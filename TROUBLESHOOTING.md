# Troubleshooting

## No users when I search / no previous chats

If the sidebar shows no users when you search and no conversation list, the app is almost certainly **not connected to Convex**. You may see in the browser console:

- `WebSocket connection to 'ws://127.0.0.1:3210/api/.../sync' failed`
- Or similar Convex/WebSocket errors

### Fix

1. **Use the Convex cloud URL (not localhost)**  
   Your app must connect to Convex’s cloud backend, not `127.0.0.1`.

   - In the project root, open **`.env.local`** (create it from `.env.local.example` if needed).
   - Set **`NEXT_PUBLIC_CONVEX_URL`** to your Convex deployment URL, for example:
     - `NEXT_PUBLIC_CONVEX_URL=https://elated-akita-626.convex.cloud`
   - You get this URL from:
     - The [Convex Dashboard](https://dashboard.convex.dev) → your project → **Settings** → **Deployment URL**, or
     - The output of **`npx convex dev`** (it prints the deployment URL).

2. **Run the Convex backend (local dev)**  
   For local development, in a terminal run:
   ```bash
   npx convex dev
   ```
   Leave it running. It syncs your Convex functions and keeps the deployment live.

3. **Restart the Next.js app**  
   After changing `.env.local`, restart your dev server (`npm run dev`).

4. **Deployed app (e.g. Vercel)**  
   If the app is deployed, set **`NEXT_PUBLIC_CONVEX_URL`** in the hosting provider’s environment variables to your **production** Convex URL (from the Convex dashboard, production deployment). Do **not** use `127.0.0.1` or `localhost` in production.

Once the WebSocket connects, users and conversations will load. The app also shows an amber **“Can’t connect to Convex”** banner in the sidebar when it detects no connection after a few seconds.

---

## Clerk: development keys warning

Console message:

```text
Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits...
```

- **Local dev:** This is normal. Development keys are for local testing.
- **Production (e.g. Vercel):** Use **production** Clerk keys in your deployment environment variables:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...`
  - `CLERK_SECRET_KEY=sk_live_...`
  Create or use a Production instance in the [Clerk Dashboard](https://dashboard.clerk.com) and add your deployed URL to **Allowed origins**.

---

## “Not authenticated” when starting a chat or creating a group

Convex is not accepting your Clerk JWT. Follow **[CONVEX_CLERK_SETUP.md](./CONVEX_CLERK_SETUP.md)** and set **`CLERK_JWT_ISSUER_DOMAIN`** in the **Convex Dashboard** (Settings → Environment Variables) for the deployment you’re using (dev or production).
