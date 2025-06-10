import express, { Request, Response } from 'express';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { requireAuth } from '@clerk/express';

const router = express.Router();

router.get('/conversations', requireAuth(), async (req: any, res): Promise<void> => {
    try {
        const clerkUserId = req.auth.userId;

        if (!clerkUserId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const conversations = await Conversation.find({ clerkUserId }).sort({ updatedAt: -1 });
        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/conversations/:conversationId/messages', requireAuth(), async (req: any, res): Promise<void> => {
    try {
        const { conversationId } = req.params;
        const clerkUserId = req.auth.userId;

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

router.post('/message', async (req: Request, res: Response): Promise<void> => {
    const { message } = req.body;
    console.log(`Received message (mock API): "${message}"`);
  
    if (!message) {
      res.status(400).json({ error: 'Message content is required.' });
      return;
    }
  
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 500));
  
    const mockResponses = [
      `That's an interesting thought about "${message}"!`,
      `I understand. So, regarding "${message}"...`,
      `Thank you for sharing "${message}". How can I help further?`,
      `I'm thinking about "${message}". What else comes to mind?`
    ];
    const mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  
    res.status(200).json({ response: mockResponse });
});

export default router; 