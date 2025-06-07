import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

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

// Middleware to parse JSON request bodies
app.use(express.json());

// Basic health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('AI Companion Backend is running!');
});

// Mock AI response endpoint
app.post('/api/mock-ai-chat', async (req, res) => {
  const { message } = req.body;
  console.log(`Received message (mock API): "${message}"`);

  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});