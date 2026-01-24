const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ timestamp: -1 }).limit(50); // Limit to last 50
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};
