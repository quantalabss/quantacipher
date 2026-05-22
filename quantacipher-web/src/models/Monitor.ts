import mongoose from 'mongoose';

const MonitorSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: [true, 'User Email is required'],
        index: true,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    endpoint: {
        type: String,
        required: [true, 'Endpoint is required'],
    },
    type: {
        type: String,
        enum: ['http', 'rpc'],
        default: 'http',
    },
    chain: {
        type: String,
        default: 'evm',
    },
    frequency: {
        type: Number,
        default: 60, // seconds
    },
    alertType: {
        type: String,
        enum: ['email', 'webhook'],
        default: 'email',
    },
    webhookUrl: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ['up', 'down', 'degraded', 'pending'],
        default: 'pending',
    },
    lastLatency: {
        type: Number,
        default: 0,
    },
    lastChecked: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastBlockHeight: {
        type: Number,
        default: 0,
    },
    blockDrift: {
        type: Number, // Positive means behind, Negative means ahead (rare)
        default: 0,
    },
});

// CRITICAL INDEXES FOR SCALABILITY
// These make queries 10-100x faster at scale
MonitorSchema.index({ userEmail: 1, status: 1 }); // For dashboard queries
MonitorSchema.index({ status: 1, lastChecked: 1 }); // For cron job queries
MonitorSchema.index({ createdAt: -1 }); // For sorting by date
MonitorSchema.index({ userEmail: 1, createdAt: -1 }); // For user's monitor list

export default mongoose.models.Monitor || mongoose.model('Monitor', MonitorSchema);
