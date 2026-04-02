const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

// CORS Configuration
// It securely reads FRONTEND_URL, strips trailing slashes to prevent CORS mismatches, 
// and defaults to allowing all origins (true) for local development if not provided.
let corsOptions = {
    origin: true, // Default to true (reflects request origin)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Type'],
    optionsSuccessStatus: 204,
};

if (process.env.FRONTEND_URL) {
    const allowedOrigins = process.env.FRONTEND_URL
        .split(',')
        .map((url) => url.trim().replace(/\/+$/, '')) // Removetrailing slashes!
        .filter(Boolean);

    corsOptions.origin = allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins;
}

app.use(cors(corsOptions));

const auth = require('./routes/authRoutes');
const medicine = require('./routes/medicineRoutes');
const caretaker = require('./routes/caretakerRoutes');
const ai = require('./routes/aiRoutes');
const admin = require('./routes/adminRoutes');

app.use('/api/auth', auth);
app.use('/api/medicine', medicine);
app.use('/api/caretaker', caretaker);
app.use('/api/ai', ai);
app.use('/api/admin', admin);

app.get('/api/health', (req, res) => {
    res.status(200).json({ ok: true, service: 'med-mate-api' });
});

app.get('/', (req, res) => {
    res.send('Med-Mate API is running...');
});

module.exports = app;
