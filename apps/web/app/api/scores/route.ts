import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb/dbConnect';
import Score from '../../../models/Score';
import User from '../../../models/User';

/**
 * MCP-Orchestrated Score Submission
 * Implements: Validation (1-45), Date Uniqueness, Rolling 5 Rule.
 * Security: Strict Active Subscription Check
 */
export async function POST(request: Request) {
  try {
    await dbConnect();
    const { userId, score, date } = await request.json();

    // 1. SECURITY: Strict Subscription Check
    const user = await User.findById(userId);
    if (!user || user.subscriptionStatus !== 'active') {
      return NextResponse.json({ 
        error: "DH_003: Subscription Lapsed. Please reactivate your node to commit scores." 
      }, { status: 403 });
    }

    // 2. MCP-Level Validation
    if (score < 1 || score > 45) {
      return NextResponse.json({ error: "DH_002: Invalid Stableford Range (1-45)" }, { status: 400 });
    }

    // 3. Date Uniqueness Check (Strict PRD Requirement)
    const existing = await Score.findOne({ userId, date });
    if (existing) {
      return NextResponse.json({ 
        error: "DH_001: Date Duplicate Error. Only one score entry is permitted per date. Please edit the existing entry instead." 
      }, { status: 400 });
    }

    // 4. Final Insertion
    const newScore = await Score.create({ 
      userId, 
      points: score, 
      date 
    });

    return NextResponse.json({ 
      status: "success", 
      message: "Score submitted and Rolling 5 rule enforced via Mongoose Middleware.",
      data: newScore 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { scoreId, points } = await request.json();

    if (points < 1 || points > 45) {
      return NextResponse.json({ error: "Invalid Stableford Range (1-45)" }, { status: 400 });
    }

    const updated = await Score.findByIdAndUpdate(scoreId, { points }, { new: true });
    return NextResponse.json({ status: "success", data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const scoreId = searchParams.get('id');
    await Score.findByIdAndDelete(scoreId);
    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const scores = await Score.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    return NextResponse.json({ status: "success", data: scores });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
