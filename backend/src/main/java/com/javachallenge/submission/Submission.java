package com.javachallenge.submission;

import com.javachallenge.challenge.Challenge;
import com.javachallenge.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "submissions")
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private Challenge challenge;

    @Column(name = "zip_path")
    private String zipPath;

    @Column(nullable = false)
    private String status = "pending";

    private Integer score;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "visible_tests_json", columnDefinition = "jsonb")
    private String visibleTestsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "hidden_tests_json", columnDefinition = "jsonb")
    private String hiddenTestsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "checkstyle_violations_json", columnDefinition = "jsonb")
    private String checkstyleViolationsJson;

    @Column(name = "grader_log", columnDefinition = "TEXT")
    private String graderLog;

    @Column(name = "submitted_at", updatable = false)
    private Instant submittedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    // Getters & setters
    public UUID getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Challenge getChallenge() { return challenge; }
    public void setChallenge(Challenge challenge) { this.challenge = challenge; }
    public String getZipPath() { return zipPath; }
    public void setZipPath(String zipPath) { this.zipPath = zipPath; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public String getVisibleTestsJson() { return visibleTestsJson; }
    public void setVisibleTestsJson(String json) { this.visibleTestsJson = json; }
    public String getHiddenTestsJson() { return hiddenTestsJson; }
    public void setHiddenTestsJson(String json) { this.hiddenTestsJson = json; }
    public String getCheckstyleViolationsJson() { return checkstyleViolationsJson; }
    public void setCheckstyleViolationsJson(String json) { this.checkstyleViolationsJson = json; }
    public String getGraderLog() { return graderLog; }
    public void setGraderLog(String log) { this.graderLog = log; }
    public Instant getSubmittedAt() { return submittedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}
