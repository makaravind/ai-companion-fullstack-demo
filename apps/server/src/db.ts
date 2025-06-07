import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { IUser } from './models/User';
import Conversation, { IConversation } from './models/Conversation';
import Message, { IMessage } from './models/Message';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai_companion_db';

export const connectDB = async () => {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('MongoDB connected successfully.');
    } catch (err) {
      console.error('MongoDB connection error:', err);
      process.exit(1); // Exit process with failure
    }
  };
  
  // CRUD operations for User
  export const createUser = async (clerkUserId: string, username: string, email: string): Promise<IUser> => {
    const newUser = new User({ clerkUserId, username, email });
    return newUser.save();
  };
  
  export const findUserByClerkId = async (clerkUserId: string): Promise<IUser | null> => {
    return User.findOne({ clerkUserId });
  };
  
  // CRUD operations for Conversation
  export const createConversation = async (userId: mongoose.Types.ObjectId, clerkUserId: string, title?: string): Promise<IConversation> => {
    const newConversation = new Conversation({ userId, clerkUserId, title });
    return newConversation.save();
  };
  
  export const findConversationsByClerkId = async (clerkUserId: string): Promise<IConversation> => {
    return Conversation.find({ clerkUserId }).sort({ updatedAt: -1 });
  };
  
  export const findConversationById = async (conversationId: string): Promise<IConversation | null> => {
    return Conversation.findById(conversationId);
  };
  
  // CRUD operations for Message
  export const createMessage = async (conversationId: mongoose.Types.ObjectId, sender: 'user' | 'ai', content: string): Promise<IMessage> => {
    const newMessage = new Message({ conversationId, sender, content });
    return newMessage.save();
  };
  
  export const findMessagesByConversationId = async (conversationId: string): Promise<IMessage> => {
    return Message.find({ conversationId }).sort({ timestamp: 1 });
  };