import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    fullName: v.string(),
    email: v.string(),
    avatar: v.string(),
    online: v.boolean(),
    lastSeen: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  conversations: defineTable({
    isGroup: v.boolean(),
    name: v.optional(v.string()),
    members: v.array(v.string()),
    membersKey: v.optional(v.string()),
    lastMessageAt: v.number(),
  })
    .index("by_members_key", ["membersKey"])
    .index("by_last_message", ["lastMessageAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
    createdAt: v.number(),
    deleted: v.boolean(),
    reactions: v.record(v.string(), v.array(v.string())),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_created", ["conversationId", "createdAt"]),

  typing: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    typing: v.boolean(),
    updatedAt: v.number(),
  }).index("by_conversation", ["conversationId"]),

  conversationReads: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    lastReadAt: v.number(),
  }).index("by_conversation_user", ["conversationId", "userId"]),
});
