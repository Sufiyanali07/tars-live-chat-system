"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ConvexUser } from "@/types";
import { MessageCircle } from "lucide-react";

type UserListItemProps = {
  user: ConvexUser;
  onStartChat: () => void;
  className?: string;
};

export function UserListItem({
  user,
  onStartChat,
  className,
}: UserListItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onStartChat()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onStartChat();
        }
      }}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200 hover:bg-muted/70 active:bg-muted/90",
        className
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11 ring-1 ring-border/50">
          <AvatarImage src={user.avatar} alt={user.fullName} />
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {user.fullName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {user.online && (
          <span
            className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500"
            aria-label="Online"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{user.fullName}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="default"
        className="shrink-0 gap-1.5 rounded-full"
        onClick={(e) => {
          e.stopPropagation();
          onStartChat();
        }}
        aria-label={`Start chat with ${user.fullName}`}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Message</span>
      </Button>
    </div>
  );
}
