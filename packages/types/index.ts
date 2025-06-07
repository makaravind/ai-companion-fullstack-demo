export interface ChatMessage {
    _id?: string;
    userId: string;
    sender: 'user' | 'ai';
    content: string;
    timestamp: Date;
    sessionId: string;
  }
  
  export interface UserProfile {
    clerkUserId: string;
    username: string;
    email: string;
  }