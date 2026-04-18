import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSession } from '../../../../lib/auth';
import dbConnect from '../../../../lib/mongodb/dbConnect';
import User from '../../../../models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${req.headers.get('origin')}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Stripe Portal Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
