import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongodb';
import Monitor from '@/models/Monitor';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || !session.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        await dbConnect();
        // Ensure user owns the monitor
        const result = await Monitor.deleteOne({
            _id: id,
            userEmail: session.user.email
        });

        if (result.deletedCount === 0) {
            return new NextResponse("Not Found or Unauthorized", { status: 404 });
        }

        return new NextResponse("Deleted", { status: 200 });

    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
