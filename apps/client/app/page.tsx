"use client"; // This component will be a client component

import { useState } from "react";

export default function HomePage() {
  const [message, setMessage] = useState("test message");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMockMessage = async () => {
    setLoading(true);
    setError("");
    setResponse("");
    console.log("Sending mock message:", message);
    try {
      // Use process.env.NEXT_PUBLIC_API_URL which will be set in docker-compose for frontend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/mock-ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to get mock AI response");
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <button
        onClick={sendMockMessage}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Mock"}
      </button>
    </div>
  );
}
