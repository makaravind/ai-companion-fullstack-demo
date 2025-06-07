import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId; // Reference to local User model
  clerkUserId: string; // Redundant but useful for direct lookup
  title: string; // A short title for the conversation
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  clerkUserId: { type: String, required: true, index: true },
  title: { type: String, default: 'New AI Chat' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

ConversationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IConversation>('Conversation', ConversationSchema);