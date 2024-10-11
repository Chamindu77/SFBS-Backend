// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const path = require('path');
// const connectDB = require('./config/db');

// // Import your routes here
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const facilityRoutes = require('./routes/facilityRoutes');
// const equipmentRoutes = require('./routes/equipmentRoutes');
// const equipmentBookingRoutes = require('./routes/equipmentBookingRoutes');
// const facilityBookingRoutes = require('./routes/facilityBookingRoutes');
// const coachProfileRoutes = require('./routes/coachProfileRoutes');
// const sessionRoutes = require('./routes/sessionRoutes');
// const reviewRoutes = require('./routes/reviewRoutes');

// const app = express();

// // Configure CORS globally for all routes
// const corsOptions = {
//   origin: 'https://sfbs-frontend.vercel.app', // Replace with your frontend URL
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
// };

// app.use(cors(corsOptions));

// // Preflight request handler
// app.options('*', cors(corsOptions));

// // Connect to the database
// connectDB();

// // Init Middleware
// app.use(bodyParser.json());
// app.use(express.json());

// // Serve static files from the uploads folder
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// app.get('/', (req, res) => {
//   res.send('Server is running');
// });
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/user', userRoutes);
// app.use('/api/v1/facilities', facilityRoutes);
// app.use('/api/v1/equipment', equipmentRoutes);
// app.use('/api/v1/equipment-booking', equipmentBookingRoutes);
// app.use('/api/v1/facility-booking', facilityBookingRoutes);
// app.use('/api/v1/coach-profile', coachProfileRoutes);
// app.use('/api/v1/session', sessionRoutes);
// app.use('/api/v1/reviews', reviewRoutes);

// // Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/db');
const passport = require('passport'); // Add passport
const session = require('express-session'); // Add session
const GoogleStrategy = require('passport-google-oauth20').Strategy; // Add Google OAuth strategy
const User = require('./models/User'); // Add User model

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
  origin: 'https://sfbs-frontend.vercel.app', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
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

// Configure Session Middleware
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google Strategy for Passport
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://your-hosted-domain.com/api/v1/auth/google/callback', // Replace with your hosted domain
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      // If user does not exist, create a new one
      if (!user) {
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          role: 'User', // Set default role as 'User'
        });
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
));

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});

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
