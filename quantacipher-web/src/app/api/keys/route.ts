import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongodb';
import ApiKey from '@/models/ApiKey';
import User from '@/models/User';

// --- Plan limits ---
const PLAN_KEY_LIMITS: Record<string, number> = {
    free: 1,
    startup: 5,
    business: 20,
    enterprise: 999999,
};

const PLAN_CALL_LIMITS: Record<string, number> = {
    free: 10000,
    startup: 500000,
    business: 5000000,
    enterprise: 999999999,
};

/**
 * GET /api/keys
 * Returns all API keys for the authenticated user.
 */
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    try {
        // Ensure user exists
        let user = await User.findOne({ email: session.user.email });
        if (!user) {
            user = await User.create({
                email: session.user.email,
                name: session.user.name,
                plan: 'free',
            });
        }

        const keys = await ApiKey.find({ userId: user._id }).sort({ createdAt: -1 }).lean();

        // Calculate rolling 30-day total calls across all keys
        const totalCalls = keys.reduce((sum, k) => sum + (k.calls || 0), 0);
        const totalBytes = keys.reduce((sum, k) => sum + (k.bytesSecured || 0), 0);
        const activeKeys = keys.filter(k => k.status === 'active').length;

        return NextResponse.json({
            keys,
            analytics: {
                totalCalls,
                totalBytes,
                activeKeys,
                plan: user.plan,
            }
        });
    } catch (error) {
        console.error('[GET /api/keys]', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

/**
 * POST /api/keys
 * Generates a new API key for the authenticated user.
 * Body: { name: string }
 */
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    try {
        const body = await req.json();
        const { name } = body;

        if (!name || typeof name !== 'string' || name.trim().length < 1) {
            return NextResponse.json({ error: 'Key name is required.' }, { status: 400 });
        }

        // Ensure user exists
        let user = await User.findOne({ email: session.user.email });
        if (!user) {
            user = await User.create({
                email: session.user.email,
                name: session.user.name,
                plan: 'free',
            });
        }

        // Enforce plan key limit
        const currentKeyCount = await ApiKey.countDocuments({ userId: user._id, status: 'active' });
        const keyLimit = PLAN_KEY_LIMITS[user.plan] ?? 1;

        if (currentKeyCount >= keyLimit) {
            return NextResponse.json({
                error: `Key limit reached. Your ${user.plan} plan allows ${keyLimit} active API key(s). Upgrade to add more.`,
                limit: keyLimit,
                current: currentKeyCount,
                plan: user.plan,
            }, { status: 403 });
        }

        // Generate a unique key
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const rand = Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const newKeyValue = `qz_live_${rand}`;

        const monthlyCallLimit = PLAN_CALL_LIMITS[user.plan] ?? 10000;

        const apiKey = await ApiKey.create({
            userId: user._id,
            name: name.trim(),
            key: newKeyValue,
            status: 'active',
            calls: 0,
            bytesSecured: 0,
            monthlyCallLimit,
        });

        return NextResponse.json(apiKey, { status: 201 });

    } catch (error) {
        console.error('[POST /api/keys]', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

/**
 * DELETE /api/keys
 * Revokes an API key by ID.
 * Body: { keyId: string }
 */
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    try {
        const body = await req.json();
        const { keyId } = body;

        if (!keyId) {
            return NextResponse.json({ error: 'keyId is required.' }, { status: 400 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Only allow revoking own keys
        const apiKey = await ApiKey.findOneAndUpdate(
            { _id: keyId, userId: user._id },
            { status: 'revoked', revokedAt: new Date() },
            { new: true }
        );

        if (!apiKey) {
            return NextResponse.json({ error: 'Key not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, key: apiKey });

    } catch (error) {
        console.error('[DELETE /api/keys]', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
