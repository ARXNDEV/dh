import mongoose, { Schema, Document } from 'mongoose';

export interface IDrawResult extends Document {
  monthYear: string;
  totalPool: number;
  jackpotRollover: number;
  status: 'Simulated' | 'Published';
  drawType: 'Random' | 'Algorithmic';
  winningNumbers: number[];
  prizeSplits: {
    match5: number;
    match4: number;
    match3: number;
  };
  winnersCount: {
    match5: number;
    match4: number;
    match3: number;
  };
  createdAt: Date;
}

const DrawResultSchema: Schema = new Schema({
  monthYear: { type: String, required: true, unique: true },
  totalPool: { type: Number, default: 0 },
  jackpotRollover: { type: Number, default: 0 },
  status: { type: String, enum: ['Simulated', 'Published'], default: 'Simulated' },
  drawType: { type: String, enum: ['Random', 'Algorithmic'], default: 'Random' },
  winningNumbers: { type: [Number], default: [] },
  prizeSplits: {
    match5: { type: Number, default: 0 },
    match4: { type: Number, default: 0 },
    match3: { type: Number, default: 0 },
  },
  winnersCount: {
    match5: { type: Number, default: 0 },
    match4: { type: Number, default: 0 },
    match3: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.DrawResult || mongoose.model<IDrawResult>('DrawResult', DrawResultSchema);
