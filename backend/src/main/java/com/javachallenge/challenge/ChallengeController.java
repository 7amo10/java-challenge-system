package com.javachallenge.challenge;

import com.javachallenge.zip.ZipBundleService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {

    private final ChallengeService challengeService;
    private final ZipBundleService zipBundleService;

    public ChallengeController(ChallengeService challengeService, ZipBundleService zipBundleService) {
        this.challengeService = challengeService;
        this.zipBundleService = zipBundleService;
    }

    @GetMapping
    public ResponseEntity<List<ChallengeDto>> list(
            @RequestParam(required = false) Integer topic,
            @RequestParam(required = false) String difficulty) {
        List<ChallengeDto> result = (topic != null)
                ? challengeService.listByTopic(topic)
                : challengeService.listAll();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChallengeDto> get(@PathVariable UUID id) {
        return challengeService.findById(id)
                .map(ChallengeDto::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/download")
    public void download(@PathVariable UUID id, HttpServletResponse response) throws IOException {
        Challenge challenge = challengeService.findById(id)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
        response.setContentType("application/zip");
        response.setHeader("Content-Disposition",
                "attachment; filename=\"" + sanitize(challenge.getTheme()) + "-challenge.zip\"");
        zipBundleService.writeBundle(challenge, response.getOutputStream());
    }

    private String sanitize(String name) {
        return name.toLowerCase().replaceAll("[^a-z0-9]+", "-");
    }
}
