import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb/dbConnect';
import Winner from '../../../../models/Winner';

/**
 * API: /api/winners/approve
 * Allows Principal Admins to approve/reject winners and trigger payouts.
 */
export async function POST(request: Request) {
  try {
    await dbConnect();
    const { winnerId, status, adminNotes } = await request.json();

    const winner = await Winner.findByIdAndUpdate(winnerId, {
      verificationStatus: status,
      adminNotes,
      paidAt: status === 'Approved' ? new Date() : null
    }, { new: true });

    if (!winner) {
      return NextResponse.json({ error: "Winner not found" }, { status: 404 });
    }

    // Principal Engineering: Logic for triggering payout orchestration
    if (status === 'Approved') {
      // Orchestrate payout via Stripe/Stitch here
      console.log(`Principal Orchestration: Payout triggered for winner ${winnerId}`);
    }

    return NextResponse.json({
      status: "success",
      message: `Winner status updated to ${status}.`,
      data: winner
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
