import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'dummy_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
    });

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId } = body;

    let razorpayPlanId = '';
    if (planId === 'startup') razorpayPlanId = process.env.RAZORPAY_PLAN_ID_STARTUP || '';
    else if (planId === 'professional') razorpayPlanId = process.env.RAZORPAY_PLAN_ID_PROFESSIONAL || '';
    
    if (!razorpayPlanId || razorpayPlanId.includes('placeholder')) {
        return NextResponse.json({ error: "Invalid plan or missing plan configuration in environment" }, { status: 400 });
    }

    const options = {
      plan_id: razorpayPlanId,
      customer_notify: 1 as const, // Fix TS error by making it exactly 1
      total_count: 120, // Example: 10 years (120 months)
    };

    const subscription = await razorpay.subscriptions.create(options);

    return NextResponse.json(subscription, { status: 200 });
  } catch (error) {
    console.error("Error creating Razorpay subscription:", error);
    return NextResponse.json({ error: "Error creating subscription" }, { status: 500 });
  }
}
