"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@clerk/nextjs';
import { useApi } from '@/hooks/useApi';

// Define a local message type for this milestone
interface MockChatMessage {
  sender: 'user' | 'ai';
  content: string;
}

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MockChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false); // Placeholder for connection status
  const { isLoaded, isSignedIn } = useAuth();
  const { post } = useApi();

  // Placeholder for sending message (Socket.IO logic will be added later)
  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
        // get response from mock api
        const data = await post('/message', { message: input });
        setMessages(prevMessages => [...prevMessages, { sender: 'user', content: input }]);
        setMessages(prevMessages => [...prevMessages, { sender: 'ai', content: data.response }]);
        setInput('');
    }
  };

  if(!isLoaded) {
    return <div>Loading...</div>;
  }
  if(!isSignedIn) {
    return <div>Please sign in to continue</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-bold mb-8">AI Companion (UI Demo)</h1>
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <CardContent className="p-6">
          <p className="mb-4 text-center">Status: {isConnected? 'Connected (UI Only)' : 'Disconnected (UI Only)'}</p>
          <ScrollArea className="h-[400px] w-full border border-gray-200 dark:border-gray-700 rounded-md p-4 mb-4 bg-gray-50 dark:bg-gray-700">
            {messages.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center">Start a conversation...</p>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded-lg max-w-[80%] ${
                  msg.sender === 'user'
                   ? 'bg-blue-500 text-white ml-auto rounded-br-none'
                    : 'bg-gray-200 text-gray-900 mr-auto rounded-bl-none dark:bg-gray-600 dark:text-gray-100'
                }`}
              >
                {msg.content}
              </div>
            ))}
          </ScrollArea>
          <form onSubmit={sendChatMessage} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow rounded-md border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 p-2 min-h-[40px] max-h-[150px]"
              rows={1}
            />
            <Button
              type="submit"
              disabled={!input.trim()} // Disable if input is empty
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}