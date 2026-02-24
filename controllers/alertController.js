const supabase = require('../config/supabase');

exports.getAlerts = async (req, res) => {
    try {
        const { sensorId } = req.query;

        let query = supabase
            .from('alerts')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(50);

        if (sensorId) {
            query = query.eq('sensor_id', sensorId);
        }

        const { data: alerts, error } = await query;

        if (error) throw error;
        res.json(alerts || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
