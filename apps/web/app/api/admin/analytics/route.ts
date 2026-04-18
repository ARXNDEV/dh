import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb/dbConnect';
import User from '../../../../models/User';
import Charity from '../../../../models/Charity';
import Score from '../../../../models/Score';
import DrawResult from '../../../../models/DrawResult';
import { getSession } from '../../../../lib/auth';

async function isAdmin() {
  const session = await getSession();
  return session?.user?.role === 'admin';
}

export async function GET() {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    await dbConnect();

    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalDonated = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$totalDonated" } } }
    ]);
    
    const charityStats = await Charity.find({}, 'name totalContributions');
    const drawStats = await DrawResult.find({}).sort({ createdAt: -1 }).limit(5);
    
    const recentScores = await Score.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalDonated: totalDonated[0]?.total || 0,
        charityStats,
        drawStats,
        recentScores30Days: recentScores
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
