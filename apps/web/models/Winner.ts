import mongoose, { Schema, Document } from 'mongoose';

export interface IWinner extends Document {
  userId: mongoose.Types.ObjectId;
  monthYear: string;
  prizeAmount: number;
  verificationStatus: 'Pending' | 'Approved' | 'Rejected';
  proofUrl?: string;
  adminNotes?: string;
  paidAt?: Date;
  createdAt: Date;
}

const WinnerSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  monthYear: { type: String, required: true },
  prizeAmount: { type: Number, required: true },
  verificationStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  proofUrl: { type: String },
  adminNotes: { type: String },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Winner || mongoose.model<IWinner>('Winner', WinnerSchema);
