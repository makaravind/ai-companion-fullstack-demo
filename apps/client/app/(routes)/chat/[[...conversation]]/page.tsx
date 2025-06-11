"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@clerk/nextjs';
import { useApi } from '@/hooks/useApi';
import { useParams } from 'next/navigation';
import pusherClient from '@/lib/pusher-client'; 

function addConversationIdToUrl(conversationId: string) {
  const url = new URL(window.location.href);
  // add as path param  
  url.pathname = `/chat/${conversationId}`;
  window.history.pushState({}, '', url.toString());
}

// Define a local message type for this milestone
interface MockChatMessage {
  sender: 'user' | 'ai';
  content: string;
}

function useConversationId() {
  const {conversation} = useParams();
  const [conversationId, setConversationId] = useState<string | null>(null);
  useEffect(() => {
    if(conversation) {
      setConversationId(conversation as string);
    }
  }, [conversation]);
  return {conversationId, setConversationId};
}

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MockChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();
  const { post , get} = useApi();
  const {conversationId, setConversationId} = useConversationId();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(!conversationId) {
      setIsConnected(false);
      return;
    }

    console.log("initializing pusher for conversation", conversationId);

    const channel = pusherClient.subscribe(`conversation-${conversationId}`)
      
    channel.bind('message', (data: { message: string }) => {
      console.log("Got message from pusher", data);
      setMessages((prev) => [...prev, { sender: 'ai', content: data.message }])
    })
    setIsConnected(true);

    return () => {
      pusherClient.unsubscribe(`conversation-${conversationId}`)
    }
  }, [conversationId])

  // Placeholder for sending message (Socket.IO logic will be added later)
  const sendChatMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
        const data = await post('/message', { message: input, conversationId });
        if(!conversationId) {
          addConversationIdToUrl(data.conversationId);
          setConversationId(data.conversationId);
        }
        setMessages(prevMessages => [...prevMessages, { sender: 'user', content: input }]);
        setInput('');
    }
  }, [input, post, conversationId]);

  useEffect(() => {
    // useApi hook has get method
    const fetchMessages = async () => {
      const messages = await get(`/conversations/${conversationId}/messages`); 
      console.log("aravind", messages);
      setMessages(messages.map((msg: any) => ({ sender: msg.sender, content: msg.content })));
      setLoading(false);
    };
    if(conversationId) {  
      fetchMessages();
    } else {
      setLoading(false);
    }
  }, [conversationId, get]);

  if(!isLoaded || loading) {
    return <div>Loading...</div>;
  }
  if(!isSignedIn) {
    return <div>Please sign in to continue</div>;
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-bold mb-8">AI Companion</h1>
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <CardContent className="p-6">
          <p className="mb-4 text-center">Status: {isConnected? 'Connected' : 'Disconnected'}</p>
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