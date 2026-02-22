# Deploying Tars Chat

This guide walks you through deploying the app in a production-ready way: **Vercel** for the Next.js frontend, **Convex** for the backend (already hosted), and **Clerk** for auth.

---

## Overview

| Service   | Role              | Where to deploy / configure      |
|----------|-------------------|-----------------------------------|
| **Vercel** | Next.js app       | Import from GitHub, add env vars  |
| **Convex** | DB + realtime API | Production deployment (CLI or dashboard) |
| **Clerk**  | Auth              | Use production keys + allowed origins   |

---

## Step 1: Push code to GitHub

If you haven’t already:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Use a **.gitignore** that excludes `.env.local` and `.env` (the project already does this).

---

## Step 2: Convex production deployment

Convex separates **development** and **production** deployments.

1. **Create a production deployment** (one-time):
   - [Convex Dashboard](https://dashboard.convex.dev) → your project → **Settings** → **Deployments**, or
   - CLI: `npx convex deploy` (creates/uses a production deployment).

2. **Set production env var for Clerk**  
   In the Convex dashboard, switch to the **production** deployment, then:
   - **Settings** → **Environment Variables**
   - Add `CLERK_JWT_ISSUER_DOMAIN` with the same Clerk Issuer URL you use in production (see Step 3).  
   If you use the same Clerk application for dev and prod, the value is the same as in dev.

3. **Get the production Convex URL**  
   In the dashboard, select the **production** deployment and copy the **Deployment URL** (e.g. `https://your-prod-name.convex.cloud`). You’ll use this in Vercel.

---

## Step 3: Clerk (production)

1. In [Clerk Dashboard](https://dashboard.clerk.com), use your existing app or create a **Production** instance.
2. **API Keys:** copy:
   - **Publishable key** (starts with `pk_live_...` for production)
   - **Secret key** (starts with `sk_live_...`)
3. **Allowed origins (important):**
   - **Paths:** **Domains** or **Redirect / allowlist**
   - Add your Vercel URL, e.g. `https://your-app.vercel.app`
   - If you add a custom domain later, add that too (e.g. `https://chat.yourdomain.com`).
4. **JWT template for Convex:**  
   Ensure you have a JWT template named **convex** (same as in [CONVEX_CLERK_SETUP.md](./CONVEX_CLERK_SETUP.md)). Production usually uses the same template; the **Issuer URL** is what you set in Convex as `CLERK_JWT_ISSUER_DOMAIN`.

---

## Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. **Add New Project** → import your GitHub repo.
3. **Configure:**
   - **Framework Preset:** Next.js (auto-detected).
   - **Root Directory:** leave default (project root).
   - **Build Command:** `npm run build` (default).
   - **Output Directory:** default.

4. **Environment variables** (add these before or after first deploy):

   | Name                             | Value                                      | Notes                    |
   |----------------------------------|--------------------------------------------|--------------------------|
   | `NEXT_PUBLIC_CONVEX_URL`         | `https://your-**prod**-deployment.convex.cloud` | From Convex **production** deployment |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` (or `pk_test_...`)           | From Clerk               |
   | `CLERK_SECRET_KEY`               | `sk_live_...` (or `sk_test_...`)           | From Clerk, keep secret  |

   For **production**, use Convex **production** URL and Clerk **live** keys if you have them.

5. Click **Deploy**. Wait for the build to finish.

---

## Step 5: Post-deploy checklist

- **Clerk:** Confirm your Vercel URL (and custom domain if any) is in Clerk’s allowed origins.
- **Convex:** Confirm `CLERK_JWT_ISSUER_DOMAIN` is set for the **production** deployment and matches Clerk’s Issuer.
- **Test:** Open `https://your-app.vercel.app`, sign in, open a chat, send a message. If you see “Not authenticated”, re-check the Convex env var and Clerk JWT template name/issuer (see [CONVEX_CLERK_SETUP.md](./CONVEX_CLERK_SETUP.md)).

---

## Optional: Custom domain (Vercel)

1. Vercel project → **Settings** → **Domains** → add your domain.
2. In Clerk, add the new domain to allowed origins.
3. No change needed in Convex for domain (it uses the Convex URL, not your app domain).

---

## Optional: Preview / staging

- Use a **separate Convex deployment** (e.g. “preview”) and a **Clerk development** (or separate) application for preview branches.
- In Vercel, set different env vars per branch or environment (e.g. **Preview** vs **Production**) so preview uses the preview Convex URL and Clerk keys.

---

## Summary

1. Push code to GitHub.
2. Convex: create production deployment, set `CLERK_JWT_ISSUER_DOMAIN`, copy production URL.
3. Clerk: get production (or shared) keys, add Vercel URL to allowed origins, keep **convex** JWT template.
4. Vercel: import repo, add `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, deploy.
5. Test sign-in and chat; fix “Not authenticated” with Convex env + Clerk issuer if needed.

For auth issues in production, the same steps in [CONVEX_CLERK_SETUP.md](./CONVEX_CLERK_SETUP.md) apply to your **production** Convex deployment and Clerk issuer.
