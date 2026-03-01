package com.javachallenge.submission;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {
    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping
    public ResponseEntity<SubmissionDto> submit(
            @RequestParam UUID challengeId,
            @RequestParam MultipartFile file,
            @AuthenticationPrincipal OAuth2User principal) throws IOException {
        if (principal == null) return ResponseEntity.status(401).build();
        String username = principal.getAttribute("login");
        Submission s = submissionService.createSubmission(challengeId, username, file);
        return ResponseEntity.accepted().body(SubmissionDto.from(s));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionDto> get(@PathVariable UUID id) {
        return submissionService.findById(id)
                .map(SubmissionDto::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my")
    public ResponseEntity<List<SubmissionDto>> mySubmissions(
            @AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        String username = principal.getAttribute("login");
        return ResponseEntity.ok(submissionService.findByUsername(username));
    }

    @GetMapping("/my/stats")
    public ResponseEntity<Map<String, Object>> myStats(
            @AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        String username = principal.getAttribute("login");
        return ResponseEntity.ok(submissionService.statsForUser(username));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> leaderboard() {
        return ResponseEntity.ok(submissionService.leaderboard());
    }

    @GetMapping(value = "/{id}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamGrading(@PathVariable UUID id) {
        SseEmitter emitter = new SseEmitter(300_000L); // 5 min timeout

        java.util.concurrent.ScheduledExecutorService scheduler =
            java.util.concurrent.Executors.newSingleThreadScheduledExecutor();

        final int[] lastLogLength = {0};

        var future = scheduler.scheduleAtFixedRate(() -> {
            try {
                var subOpt = submissionService.findById(id);
                if (subOpt.isEmpty()) {
                    emitter.send(SseEmitter.event().name("error").data("{\"message\":\"Submission not found\"}"));
                    emitter.complete();
                    scheduler.shutdown();
                    return;
                }
                Submission sub = subOpt.get();

                // Send new log lines
                String currentLog = sub.getGraderLog() != null ? sub.getGraderLog() : "";
                if (currentLog.length() > lastLogLength[0]) {
                    String newContent = currentLog.substring(lastLogLength[0]);
                    lastLogLength[0] = currentLog.length();
                    emitter.send(SseEmitter.event().name("log").data(newContent));
                }

                // Send status updates
                String status = sub.getStatus();
                emitter.send(SseEmitter.event().name("status").data(
                    "{\"status\":\"" + status + "\"" +
                    (sub.getScore() != null ? ",\"score\":" + sub.getScore() : "") + "}"
                ));

                // If terminal state, send final result and close
                if ("passed".equals(status) || "failed".equals(status) || "error".equals(status)) {
                    emitter.send(SseEmitter.event().name("complete").data(
                        new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(SubmissionDto.from(sub))
                    ));
                    emitter.complete();
                    scheduler.shutdown();
                }
            } catch (Exception e) {
                emitter.completeWithError(e);
                scheduler.shutdown();
            }
        }, 0, 800, java.util.concurrent.TimeUnit.MILLISECONDS);

        emitter.onCompletion(scheduler::shutdown);
        emitter.onTimeout(scheduler::shutdown);
        emitter.onError(t -> scheduler.shutdown());

        return emitter;
    }
}
