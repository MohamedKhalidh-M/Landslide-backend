const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    riskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        required: true
    },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    dataSnapshot: { type: Object }
});

module.exports = mongoose.model('Alert', alertSchema);
