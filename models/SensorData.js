const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  sensorId: { type: String, required: true },
  soilMoisture: { type: Number, required: true },
  rainfall: { type: Number, required: true },
  tiltValue: { type: Number, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('SensorData', sensorDataSchema);
