package com.javachallenge.ai;

import com.javachallenge.challenge.Challenge;
import com.javachallenge.challenge.ChallengeDto;
import com.javachallenge.challenge.ChallengeSeed;
import com.javachallenge.challenge.ChallengeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/challenges")
public class AiController {

    private final ChallengeService challengeService;
    private final ChallengeGenerationService generationService;

    public AiController(ChallengeService challengeService, ChallengeGenerationService generationService) {
        this.challengeService = challengeService;
        this.generationService = generationService;
    }

    @PostMapping("/generate")
    public ResponseEntity<ChallengeDto> generate(@RequestBody GenerateRequest request) {
        ChallengeSeed seed = challengeService.findSeedById(request.seedId())
                .orElseThrow(() -> new RuntimeException("Seed not found: " + request.seedId()));
        Challenge challenge = generationService.generateVariant(seed, request.theme());
        return ResponseEntity.ok(ChallengeDto.from(challenge));
    }

    public record GenerateRequest(UUID seedId, String theme) {}
}
