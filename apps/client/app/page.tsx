"use client"; // This component will be a client component

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();
  if(!isLoaded) {
    return <div>Loading...</div>;
  }
  if(!isSignedIn) {
    return <div>Please sign in to continue</div>;
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to AI Companion!</h1>
      <div className="flex flex-col gap-4">
        {/* Link to the mock API chat for testing */}
        <Link href="/api-test" passHref>
          <Button className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700">
            Test Mock HTTP API
          </Button>
        </Link>
        {/* Link to the real-time Socket.IO chat (will be implemented in Section VI) */}
        <Link href="/chat" passHref>
          <Button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Start Real-time Chat (Mock)
          </Button>
        </Link>
      </div>
      <UserButton />
    </div>
  );
}
