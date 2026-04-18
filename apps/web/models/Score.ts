import mongoose, { Schema, Document } from 'mongoose';

export interface IScore extends Document {
  userId: mongoose.Types.ObjectId;
  points: number;
  date: string;
  createdAt: Date;
}

const ScoreSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  points: { type: Number, required: true, min: 1, max: 45 },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Implementation of "Rolling 5" logic via Middleware
// This ensures that only the latest 5 scores are ever stored in the database.
ScoreSchema.post('save', async function (doc) {
  const Score = mongoose.model<IScore>('Score');
  const count = await Score.countDocuments({ userId: doc.userId });
  
  if (count > 5) {
    // Find all scores except the most recent 5 based on date (desc) and createdAt (desc)
    const scoresToKeep = await Score.find({ userId: doc.userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);
    
    const keepIds = scoresToKeep.map(s => s._id.toString());
    
    await Score.deleteMany({ 
      userId: doc.userId,
      _id: { $nin: keepIds } 
    });
    
    console.log(`[Rolling 5] Orchestrated pruning for user ${doc.userId}. Retained latest 5 entries.`);
  }
});

export default mongoose.models.Score || mongoose.model<IScore>('Score', ScoreSchema);
