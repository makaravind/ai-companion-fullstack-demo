import { Request, Response } from 'express';
import User from '../models/User';
import { verifyWebhook } from '@clerk/express/webhooks';

export const handleClerkWebhook = async (req: Request, res: Response) => {
  try {
    const evt = await verifyWebhook(req);

    const eventType = evt.type;

    if (eventType === 'user.created') {
      const { id, email_addresses } = evt.data;

      if (!email_addresses || email_addresses.length === 0) {
        return res.status(400).json({ error: 'Email address is required.' });
      }

      const user = new User({
        clerkUserId: id,
        email: email_addresses[0].email_address,
      });

      try {
        await user.save();
        console.log('User saved to database:', user);
        res.status(201).json(user);
        return;
      } catch (error) {
        console.error('Error saving user to database:', error);
        res.status(500).json({ error: 'Failed to save user to database.' });
        return;
      }
    }

    res.status(200).send('Webhook received');
  } catch (err) {
    console.error('Error verifying webhook:', err);
    res.status(400).send('Error verifying webhook');
  }
};
