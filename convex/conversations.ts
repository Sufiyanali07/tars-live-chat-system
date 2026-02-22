import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function sortMembers(members: string[]) {
  return [...members].sort();
}

export const getOrCreateDM = mutation({
  args: { otherClerkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const myClerkId = identity.subject;
    if (myClerkId === args.otherClerkId) throw new Error("Cannot DM yourself");

    const members = sortMembers([myClerkId, args.otherClerkId]);
    const membersKey = members.join("_");
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_members_key", (q) => q.eq("membersKey", membersKey))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      isGroup: false,
      members,
      membersKey,
      lastMessageAt: 0,
    });
  },
});

export const createGroup = mutation({
  args: {
    name: v.string(),
    memberClerkIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const myClerkId = identity.subject;
    const members = Array.from(
      new Set([myClerkId, ...args.memberClerkIds])
    );
    return await ctx.db.insert("conversations", {
      isGroup: true,
      name: args.name,
      members,
      lastMessageAt: 0,
    });
  },
});

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const clerkId = identity.subject;
    const all = await ctx.db
      .query("conversations")
      .withIndex("by_last_message")
      .order("desc")
      .collect();
    return all.filter((c) => c.members.includes(clerkId));
  },
});

export const getById = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});
