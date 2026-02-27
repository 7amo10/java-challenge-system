package com.javachallenge.user;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public User findOrCreate(Long githubId, String username, String avatarUrl) {
        return repo.findByGithubId(githubId).orElseGet(() -> {
            User u = new User();
            u.setGithubId(githubId);
            u.setUsername(username);
            u.setAvatarUrl(avatarUrl);
            return repo.save(u);
        });
    }

    public User findByUsername(String username) {
        return repo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}
