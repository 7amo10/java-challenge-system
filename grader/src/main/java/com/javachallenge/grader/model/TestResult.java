package com.javachallenge.grader.model;

public record TestResult(
    String name,
    boolean passed,
    String errorMessage,
    double timeSeconds
) {}
