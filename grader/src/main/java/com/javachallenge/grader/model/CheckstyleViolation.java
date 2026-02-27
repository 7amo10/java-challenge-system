package com.javachallenge.grader.model;

public record CheckstyleViolation(
    String file,
    int line,
    String severity,
    String message,
    String rule
) {}
