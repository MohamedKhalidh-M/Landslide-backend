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
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/landslide-system';
        console.log(`Attempting to connect to MongoDB at ${mongoUri}...`);

        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
        console.log('MongoDB Connected');
    } catch (err) {
        console.log('Local MongoDB connection failed, starting in-memory database...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            console.log(`In-memory MongoDB started at ${uri}`);
            await mongoose.connect(uri);
            console.log('MongoDB Connected (In-Memory)');
        } catch (memErr) {
            console.error('Failed to start in-memory MongoDB:', memErr);
            process.exit(1);
        }
    }

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
