"use client"; // This component will be a client component

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";

export default function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();

  useEffect(() => {
    if (isSignedIn) {
      const fetchConversation = async () => {
        try {
          const data = await get("/conversation");
          setConversationId(data.latestConversationId);
        } catch (error) {
          console.error("Failed to fetch conversation", error);
        } finally {
          setLoading(false);
        }
      };
      fetchConversation();
    } else {
      setLoading(false);
    }
  }, [isSignedIn]);

  if (!isLoaded || loading) {
    return <div>Loading...</div>;
  }
  if (!isSignedIn) {
    return <div>Please sign in to continue</div>;
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to AI Companion!</h1>
      <div className="flex flex-col gap-4">
        {conversationId && (
          <Link href={`/chat/${conversationId}`} passHref>
            <Button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Continue conversation
            </Button>
          </Link>
        )}
        <Link href="/chat" passHref>
          <Button className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700">
            Start new conversation
          </Button>
        </Link>
      </div>
    </div>
  );
}
