import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongodb';
import Monitor from '@/models/Monitor';
import MonitorCheck from '@/models/MonitorCheck';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Get all monitors for the user
        const monitors = await Monitor.find({ userEmail: session.user.email });

        if (monitors.length === 0) {
            return NextResponse.json({
                totalMonitors: 0,
                uptime: 0,
                avgLatency: 0,
                totalChecks: 0
            });
        }

        const monitorIds = monitors.map(m => m._id);

        // Get all checks for these monitors in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const checks = await MonitorCheck.find({
            monitorId: { $in: monitorIds },
            checkedAt: { $gte: thirtyDaysAgo }
        });

        // Calculate stats
        const totalChecks = checks.length;
        const upChecks = checks.filter(c => c.status === 'up').length;
        const uptimePercentage = totalChecks > 0 ? (upChecks / totalChecks) * 100 : 0;

        const latencies = checks
            .filter(c => c.latency && c.latency > 0)
            .map(c => c.latency);
        const avgLatency = latencies.length > 0
            ? latencies.reduce((a, b) => a + b, 0) / latencies.length
            : 0;

        // Get current status counts
        const upCount = monitors.filter(m => m.status === 'up').length;
        const downCount = monitors.filter(m => m.status === 'down').length;
        const pendingCount = monitors.filter(m => m.status === 'pending').length;

        return NextResponse.json({
            totalMonitors: monitors.length,
            uptime: Math.round(uptimePercentage * 100) / 100,
            avgLatency: Math.round(avgLatency),
            totalChecks,
            statusBreakdown: {
                up: upCount,
                down: downCount,
                pending: pendingCount
            },
            period: '30 days'
        });

    } catch (error: any) {
        console.error('Analytics error:', error);
        return NextResponse.json({
            error: 'Failed to fetch analytics'
        }, { status: 500 });
    }
}
