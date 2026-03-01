package com.javachallenge.challenge;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "challenges")
public class Challenge {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seed_id")
    private ChallengeSeed seed;

    @Column(name = "topic_id", nullable = false)
    private int topicId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String theme;

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

    @Column(name = "ai_generated")
    private boolean aiGenerated = false;

    @Column(name = "challenge_type", nullable = false)
    private String challengeType = "refactor";

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    // Getters
    public UUID getId() { return id; }
    public ChallengeSeed getSeed() { return seed; }
    public int getTopicId() { return topicId; }
    public String getTitle() { return title; }
    public String getTheme() { return theme; }
    public String getDifficulty() { return difficulty; }
    public String getStory() { return story; }
    public String getLegacyCode() { return legacyCode; }
    public String getRequirementsMd() { return requirementsMd; }
    public String getTestSuiteCode() { return testSuiteCode; }
    public String getHiddenTestsJson() { return hiddenTestsJson; }
    public String getCheckstyleRulesJson() { return checkstyleRulesJson; }
    public boolean isAiGenerated() { return aiGenerated; }
    public String getChallengeType() { return challengeType; }
    public Instant getCreatedAt() { return createdAt; }

    // Setters
    public void setSeed(ChallengeSeed seed) { this.seed = seed; }
    public void setTopicId(int topicId) { this.topicId = topicId; }
    public void setTitle(String title) { this.title = title; }
    public void setTheme(String theme) { this.theme = theme; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public void setStory(String story) { this.story = story; }
    public void setLegacyCode(String legacyCode) { this.legacyCode = legacyCode; }
    public void setRequirementsMd(String requirementsMd) { this.requirementsMd = requirementsMd; }
    public void setTestSuiteCode(String testSuiteCode) { this.testSuiteCode = testSuiteCode; }
    public void setHiddenTestsJson(String json) { this.hiddenTestsJson = json; }
    public void setCheckstyleRulesJson(String json) { this.checkstyleRulesJson = json; }
    public void setAiGenerated(boolean aiGenerated) { this.aiGenerated = aiGenerated; }
    public void setChallengeType(String challengeType) { this.challengeType = challengeType; }
}
