package com.javachallenge.challenge;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ChallengeService {
    private final ChallengeRepository challengeRepo;
    private final ChallengeSeedRepository seedRepo;

    public ChallengeService(ChallengeRepository challengeRepo, ChallengeSeedRepository seedRepo) {
        this.challengeRepo = challengeRepo;
        this.seedRepo = seedRepo;
    }

    public List<ChallengeDto> listAll() {
        return challengeRepo.findAll().stream().map(ChallengeDto::from).toList();
    }

    public List<ChallengeDto> listByTopic(int topicId) {
        return challengeRepo.findByTopicId(topicId).stream().map(ChallengeDto::from).toList();
    }

    public Optional<Challenge> findById(UUID id) {
        return challengeRepo.findById(id);
    }

    public List<ChallengeSeed> listSeeds() {
        return seedRepo.findAll();
    }

    public Optional<ChallengeSeed> findSeedById(UUID id) {
        return seedRepo.findById(id);
    }

    public Challenge save(Challenge challenge) {
        return challengeRepo.save(challenge);
    }
}
