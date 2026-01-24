const Threshold = require('../models/Threshold');

exports.getThresholds = async (req, res) => {
    try {
        let thresholds = await Threshold.findOne().sort({ updatedAt: -1 });
        if (!thresholds) {
            thresholds = await Threshold.create({});
        }
        res.json(thresholds);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.updateThresholds = async (req, res) => {
    try {
        const { soilMoistureMax, rainfallMax, tiltMax } = req.body;
        const newThreshold = new Threshold({
            soilMoistureMax,
            rainfallMax,
            tiltMax
        });
        await newThreshold.save();
        res.json(newThreshold);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};
