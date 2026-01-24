const analyzeRisk = (data, thresholds) => {
    const { soilMoisture, rainfall, tiltValue } = data;
    const { soilMoistureMax, rainfallMax, tiltMax } = thresholds;

    let exceededCount = 0;
    let isSoilHigh = soilMoisture > soilMoistureMax;
    let isRainHigh = rainfall > rainfallMax;
    let isTiltHigh = tiltValue > tiltMax;

    if (isSoilHigh) exceededCount++;
    if (isRainHigh) exceededCount++;
    if (isTiltHigh) exceededCount++;

    if (isSoilHigh && isRainHigh && isTiltHigh) {
        return 'HIGH';
    } else if (exceededCount > 0) {
        return 'MEDIUM';
    } else {
        return 'LOW';
    }
};

module.exports = { analyzeRisk };
