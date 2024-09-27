const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const equipmentBookingRoutes = require('./routes/equipmentBookingRoutes');
const facilityBookingRoutes = require('./routes/facilityBookingRoutes');
const coachProfileRoutes = require('./routes/coachProfileRoutes'); // Updated
//const sessionRoutes = require('./routes/sessionRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const cors = require('cors');

const app = express();

// app.use(cors({
//      origin: 'https://verdant-boba-888f77.netlify.app', // Specific origin
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true, // Allow credentials to be sent
//     allowedHeaders: ['Content-Type'], // Specify allowed headers
//   }));

app.options('*', cors({
    origin: 'https://verdant-boba-888f77.netlify.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// Connect Database
connectDB();

// Init Middleware
app.use(bodyParser.json());
app.use(express.json());

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Define Routes
app.use('/api/v1/auth', authRoutes );
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/facilities', facilityRoutes);
app.use('/api/v1/equipment', equipmentRoutes);
app.use('/api/v1/equipment-booking', equipmentBookingRoutes);
app.use('/api/v1/facility-booking', facilityBookingRoutes);
//app.use('/api/v1/payment', facilityBookingRoutes);
app.use('/api/v1/coach-profile', coachProfileRoutes); 
app.use('/api/v1/session', sessionRoutes);
app.use('/api/v1/reviews', reviewRoutes);




const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
