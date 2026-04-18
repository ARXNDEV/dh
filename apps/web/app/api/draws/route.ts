import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb/dbConnect';
import User from '../../../models/User';

/**
 * MCP-Orchestrated Prize Pool Calculation
 * Implements: Active Subscriber count * Fee * (1 - Charity Cut)
 * Splits: 5-Match (40%), 4-Match (35%), 3-Match (25%)
 */
export async function POST(request: Request) {
  try {
    await dbConnect();
    const { month } = await request.json();

    // 1. Stitch Orchestration: Query active subscribers
    const subCount = await User.countDocuments({ subscriptionStatus: 'active' });

    const subFee = 50; // $50 monthly sub
    const charityCut = 0.10; // 10%
    const adminCut = 0.05; // 5% for platform maintenance

    // 2. Prize Pool Calculation
    const totalPool = subCount * subFee * (1 - (charityCut + adminCut));
    
    const splits = {
      fiveMatch: totalPool * 0.40,
      fourMatch: totalPool * 0.35,
      threeMatch: totalPool * 0.25,
    };

    return NextResponse.json({
      status: "success",
      month,
      subCount,
      totalPool,
      splits
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
