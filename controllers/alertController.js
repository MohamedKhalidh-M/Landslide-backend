const supabase = require('../config/supabase');

exports.getAlerts = async (req, res) => {
    try {
        const { data: alerts, error } = await supabase
            .from('alerts')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(50);

        if (error) throw error;
        res.json(alerts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
