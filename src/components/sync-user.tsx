"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function SyncUser() {
  const { user, isLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsert);
  const setOnline = useMutation(api.users.setOnline);

  useEffect(() => {
    if (!isLoaded || !user) return;
    upsertUser({
      clerkId: user.id,
      fullName: user.fullName ?? "Unknown",
      email: user.primaryEmailAddress?.emailAddress ?? "",
      avatar: user.imageUrl ?? "",
    }).catch(() => {});
  }, [isLoaded, user, upsertUser]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    setOnline({ clerkId: user.id, online: true });
    const onVisibility = () => {
      setOnline({ clerkId: user.id, online: document.visibilityState === "visible" });
    };
    document.addEventListener("visibilitychange", onVisibility);
    const t = setInterval(() => setOnline({ clerkId: user.id, online: true }), 30_000);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(t);
      setOnline({ clerkId: user.id, online: false });
    };
  }, [isLoaded, user, setOnline]);

  return null;
}
