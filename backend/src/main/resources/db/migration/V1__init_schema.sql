CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    github_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE challenge_seeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id SMALLINT NOT NULL CHECK (topic_id BETWEEN 1 AND 6),
    title VARCHAR(200) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('medium','hard')),
    story TEXT NOT NULL,
    legacy_code TEXT NOT NULL,
    requirements_md TEXT NOT NULL,
    test_suite_code TEXT NOT NULL,
    hidden_tests_json JSONB NOT NULL DEFAULT '[]',
    checkstyle_rules_json JSONB NOT NULL DEFAULT '[]',
    effective_java_items INTEGER[] NOT NULL DEFAULT '{}'
);

CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seed_id UUID REFERENCES challenge_seeds(id),
    topic_id SMALLINT NOT NULL CHECK (topic_id BETWEEN 1 AND 6),
    title VARCHAR(200) NOT NULL,
    theme VARCHAR(200) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('medium','hard')),
    story TEXT NOT NULL,
    legacy_code TEXT NOT NULL,
    requirements_md TEXT NOT NULL,
    test_suite_code TEXT NOT NULL,
    hidden_tests_json JSONB NOT NULL DEFAULT '[]',
    checkstyle_rules_json JSONB NOT NULL DEFAULT '[]',
    ai_generated BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    challenge_id UUID NOT NULL REFERENCES challenges(id),
    zip_path TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','passed','failed','error')),
    score SMALLINT CHECK (score BETWEEN 0 AND 100),
    visible_tests_json JSONB,
    hidden_tests_json JSONB,
    checkstyle_violations_json JSONB,
    grader_log TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT score_only_when_complete CHECK (score IS NULL OR status IN ('passed','failed'))
);

CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_challenge ON submissions(challenge_id);
CREATE INDEX idx_challenges_topic ON challenges(topic_id);
