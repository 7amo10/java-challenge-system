package com.javachallenge.challenge;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ChallengeRepository extends JpaRepository<Challenge, UUID> {
    List<Challenge> findByTopicId(int topicId);
    List<Challenge> findByTopicIdAndDifficulty(int topicId, String difficulty);
}
