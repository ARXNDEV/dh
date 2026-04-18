import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb/dbConnect';
import User from '../../../../models/User';
import Score from '../../../../models/Score';
import DrawResult from '../../../../models/DrawResult';
import Winner from '../../../../models/Winner';

/**
 * MCP DRAW ENGINE: ORCHESTRATOR
 * Supports: Random vs Algorithmic Draw, Simulation Mode, Jackpot Rollover.
 */
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { monthYear, drawType, action } = await req.json(); // action: 'simulate' | 'publish'

    // 1. POOL CALCULATION
    const activeSubscribers = await User.countDocuments({ subscriptionStatus: 'active' });
    const monthlyFee = 50;
    const charityCut = 0.10;
    const platformCut = 0.05;
    const currentMonthPool = activeSubscribers * monthlyFee * (1 - (charityCut + platformCut));

    // Get previous month's rollover
    const prevMonth = await DrawResult.findOne({ status: 'Published' }).sort({ createdAt: -1 });
    const rolloverFromPrev = prevMonth?.jackpotRollover || 0;
    const totalPrizePool = currentMonthPool + rolloverFromPrev;

    // 2. GENERATE WINNING NUMBERS (5 Numbers, 1-45)
    let winningNumbers: number[] = [];
    if (drawType === 'Algorithmic') {
      // Algorithmic: Weighted by frequency of user scores
      const scoreFrequency = await Score.aggregate([
        { $group: { _id: "$points", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      // Take top 3 most frequent and bottom 2 least frequent for a balanced algorithmic draw
      const frequent = scoreFrequency.slice(0, 3).map(f => f._id);
      const rare = scoreFrequency.slice(-2).map(r => r._id);
      winningNumbers = [...frequent, ...rare];
      
      // Fill remaining if scores are sparse
      while (winningNumbers.length < 5) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!winningNumbers.includes(num)) winningNumbers.push(num);
      }
    } else {
      // Random: Standard Lottery
      while (winningNumbers.length < 5) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!winningNumbers.includes(num)) winningNumbers.push(num);
      }
    }

    // 3. MATCH CALCULATION & WINNER IDENTIFICATION (Simulated)
    // In a real scenario, we would iterate through all users' latest 5 scores
    // and count how many numbers match the winningNumbers.
    // For this demonstration, we'll simulate winner counts.
    const winnersCount = {
      match5: Math.random() > 0.8 ? 1 : 0, // 20% chance of a jackpot winner
      match4: Math.floor(Math.random() * 5) + 1,
      match3: Math.floor(Math.random() * 20) + 10,
    };

    // 4. PRIZE SPLITS (40/35/25)
    const prizeSplits = {
      match5: totalPrizePool * 0.40,
      match4: totalPrizePool * 0.35,
      match3: totalPrizePool * 0.25,
    };

    // 5. JACKPOT ROLLOVER LOGIC
    let nextMonthRollover = 0;
    if (winnersCount.match5 === 0) {
      nextMonthRollover = prizeSplits.match5;
      prizeSplits.match5 = 0; // Rolled over
    }

    const drawData = {
      monthYear,
      drawType,
      totalPool: totalPrizePool,
      jackpotRollover: nextMonthRollover,
      winningNumbers: winningNumbers.sort((a, b) => a - b),
      prizeSplits,
      winnersCount,
      status: action === 'publish' ? 'Published' : 'Simulated'
    };

    // Upsert the draw result for the month
    const result = await DrawResult.findOneAndUpdate(
      { monthYear },
      drawData,
      { upsert: true, new: true }
    );

    // 6. IF PUBLISHING: Create Winner Records
    if (action === 'publish') {
      // In a real scenario, we'd identify specific user IDs who matched.
      // For this demonstration, we'll create a mock winner record if there are winners.
      if (winnersCount.match4 > 0) {
        // Create one mock winner for match 4
        const randomUser = await User.findOne({ role: 'user' });
        if (randomUser) {
          await Winner.create({
            userId: randomUser._id,
            monthYear,
            prizeAmount: prizeSplits.match4 / winnersCount.match4,
            verificationStatus: 'Pending'
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      action,
      data: result,
      message: action === 'publish' 
        ? `Draw published for ${monthYear}. Jackpot of $${nextMonthRollover.toLocaleString()} ${nextMonthRollover > 0 ? 'rolled over' : 'distributed'}.`
        : `Simulation complete for ${monthYear}. Ready for review.`
    });

  } catch (error: any) {
    console.error('Draw Engine Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
