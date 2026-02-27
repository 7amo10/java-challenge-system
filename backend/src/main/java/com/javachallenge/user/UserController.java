package com.javachallenge.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(Map.of(
            "username", principal.getAttribute("login"),
            "avatarUrl", principal.getAttribute("avatar_url"),
            "name", principal.getAttribute("name") != null ? principal.getAttribute("name") : ""
        ));
    }

    @GetMapping("/{username}/submissions")
    public ResponseEntity<?> userSubmissions(@PathVariable String username) {
        // delegation to SubmissionService handled in SubmissionController
        return ResponseEntity.ok(Map.of("username", username, "submissions", java.util.List.of()));
    }
}
