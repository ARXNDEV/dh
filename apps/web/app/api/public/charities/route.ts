import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb/dbConnect';
import Charity from '../../../../models/Charity';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    let query: any = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const charities = await Charity.find(query).sort({ name: 1 });
    return NextResponse.json({ success: true, data: charities });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
