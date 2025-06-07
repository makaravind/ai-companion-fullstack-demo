import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkUserId: string; // ID from Clerk
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  clerkUserId: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Update `updatedAt` on save
UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IUser>('User', UserSchema);