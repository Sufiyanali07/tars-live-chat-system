"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const REACTIONS = ["👍", "❤", "😂", "😮", "😢"];

const KEY_TO_EMOJI: Record<string, string> = {
  thumbs_up: "👍",
  heart: "❤",
  joy: "😂",
  astonished: "😮",
  cry: "😢",
};

function reactionKeyToEmoji(key: string): string {
  return KEY_TO_EMOJI[key] ?? key;
}

type MessageBubbleProps = {
  message: {
    _id: Id<"messages">;
    senderId: string;
    content: string;
    createdAt: number;
    deleted: boolean;
    reactions: Record<string, string[]>;
  };
  isOwn: boolean;
  senderName: string;
  formatTime: (ts: number) => string;
  conversationId: Id<"conversations">;
};

export function MessageBubble({
  message,
  isOwn,
  senderName,
  formatTime,
  conversationId,
}: MessageBubbleProps) {
  const deleteMessage = useMutation(api.messages.softDelete);
  const addReaction = useMutation(api.messages.addReaction);

  const handleDelete = () => {
    deleteMessage({ messageId: message._id });
  };

  return (
    <div
      className={cn(
        "flex w-full animate-in fade-in-50 duration-200",
        isOwn ? "justify-end pl-12" : "justify-start pr-12"
      )}
    >
      <div className="group relative flex max-w-[75%] flex-col items-end gap-0.5">
        {/* Main bubble */}
        <div
          className={cn(
            "relative min-w-[60px] max-w-full px-4 py-2.5 transition-shadow duration-200",
            isOwn ? "chat-bubble-sent" : "chat-bubble-received"
          )}
        >
          {!isOwn && (
            <p className="mb-1 text-xs font-semibold opacity-90">
              {senderName}
            </p>
          )}
          {message.deleted ? (
            <p className="italic text-sm opacity-80">This message was deleted</p>
          ) : (
            <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">
              {message.content}
            </p>
          )}
          <div className="mt-1 flex items-center justify-end gap-1.5">
            <span
              className={cn(
                "text-[11px]",
                isOwn ? "opacity-80" : "text-muted-foreground"
              )}
            >
              {formatTime(message.createdAt)}
            </span>
            {isOwn && !message.deleted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Reactions row */}
        {Object.keys(message.reactions).length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {Object.entries(message.reactions).map(([key, userIds]) =>
              userIds.length > 0 ? (
                <TooltipProvider key={key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() =>
                          addReaction({
                            messageId: message._id,
                            emoji: reactionKeyToEmoji(key),
                          })
                        }
                        className="inline-flex items-center gap-0.5 rounded-full border border-border/50 bg-background/95 px-2 py-0.5 text-xs shadow-sm transition-all hover:scale-105 hover:shadow active:scale-95 dark:bg-card/95"
                      >
                        <span>{reactionKeyToEmoji(key)}</span>
                        {userIds.length > 1 && (
                          <span className="text-muted-foreground">
                            {userIds.length}
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Click to toggle your reaction
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null
            )}
          </div>
        )}

        {/* Quick reaction bar - appears on hover */}
        {!message.deleted && (
          <div className="mt-0.5 flex gap-0.5 rounded-full bg-muted/80 px-1.5 py-1 opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addReaction({ messageId: message._id, emoji })}
                className="flex h-7 w-7 items-center justify-center rounded-full text-sm transition-transform hover:scale-125 active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
