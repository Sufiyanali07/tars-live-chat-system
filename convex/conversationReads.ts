import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const markRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    lastReadAt: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const clerkId = identity.subject;

    const existing = await ctx.db
      .query("conversationReads")
      .withIndex("by_conversation_user", (q) =>
        q
          .eq("conversationId", args.conversationId)
          .eq("userId", clerkId)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        lastReadAt: Math.max(existing.lastReadAt, args.lastReadAt),
      });
    } else {
      await ctx.db.insert("conversationReads", {
        conversationId: args.conversationId,
        userId: clerkId,
        lastReadAt: args.lastReadAt,
      });
    }
  },
});

export const getRead = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("conversationReads")
      .withIndex("by_conversation_user", (q) =>
        q
          .eq("conversationId", args.conversationId)
          .eq("userId", identity.subject)
      )
      .unique();
  },
});

export const listAllReadsForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const reads = await ctx.db.query("conversationReads").collect();
    return reads.filter((r) => r.userId === identity.subject);
  },
});
