import express, { Request, Response } from 'express';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { requireAuth } from '@clerk/express';

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
    
        res.status(200).json({ response: mockResponse, conversationId: currentConversation._id });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router; 