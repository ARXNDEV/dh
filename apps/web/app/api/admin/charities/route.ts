import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb/dbConnect';
import Charity from '../../../../models/Charity';
import { getSession } from '../../../../lib/auth';

async function isAdmin() {
  const session = await getSession();
  return session?.user?.role === 'admin';
}

export async function GET() {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    await dbConnect();
    const charities = await Charity.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, data: charities });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    await dbConnect();
    const body = await req.json();
    const charity = await Charity.create(body);
    return NextResponse.json({ success: true, data: charity });
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
    const charity = await Charity.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ success: true, data: charity });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await Charity.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
