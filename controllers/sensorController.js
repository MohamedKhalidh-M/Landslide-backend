const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const Threshold = require('../models/Threshold');
const { analyzeRisk } = require('../services/riskAnalysis');

exports.ingestData = async (req, res) => {
    try {
        const { sensorId, soilMoisture, rainfall, tiltValue, temperature, humidity } = req.body;

        // Get latest thresholds
        let thresholds = await Threshold.findOne().sort({ updatedAt: -1 });
        if (!thresholds) {
            thresholds = await Threshold.create({}); // Create default if none
        }

        const riskLevel = analyzeRisk({ soilMoisture, rainfall, tiltValue }, thresholds);

        // Save Sensor Data
        const newData = new SensorData({
            sensorId,
            soilMoisture,
            rainfall,
            tiltValue,
            temperature,
            humidity
        });
        await newData.save();

        const io = req.app.get('socketio');

        // Emit real-time data
        io.emit('new-data', { ...newData.toObject(), riskLevel });

        // Handle Risk
        if (riskLevel === 'HIGH') {
            const alert = new Alert({
                riskLevel,
                message: `High risk detected! Soil: ${soilMoisture}, Rain: ${rainfall}, Tilt: ${tiltValue}`,
                dataSnapshot: newData
            });
            await alert.save();
            io.emit('alert', alert);
        }

        res.status(201).json({ message: 'Data received', riskLevel });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getRealTime = async (req, res) => {
    try {
        const latest = await SensorData.findOne().sort({ timestamp: -1 });
        res.json(latest);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const { range } = req.query; // '24h', '7d'
        let startDate = new Date();

        if (range === '7d') {
            startDate.setDate(startDate.getDate() - 7);
        } else {
            startDate.setHours(startDate.getHours() - 24); // Default 24h
        }

        const data = await SensorData.find({ timestamp: { $gte: startDate } }).sort({ timestamp: 1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};
