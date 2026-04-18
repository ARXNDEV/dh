import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb/dbConnect';
import User from '../../../../models/User';
import DrawResult from '../../../../models/DrawResult';

/**
 * MCP TOOL: run_draw_simulation
 * PRINCIPAL ENGINEER IMPLEMENTATION: Simulation Mode before Publishing
 * 
 * 1. Calculate pool from active subscriptions.
 * 2. Apply 40/35/25 split.
 * 3. Handle 5-match Jackpot Rollover.
 */
export async function POST(request: Request) {
  try {
    await dbConnect();
    const { monthYear, winnersCount } = await request.json();

    // 1. PRINCIPAL: Calculate Pool
    const activeCount = await User.countDocuments({ subscriptionStatus: 'active' });

    const monthlyFee = 50;
    const charityCut = 0.10;
    const totalCurrentPool = activeCount * monthlyFee * (1 - charityCut);

    // 2. PRINCIPAL: Apply Splits (40/35/25)
    const { match5, match4, match3 } = winnersCount;
    const splits = {
      fiveMatch: totalCurrentPool * 0.40,
      fourMatch: totalCurrentPool * 0.35,
      threeMatch: totalCurrentPool * 0.25,
    };

    // 3. PRINCIPAL: Jackpot Rollover Logic
    let rollover = 0;
    if (match5 === 0) {
      rollover = splits.fiveMatch;
      splits.fiveMatch = 0;
    }

    // 4. PRINCIPAL: Record Simulation State (not published yet)
    await DrawResult.findOneAndUpdate({ monthYear }, {
      totalPool: totalCurrentPool,
      jackpotRollover: rollover,
      status: 'Simulated',
      winningNumbers: [12, 24, 36, 48, 5] // Mocked
    }, { upsert: true });

    return NextResponse.json({
      status: "Simulated",
      pool: totalCurrentPool,
      breakdown: {
        jackpot: splits.fiveMatch > 0 ? splits.fiveMatch : `Rollover: $${rollover.toLocaleString()}`,
        fourMatch: splits.fourMatch,
        threeMatch: splits.threeMatch
      },
      verificationRequired: "Admin must approve winners' screenshots before Publishing."
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
