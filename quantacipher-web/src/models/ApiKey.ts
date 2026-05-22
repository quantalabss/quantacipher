import mongoose from 'mongoose';

const ApiKeySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: [true, 'Key name is required'],
        trim: true,
    },
    // We store the key itself for display, but validate via a hash in production
    key: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['active', 'revoked'],
        default: 'active',
    },
    // Usage tracking
    calls: {
        type: Number,
        default: 0,
    },
    bytesSecured: {
        type: Number,
        default: 0,
    },
    // Limits per plan
    monthlyCallLimit: {
        type: Number,
        default: 10000, // Free tier default
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    revokedAt: {
        type: Date,
        required: false,
    },
});

// Helper: generate a QZ API key
ApiKeySchema.statics.generateKey = function () {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const rand = Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `qz_live_${rand}`;
};

export default mongoose.models.ApiKey || mongoose.model('ApiKey', ApiKeySchema);
