import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

/**
 * Test Route: Retrieve a specific Stripe Charge
 * As requested by the user for payment gateway confirmation.
 */
export async function GET() {
  try {
    const chargeId = 'ch_3LiiC52eZvKYlo2C1da66ZSQ';
    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }

    console.log(`Attempting to retrieve charge: ${chargeId}`);

    // Initializing a dedicated instance for this key to ensure clean orchestration
    const testStripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16' as any,
    });

    const charge = await testStripe.charges.retrieve(chargeId);

    return NextResponse.json({
      success: true,
      charge: charge
    });
  } catch (error: any) {
    console.error('Stripe Retrieve Charge Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
