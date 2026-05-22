import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongodb';
import MonitorCheck from '@/models/MonitorCheck';
import Monitor from '@/models/Monitor';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // 1. Get monitors belonging to this user
        const monitors = await Monitor.find({ userEmail: session.user.email }).select('_id name endpoint');
        const monitorMap = monitors.reduce((acc: any, m: any) => {
            acc[m._id.toString()] = m;
            return acc;
        }, {});

        const monitorIds = monitors.map((m: any) => m._id);

        // 2. Find ONLY 'down' checks for these monitors
        // Sort by newest first, limit to last 50 incidents
        const incidents = await MonitorCheck.find({
            monitorId: { $in: monitorIds },
            status: 'down'
        })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();

        // 3. Transform data for UI
        const formattedIncidents = incidents.map((inc: any) => ({
            _id: inc._id,
            monitorName: monitorMap[inc.monitorId.toString()]?.name || 'Unknown',
            endpoint: monitorMap[inc.monitorId.toString()]?.endpoint || '',
            status: inc.status,
            timestamp: inc.timestamp,
            latency: inc.latency,
            errorMessage: inc.errorMessage
        }));

        return NextResponse.json(formattedIncidents);

    } catch (error: any) {
        console.error("Incidents fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
