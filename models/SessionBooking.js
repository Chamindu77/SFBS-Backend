const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  sessionRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SessionRequest',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userPhone: {
    type: String,
    required: true,
  },
  sportName: {
    type: String,
    required: true,
  },
  sessionType: {
    type: String,
    required: true,
  },
  bookedTimeSlots: {
    type: [{
      date: {
        type: Date,
        required: true,
      },
      timeSlot: {
        type: String,
        required: true,
      }
    }],
    required: true,
  },
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  coachName: {
    type: String,
    required: true,
  },
  coachEmail: {
    type: String,
    required: true,
  },
  coachLevel: {
    type: String,
    required: true,
  },
  sessionFee: {
    type: String,
    required: true, 
  },
  courtNo: {
    type: String,
    default: null, 
  },
  receipt: {
    type: String,
    required: true, 
  },
  qrCodeUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('SessionBooking', BookingSchema);
