package com.javachallenge.submission;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
}
