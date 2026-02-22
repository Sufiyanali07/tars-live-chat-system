import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ChatLayout } from "@/components/chat-layout";

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return <ChatLayout />;
}
