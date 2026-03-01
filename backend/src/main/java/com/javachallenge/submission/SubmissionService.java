package com.javachallenge.submission;

import com.javachallenge.challenge.Challenge;
import com.javachallenge.challenge.ChallengeService;
import com.javachallenge.grader.GraderClient;
import com.javachallenge.user.User;
import com.javachallenge.user.UserService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.*;
import java.util.UUID;

@Service
public class SubmissionService {

    private final SubmissionRepository repo;
    private final ChallengeService challengeService;
    private final UserService userService;
    private final GraderClient graderClient;

    public SubmissionService(SubmissionRepository repo, ChallengeService challengeService,
                              UserService userService, GraderClient graderClient) {
        this.repo = repo;
        this.challengeService = challengeService;
        this.userService = userService;
        this.graderClient = graderClient;
    }

    public Submission createSubmission(UUID challengeId, String username, MultipartFile file)
            throws IOException {
        Challenge challenge = challengeService.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
        User user = userService.findByUsername(username);

        // Save file to temp storage
        Path tempDir = Files.createTempDirectory("submission-");
        Path zipPath = tempDir.resolve("submission.zip");
        file.transferTo(zipPath);

        Submission submission = new Submission();
        submission.setUser(user);
        submission.setChallenge(challenge);
        submission.setZipPath(zipPath.toString());
        submission.setStatus("pending");
        Submission saved = repo.save(submission);

        // Trigger grading asynchronously
        gradeAsync(saved, challenge, zipPath);
        return saved;
    }

    @Async
    public void gradeAsync(Submission submission, Challenge challenge, Path zipPath) {
        try {
            submission.setStatus("running");
            submission.setGraderLog("[PHASE] Initializing grading environment...\n");
            repo.save(submission);

            submission.setGraderLog(submission.getGraderLog() + "[PHASE] Sending submission to sandbox...\n");
            repo.save(submission);

            GraderClient.GraderResult result = graderClient.grade(
                    zipPath, challenge.getHiddenTestsJson(), challenge.getCheckstyleRulesJson()
            );

            submission.setGraderLog(submission.getGraderLog() + "[PHASE] Parsing test results...\n");
            repo.save(submission);

            submission.setStatus(result.passed() ? "passed" : "failed");
            submission.setScore(result.score());
            submission.setVisibleTestsJson(result.visibleTestsJson());
            submission.setHiddenTestsJson(result.hiddenTestsJson());
            submission.setCheckstyleViolationsJson(result.checkstyleJson());
            submission.setGraderLog(submission.getGraderLog() + "[PHASE] Grading complete.\n" + result.log());
            submission.setCompletedAt(Instant.now());
        } catch (Exception e) {
            submission.setStatus("error");
            submission.setGraderLog((submission.getGraderLog() != null ? submission.getGraderLog() : "")
                + "[ERROR] " + e.getMessage() + "\n");
        }
        repo.save(submission);
    }

    public Optional<Submission> findById(UUID id) {
        return repo.findById(id);
    }

    public List<SubmissionDto> findByUsername(String username) {
        User user = userService.findByUsername(username);
        return repo.findByUserIdOrderBySubmittedAtDesc(user.getId())
                .stream().map(SubmissionDto::from).toList();
    }

    public Map<String, Object> statsForUser(String username) {
        User user = userService.findByUsername(username);
        List<Submission> subs = repo.findByUserIdOrderBySubmittedAtDesc(user.getId());
        long total = subs.size();
        long passed = subs.stream().filter(s -> "passed".equals(s.getStatus())).count();
        long failed = subs.stream().filter(s -> "failed".equals(s.getStatus())).count();
        double avgScore = subs.stream()
                .filter(s -> s.getScore() != null)
                .mapToInt(Submission::getScore)
                .average().orElse(0.0);
        int bestScore = subs.stream()
                .filter(s -> s.getScore() != null)
                .mapToInt(Submission::getScore)
                .max().orElse(0);
        long uniqueChallengesSolved = subs.stream()
                .filter(s -> "passed".equals(s.getStatus()))
                .map(s -> s.getChallenge().getId())
                .distinct().count();

        return Map.of(
            "totalSubmissions", total,
            "passed", passed,
            "failed", failed,
            "avgScore", Math.round(avgScore * 10.0) / 10.0,
            "bestScore", bestScore,
            "challengesSolved", uniqueChallengesSolved
        );
    }

    public List<Map<String, Object>> leaderboard() {
        List<Submission> allPassed = repo.findByStatus("passed");
        // Group by user, sum best scores per challenge
        Map<UUID, List<Submission>> byUser = allPassed.stream()
                .collect(java.util.stream.Collectors.groupingBy(s -> s.getUser().getId()));

        List<Map<String, Object>> board = new ArrayList<>();
        for (var entry : byUser.entrySet()) {
            User user = entry.getValue().get(0).getUser();
            // Best score per challenge
            Map<UUID, Integer> bestPerChallenge = new HashMap<>();
            for (Submission s : entry.getValue()) {
                if (s.getScore() != null) {
                    bestPerChallenge.merge(s.getChallenge().getId(), s.getScore(), Math::max);
                }
            }
            int totalScore = bestPerChallenge.values().stream().mapToInt(i -> i).sum();
            board.add(Map.of(
                "username", user.getUsername(),
                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                "totalScore", totalScore,
                "challengesSolved", bestPerChallenge.size()
            ));
        }
        // Sort by totalScore descending
        board.sort((a, b) -> ((Integer)b.get("totalScore")).compareTo((Integer)a.get("totalScore")));
        // Add rank
        List<Map<String, Object>> ranked = new ArrayList<>();
        for (int i = 0; i < board.size(); i++) {
            Map<String, Object> e = new HashMap<>(board.get(i));
            e.put("rank", i + 1);
            ranked.add(e);
        }
        return ranked;
    }
}
