import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        // 1. Authenticate user
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get Razorpay payment details from request
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
            return NextResponse.json({ error: 'Missing payment verification details' }, { status: 400 });
        }

        // 3. Verify the Razorpay signature
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            console.error('RAZORPAY_KEY_SECRET is not configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({
                error: 'Payment verification failed. Invalid signature.',
                verified: false
            }, { status: 400 });
        }

        // 4. Update user plan in database
        await dbConnect();

        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + 1); // 1 month from now

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                email: session.user.email,
                name: session.user.name,
                plan: planId, // e.g. 'startup' or 'professional'
                paymentTxHash: razorpay_payment_id, // Store payment ID instead of crypto txHash
                planExpiresAt: expirationDate,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        // 5. Send billing upgrade email asynchronously
        if (user.email) {
            import('@/lib/email').then(({ sendEmail }) => {
                import('@/components/emails/BillingEmail').then(({ BillingEmail }) => {
                    import('react').then((React) => {
                        sendEmail({
                            to: user.email,
                            subject: 'QuantaCipher Plan Upgraded',
                            react: React.createElement(BillingEmail, { 
                                name: user.name || 'Developer', 
                                planName: user.plan || planId 
                            })
                        });
                    });
                });
            }).catch(console.error);
        }

        // 6. Return success
        return NextResponse.json({
            verified: true,
            message: `Payment verified successfully! Your plan has been upgraded to ${planId.toUpperCase()}.`,
            plan: user.plan,
            expiresAt: user.planExpiresAt,
            paymentId: razorpay_payment_id
        });

    } catch (error: any) {
        console.error('Payment verification error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to verify payment',
            verified: false
        }, { status: 500 });
    }
}
