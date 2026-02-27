package com.javachallenge.challenge;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "challenge_seeds")
public class ChallengeSeed {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "topic_id", nullable = false)
    private int topicId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String difficulty;

    @Column(columnDefinition = "TEXT")
    private String story;

    @Column(name = "legacy_code", columnDefinition = "TEXT")
    private String legacyCode;

    @Column(name = "requirements_md", columnDefinition = "TEXT")
    private String requirementsMd;

    @Column(name = "test_suite_code", columnDefinition = "TEXT")
    private String testSuiteCode;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "hidden_tests_json", columnDefinition = "jsonb")
    private String hiddenTestsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "checkstyle_rules_json", columnDefinition = "jsonb")
    private String checkstyleRulesJson;

    @Column(name = "effective_java_items", columnDefinition = "integer[]")
    private int[] effectiveJavaItems;

    // Getters
    public UUID getId() { return id; }
    public int getTopicId() { return topicId; }
    public String getTitle() { return title; }
    public String getDifficulty() { return difficulty; }
    public String getStory() { return story; }
    public String getLegacyCode() { return legacyCode; }
    public String getRequirementsMd() { return requirementsMd; }
    public String getTestSuiteCode() { return testSuiteCode; }
    public String getHiddenTestsJson() { return hiddenTestsJson; }
    public String getCheckstyleRulesJson() { return checkstyleRulesJson; }
    public int[] getEffectiveJavaItems() { return effectiveJavaItems; }

    // Setters
    public void setTopicId(int topicId) { this.topicId = topicId; }
    public void setTitle(String title) { this.title = title; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public void setStory(String story) { this.story = story; }
    public void setLegacyCode(String legacyCode) { this.legacyCode = legacyCode; }
    public void setRequirementsMd(String requirementsMd) { this.requirementsMd = requirementsMd; }
    public void setTestSuiteCode(String testSuiteCode) { this.testSuiteCode = testSuiteCode; }
    public void setHiddenTestsJson(String hiddenTestsJson) { this.hiddenTestsJson = hiddenTestsJson; }
    public void setCheckstyleRulesJson(String checkstyleRulesJson) { this.checkstyleRulesJson = checkstyleRulesJson; }
    public void setEffectiveJavaItems(int[] items) { this.effectiveJavaItems = items; }
}
