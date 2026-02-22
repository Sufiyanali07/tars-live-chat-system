"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Send } from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import { MessageBubble } from "@/components/message-bubble";
import { TypingIndicator } from "@/components/typing-indicator";
import { formatMessageTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ChatPanelProps = {
  conversationId: string;
  onBack?: () => void;
};

export function ChatPanel({ conversationId, onBack }: ChatPanelProps) {
  const router = useRouter();
  const { user } = useUser();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [atBottom, setAtBottom] = useState(true);
  const [showNewMessages, setShowNewMessages] = useState(false);
  const prevMessageCountRef = useRef(0);

  const convId = conversationId as Id<"conversations">;
  const conversation = useQuery(api.conversations.getById, { conversationId: convId });
  const messages = useQuery(api.messages.list, { conversationId: convId });
  const typingUsers = useQuery(api.typing.listTyping, { conversationId: convId });
  const sendMessage = useMutation(api.messages.send);
  const setTyping = useMutation(api.typing.setTyping);
  const markRead = useMutation(api.conversationReads.markRead);

  const myClerkId = user?.id ?? "";
  const users = useQuery(api.users.list);
  const getUser = useCallback(
    (clerkId: string) => users?.find((u) => u.clerkId === clerkId),
    [users]
  );

  useEffect(() => {
    if (!messages?.length) return;
    const latest = messages[messages.length - 1];
    markRead({ conversationId: convId, lastReadAt: latest.createdAt });
  }, [convId, messages, markRead]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAtBottom(nearBottom);
    if (nearBottom) setShowNewMessages(false);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll, messages?.length]);

  useEffect(() => {
    if (!messages?.length) return;
    const count = messages.length;
    if (prevMessageCountRef.current > 0 && count > prevMessageCountRef.current) {
      if (atBottom) {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      } else {
        setShowNewMessages(true);
      }
    } else if (atBottom) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
    prevMessageCountRef.current = count;
  }, [messages?.length, atBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setTyping({ conversationId: convId, typing: false });
    try {
      await sendMessage({ conversationId: convId, content: text });
    } catch (e) {
      toast.error("Failed to send. Try again.");
      setInput(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setTyping({ conversationId: convId, typing: e.target.value.length > 0 });
  };

  const otherMembers =
    conversation?.members.filter((m) => m !== myClerkId) ?? [];
  const title = conversation?.isGroup
    ? conversation.name ?? `${otherMembers.length} members`
    : getUser(otherMembers[0] ?? "")?.fullName ?? "Chat";
  const headerAvatar = conversation?.isGroup
    ? null
    : getUser(otherMembers[0] ?? "")?.avatar;

  if (!conversation) {
    return (
      <div className="flex h-full flex-col">
        {onBack && (
          <header className="flex shrink-0 items-center gap-2 border-b border-border bg-background px-4 py-3 shadow-sm">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Skeleton className="h-6 w-48" />
          </header>
        )}
        <div className="flex flex-1 items-center justify-center">
          <Skeleton className="h-64 w-full max-w-md rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col bg-background">
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card/95 px-4 py-3 shadow-sm backdrop-blur-sm">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Back to conversations"
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {title.slice(0, 1).toUpperCase()}
            </div>
            {!conversation.isGroup && otherMembers[0] && getUser(otherMembers[0])?.online && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-foreground">
              {title}
            </h1>
            {!conversation.isGroup && otherMembers[0] && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    getUser(otherMembers[0])?.online ? "bg-green-500" : "bg-muted-foreground/60"
                  )}
                />
                {getUser(otherMembers[0])?.online ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/20"
        onScroll={handleScroll}
      >
        <div className="flex flex-col gap-2 py-4 pl-2 pr-4 md:pl-3">
          {!messages?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4">
                <span className="text-3xl">💬</span>
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No messages yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Say hello to start the conversation
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={msg.senderId === myClerkId}
                senderName={getUser(msg.senderId)?.fullName ?? "Unknown"}
                formatTime={formatMessageTime}
                conversationId={convId}
              />
            ))
          )}
          {typingUsers && typingUsers.length > 0 && (
            <TypingIndicator
              users={typingUsers.map((t) => getUser(t.userId)?.fullName ?? "Someone")}
            />
          )}
        </div>
      </div>

      {showNewMessages && (
        <div className="flex justify-center py-2">
          <Button
            variant="default"
            size="sm"
            className="rounded-full shadow-md"
            onClick={() => {
              scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
              });
              setShowNewMessages(false);
              setAtBottom(true);
            }}
          >
            ↓ New messages
          </Button>
        </div>
      )}

      <div className="shrink-0 border-t border-border bg-card/80 p-3 backdrop-blur-sm">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-background px-3 py-2 shadow-sm">
          <Textarea
            placeholder="Message"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            className="min-h-[40px] max-h-28 resize-none border-0 bg-transparent px-0 py-2.5 text-sm shadow-none focus-visible:ring-0"
          />
          <Button
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
