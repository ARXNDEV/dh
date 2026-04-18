import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb/dbConnect';
import User from '../../../models/User';
import Charity from '../../../models/Charity';

/**
 * Charity Cut Calculation via Stitch
 * Implements: 10% minimum contribution
 */
export async function POST(request: Request) {
  try {
    await dbConnect();
    const { userId, subscriptionAmount } = await request.json();

    // Orchestration: Update total contributions for selected charity
    const user = await User.findById(userId);

    if (user && user.charityId) {
      const actualPercentage = user.donationPercentage || 10;
      const charityCut = subscriptionAmount * (actualPercentage / 100);

      // 1. Update Charity's total contributions
      await Charity.findByIdAndUpdate(user.charityId, {
        $inc: { totalContributions: charityCut }
      });

      // 2. Update User's total donated amount
      await User.findByIdAndUpdate(userId, {
        $inc: { totalDonated: charityCut }
      });

      return NextResponse.json({
        status: "success",
        userId,
        charityCut,
        percentage: `${actualPercentage}%`
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
