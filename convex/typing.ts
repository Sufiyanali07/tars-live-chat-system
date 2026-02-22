import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const TYPING_TIMEOUT_MS = 2000;

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    typing: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const clerkId = identity.subject;

    const existing = await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
    const myEntry = existing.find((e) => e.userId === clerkId);
    const now = Date.now();

    if (myEntry) {
      await ctx.db.patch(myEntry._id, { typing: args.typing, updatedAt: now });
    } else if (args.typing) {
      await ctx.db.insert("typing", {
        conversationId: args.conversationId,
        userId: clerkId,
        typing: true,
        updatedAt: now,
      });
    }
  },
});

export const listTyping = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const myClerkId = identity.subject;
    const now = Date.now();
    const entries = await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
    return entries.filter(
      (e) =>
        e.userId !== myClerkId &&
        e.typing &&
        now - e.updatedAt < TYPING_TIMEOUT_MS
    );
  },
});
