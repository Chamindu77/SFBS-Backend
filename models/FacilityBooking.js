const mongoose = require('mongoose');

// Define the schema for facility Booking
const FacilityBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userPhoneNumber: {
    type: String,
    required: true
  },
  sportName: {
    type: String,
    required: true
  },
  courtNumber: {
    type: String,
    required: true
  },
  courtPrice: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlots: {
    type: [String],
    required: true
  },
  totalHours: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  receipt: {
    type: String, 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  qrCode: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FacilityBooking', FacilityBookingSchema);
