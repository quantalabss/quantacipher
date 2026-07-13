import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongodb';
import ApiKey from '@/models/ApiKey';
import ApiLog from '@/models/ApiLog';
import User from '@/models/User';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    try {
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const keys = await ApiKey.find({ userId: user._id }).lean();
        
        // Basic Overview Stats
        const totalCalls = keys.reduce((sum, k) => sum + (k.calls || 0), 0);
        const totalBytes = keys.reduce((sum, k) => sum + (k.bytesSecured || 0), 0);
        const activeKeys = keys.filter(k => k.status === 'active').length;

        // Fetch Recent Logs
        const recentLogs = await ApiLog.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('apiKeyId', 'name key') // to get key name if needed
            .lean();

        // Calculate Error Rate (from recent logs as a proxy)
        const totalRecent = recentLogs.length;
        const failedRecent = recentLogs.filter(log => log.status >= 400).length;
        const errorRate = totalRecent > 0 ? ((failedRecent / totalRecent) * 100).toFixed(2) : "0.00";

        // Generate Chart Data (Last 30 days)
        // If DB has no logs, we'll create a dummy time series so the chart renders beautifully,
        // but if logs exist, we aggregate them by date.
        
        // Setup 30 days empty map
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const chartDataMap = new Map<string, { calls: number; bytes: number }>();
        for (let i = 0; i < 30; i++) {
            const d = new Date(thirtyDaysAgo);
            d.setDate(d.getDate() + i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            chartDataMap.set(dateStr, { calls: 0, bytes: 0 });
        }

        // Aggregate actual logs if they exist
        const logsLast30Days = await ApiLog.find({
            userId: user._id,
            createdAt: { $gte: thirtyDaysAgo }
        }).lean();

        if (logsLast30Days.length > 0) {
            logsLast30Days.forEach(log => {
                const dateStr = new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (chartDataMap.has(dateStr)) {
                    const current = chartDataMap.get(dateStr)!;
                    chartDataMap.set(dateStr, {
                        calls: current.calls + 1,
                        bytes: current.bytes + (log.bytesProcessed || 0)
                    });
                }
            });
        }

        const chartData = Array.from(chartDataMap.entries()).map(([date, data]) => ({ 
            date, 
            calls: data.calls,
            bytes: data.bytes
        }));

        // Transform recent logs for frontend
        const activityFeed = recentLogs.map(log => ({
            id: log._id,
            endpoint: log.endpoint,
            status: log.status,
            bytesProcessed: log.bytesProcessed,
            time: new Date(log.createdAt).toLocaleString(),
            keyName: log.apiKeyId ? (log.apiKeyId as any).name : 'Unknown Key'
        }));

        return NextResponse.json({
            overview: {
                totalCalls,
                totalBytes,
                activeKeys,
                errorRate,
                plan: user.plan
            },
            chartData,
            recentActivity: activityFeed
        });

    } catch (error) {
        console.error('[GET /api/analytics]', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
