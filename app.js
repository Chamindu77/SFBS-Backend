// const express = require('express');
// const connectDB = require('./config/db');
// const bodyParser = require('body-parser');
// const path = require('path');

// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const facilityRoutes = require('./routes/facilityRoutes');
// const equipmentRoutes = require('./routes/equipmentRoutes');
// const equipmentBookingRoutes = require('./routes/equipmentBookingRoutes');
// const facilityBookingRoutes = require('./routes/facilityBookingRoutes');
// const coachProfileRoutes = require('./routes/coachProfileRoutes'); // Updated
// //const sessionRoutes = require('./routes/sessionRoutes');
// const sessionRoutes = require('./routes/sessionRoutes');
// const reviewRoutes = require('./routes/reviewRoutes');
// const cors = require('cors');

// const app = express();



// app.options('*', cors({
//     origin: 'https://sfbs-frontend.vercel.app',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true,
// }));

// // Connect Database
// connectDB();

// // Init Middleware
// app.use(bodyParser.json());
// app.use(express.json());

// // Serve static files from the uploads folder
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// //app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// app.get('/', (req, res) => {
//   res.send('Server is running');
// });

// // Define Routes
// app.use('/api/v1/auth', authRoutes );
// app.use('/api/v1/user', userRoutes);
// app.use('/api/v1/facilities', facilityRoutes);
// app.use('/api/v1/equipment', equipmentRoutes);
// app.use('/api/v1/equipment-booking', equipmentBookingRoutes);
// app.use('/api/v1/facility-booking', facilityBookingRoutes);
// //app.use('/api/v1/payment', facilityBookingRoutes);
// app.use('/api/v1/coach-profile', coachProfileRoutes); 
// app.use('/api/v1/session', sessionRoutes);
// app.use('/api/v1/reviews', reviewRoutes);




// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/db');

// Import your routes here
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const equipmentBookingRoutes = require('./routes/equipmentBookingRoutes');
const facilityBookingRoutes = require('./routes/facilityBookingRoutes');
const coachProfileRoutes = require('./routes/coachProfileRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Configure CORS globally for all routes
const corsOptions = {
  origin: 'https://sfbs-frontend.vercel.app', 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Preflight request handler
app.options('*', cors(corsOptions));

// Connect to the database
connectDB();

// Init Middleware
app.use(bodyParser.json());
app.use(express.json());

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('Server is running');
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/facilities', facilityRoutes);
app.use('/api/v1/equipment', equipmentRoutes);
app.use('/api/v1/equipment-booking', equipmentBookingRoutes);
app.use('/api/v1/facility-booking', facilityBookingRoutes);
app.use('/api/v1/coach-profile', coachProfileRoutes);
app.use('/api/v1/session', sessionRoutes);
app.use('/api/v1/reviews', reviewRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
