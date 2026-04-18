import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb/dbConnect';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import { login } from '../../../../lib/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password, fullName, charityId, plan } = await req.json();

    if (!email || !password || !fullName || !charityId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      fullName,
      charityId,
      plan,
      subscriptionStatus: 'active' // Initializing as active for the demo flow
    });

    // Create session
    const userSession = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };
    await login(userSession);

    return NextResponse.json({ success: true, user: userSession });
  } catch (error: any) {
    console.error('Signup API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
