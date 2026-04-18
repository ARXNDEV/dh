import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb/dbConnect';
import Winner from '../../../../models/Winner';

/**
 * API: /api/winners/verify
 * Allows winners to upload their golf score proof (screenshot URL).
 */
export async function POST(request: Request) {
  try {
    await dbConnect();
    const { winnerId, proofUrl } = await request.json();

    const winner = await Winner.findByIdAndUpdate(winnerId, {
      verificationStatus: 'Pending',
      proofUrl,
      adminNotes: `Proof uploaded by user. Attachment: ${proofUrl}`
    }, { new: true });

    if (!winner) {
      return NextResponse.json({ error: "Winner not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: "success",
      message: "Proof submitted successfully. Our Principal Admins will verify your round shortly.",
      data: winner
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
