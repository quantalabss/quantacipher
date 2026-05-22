import { Request, Response, NextFunction } from 'express';

/**
 * QuantaCipher API Key Authentication Middleware
 * 
 * In production: validates API keys against MongoDB (the quantacipher-web database).
 * The gateway connects to the same MongoDB cluster as the Next.js web app,
 * looking up keys in the `apikeys` collection.
 * 
 * TODO: Add Redis caching layer in front of MongoDB for < 1ms auth latency.
 */

// MongoDB connection for key validation
// We lazy-import mongoose to avoid cold-start delay
let mongoose: any = null;
let ApiKeyModel: any = null;

export async function getApiKeyModel() {
    if (ApiKeyModel) return ApiKeyModel;
    
    if (!mongoose) {
        mongoose = await import('mongoose');
    }

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is required');
    }

    if (mongoose.connection?.readyState !== 1) {
        await mongoose.connect(MONGODB_URI);
    }

    const ApiKeySchema = new mongoose.Schema({
        userId: mongoose.Schema.Types.ObjectId,
        key: String,
        status: String,
        calls: Number,
        bytesSecured: Number,
        monthlyCallLimit: Number,
    });

    ApiKeyModel = mongoose.models?.ApiKey || mongoose.model('ApiKey', ApiKeySchema);
    return ApiKeyModel;
}

export const requireApiKey = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header('x-api-key') || req.header('Authorization')?.replace('Bearer ', '');

    if (!apiKey) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing QuantaCipher API Key. Get one at quantalabs.cc'
        });
    }

    // Basic format check
    if (!apiKey.startsWith('qz_live_') && !apiKey.startsWith('qz_test_')) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Invalid API key format.'
        });
    }

    try {
        // Validate against database
        const ApiKey = await getApiKeyModel();
        const keyDoc = await ApiKey.findOne({ key: apiKey, status: 'active' });

        if (!keyDoc) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Invalid or revoked QuantaCipher API Key.'
            });
        }

        // Attach key document to request for downstream use (billing, rate limiting)
        (req as any).client = {
            apiKey,
            keyId: keyDoc._id.toString(),
            userId: keyDoc.userId.toString(),
            calls: keyDoc.calls,
            monthlyCallLimit: keyDoc.monthlyCallLimit,
        };

        next();
    } catch (err) {
        console.error('[Auth Middleware] DB Error:', err);
        // Fail open in case of DB issues (configurable per policy)
        // In strict mode, return 500 here
        return res.status(500).json({ error: 'Authentication service unavailable.' });
    }
};
