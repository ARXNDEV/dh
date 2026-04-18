import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(err => {
      console.error('JSON Parse Error:', err);
      return null;
    });

    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { plan, email, fullName, charityId } = body;

    console.log('Stripe Checkout Request:', { plan, email, fullName, charityId });

    const priceId = plan === 'yearly' 
      ? 'price_yearly_valor_480' 
      : 'price_monthly_valor_50'; 

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `VALOR ${plan === 'yearly' ? 'Principal' : 'Standard'} Node Subscription`,
              description: `Legacy Collective Impact - ${fullName}`,
            },
            unit_amount: plan === 'yearly' ? 48000 : 5000,
            recurring: {
              interval: plan === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/cancel`,
      customer_email: email,
      metadata: {
        fullName,
        charityId,
        plan,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe Route Error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return NextResponse.json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
