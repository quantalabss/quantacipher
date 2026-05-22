import mongoose from 'mongoose';

const MonitorCheckSchema = new mongoose.Schema({
    monitorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Monitor',
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['up', 'down', 'degraded'],
        required: true,
    },
    latency: {
        type: Number,
        required: true,
        default: 0,
    },
    statusCode: {
        type: Number,
    },
    errorMessage: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    }
});

// Compound index for querying history of a specific monitor efficiently
MonitorCheckSchema.index({ monitorId: 1, timestamp: -1 });

// Index for analytics queries (uptime calculations)
MonitorCheckSchema.index({ monitorId: 1, status: 1, timestamp: -1 });

// TTL index - automatically delete checks older than 90 days to save space
// This prevents database from growing infinitely
MonitorCheckSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export default mongoose.models.MonitorCheck || mongoose.model('MonitorCheck', MonitorCheckSchema);
