require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const sensorController = require('./controllers/sensorController');
const alertController = require('./controllers/alertController');
const configController = require('./controllers/configController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
    res.send('Landslide Alert System Backend is Running');
});

app.post('/api/sensors', sensorController.ingestData);
app.get('/api/sensors/realtime', sensorController.getRealTime);
app.get('/api/sensors/history', sensorController.getHistory);
app.get('/api/alerts', alertController.getAlerts);
app.get('/api/thresholds', configController.getThresholds);
app.put('/api/thresholds', configController.updateThresholds);

// Socket.io
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

app.set('socketio', io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            console.error('ERROR: MONGO_URI environment variable is not set!');
            console.error('Please set MONGO_URI to your MongoDB connection string.');
            console.error('For Railway: Add MONGO_URI in your service variables');
            console.error('For MongoDB Atlas: Get connection string from atlas.mongodb.com');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✓ MongoDB Connected Successfully');

    } catch (err) {
        console.error('✗ MongoDB Connection Failed:', err.message);
        process.exit(1);
    }

    server.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
    });
};

startServer();
