"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, MessageCircle, Users } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserListItem } from "@/components/user-list-item";
import { ConvexUser } from "@/types";
import { toast } from "sonner";

type SidebarProps = {
  currentConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
};

export function Sidebar({
  currentConversationId,
  onSelectConversation,
}: SidebarProps) {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [startingChatWithClerkId, setStartingChatWithClerkId] = useState<string | null>(null);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const conversations = useQuery(api.conversationsWithPreview.listWithPreview);
  const users = useQuery(api.users.list);
  const getOrCreateDM = useMutation(api.conversations.getOrCreateDM);
  const createGroup = useMutation(api.conversations.createGroup);
  const myClerkId = user?.id ?? "";

  const filteredUsers =
    users?.filter(
      (u) =>
        u.clerkId !== myClerkId &&
        (search.trim() === "" ||
          u.fullName.toLowerCase().includes(search.toLowerCase()))
    ) ?? [];

  const getOtherMember = (members: string[]) =>
    members.find((m) => m !== myClerkId);
  const getUserByClerkId = (clerkId: string) =>
    users?.find((u) => u.clerkId === clerkId);
  const getConversationTitle = (conv: NonNullable<typeof conversations>[0]) => {
    if (conv.isGroup && conv.name) return conv.name;
    const otherId = getOtherMember(conv.members);
    const other = otherId ? getUserByClerkId(otherId) : null;
    return other?.fullName ?? "Unknown";
  };
  const getConversationAvatar = (conv: NonNullable<typeof conversations>[0]) => {
    if (conv.isGroup) return null;
    const otherId = getOtherMember(conv.members);
    const other = otherId ? getUserByClerkId(otherId) : null;
    return other?.avatar ?? null;
  };
  async function startChatWithUser(otherClerkId: string): Promise<string | null> {
    setStartingChatWithClerkId(otherClerkId);
    try {
      const id = await getOrCreateDM({ otherClerkId });
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not start chat";
      toast.error(message);
      return null;
    } finally {
      setStartingChatWithClerkId(null);
    }
  }
  type ConversationWithPreview = NonNullable<typeof conversations>[number];
  const getUnreadCount = (conv: ConversationWithPreview) => {
    if (conv._id === currentConversationId) return 0;
    return conv.unreadCount ?? 0;
  };

  return (
    <div className="flex h-full w-full flex-col bg-card">
      <header className="shrink-0 border-b border-border bg-primary/5 px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 shrink-0 ring-2 ring-background">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName ?? ""} />
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              {(user?.fullName ?? "U").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-foreground">
              {user?.fullName ?? "You"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress ?? ""}
            </p>
          </div>
          <ThemeToggle />
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>

      <div className="flex shrink-0 px-3 py-3">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search or start a chat"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-full border-border/80 bg-muted/50 pl-10 focus-visible:ring-2"
          />
        </div>
      </div>

      <Separator className="opacity-60" />

      {search.trim() !== "" ? (
        <ScrollArea className="flex-1">
          <div className="space-y-0.5 p-2">
            <p className="mb-2 px-2 text-xs text-muted-foreground">
              Tap Message or click a user to start chatting
            </p>
            {!users ? (
              <Skeleton className="h-12 w-full rounded-lg" />
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No users found.
              </div>
            ) : (
              filteredUsers.map((u) => (
                <UserListItem
                  key={u._id}
                  user={u as ConvexUser}
                  isLoading={startingChatWithClerkId === u.clerkId}
                  onStartChat={() => {
                    startChatWithUser(u.clerkId).then((id) => {
                      if (id) onSelectConversation(id);
                    });
                  }}
                />
              ))
            )}
          </div>
        </ScrollArea>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-0.5 p-2">
            <Button
              type="button"
              variant="outline"
              className="mb-2 w-full justify-start gap-2 rounded-2xl border-dashed"
              onClick={() => setGroupDialogOpen(true)}
            >
              <Users className="h-4 w-4" />
              New group
            </Button>
            {!conversations ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-14 px-4 text-center">
                <div className="rounded-full bg-muted p-4">
                  <MessageCircle className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  No chats yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Search above to find someone and start a conversation
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const title = getConversationTitle(conv);
                const avatar = getConversationAvatar(conv);
                const unread = getUnreadCount(conv);
                const isActive = currentConversationId === conv._id;
                return (
                  <button
                    key={conv._id}
                    type="button"
                    onClick={() => onSelectConversation(conv._id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200",
                      isActive
                        ? "bg-primary/10 shadow-sm"
                        : "hover:bg-muted/70 active:bg-muted/90"
                    )}
                  >
                    <Avatar className="h-12 w-12 shrink-0 ring-1 ring-border/50">
                      <AvatarImage src={avatar ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                        {title.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">
                        {title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {conv.lastMessage
                          ? conv.lastMessage.content
                          : "No messages yet"}
                      </p>
                    </div>
                    {unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      )}

      <CreateGroupDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        users={users?.filter((u) => u.clerkId !== myClerkId) ?? []}
        onCreateGroup={async (name, memberClerkIds) => {
          const id = await createGroup({ name, memberClerkIds });
          onSelectConversation(id);
          setGroupDialogOpen(false);
          toast.success("Group created");
        }}
      />
    </div>
  );
}

type CreateGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: ConvexUser[];
  onCreateGroup: (name: string, memberClerkIds: string[]) => Promise<void>;
};

function CreateGroupDialog({
  open,
  onOpenChange,
  users,
  onCreateGroup,
}: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const toggleUser = (clerkId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(clerkId)) next.delete(clerkId);
      else next.add(clerkId);
      return next;
    });
  }

  const handleCreate = async () => {
    const name = groupName.trim();
    if (!name || selectedIds.size === 0) {
      toast.error("Enter a group name and select at least one member.");
      return;
    }
    setLoading(true);
    try {
      await onCreateGroup(name, Array.from(selectedIds));
      setGroupName("");
      setSelectedIds(new Set());
    } catch {
      // toast handled by parent/sidebar
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setGroupName("");
      setSelectedIds(new Set());
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create group</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Input
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="rounded-lg"
          />
          <ScrollArea className="max-h-[240px] rounded-lg border border-border p-2">
            <div className="space-y-1">
              {users.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No other users to add.</p>
              ) : (
                users.map((u) => (
                  <label
                    key={u._id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/70"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(u.clerkId)}
                      onChange={() => toggleUser(u.clerkId)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback className="text-xs">{u.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm font-medium">{u.fullName}</span>
                  </label>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading || !groupName.trim() || selectedIds.size === 0}
          >
            {loading ? "Creating…" : "Create group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
