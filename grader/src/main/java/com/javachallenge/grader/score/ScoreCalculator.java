package com.javachallenge.grader.score;

import com.javachallenge.grader.model.CheckstyleViolation;
import com.javachallenge.grader.model.TestResult;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ScoreCalculator {

    /**
     * Scoring breakdown (when hidden tests are configured):
     * - Visible tests:  up to 40 pts (proportional pass rate)
     * - Hidden tests:   up to 40 pts (proportional pass rate)
     * - Checkstyle:     up to 20 pts (20 if 0 violations, then -2 per violation, min 0)
     *
     * When no hidden tests are configured for the challenge:
     * - Visible tests:  up to 80 pts
     * - Checkstyle:     up to 20 pts
     */
    public int calculate(List<TestResult> visibleTests, List<TestResult> hiddenTests,
                          List<CheckstyleViolation> violations, boolean hiddenTestsConfigured) {
        int styleScore = Math.max(0, 20 - (violations.size() * 2));

        if (!hiddenTestsConfigured) {
            int visibleScore = proportionalScore(visibleTests, 80);
            return visibleScore + styleScore;
        }

        int visibleScore = proportionalScore(visibleTests, 40);
        int hiddenScore = proportionalScore(hiddenTests, 40);
        return visibleScore + hiddenScore + styleScore;
    }

    private int proportionalScore(List<TestResult> tests, int maxPoints) {
        if (tests.isEmpty()) return 0;
        long passed = tests.stream().filter(TestResult::passed).count();
        return (int) Math.round((double) passed / tests.size() * maxPoints);
    }
}
