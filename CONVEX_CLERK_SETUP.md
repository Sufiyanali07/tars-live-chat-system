# Fix "Not authenticated" — Convex + Clerk setup

The error **"Not authenticated"** from `getOrCreateDM` means Convex is not accepting your Clerk JWT. Convex runs in the cloud and does **not** read your local `.env.local`. You must set the issuer in the **Convex Dashboard**.

---

## Step 1: Get the Issuer URL from Clerk

1. Open **[Clerk Dashboard](https://dashboard.clerk.com)** → your application.
2. In the left sidebar go to **JWT Templates** (or **Configure** → **JWT Templates**).
3. Click **New template**.
4. Choose **Convex** from the list (or "Blank" and configure for Convex).
5. **Important:** Leave the template name as **convex** (all lowercase). Do not rename it.
6. Save the template.
7. On the template page, find **Issuer** and copy the full URL.  
   It looks like: `https://your-name-00.clerk.accounts.dev` (no path, no trailing slash).

---

## Step 2: Set the variable in Convex Dashboard

1. Open **[Convex Dashboard](https://dashboard.convex.dev)**.
2. Select your **project** (the one used when you run `npx convex dev`).
3. In the left sidebar, select your **development** deployment (e.g. "dev").
4. Go to **Settings** → **Environment Variables**.
5. Click **Add environment variable**.
6. Set:
   - **Name:** `CLERK_JWT_ISSUER_DOMAIN`
   - **Value:** the Issuer URL from Step 1 (e.g. `https://your-name-00.clerk.accounts.dev`)
7. Save.

---

## Step 3: Sync Convex

In your project folder run:

```bash
npx convex dev
```

Leave it running so your backend uses the new env var.

---

## Step 4: Try again

1. Refresh your app in the browser (or restart `npm run dev` if needed).
2. Search for a user and click **Message**.

If you still see "Not authenticated", double-check:

- The JWT template in Clerk is named exactly **convex**.
- You copied the **Issuer** URL, not the JWKS or another URL.
- You added `CLERK_JWT_ISSUER_DOMAIN` in the **Convex** dashboard (not only in `.env.local`).
- You’re in the correct Convex project and **development** deployment in the dashboard.
