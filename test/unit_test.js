const assert = require('assert');
const { analyzeRisk } = require('../services/riskAnalysis');

console.log('Running Risk Analysis Unit Tests...');

const thresholds = {
    soilMoistureMax: 800,
    rainfallMax: 50,
    tiltMax: 20
};

// Test 1: Low Risk (All below thresholds)
try {
    const result = analyzeRisk({
        soilMoisture: 300,
        rainfall: 0,
        tiltValue: 5
    }, thresholds);
    assert.strictEqual(result, 'LOW');
    console.log('✔ Test 1 Passed: Low Risk');
} catch (e) {
    console.error('✘ Test 1 Failed:', e.message);
}

// Test 2: Medium Risk (One above threshold)
try {
    const result = analyzeRisk({
        soilMoisture: 300,
        rainfall: 60, // Exceeds 50
        tiltValue: 5
    }, thresholds);
    assert.strictEqual(result, 'MEDIUM');
    console.log('✔ Test 2 Passed: Medium Risk (Rain)');
} catch (e) {
    console.error('✘ Test 2 Failed:', e.message);
}

// Test 3: Medium Risk (Two above thresholds)
try {
    const result = analyzeRisk({
        soilMoisture: 850, // Exceeds 800
        rainfall: 60,      // Exceeds 50
        tiltValue: 5
    }, thresholds);
    assert.strictEqual(result, 'MEDIUM'); // Should still be MEDIUM as per logic
    console.log('✔ Test 3 Passed: Medium Risk (Soil + Rain)');
} catch (e) {
    console.error('✘ Test 3 Failed:', e.message);
}

// Test 4: High Risk (All three above thresholds)
try {
    const result = analyzeRisk({
        soilMoisture: 850,
        rainfall: 60,
        tiltValue: 25   // Exceeds 20
    }, thresholds);
    assert.strictEqual(result, 'HIGH');
    console.log('✔ Test 4 Passed: High Risk');
} catch (e) {
    console.error('✘ Test 4 Failed:', e.message);
}

console.log('Unit Tests Completed.');
