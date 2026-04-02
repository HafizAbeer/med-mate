const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Route files
const auth = require('./routes/authRoutes');
const medicine = require('./routes/medicineRoutes');
const caretaker = require('./routes/caretakerRoutes');
const ai = require('./routes/aiRoutes');
const admin = require('./routes/adminRoutes');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/medicine', medicine);
app.use('/api/caretaker', caretaker);
app.use('/api/ai', ai);
app.use('/api/admin', admin);

// Basic Route
app.get('/', (req, res) => {
    res.send('Med-Mate API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
