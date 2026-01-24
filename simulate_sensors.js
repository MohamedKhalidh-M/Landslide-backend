const API_URL = 'http://localhost:5000/api';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sendData = async (data) => {
    try {
        const response = await fetch(`${API_URL}/sensors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log(`Sent: Soil=${data.soilMoisture}, Rain=${data.rainfall}, Tilt=${data.tiltValue} -> Risk: ${result.riskLevel}`);
    } catch (error) {
        console.error('Error sending data:', error.message);
    }
};

const runSimulation = async () => {
    console.log('Starting Sensor Simulation...');

    // Normal Data
    await sendData({
        sensorId: 'ESP32_001',
        soilMoisture: 300,
        rainfall: 0,
        tiltValue: 5,
        temperature: 25,
        humidity: 60
    });

    await sleep(1000);

    // Medium Risk (Rain High)
    await sendData({
        sensorId: 'ESP32_001',
        soilMoisture: 300,
        rainfall: 60, // Threshold is 50
        tiltValue: 5,
        temperature: 24,
        humidity: 80
    });

    await sleep(1000);

    // High Risk (All High)
    await sendData({
        sensorId: 'ESP32_001',
        soilMoisture: 850, // Threshold 800
        rainfall: 100,     // Threshold 50
        tiltValue: 25,     // Threshold 20
        temperature: 22,
        humidity: 90
    });

    console.log('Simulation complete.');
};

runSimulation();
