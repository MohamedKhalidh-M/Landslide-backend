const supabase = require('../config/supabase');
const { analyzeRisk } = require('../services/riskAnalysis');

exports.ingestData = async (req, res) => {
    try {
        const { sensorId, soilMoisture, rainfall, tiltValue, temperature, humidity } = req.body;

        // Get latest thresholds
        let { data: thresholds, error: thresholdError } = await supabase
            .from('thresholds')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (thresholdError || !thresholds) {
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
        }

        const thresholdsMapped = {
            soilMoistureMax: thresholds.soil_moisture_max,
            rainfallMax: thresholds.rainfall_max,
            tiltMax: thresholds.tilt_max,
        };

        const riskLevel = analyzeRisk({ soilMoisture, rainfall, tiltValue }, thresholdsMapped);

        // Save Sensor Data
        const { data: newData, error: insertError } = await supabase
            .from('sensor_data')
            .insert({
                sensor_id: sensorId,
                soil_moisture: soilMoisture,
                rainfall,
                tilt_value: tiltValue,
                temperature,
                humidity
            })
            .select()
            .single();

        if (insertError) throw insertError;

        const io = req.app.get('socketio');

        // Emit real-time data
        io.emit('new-data', { ...newData, riskLevel });

        // Handle Risk
        if (riskLevel === 'HIGH') {
            const { data: alert, error: alertError } = await supabase
                .from('alerts')
                .insert({
                    risk_level: riskLevel,
                    message: `High risk detected at ${sensorId}! Soil: ${soilMoisture}, Rain: ${rainfall}, Tilt: ${tiltValue}`,
                    sensor_id: sensorId,
                    data_snapshot: newData
                })
                .select()
                .single();

            if (alertError) throw alertError;
            io.emit('alert', alert);
        }

        res.status(201).json({ message: 'Data received', riskLevel });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get all unique sensor node IDs
exports.getNodes = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('sensor_data')
            .select('sensor_id');

        if (error) throw error;

        // Extract unique sensor IDs
        const uniqueNodes = [...new Set(data.map(row => row.sensor_id))];
        res.json(uniqueNodes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getRealTime = async (req, res) => {
    try {
        const { sensorId } = req.query;

        let query = supabase
            .from('sensor_data')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

        if (sensorId) {
            query = supabase
                .from('sensor_data')
                .select('*')
                .eq('sensor_id', sensorId)
                .order('timestamp', { ascending: false })
                .limit(1)
                .single();
        }

        const { data: latest, error } = await query;

        if (error && error.code !== 'PGRST116') throw error;
        res.json(latest || null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const { range, sensorId } = req.query;
        let startDate = new Date();

        if (range === '7d') {
            startDate.setDate(startDate.getDate() - 7);
        } else {
            startDate.setHours(startDate.getHours() - 24);
        }

        let query = supabase
            .from('sensor_data')
            .select('*')
            .gte('timestamp', startDate.toISOString())
            .order('timestamp', { ascending: true });

        if (sensorId) {
            query = query.eq('sensor_id', sensorId);
        }

        const { data, error } = await query;

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
