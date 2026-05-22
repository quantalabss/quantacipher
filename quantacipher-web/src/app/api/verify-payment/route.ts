import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { JsonRpcProvider, formatEther } from 'ethers';

const TREASURY_ADDRESS = process.env.TREASURY_WALLET_ADDRESS || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
const EXPECTED_AMOUNT = "0.01"; // 0.01 ETH
const REQUIRED_CONFIRMATIONS = 1;

export async function POST(req: Request) {
    try {
        // 1. Authenticate user
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get transaction hash from request
        const { txHash } = await req.json();
        if (!txHash || typeof txHash !== 'string') {
            return NextResponse.json({ error: 'Transaction hash is required' }, { status: 400 });
        }

        // Connect to DB
        await dbConnect();

        // Security: Prevent replay attacks
        // Check if this transaction hash has already been used by ANY user
        const existingTx = await User.findOne({ paymentTxHash: txHash });
        if (existingTx) {
            return NextResponse.json({
                error: 'This transaction has already been used to activate a plan.',
                verified: false
            }, { status: 400 });
        }

        // 3. Connect to Ethereum provider
        const rpcUrl = process.env.ETH_RPC_URL || 'https://eth.llamarpc.com'; // Free public RPC
        const provider = new JsonRpcProvider(rpcUrl);

        // 4. Get transaction receipt
        const receipt = await provider.getTransactionReceipt(txHash);

        if (!receipt) {
            return NextResponse.json({
                error: 'Transaction not found or not yet confirmed',
                verified: false
            }, { status: 400 });
        }

        // 5. Verify transaction details
        const tx = await provider.getTransaction(txHash);

        if (!tx) {
            return NextResponse.json({
                error: 'Transaction details not found',
                verified: false
            }, { status: 400 });
        }

        // 6. Check if transaction is to correct address
        if (tx.to?.toLowerCase() !== TREASURY_ADDRESS.toLowerCase()) {
            return NextResponse.json({
                error: 'Transaction sent to incorrect address',
                verified: false
            }, { status: 400 });
        }

        // 7. Check if correct amount was sent
        const valueInEth = formatEther(tx.value);
        if (parseFloat(valueInEth) < parseFloat(EXPECTED_AMOUNT)) {
            return NextResponse.json({
                error: `Insufficient payment. Expected ${EXPECTED_AMOUNT} ETH, received ${valueInEth} ETH`,
                verified: false
            }, { status: 400 });
        }

        // 8. Check confirmations
        const currentBlock = await provider.getBlockNumber();
        const confirmations = receipt.blockNumber ? currentBlock - receipt.blockNumber : 0;

        if (confirmations < REQUIRED_CONFIRMATIONS) {
            return NextResponse.json({
                error: `Transaction needs ${REQUIRED_CONFIRMATIONS - confirmations} more confirmation(s)`,
                verified: false,
                confirmations
            }, { status: 400 });
        }

        // 9. Update user plan in database
        await dbConnect();

        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + 1); // 1 month from now

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                email: session.user.email,
                name: session.user.name,
                plan: 'validator',
                paymentTxHash: txHash,
                planExpiresAt: expirationDate,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        // 10. Return success
        return NextResponse.json({
            verified: true,
            message: 'Payment verified successfully! Your plan has been upgraded to Validator.',
            plan: user.plan,
            expiresAt: user.planExpiresAt,
            txHash: txHash,
            confirmations
        });

    } catch (error: any) {
        console.error('Payment verification error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to verify payment',
            verified: false
        }, { status: 500 });
    }
}
