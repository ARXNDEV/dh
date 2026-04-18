import mongoose, { Schema, Document } from 'mongoose';

export interface ICharity extends Document {
  name: string;
  impact: string;
  description: string;
  image: string;
  gallery: string[];
  category: string;
  isFeatured: boolean;
  upcomingEvents: {
    title: string;
    date: string;
    description: string;
  }[];
  totalContributions: number;
  createdAt: Date;
}

const CharitySchema: Schema = new Schema({
  name: { type: String, required: true },
  impact: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, required: true },
  gallery: { type: [String], default: [] },
  category: { type: String, default: 'General' },
  isFeatured: { type: Boolean, default: false },
  upcomingEvents: [{
    title: String,
    date: String,
    description: String,
  }],
  totalContributions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Charity || mongoose.model<ICharity>('Charity', CharitySchema);
