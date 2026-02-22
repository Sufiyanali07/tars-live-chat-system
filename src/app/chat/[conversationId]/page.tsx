import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ChatLayout } from "@/components/chat-layout";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const { conversationId } = await params;
  return <ChatLayout conversationId={conversationId} />;
}
