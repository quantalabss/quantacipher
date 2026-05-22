import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongodb';
import Monitor from '@/models/Monitor';
import MonitorCheck from '@/models/MonitorCheck';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    try {
        const monitors = await Monitor.find({ userEmail: session.user.email }).sort({ createdAt: -1 }).lean();

        // Populate history for each monitor
        const monitorsWithHistory = await Promise.all(monitors.map(async (monitor) => {
            // Get last 20 checks for sparkline
            const history = await MonitorCheck.find({ monitorId: monitor._id })
                .sort({ timestamp: -1 })
                .limit(20)
                .select('latency status timestamp')
                .lean();

            // Reverse to show oldest -> newest (left -> right in graph)
            return {
                ...monitor,
                history: history.reverse()
            };
        }));

        return NextResponse.json(monitorsWithHistory);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, endpoint, frequency, type, chain, alertType, webhookUrl } = body;

        if (!name || !endpoint) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        await dbConnect();

        // Check user's plan and monitor limits
        const User = (await import('@/models/User')).default;
        let user = await User.findOne({ email: session.user.email });

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

        // Get current monitor count
        const monitorCount = await Monitor.countDocuments({ userEmail: session.user.email });

        // Enforce plan limits
        const planLimits: Record<string, number> = {
            hobbyist: 3,
            validator: 20,
            protocol: 999999
        };

        const limit = planLimits[user.plan] || 3;

        if (monitorCount >= limit) {
            return NextResponse.json({
                error: `Monitor limit reached. Your ${user.plan} plan allows ${limit} monitors. Upgrade to add more.`,
                limit,
                current: monitorCount,
                plan: user.plan
            }, { status: 403 });
        }

        const monitor = await Monitor.create({
            userEmail: session.user.email,
            name,
            endpoint,
            frequency: frequency || 60,
            type: type || 'http',
            chain,
            alertType: alertType || 'email',
            webhookUrl,
            status: 'pending'
        });

        return NextResponse.json(monitor);

    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
