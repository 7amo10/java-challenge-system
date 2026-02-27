package com.javachallenge.challenge;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ChallengeSeedRepository extends JpaRepository<ChallengeSeed, UUID> {
    List<ChallengeSeed> findByTopicId(int topicId);
}
