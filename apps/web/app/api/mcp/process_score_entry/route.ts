import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb/dbConnect';
import Score from '../../../../models/Score';
import User from '../../../../models/User';
import Charity from '../../../../models/Charity';

/**
 * MCP TOOL: process_score_entry
 * THE BRAIN: Solutions Architect Level Logic
 * 
 * Logic flow:
 * 1. Validate Stableford score (1-45).
 * 2. Reject if date already exists for user_id.
 * 3. Enforce Rolling 5 Rule via Mongoose Middleware.
 * 4. Return "Success" with emotion-driven charitable impact.
 */
export async function POST(request: Request) {
  try {
    await dbConnect();
    const { userId, score, date } = await request.json();

    // 1. SOLUTIONS ARCHITECT: Input Validation
    if (score < 1 || score > 45) {
      return NextResponse.json({ 
        error: "DH_002: Invalid Stableford Score (1-45). High-performance rounds must be within regulation." 
      }, { status: 400 });
    }

    // 2. SOLUTIONS ARCHITECT: Uniqueness Check
    const existing = await Score.findOne({ userId, date });

    if (existing) {
      return NextResponse.json({ 
        error: "DH_001: Round already recorded for this date. Precision requires unique entries." 
      }, { status: 400 });
    }

    // 3. SOLUTIONS ARCHITECT: Orchestration (Mongoose Middleware handles the Rolling 5)
    const scoreRecord = await Score.create({ 
      userId, 
      points: score, 
      date 
    });

    // 4. SOLUTIONS ARCHITECT: Emotion-Driven Output
    const user = await User.findById(userId);
    const charity = await Charity.findById(user?.charityId);

    const charityName = charity?.name || "your selected charity";
    const totalImpact = user?.totalDonated || 0;

    return NextResponse.json({
      status: "Success",
      message: `Round of ${score} confirmed! Your consistent performance has now contributed a total of $${totalImpact.toFixed(2)} to ${charityName}. You're not just playing golf; you're changing lives.`,
      data: scoreRecord
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
