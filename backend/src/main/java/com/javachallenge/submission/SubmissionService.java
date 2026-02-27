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
import java.util.List;
import java.util.Optional;
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
            repo.save(submission);

            GraderClient.GraderResult result = graderClient.grade(
                    zipPath, challenge.getHiddenTestsJson(), challenge.getCheckstyleRulesJson()
            );

            submission.setStatus(result.passed() ? "passed" : "failed");
            submission.setScore(result.score());
            submission.setVisibleTestsJson(result.visibleTestsJson());
            submission.setHiddenTestsJson(result.hiddenTestsJson());
            submission.setCheckstyleViolationsJson(result.checkstyleJson());
            submission.setGraderLog(result.log());
            submission.setCompletedAt(Instant.now());
        } catch (Exception e) {
            submission.setStatus("error");
            submission.setGraderLog(e.getMessage());
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
}
