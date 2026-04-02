# Deploy Med-Mate on Vercel

This repo supports **two Vercel projects** from one Git repo (recommended):

| Project | Root directory | What it deploys |
|---------|----------------|-----------------|
| **API** | `backend/` | Express API ([Express on Vercel](https://vercel.com/docs/frameworks/backend/express)) |
| **Web** | `.` (repo root) | React + Vite SPA (`vercel.json` at root handles client-side routing) |

---

## Part A — Deploy the backend (Express API)

The backend is split so Vercel can run it as a **serverless Express app**:

| File | Role |
|------|------|
| `backend/app.js` | Defines routes and **`module.exports = app`** (Vercel entry). |
| `backend/server.js` | Local only: `require('./app')` + **`app.listen()`** for `npm run dev` / `npm start`. |
| `backend/vercel.json` | Optional: `maxDuration` for long requests (e.g. AI). |

### Steps

1. In Vercel → **Add New Project** → import the same Git repo.
2. **Root Directory** → set to **`backend`** (important).
3. **Framework Preset** → Vercel should detect **Express** (or “Other” with no build step).
4. **Build Command** → leave empty or `echo "no build"` (no build needed).
5. **Output** → not used for Express backend.
6. **Environment variables** (Production + Preview):

   | Variable | Required | Example |
   |----------|----------|---------|
   | `MONGO_URI` | Yes | MongoDB Atlas connection string |
   | `JWT_SECRET` | Yes | Long random string |
   | `FRONTEND_URL` | Recommended | `https://your-web-app.vercel.app` (comma-separated for multiple origins, no trailing slash) |
   | `HUGGINGFACE_API_TOKEN` | Optional | For `/api/ai/*` |

7. Deploy. Your API base will look like:  
   **`https://<backend-project>.vercel.app`**

### Frontend URL for `axios`

Set the **web** app’s `VITE_API_URL` to:

```text
https://<backend-project>.vercel.app/api
```

Routes are mounted at `/api/auth`, `/api/medicine`, etc., so the client base URL **must include `/api`**.

### Limits (read this)

- **Cold starts**: first request after idle can be slower.
- **Function timeout**: default is short; `backend/vercel.json` sets **`maxDuration`: 60** for `app.js` (requires a Vercel plan that allows it; otherwise reduce AI `max_tokens` or upgrade).
- **MongoDB**: allow **`0.0.0.0/0`** (or Vercel IPs) on Atlas for serverless.
- **`connectDB`**: if Mongo is wrong, the function may crash; fix `MONGO_URI` in Vercel env.

### Local dev (unchanged)

```bash
cd backend
npm install
npm run dev
# or: npm start
```

---

## Part B — Deploy the frontend (Vite SPA)

1. **Second Vercel project** → same repo, **Root Directory** = **`.`** (repository root).
2. **Build**: `npm run build` → output **`dist`**.
3. **Environment variable**: `VITE_API_URL` = **`https://<backend-project>.vercel.app/api`** (your real backend URL + `/api`).

| File | Purpose |
|------|--------|
| `vercel.json` (repo root) | SPA rewrites so React Router works on refresh. |
| `src/utils/api.js` | Uses `VITE_API_URL` for all API calls. |

### CORS

On the **backend** Vercel project, set `FRONTEND_URL` to your **frontend** URL, e.g. `https://your-web.vercel.app`.  
If unset, CORS stays permissive for development (`origin: true`).

---

## Checklist (full stack on Vercel)

- [ ] Backend project: root **`backend/`**, env `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`.
- [ ] Frontend project: root **`.**, env `VITE_API_URL` = `https://<backend>.vercel.app/api`.
- [ ] MongoDB Atlas network access allows Vercel.
- [ ] Test: open frontend → login → requests go to backend URL.

---

## Monorepo note

- Deploying **only the repo root** on Vercel builds the **Vite app**; it does **not** deploy Express unless you add a separate project with **Root Directory = `backend`**.
