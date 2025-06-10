import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  clerkUserId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema({
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