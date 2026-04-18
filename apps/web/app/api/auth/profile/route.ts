import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb/dbConnect';
import User from '../../../../models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { supabaseId, email, fullName, charityId, plan } = body;

    if (!supabaseId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { supabaseId },
      { 
        email, 
        fullName, 
        charityId, 
        plan,
        subscriptionStatus: 'active' // Mocking active for now after signup
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Profile API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Profile API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
