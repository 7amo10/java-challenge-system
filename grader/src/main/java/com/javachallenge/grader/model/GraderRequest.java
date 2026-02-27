package com.javachallenge.grader.model;

public record GraderRequest(
    String hiddenTestsJson,
    String checkstyleRulesJson
) {}
