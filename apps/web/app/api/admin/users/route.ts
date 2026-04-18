import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb/dbConnect';
import User from '../../../../models/User';
import { getSession } from '../../../../lib/auth';

// Middleware replacement for role checking
async function isAdmin() {
  const session = await getSession();
  return session?.user?.role === 'admin';
}

export async function GET() {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    await dbConnect();
    const body = await req.json();
    const { id, ...updateData } = body;
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
