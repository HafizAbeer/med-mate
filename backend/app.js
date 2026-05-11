const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(express.json());

// CORS Configuration
const allowedOrigins = [
    'https://med-mate-five.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));

const auth = require('./routes/authRoutes');
const medicine = require('./routes/medicineRoutes');
const caretaker = require('./routes/caretakerRoutes');
const ai = require('./routes/aiRoutes');
const admin = require('./routes/adminRoutes');
const notifications = require('./routes/notificationRoutes');

// Ensure database connection before routing requests (Crucial for Vercel Serverless)
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

app.use('/api/auth', auth);
app.use('/api/medicine', medicine);
app.use('/api/caretaker', caretaker);
app.use('/api/ai', ai);
app.use('/api/admin', admin);
app.use('/api/notifications', notifications);

app.get('/api/health', (req, res) => {
    res.status(200).json({ ok: true, service: 'med-mate-api' });
});

app.get('/', (req, res) => {
    res.send('Med-Mate API is running...');
});

module.exports = app;
