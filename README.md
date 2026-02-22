# Tars Chat — Real-time Live Messaging

A production-grade real-time live chat web app built for the **Tars Full Stack Engineer Internship 2026** coding challenge. Clean, minimal UI inspired by WhatsApp Web, iMessage, and Linear.

![Tars Chat](https://via.placeholder.com/800x450?text=Tars+Chat+Screenshot)

## Features

- **Authentication** — Sign up, log in, log out via Clerk (email or social). User name and avatar displayed; profiles synced to Convex.
- **User list & search** — Browse all registered users (excluding yourself). Search by name; click to open or create a DM.
- **One-on-one direct messages** — Private conversations with real-time updates via Convex subscriptions. Sidebar shows all conversations with latest message preview.
- **Smart timestamps** — Today: time only (e.g. 2:34 PM). Older: date + time (e.g. Feb 15, 2:34 PM). Different year includes year.
- **Empty states** — Helpful copy when there are no conversations, no messages, or no search results.
- **Responsive layout** — Desktop: fixed 320px sidebar + chat. Mobile: conversation list first; tap opens full-screen chat with back button.
- **Online/offline status** — Green indicator for users currently in the app; updates in real time.
- **Typing indicator** — “X is typing…” with pulsing dots; clears after ~2s inactivity or when a message is sent.
- **Unread badge** — Badge on each conversation with unread count; clears when the conversation is opened; updates in real time.
- **Smart auto-scroll** — New messages scroll into view when at bottom; when scrolled up, a “↓ New messages” button appears instead.
- **Delete own messages** — Soft delete; shows “This message was deleted” in italics for everyone.
- **Message reactions** — React with 👍 ❤ 😂 😮 😢; click again to remove. Counts shown below the message.
- **Loading & error states** — Skeletons while loading; toast on send failure with retry.
- **Dark/light theme** — System-aware theme support.

## Tech stack

- **Next.js** (App Router)
- **TypeScript**
- **Convex** (database, backend, realtime)
- **Clerk** (authentication)
- **Tailwind CSS**
- **shadcn/ui** + **lucide-react**

## Getting started

### Prerequisites

- Node.js 18+
- npm or yarn
- [Convex](https://convex.dev) account
- [Clerk](https://clerk.com) account

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Tars
npm install
```

### 2. Environment variables

Copy the example env and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# From Convex dashboard (or after running npx convex dev)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# From Clerk dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

In the **Convex dashboard**, set:

- `CLERK_JWT_ISSUER_DOMAIN` — From Clerk: JWT template “convex” → Issuer URL (e.g. `https://your-issuer.clerk.accounts.dev`).

In **Clerk**:

- Create a JWT template named **convex** (exact name).
- Use the Convex docs for the template shape if needed.

### 3. Convex

```bash
npx convex dev
```

This links the project (or creates one), pushes the schema, and runs codegen. Keep it running while developing.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up or sign in, then start a chat from the sidebar.

## Troubleshooting

### "Not authenticated" when starting a chat

Convex needs to verify your Clerk JWT. If you see this error when clicking **Message**:

1. **Clerk JWT template**  
   In [Clerk Dashboard](https://dashboard.clerk.com) → **JWT Templates** → **New template** → choose **Convex**. Name it exactly **convex** (lowercase). Save and copy the **Issuer URL** (e.g. `https://your-clerk-domain.clerk.accounts.dev`).

2. **Convex env variable**  
   In [Convex Dashboard](https://dashboard.convex.dev) → your project → **Settings** → **Environment Variables** → add:
   - **Name:** `CLERK_JWT_ISSUER_DOMAIN`  
   - **Value:** the Issuer URL from step 1 (no trailing slash).

3. Restart your app and try **Message** again. Keep `npx convex dev` running.

### "Could not start chat" or other errors

- Ensure `npx convex dev` is running so the backend is deployed.
- Check the browser console (F12 → Console) for the full error.

## Deployment

For a full, step-by-step guide see **[DEPLOYMENT.md](./DEPLOYMENT.md)**. Summary:

1. **Push to GitHub** — so Vercel can import the repo.
2. **Convex** — create a **production** deployment (`npx convex deploy` or dashboard), set `CLERK_JWT_ISSUER_DOMAIN` for production, copy the **production** deployment URL.
3. **Clerk** — use production (or shared) keys; add your Vercel URL to **allowed origins**; keep the **convex** JWT template.
4. **Vercel** — import repo, add env vars (`NEXT_PUBLIC_CONVEX_URL` = Convex **production** URL, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`), deploy.

Convex hosts the backend; you only deploy the Next.js app on Vercel. After deploy, test sign-in and chat; if you see "Not authenticated", check [CONVEX_CLERK_SETUP.md](./CONVEX_CLERK_SETUP.md) for the production deployment.

## Project structure

```
src/
  app/                    # Next.js App Router
    chat/[conversationId]/ # Chat view
    sign-in/ sign-up/     # Clerk auth
  components/
    ui/                   # shadcn-style components
    chat-layout.tsx       # Main layout (sidebar + panel)
    chat-panel.tsx        # Messages, input, typing
    message-bubble.tsx    # Single message + reactions
    sidebar.tsx           # Users, search, conversations
    typing-indicator.tsx
  lib/
convex/
  schema.ts               # Tables: users, conversations, messages, typing, conversationReads
  users.ts                # Upsert, setOnline, list
  conversations.ts        # getOrCreateDM, list, getById
  conversationsWithPreview.ts  # List with last message + unreadCount
  messages.ts             # send, list, softDelete, addReaction
  typing.ts               # setTyping, listTyping
  conversationReads.ts    # markRead, getRead, listAllReadsForUser
```

## Video walkthrough

**Loom video:** [Add your Loom link here]

- ~30s intro
- Feature demo (auth, search, DM, typing, reactions, unread, auto-scroll)
- Code walk-through of one feature
- Small live change (e.g. color or label) shown in the app
- Closing notes

## License

MIT.
