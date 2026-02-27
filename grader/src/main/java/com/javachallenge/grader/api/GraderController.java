package com.javachallenge.grader.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javachallenge.grader.docker.DockerSandbox;
import com.javachallenge.grader.model.*;
import com.javachallenge.grader.parser.CheckstyleParser;
import com.javachallenge.grader.parser.SurefireParser;
import com.javachallenge.grader.score.ScoreCalculator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.*;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@RestController
@RequestMapping("/internal")
public class GraderController {

    private final DockerSandbox sandbox;
    private final SurefireParser surefireParser;
    private final CheckstyleParser checkstyleParser;
    private final ScoreCalculator scoreCalculator;
    private final ObjectMapper objectMapper;

    public GraderController(DockerSandbox sandbox, SurefireParser surefireParser,
                             CheckstyleParser checkstyleParser, ScoreCalculator scoreCalculator,
                             ObjectMapper objectMapper) {
        this.sandbox = sandbox;
        this.surefireParser = surefireParser;
        this.checkstyleParser = checkstyleParser;
        this.scoreCalculator = scoreCalculator;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/grade")
    public ResponseEntity<GraderResult> grade(
            @RequestParam MultipartFile zip,
            @RequestParam(defaultValue = "[]") String hiddenTests,
            @RequestParam(defaultValue = "{}") String checkstyleRules) {

        Path workDir = null;
        try {
            workDir = Files.createTempDirectory("grader-");
            extractZip(zip, workDir);
            injectHiddenTests(workDir, hiddenTests);

            // Run in Docker
            DockerSandbox.ExecutionResult execution = sandbox.runMavenTests(workDir);

            // Parse results
            Path surefireDir = workDir.resolve("target/surefire-reports");
            Path checkstyleXml = workDir.resolve("target/checkstyle-result.xml");

            List<TestResult> allTests = surefireParser.parse(surefireDir);
            List<CheckstyleViolation> violations = checkstyleParser.parse(checkstyleXml);

            // Split visible vs hidden tests by name convention
            List<TestResult> visibleTests = allTests.stream()
                    .filter(t -> !t.name().contains("Hidden")).toList();
            List<TestResult> hiddenTestResults = allTests.stream()
                    .filter(t -> t.name().contains("Hidden")).toList();

            int score = scoreCalculator.calculate(visibleTests, hiddenTestResults, violations);
            boolean passed = score >= 60 && execution.exitCode() == 0;

            return ResponseEntity.ok(new GraderResult(
                    passed,
                    score,
                    objectMapper.writeValueAsString(visibleTests),
                    objectMapper.writeValueAsString(hiddenTestResults),
                    objectMapper.writeValueAsString(violations),
                    execution.output()
            ));

        } catch (Exception e) {
            return ResponseEntity.ok(new GraderResult(
                    false, 0, "[]", "[]", "[]", "Grader error: " + e.getMessage()
            ));
        } finally {
            if (workDir != null) deleteDirectory(workDir.toFile());
        }
    }

    private void extractZip(MultipartFile zip, Path dest) throws Exception {
        try (ZipInputStream zis = new ZipInputStream(zip.getInputStream())) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                Path target = dest.resolve(entry.getName()).normalize();
                if (!target.startsWith(dest)) throw new SecurityException("Zip path traversal!");
                if (entry.isDirectory()) {
                    Files.createDirectories(target);
                } else {
                    Files.createDirectories(target.getParent());
                    Files.copy(zis, target, StandardCopyOption.REPLACE_EXISTING);
                }
                zis.closeEntry();
            }
        }
    }

    private void injectHiddenTests(Path workDir, String hiddenTestsJson) throws Exception {
        // Hidden tests JSON is an array of {className, code} objects
        // Inject each into the test directory
        if (hiddenTestsJson == null || hiddenTestsJson.equals("[]")) return;
        var tests = objectMapper.readTree(hiddenTestsJson);
        Path testDir = workDir.resolve("src/test/java/com/challenge");
        Files.createDirectories(testDir);
        for (var test : tests) {
            String className = test.get("className").asText();
            String code = test.get("code").asText();
            Files.writeString(testDir.resolve(className + ".java"), code);
        }
    }

    private void deleteDirectory(File dir) {
        if (dir.isDirectory()) {
            File[] files = dir.listFiles();
            if (files != null) for (File f : files) deleteDirectory(f);
        }
        dir.delete();
    }
}
