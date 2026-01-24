const mongoose = require('mongoose');

const thresholdSchema = new mongoose.Schema({
    soilMoistureMax: { type: Number, default: 800 }, // Adjust defaults as suitable for sensor
    rainfallMax: { type: Number, default: 50 },
    tiltMax: { type: Number, default: 20 },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Threshold', thresholdSchema);
