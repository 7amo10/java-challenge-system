package com.javachallenge.grader.model;

public record GraderResult(
    boolean passed,
    int score,
    String visibleTestsJson,
    String hiddenTestsJson,
    String checkstyleJson,
    String log
) {}
