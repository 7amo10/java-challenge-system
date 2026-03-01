package com.javachallenge.config;

import com.javachallenge.user.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;
    private final String frontendUrl;

    public OAuth2SuccessHandler(UserService userService,
                                 @Value("${app.frontend.url:http://localhost:3000}") String frontendUrl) {
        this.userService = userService;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                         Authentication authentication) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        Long githubId = ((Number) oauth2User.getAttribute("id")).longValue();
        String username = oauth2User.getAttribute("login");
        String avatarUrl = oauth2User.getAttribute("avatar_url");

        // Persist user in DB (create if new, find if existing)
        userService.findOrCreate(githubId, username, avatarUrl);

        response.sendRedirect(frontendUrl + "/dashboard");
    }
}
