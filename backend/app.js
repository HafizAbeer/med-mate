const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

let corsOrigin = true;
if (process.env.FRONTEND_URL) {
    const list = process.env.FRONTEND_URL.split(',').map((o) => o.trim()).filter(Boolean);
    corsOrigin = list.length === 1 ? list[0] : list;
}
app.use(cors({ origin: corsOrigin }));

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

app.get('/', (req, res) => {
    res.send('Med-Mate API is running...');
});

module.exports = app;
