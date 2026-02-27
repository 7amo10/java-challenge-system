package com.javachallenge.grader;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Path;

@Component
public class GraderClient {

    public record GraderResult(
        boolean passed,
        int score,
        String visibleTestsJson,
        String hiddenTestsJson,
        String checkstyleJson,
        String log
    ) {}

    private final String graderUrl;
    private final RestTemplate restTemplate = new RestTemplate();

    public GraderClient(@Value("${app.grader.url:http://grader:8081}") String graderUrl) {
        this.graderUrl = graderUrl;
    }

    public GraderResult grade(Path zipPath, String hiddenTestsJson, String checkstyleRulesJson) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("zip", new FileSystemResource(zipPath));
        body.add("hiddenTests", hiddenTestsJson);
        body.add("checkstyleRules", checkstyleRulesJson);

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<GraderResult> response = restTemplate.postForEntity(
                graderUrl + "/internal/grade", request, GraderResult.class
        );
        return response.getBody();
    }
}
