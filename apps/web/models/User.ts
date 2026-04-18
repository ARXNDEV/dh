import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  fullName: string;
  charityId: string;
  role: 'user' | 'admin';
  plan: 'monthly' | 'yearly';
  donationPercentage: number;
  stripeCustomerId?: string;
  subscriptionStatus: 'active' | 'inactive' | 'cancelled';
  totalDonated: number;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  fullName: { type: String, required: true },
  charityId: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  plan: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  donationPercentage: { type: Number, default: 10, min: 10 },
  stripeCustomerId: { type: String },
  subscriptionStatus: { type: String, enum: ['active', 'inactive', 'cancelled'], default: 'inactive' },
  totalDonated: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
