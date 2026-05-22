import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        index: true,
    },
    name: {
        type: String,
        required: false,
    },
    plan: {
        type: String,
        enum: ['free', 'startup', 'business', 'enterprise'],
        default: 'free',
    },
    stripeCustomerId: {
        type: String,
        required: false,
    },
    stripeSubscriptionId: {
        type: String,
        required: false,
    },
    planExpiresAt: {
        type: Date,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
