import { v } from "convex/values";
import { query } from "./_generated/server";

export const listWithPreview = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const clerkId = identity.subject;
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_last_message")
      .order("desc")
      .collect();
    const mine = conversations.filter((c) => c.members.includes(clerkId));
    const reads = await ctx.db.query("conversationReads").collect();
    const readMap = new Map<string, number>();
    reads.forEach((r) => {
      if (r.userId === clerkId)
        readMap.set(r.conversationId, Math.max(readMap.get(r.conversationId) ?? 0, r.lastReadAt));
    });

    const result = await Promise.all(
      mine.map(async (conv) => {
        const lastMsg = await ctx.db
          .query("messages")
          .withIndex("by_conversation_created", (q) =>
            q.eq("conversationId", conv._id)
          )
          .order("desc")
          .first();
        const lastRead = readMap.get(conv._id) ?? 0;
        const allMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation_created", (q) =>
            q.eq("conversationId", conv._id)
          )
          .collect();
        const unreadCount = allMessages.filter(
          (m) => m.senderId !== clerkId && m.createdAt > lastRead
        ).length;

        return {
          ...conv,
          lastMessage: lastMsg
            ? {
                content: lastMsg.deleted
                  ? "This message was deleted"
                  : lastMsg.content,
                createdAt: lastMsg.createdAt,
                senderId: lastMsg.senderId,
              }
            : null,
          unreadCount,
        };
      })
    );
    return result;
  },
});
