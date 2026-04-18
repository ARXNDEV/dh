import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb/dbConnect';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import { login, logout } from '../../../../lib/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

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
    console.error('Login API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  await logout();
  return NextResponse.json({ success: true });
}
