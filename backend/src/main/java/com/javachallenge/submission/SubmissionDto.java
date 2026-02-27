package com.javachallenge.submission;

import java.time.Instant;
import java.util.UUID;

public record SubmissionDto(
    UUID id,
    UUID challengeId,
    String challengeTitle,
    String status,
    Integer score,
    String visibleTestsJson,
    String hiddenTestsJson,
    String checkstyleViolationsJson,
    Instant submittedAt,
    Instant completedAt
) {
    public static SubmissionDto from(Submission s) {
        return new SubmissionDto(
            s.getId(),
            s.getChallenge().getId(),
            s.getChallenge().getTitle(),
            s.getStatus(),
            s.getScore(),
            s.getVisibleTestsJson(),
            s.getHiddenTestsJson(),
            s.getCheckstyleViolationsJson(),
            s.getSubmittedAt(),
            s.getCompletedAt()
        );
    }
}
