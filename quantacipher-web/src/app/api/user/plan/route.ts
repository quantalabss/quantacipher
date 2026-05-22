import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        let user = await User.findOne({ email: session.user.email });

        // If user doesn't exist, create with default plan
        if (!user) {
            user = await User.create({
                email: session.user.email,
                name: session.user.name,
                plan: 'hobbyist'
            });
        }

        // Check if plan has expired
        if (user.planExpiresAt && new Date() > user.planExpiresAt) {
            user.plan = 'hobbyist';
            user.planExpiresAt = null;
            await user.save();
        }

        return NextResponse.json({
            plan: user.plan,
            expiresAt: user.planExpiresAt,
            paymentTxHash: user.paymentTxHash
        });

    } catch (error: any) {
        console.error('Get user plan error:', error);
        return NextResponse.json({
            error: 'Failed to get user plan',
            plan: 'hobbyist'
        }, { status: 500 });
    }
}
