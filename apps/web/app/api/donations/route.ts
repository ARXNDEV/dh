import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb/dbConnect';
import Charity from '../../../models/Charity';
import User from '../../../models/User';
import { getSession } from '../../../lib/auth';

export async function POST(req: Request) {
  try {
    const { charityId, amount, userId } = await req.json();

    if (!charityId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // 1. Update Charity Total
    await Charity.findByIdAndUpdate(charityId, {
      $inc: { totalContributions: amount }
    });

    // 2. If user is logged in, update their total impact
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $inc: { totalDonated: amount }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Independent donation of $${amount} successfully processed.` 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
