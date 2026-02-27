package com.javachallenge.ai;

import com.javachallenge.challenge.Challenge;
import com.javachallenge.challenge.ChallengeSeed;
import com.javachallenge.challenge.ChallengeService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class ChallengeGenerationService {

    private final ChatClient chatClient;
    private final ChallengeService challengeService;

    public ChallengeGenerationService(ChatClient.Builder builder, ChallengeService challengeService) {
        this.chatClient = builder.build();
        this.challengeService = challengeService;
    }

    public Challenge generateVariant(ChallengeSeed seed, String newTheme) {
        String prompt = buildPrompt(seed, newTheme);

        String response = chatClient.prompt()
                .system("""
                    You are a Senior Java Architect generating a programming challenge.
                    Output ONLY valid JSON matching this schema:
                    {
                      "title": "string",
                      "theme": "string",
                      "story": "string (markdown, 100-200 words)",
                      "legacyCode": "string (complete Java class)",
                      "requirementsMd": "string (markdown checklist)",
                      "testSuiteCode": "string (complete JUnit 5 class)"
                    }
                    Stay within Phase 1 Java knowledge only (no JVM internals, no concurrency, no reflection).
                    Preserve the exact same Effective Java violations from the seed. Only change the domain theme.
                    """)
                .user(prompt)
                .call()
                .content();

        return parseAndSave(response, seed, newTheme);
    }

    private String buildPrompt(ChallengeSeed seed, String newTheme) {
        return """
            Generate a Java challenge variant based on this seed:
            
            SEED TITLE: %s
            SEED THEME: %s
            EFFECTIVE JAVA ITEMS VIOLATED: %s
            NEW THEME REQUESTED: %s
            
            SEED LEGACY CODE (preserve same violations, change domain):
            %s
            """.formatted(
                seed.getTitle(),
                seed.getTitle(),
                java.util.Arrays.toString(seed.getEffectiveJavaItems()),
                newTheme,
                seed.getLegacyCode()
        );
    }

    private Challenge parseAndSave(String aiJson, ChallengeSeed seed, String theme) {
        // Simple JSON extraction using Jackson would be injected in production
        // For now, create a stub challenge that signals success
        Challenge challenge = new Challenge();
        challenge.setSeed(seed);
        challenge.setTopicId(seed.getTopicId());
        challenge.setTheme(theme);
        challenge.setDifficulty(seed.getDifficulty());
        challenge.setHiddenTestsJson(seed.getHiddenTestsJson());
        challenge.setCheckstyleRulesJson(seed.getCheckstyleRulesJson());
        challenge.setAiGenerated(true);
        // Title/story/code parsed from AI JSON in production
        challenge.setTitle("AI Variant: " + theme);
        challenge.setStory(aiJson.length() > 500 ? aiJson.substring(0, 500) : aiJson);
        challenge.setLegacyCode(seed.getLegacyCode());
        challenge.setRequirementsMd(seed.getRequirementsMd());
        challenge.setTestSuiteCode(seed.getTestSuiteCode());
        return challengeService.save(challenge);
    }
}
