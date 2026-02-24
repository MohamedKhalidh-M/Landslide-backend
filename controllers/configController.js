const supabase = require('../config/supabase');

exports.getThresholds = async (req, res) => {
    try {
        let { data: thresholds, error } = await supabase
            .from('thresholds')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code === 'PGRST116') {
            // No rows found — create default
            const { data: newThreshold, error: createError } = await supabase
                .from('thresholds')
                .insert({
                    soil_moisture_max: 800,
                    rainfall_max: 50,
                    tilt_max: 20
                })
                .select()
                .single();

            if (createError) throw createError;
            thresholds = newThreshold;
        } else if (error) {
            throw error;
        }

        res.json(thresholds);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.updateThresholds = async (req, res) => {
    try {
        const { soilMoistureMax, rainfallMax, tiltMax } = req.body;

        const { data: newThreshold, error } = await supabase
            .from('thresholds')
            .insert({
                soil_moisture_max: soilMoistureMax,
                rainfall_max: rainfallMax,
                tilt_max: tiltMax
            })
            .select()
            .single();

        if (error) throw error;
        res.json(newThreshold);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
