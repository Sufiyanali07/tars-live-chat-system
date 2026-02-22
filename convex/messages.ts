import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { emojiToKey } from "./reactions";

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const clerkId = identity.subject;

    const conv = await ctx.db.get(args.conversationId);
    if (!conv || !conv.members.includes(clerkId))
      throw new Error("Conversation not found or access denied");

    const now = Date.now();
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: clerkId,
      content: args.content.trim(),
      createdAt: now,
      deleted: false,
      reactions: {},
    });
    await ctx.db.patch(args.conversationId, { lastMessageAt: now });
    return null;
  },
});

export const list = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const conv = await ctx.db.get(args.conversationId);
    if (!conv || !conv.members.includes(identity.subject)) return [];
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation_created", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
  },
});

export const softDelete = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const msg = await ctx.db.get(args.messageId);
    if (!msg || msg.senderId !== identity.subject)
      throw new Error("Not allowed to delete");
    await ctx.db.patch(args.messageId, {
      deleted: true,
      content: "",
    });
    return null;
  },
});

export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const msg = await ctx.db.get(args.messageId);
    if (!msg) throw new Error("Message not found");

    const key = emojiToKey(args.emoji) ?? args.emoji;
    if (!/^[\x20-\x7E]+$/.test(key)) {
      throw new Error("Invalid reaction: use ASCII-safe key or known emoji");
    }

    const reactions = { ...msg.reactions };
    const list = reactions[key] ?? [];
    const idx = list.indexOf(identity.subject);
    if (idx >= 0) {
      list.splice(idx, 1);
      if (list.length === 0) delete reactions[key];
      else reactions[key] = list;
    } else {
      reactions[key] = [...list, identity.subject];
    }
    await ctx.db.patch(args.messageId, { reactions });
    return null;
  },
});
