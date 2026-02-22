# Loom Video Script — Tars Chat (5 min)

## 1. Intro (~30 s)

- "Hi, I'm [Name]. This is my submission for the Tars Full Stack Engineer Internship 2026 coding challenge: a real-time live chat app built with Next.js, TypeScript, Convex, and Clerk."
- Show the app briefly (sidebar + empty chat or one conversation).

## 2. Feature demo (~2 min)

- **Auth:** "I'm signed in with Clerk; my name and avatar are in the sidebar. Sign out is in the user menu."
- **User list & search:** "I can search for users by name. Clicking a user opens or creates a one-on-one conversation."
- **Real-time chat:** Send a message; show it appearing on both sides (or in two tabs). "Messages and the conversation list update in real time via Convex."
- **Timestamps:** Point out time-only for today, date+time for older messages.
- **Empty states:** "If there are no conversations or no messages, we show clear empty-state copy."
- **Responsive:** Resize to mobile (or use DevTools). "On mobile, the default view is the conversation list; opening a chat is full-screen with a back button."
- **Online status:** "The green dot shows who’s online; it updates when they open or leave the app."
- **Typing indicator:** Type in the input (or have another tab/user type). "We show ‘X is typing…’ with the three dots; it goes away after a couple of seconds or when they send."
- **Unread badge:** "Unread count appears on conversations and clears when you open the conversation."
- **Auto-scroll:** "New messages scroll into view when you’re at the bottom; if you’ve scrolled up, a ‘New messages’ button appears instead."
- **Optional:** "You can delete your own messages (soft delete) and add reactions with the fixed emoji set."

## 3. Code walk-through (~1.5 min)

- Open the project in your editor.
- Pick **one** feature you’re proud of (e.g. real-time subscriptions, unread count, or typing indicator).
- **Example — Convex subscription:** Open `src/components/chat-panel.tsx` (or the file that uses `useQuery(api.messages.list, …)`). Say: "Messages are loaded with Convex’s useQuery; that’s a live subscription, so when new messages are added they show up without a refresh."
- Optionally show the Convex function that backs it: e.g. `convex/messages.ts` — `list` query.

## 4. Live code change (~45 s)

- Make a **small, visible** change, e.g.:
  - In `src/app/globals.css` or a component: change a primary color or a label (e.g. "Type a message..." → "Send a message...").
  - Or in a message bubble: change `rounded-xl` to `rounded-2xl`.
- Save and show the app in the browser with the change visible. "Here’s the same screen with [the change] applied."

## 5. Closing (~15 s)

- "That’s my submission: real-time chat with the required features, optional delete/reactions, and a clean UI. Code is on GitHub, the app is deployed on Vercel, and the repo includes a README with setup and env instructions. Thanks for watching."

---

**Checklist before recording**

- [ ] Camera on, face visible
- [ ] App running and deployed version works
- [ ] One feature chosen for code walk-through
- [ ] One small edit chosen for live change
- [ ] ~5 minutes total; practice once if possible
