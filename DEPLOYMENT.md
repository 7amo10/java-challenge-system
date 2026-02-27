# Deployment Guide — 100% Free, No Credit Card

This project deploys for **free with no credit card** using three platforms:

| Layer       | Platform                          | Free Limits                             |
|-------------|-----------------------------------|-----------------------------------------|
| Frontend    | [Netlify](https://netlify.com)    | Unlimited deploys, 100GB bandwidth/mo  |
| Backend API | [Render](https://render.com)      | 750 hours/mo, 512MB RAM                 |
| PostgreSQL  | [Supabase](https://supabase.com)  | 500MB, 2 projects, never expires        |

> ### ⚠️ Grader Service — Local Only
> The grader runs submitted code inside a **Docker sandbox** (`/var/run/docker.sock`).
> No free cloud platform allows Docker-in-Docker. The grader works perfectly with
> `docker compose up` on your local machine. For production cloud grading you would need
> a VPS with root access — defer this until you have cloud credits later.
>
> **The backend works fine in production without the grader** — submissions will be
> queued and return a "grading pending" status instead of an instant score.

> ### 💳 When you get a card — Student Pack upgrades
> - **DigitalOcean**: $200 credit (1 year) — run everything including grader on a Droplet
> - **Heroku**: $13/mo credit (24 months) — Eco dynos for backend + grader  
> - **Azure**: $100 credit — Azure Container Apps + PostgreSQL Flexible Server (free tier)

---

## Step 1 — PostgreSQL on Supabase

1. Sign up at https://supabase.com (GitHub login, no card)
2. **New project** → pick a region near you → set a DB password
3. **Project Settings → Database → Connection string → URI** — copy it:
   ```
   postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
   ```

---

## Step 2 — GitHub OAuth App

1. https://github.com/settings/developers → **New OAuth App**
2. Fill in:
   - **Application name:** Java Challenge System
   - **Homepage URL:** `https://your-app.netlify.app`
   - **Callback URL:** `https://your-backend.onrender.com/login/oauth2/code/github`
3. Copy **Client ID** and generate + copy **Client Secret**

---

## Step 3 — Deploy Backend on Render

1. https://render.com → **New → Web Service** (sign in with GitHub, no card)
2. Select the `java-challenge-system` repo
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Docker
4. Add environment variables:
   ```
   DATABASE_URL          = (Supabase URI from Step 1)
   GITHUB_CLIENT_ID      = (from Step 2)
   GITHUB_CLIENT_SECRET  = (from Step 2)
   FRONTEND_URL          = https://your-app.netlify.app
   GRADER_URL            = http://localhost:8081
   ```
5. Deploy → note the URL, e.g. `https://java-challenge-backend.onrender.com`

> Render free tier sleeps after 15 min of inactivity. First request cold-starts in ~30s.

---

## Step 4 — Deploy Frontend on Netlify

1. https://netlify.com → **Add new site → Import from Git**
2. Select `java-challenge-system` repo
3. Set **Base directory** to `frontend`
4. Set **Build command** to `npm run build`
5. Set **Publish directory** to `.next` (or leave blank — Netlify detects Next.js)
6. Add environment variables:
   ```
   NEXTAUTH_URL          = https://your-app.netlify.app
   NEXTAUTH_SECRET       = (run: openssl rand -base64 32)
   GITHUB_CLIENT_ID      = (from Step 2)
   GITHUB_CLIENT_SECRET  = (from Step 2)
   BACKEND_URL           = https://java-challenge-backend.onrender.com
   NEXT_PUBLIC_API_URL   = https://your-app.netlify.app
   ```
7. Deploy ✅

---

## Step 5 — Update GitHub OAuth App URLs

After Netlify gives you a final domain, update your OAuth App:
- **Homepage URL** → `https://your-app.netlify.app`
- **Callback URL** → `https://java-challenge-backend.onrender.com/login/oauth2/code/github`

---

## Local Development (Full Stack incl. Grader)

```bash
# Start everything — backend, grader, frontend, postgres
docker compose up

# Frontend:  http://localhost:3000
# Backend:   http://localhost:8080
# Grader:    http://localhost:8081
# Postgres:  localhost:5432
```

The grader works locally because Docker socket is available on your machine.
