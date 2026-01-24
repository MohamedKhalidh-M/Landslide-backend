# Landslide Alert System Backend

Cloud-based backend for an IoT Landslide Alert System that accepts real-time sensor data from ESP32/NodeMCU devices and performs risk analysis.

## Features

- **Real-time Sensor Data Ingestion** via REST API
- **Risk Analysis Engine** (LOW/MEDIUM/HIGH levels)
- **WebSocket Support** for real-time updates
- **Alert System** with automatic HIGH risk notifications
- **Configurable Thresholds** via API
- **Time-series Data Storage** with MongoDB
- **Auto-fallback** to in-memory database for development

## Sensors Supported

- Soil Moisture Sensor
- Rainfall Sensor
- Tilt/Vibration Sensor (MPU6050)
- Temperature & Humidity Sensor

## Quick Start

```bash
# Install dependencies
npm install

# Run unit tests
node test/unit_test.js

# Start server
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sensors` | Ingest sensor data |
| GET | `/api/sensors/realtime` | Get latest reading |
| GET | `/api/sensors/history?range=24h` | Get historical data (24h/7d) |
| GET | `/api/alerts` | Get alert history |
| GET | `/api/thresholds` | Get current thresholds |
| PUT | `/api/thresholds` | Update thresholds |

## Sensor Data Format

```json
{
  "sensorId": "ESP32_001",
  "soilMoisture": 300,
  "rainfall": 0,
  "tiltValue": 5,
  "temperature": 25,
  "humidity": 60
}
```

## Risk Analysis Logic

- **LOW**: All values within thresholds
- **MEDIUM**: 1-2 parameters exceed thresholds
- **HIGH**: Soil moisture, rainfall, AND tilt all exceed thresholds simultaneously

## WebSocket Events

- `new-data`: Emitted on every sensor reading
- `alert`: Emitted when HIGH risk is detected

## Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/landslide-system
```

## Testing

Simulate ESP32 sensor data:
```bash
node simulate_sensors.js
```

## License

MIT
