require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const supabase = require('./config/supabase');
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
        // Verify Supabase connection with a simple query
        console.log('Connecting to Supabase...');
        const { error } = await supabase.from('sensor_data').select('id').limit(1);
        if (error) throw error;
        console.log('✓ Supabase Connected Successfully');
    } catch (err) {
        console.error('✗ Supabase Connection Failed:', err.message);
        process.exit(1);
    }

    server.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
    });
};

startServer();
