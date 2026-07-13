import mongoose from 'mongoose';

const ApiLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    apiKeyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ApiKey',
        required: false,
    },
    endpoint: {
        type: String, // e.g., '/encrypt', '/decrypt', '/vault'
        required: true,
    },
    method: {
        type: String,
        default: 'POST',
    },
    status: {
        type: Number, // HTTP status code
        default: 200,
    },
    bytesProcessed: {
        type: Number,
        default: 0,
    },
    responseTimeMs: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
});

export default mongoose.models.ApiLog || mongoose.model('ApiLog', ApiLogSchema);
