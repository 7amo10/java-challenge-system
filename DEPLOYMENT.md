# Railway Deployment Guide

## Prerequisites
- Railway account at [railway.app](https://railway.app)
- GitHub OAuth app created (see `.env.example`)
- OpenAI API key

---

## Step 1 — Create Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"** → select `java-challenge-system`
3. Railway auto-detects the repo. **Don't deploy yet.**

---

## Step 2 — Add PostgreSQL

1. In the project, click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway provisions a managed Postgres instance.
3. Note the `DATABASE_URL` — it will be auto-linked to backend.

---

## Step 3 — Deploy Backend Service

1. Click **"+ New"** → **"GitHub Repo"** → `java-challenge-system`
2. Set **Root Directory**: `backend`
3. Set **Build Command**: *(Railway auto-detects Dockerfile)*
4. Add environment variables:

| Variable | Value |
|----------|-------|
| `GITHUB_CLIENT_ID` | your GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | your GitHub OAuth client secret |
| `OPENAI_API_KEY` | your OpenAI key |
| `FRONTEND_URL` | `https://your-frontend.up.railway.app` |
| `GRADER_URL` | `https://your-grader.up.railway.app` |
| `DATABASE_URL` | *(auto-linked from Postgres plugin)* |
| `DB_USER` | *(from Postgres plugin: `${{Postgres.PGUSER}}`)* |
| `DB_PASSWORD` | *(from Postgres plugin: `${{Postgres.PGPASSWORD}}`)* |

5. Set **Port**: `8080`
6. Click **Deploy**

---

## Step 4 — Deploy Grader Service

1. Click **"+ New"** → **"GitHub Repo"** → `java-challenge-system`
2. Set **Root Directory**: `grader`
3. Add environment variable:

| Variable | Value |
|----------|-------|
| `SPRING_PROFILES_ACTIVE` | `docker` |

4. Set **Port**: `8081`
5. **Important**: In Railway, grader does NOT need a public domain — only backend talks to it internally via the private Railway network. Use the private URL format: `http://grader.railway.internal:8081`
6. Update `GRADER_URL` in the **backend** service to this private URL.

---

## Step 5 — Deploy Frontend Service

1. Click **"+ New"** → **"GitHub Repo"** → `java-challenge-system`
2. Set **Root Directory**: `frontend`
3. Add environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.up.railway.app` |
| `BACKEND_URL` | `https://your-backend.up.railway.app` |
| `GITHUB_CLIENT_ID` | same as backend |
| `GITHUB_CLIENT_SECRET` | same as backend |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` output |
| `NEXTAUTH_URL` | `https://your-frontend.up.railway.app` |

4. Set **Port**: `3000`
5. Click **Deploy**

---

## Step 6 — Update GitHub OAuth Callback URL

1. Go to [github.com/settings/applications](https://github.com/settings/applications)
2. Edit your OAuth App
3. Set **Authorization callback URL** to:
   ```
   https://your-backend.up.railway.app/login/oauth2/code/github
   ```

---

## Step 7 — Verify

```bash
# Check backend health
curl https://your-backend.up.railway.app/actuator/health

# Check challenges API
curl https://your-backend.up.railway.app/api/challenges
```

Both should return `200 OK`.

---

## GitHub Actions Auto-Deploy (CI/CD)

The CI pipeline (`.github/workflows/ci.yml`) already:
1. Builds backend + grader on every push
2. Runs TypeScript type check on frontend
3. On `main` branch: builds Docker images and pushes to GHCR

To wire Railway to auto-deploy from GHCR:
1. In each Railway service → **Settings** → **Deploy** → **Image**
2. Set image to `ghcr.io/7amo10/java-challenge-system/backend:latest`
3. Add Railway deploy webhook to GitHub Actions (optional — Railway polls GHCR every 5 min)
