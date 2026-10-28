const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    accountNumber: { type: String, required: true, unique: true },
    balance: { type: Number, required: true, default: 1000 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'banned'], default: 'active' },
    tier: { type: Number, default: 1 },
    tierRequest: {
        status: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
        targetTier: { type: Number },
        bvn: { type: String },
        billType: { type: String },
        requestedAt: { type: Date }
    }
}, {
    timestamps: true    
});

module.exports = mongoose.model('User', UserSchema);