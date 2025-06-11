import express, { Request, Response } from 'express';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { requireAuth } from '@clerk/express';
import Pusher from 'pusher';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const router = express.Router();

router.get('/conversation', requireAuth(), async (req: any, res): Promise<void> => {
    try {
        const clerkUserId = req.auth().userId;

        if (!clerkUserId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const latestConversation = await Conversation.findOne({ clerkUserId }).sort({ updatedAt: -1 });
        
        res.status(200).json({ latestConversationId: latestConversation ? latestConversation._id : null });
    } catch (error) {
        console.error('Error fetching latest conversation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/conversations/:conversationId/messages', requireAuth(), async (req: any, res): Promise<void> => {
    try {
        const { conversationId } = req.params;
        const clerkUserId = req.auth().userId;

        if (!clerkUserId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || conversation.clerkUserId !== clerkUserId) {
            res.status(404).json({ error: 'Conversation not found or access denied' });
            return;
        }
        
        const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function getPusher() {
    if(!process.env.PUSHER_APP_ID){
        throw new Error('PUSHER_APP_ID is not set');
    }
    if(!process.env.PUSHER_KEY){
        throw new Error('PUSHER_KEY is not set');
    }
    if(!process.env.PUSHER_SECRET){
        throw new Error('PUSHER_SECRET is not set');
    }
    if(!process.env.PUSHER_CLUSTER){
        throw new Error('PUSHER_CLUSTER is not set');
    }
    return new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.PUSHER_CLUSTER!,
        useTLS: true
    });
}

const pusher = getPusher();

router.post('/message', requireAuth(), async (req: any, res: Response): Promise<void> => {
    try {
        const clerkUserId = req.auth().userId;

        if (!clerkUserId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { message, conversationId } = req.body;
    
        if (!message) {
            res.status(400).json({ error: 'Message content is required.' });
            return;
        }

        let currentConversation;
        if (conversationId) {
            currentConversation = await Conversation.findOne({ _id: conversationId, clerkUserId });
            if (!currentConversation) {
                res.status(404).json({ error: 'Conversation not found or access denied' });
                return;
            }
        } else {
            currentConversation = new Conversation({ clerkUserId });
            await currentConversation.save();
        }

        const userMessage = new Message({
            conversationId: currentConversation._id,
            content: message,
            sender: 'user',
        });
        await userMessage.save();
    
        setTimeout(async () => {
            const mockResponses = [
                `That's an interesting thought about "${message}"!`,
                `I understand. So, regarding "${message}"...`,
                `Thank you for sharing "${message}". How can I help further?`,
                `I'm thinking about "${message}". What else comes to mind?`
            ];
            const mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

            const aiMessage = new Message({
                conversationId: currentConversation._id,
                content: mockResponse,
                sender: 'ai',
            });
            await aiMessage.save();

            currentConversation.updatedAt = new Date();
            await currentConversation.save();

            // publish message for realtime updates
            pusher.trigger(`conversation-${currentConversation._id}`, 'message', {
                message: mockResponse,
                conversationId: currentConversation._id,
            });
        }, 500);
        res.status(200).json({ response: "received", conversationId: currentConversation._id });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router; 