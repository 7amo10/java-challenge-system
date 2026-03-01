package com.javachallenge.challenge;

import java.time.Instant;
import java.util.UUID;

public record ChallengeDto(
    UUID id,
    int topicId,
    String title,
    String theme,
    String difficulty,
    String challengeType,
    String story,
    String requirementsMd,
    boolean aiGenerated,
    Instant createdAt
) {
    public static ChallengeDto from(Challenge c) {
        return new ChallengeDto(
            c.getId(), c.getTopicId(), c.getTitle(), c.getTheme(),
            c.getDifficulty(), c.getChallengeType(), c.getStory(), c.getRequirementsMd(),
            c.isAiGenerated(), c.getCreatedAt()
        );
    }
}
