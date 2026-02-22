"use client";

type TypingIndicatorProps = { users: string[] };

export function TypingIndicator({ users }: TypingIndicatorProps) {
  const label =
    users.length === 0
      ? ""
      : users.length === 1
        ? `${users[0]} is typing...`
        : "Someone is typing...";

  return (
    <div className="flex w-full justify-start pl-12">
      <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted/80 px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/80 animate-pulse" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/80 animate-pulse" style={{ animationDelay: "150ms" }} />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/80 animate-pulse" style={{ animationDelay: "300ms" }} />
        </div>
        {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
