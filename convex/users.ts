import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const upsert = mutation({
  args: {
    clerkId: v.string(),
    fullName: v.string(),
    email: v.string(),
    avatar: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        fullName: args.fullName,
        email: args.email,
        avatar: args.avatar,
        online: true,
        lastSeen: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      fullName: args.fullName,
      email: args.email,
      avatar: args.avatar,
      online: true,
      lastSeen: now,
    });
  },
});

export const setOnline = mutation({
  args: { clerkId: v.string(), online: v.boolean() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) return;
    await ctx.db.patch(user._id, {
      online: args.online,
      lastSeen: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});
