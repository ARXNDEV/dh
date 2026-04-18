import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '../../../../lib/mongodb/dbConnect';
import User from '../../../../models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: any;

  try {
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET is not set. Skipping signature verification (Dev only).');
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (err: any) {
    console.error(`Webhook Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  await dbConnect();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_email;
        const stripeCustomerId = session.customer;

        if (customerEmail) {
          await User.findOneAndUpdate(
            { email: customerEmail },
            { 
              stripeCustomerId,
              subscriptionStatus: 'active'
            }
          );
          console.log(`[Webhook] Subscription activated for ${customerEmail}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer;
        const status = subscription.status === 'active' ? 'active' : 'inactive';

        await User.findOneAndUpdate(
          { stripeCustomerId },
          { subscriptionStatus: status }
        );
        console.log(`[Webhook] Subscription updated for customer ${stripeCustomerId}: ${status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer;

        await User.findOneAndUpdate(
          { stripeCustomerId },
          { subscriptionStatus: 'cancelled' }
        );
        console.log(`[Webhook] Subscription cancelled for customer ${stripeCustomerId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const stripeCustomerId = invoice.customer;

        await User.findOneAndUpdate(
          { stripeCustomerId },
          { subscriptionStatus: 'inactive' }
        );
        console.log(`[Webhook] Payment failed for customer ${stripeCustomerId}. Status set to inactive.`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Webhook Processing Error: ${error.message}`);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
