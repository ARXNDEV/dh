import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb/dbConnect';
import User from '../../../../models/User';
import { getSession } from '../../../../lib/auth';

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { donationPercentage } = await req.json();

    if (donationPercentage < 10) {
      return NextResponse.json({ error: 'Minimum contribution is 10%' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { donationPercentage },
      { new: true }
    );

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
