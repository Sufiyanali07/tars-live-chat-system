"use client";

import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { ChatPanel } from "@/components/chat-panel";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

type ChatLayoutProps = { conversationId?: string };

export function ChatLayout({ conversationId: conversationIdProp }: ChatLayoutProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const conversationIdFromPath = pathname?.startsWith("/chat/")
    ? pathname.replace("/chat/", "").split("/")[0]
    : null;
  const conversationId = conversationIdProp ?? conversationIdFromPath ?? null;

  const onSelectConversation = (id: string) => {
    router.push(`/chat/${id}`);
    setSheetOpen(false);
  };

  const sidebar = (
    <Sidebar
      currentConversationId={conversationId || undefined}
      onSelectConversation={onSelectConversation}
    />
  );

  return (
    <div className="flex h-screen w-full flex-row overflow-hidden bg-background">
      {/* Desktop: sidebar on the left */}
      <aside className="hidden w-[340px] shrink-0 flex-col border-r border-border bg-card shadow-sm md:flex">
        {sidebar}
      </aside>

      {/* Mobile: full-width area (list or chat) */}
      <div className="flex w-full flex-1 flex-col md:hidden">
        {conversationId ? (
          <div className="flex h-full flex-col">
            <header className="flex shrink-0 items-center gap-2 border-b border-border bg-background px-4 py-3 shadow-sm">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Back to conversations">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] p-0">
                  {sidebar}
                </SheetContent>
              </Sheet>
            </header>
            <ChatPanel
              conversationId={conversationId}
              onBack={() => router.push("/")}
            />
          </div>
        ) : (
          <div className="flex h-full flex-col">
            {sidebar}
            <EmptyStateMobile />
          </div>
        )}
      </div>

      {/* Desktop: chat area on the right (WhatsApp Web style) */}
      <main className="hidden min-w-0 flex-1 flex-col overflow-hidden md:flex">
        {conversationId ? (
          <ChatPanel conversationId={conversationId} />
        ) : (
          <EmptyStateDesktop />
        )}
      </main>
    </div>
  );
}

function EmptyStateDesktop() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="rounded-full bg-muted p-6">
        <span className="text-5xl">💬</span>
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">
          Tars Chat
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a chat from the sidebar or search for someone to start messaging
        </p>
      </div>
    </div>
  );
}

function EmptyStateMobile() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="rounded-full bg-muted p-4">
        <span className="text-3xl">💬</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Open the menu to see your conversations
      </p>
    </div>
  );
}
