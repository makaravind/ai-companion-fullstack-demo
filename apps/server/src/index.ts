import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './db';
import { handleClerkWebhook } from './webhooks/clerk';
import path from 'path';
import messagesRouter from './routes/messages';
import { clerkMiddleware } from '@clerk/express';
import { requestLogger, errorHandler, notFoundHandler } from './middleware/handlers';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

if(!process.env.CLERK_WEBHOOK_SIGNING_SECRET) {
  throw new Error('CLERK_WEBHOOK_SIGNING_SECRET is not set');
}

if(!process.env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is not set');
}

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Request logger
app.use(requestLogger);

// Clerk webhook handler
app.post('/api/webhooks/clerk', express.raw({ type: 'application/json' }), handleClerkWebhook as any);

// Middleware to parse JSON request bodies
app.use(express.json());

// Clerk middleware
app.use(clerkMiddleware());

// Routes
app.use('/api', messagesRouter);

// Basic health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('AI Companion Backend is running!');
});

// Not found handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});