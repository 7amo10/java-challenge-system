# Java Challenge System

> Real-world Java refactoring challenges based on Phase 1 of the Java Roadmap 2025.

A standalone web app where you download a broken Maven project, refactor `BadCode.java` to meet **Effective Java** standards, and submit for automated Docker-sandboxed grading.

## Architecture

```
Frontend (Next.js 14)  →  Backend API (Spring Boot 3.5)  →  PostgreSQL
                                    ↓
                           Grader Service (Spring Boot 3.5 + Docker)
```

## Topics Covered (Phase 1)

| # | Topic | Theme | Effective Java Items |
|---|-------|-------|---------------------|
| 1 | Java Basics | ATM Logger | 57, 58, 63 |
| 2 | OOP & Class Design | Vehicle Fleet | 15, 16, 17 |
| 3 | Arrays & Lists | E-Commerce Cart | 28, 50, 61 |
| 4 | Abstraction & Generics | Shipping Logistics | 26, 29, 31 |
| 5 | Lambdas & Streams | Financial Report | 42, 45, 46 |
| 6 | Collections Framework | Library Catalog | 47, 54, 58 |

## Getting Started (Local Dev)

### Prerequisites
- Java 21
- Node.js 22
- Docker Desktop

### Run with Docker Compose

```bash
# Clone the repo
git clone https://github.com/7amo10/java-challenge-system.git
cd java-challenge-system

# Set environment variables
cp .env.example .env
# Edit .env with your GitHub OAuth credentials

# Start everything
docker compose up --build
```

App is available at http://localhost:3000

### Run services individually

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
```

**Grader:**
```bash
cd grader
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Grading Breakdown

| Component | Points | Method |
|-----------|--------|--------|
| Visible Tests | 40 | JUnit 5 (Surefire XML) |
| Hidden Tests | 40 | JUnit 5 injected at grade time |
| Checkstyle | 20 | Checkstyle 10 XML |
| **Total** | **100** | Score ≥ 60 = Pass |

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Monaco Editor
- **Backend**: Spring Boot 3.5 (Java 21), Spring Security OAuth2, Spring Data JPA, Flyway, Spring AI
- **Grader**: Spring Boot 3.5, docker-java SDK, Checkstyle 10
- **Database**: PostgreSQL 16
- **Deployment**: Railway

## Related

- [Java Roadmap Docs](https://7amo10.github.io/My-Java-Rodemap/)
- [Effective Java by Joshua Bloch](https://www.oreilly.com/library/view/effective-java/9780134686097/)
