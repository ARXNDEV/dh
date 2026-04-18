import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb/dbConnect';
import Winner from '../../../../models/Winner';
import User from '../../../../models/User';
import { getSession } from '../../../../lib/auth';

async function isAdmin() {
  const session = await getSession();
  return session?.user?.role === 'admin';
}

export async function GET() {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    await dbConnect();
    const winners = await Winner.find({}).populate('userId', 'fullName email').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: winners });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
