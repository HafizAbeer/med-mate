# Deploy Med-Mate on Vercel (frontend)

This repo is set up so the **React + Vite app** can be deployed to **Vercel**. The **Express API** is **not** run by Vercel in this setup — host the backend separately (Railway, Render, Fly.io, a VPS, etc.) and point the frontend at it.

## What was added

| File | Purpose |
|------|--------|
| `vercel.json` | SPA fallback: all routes serve `index.html` so React Router works on refresh. |
| `src/utils/api.js` | Already uses `VITE_API_URL` for the API base (required in production). |

## 1. Deploy the backend first

1. Deploy `backend/` to your host (Node 18+), set env: `MONGO_URI`, `JWT_SECRET`, `PORT` (or host default), optional `HUGGINGFACE_API_TOKEN`.
2. Note the public API base URL, e.g. `https://api.yourdomain.com/api` or `https://your-service.onrender.com/api`.

## 2. Deploy the frontend on Vercel

1. **Import** the Git repo in [Vercel](https://vercel.com).
2. **Root directory**: leave as **repository root** (where `package.json` and `vite.config.js` are).
3. **Framework**: Vite (auto-detected).
4. **Build command**: `npm run build` (default).
5. **Output directory**: `dist` (Vite default).
6. **Environment variables** (Project → Settings → Environment Variables):

   | Name | Value | Environments |
   |------|--------|----------------|
   | `VITE_API_URL` | Your backend API root, e.g. `https://api.example.com/api` | Production, Preview |

   **Important:** Include the `/api` suffix if your Express app is mounted at `/api` (this project uses that).

7. Redeploy after adding or changing `VITE_API_URL`.

## 3. CORS on the backend

In **`backend/.env`** on your API server, set:

```env
FRONTEND_URL=https://your-project.vercel.app
```

Use your real Vercel URL (no trailing slash). For preview deployments, you can add comma-separated URLs:

```env
FRONTEND_URL=https://your-project.vercel.app,https://your-project-*.vercel.app
```

Or use one stable **production** URL only. If `FRONTEND_URL` is omitted, the server keeps permissive CORS (`origin: true`) for local/testing.

## 4. Checklist

- [ ] Backend reachable over **HTTPS**.
- [ ] `VITE_API_URL` matches backend base (with `/api` if applicable).
- [ ] `FRONTEND_URL` on backend matches your Vercel site URL(s).
- [ ] MongoDB (e.g. Atlas) allows connections from the API server’s IP / `0.0.0.0/0` as appropriate.

## 5. Local build (same as Vercel)

```bash
npm install
npm run build
npx vite preview
```

---

**Monorepo note:** The `backend/` folder is not built by Vercel when the root project is the Vite app; only the frontend is deployed from this configuration.
