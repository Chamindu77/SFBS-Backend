const mongoose = require('mongoose');

const SessionRequestSchema = new mongoose.Schema({
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
    enum: ['Individual Session', 'Group Session'],
    required: true,
  },
  coachProfileId: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoachProfile',
    required: true,
  },
  coachId: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requestedTimeSlots: {
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
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', "Booked"],
    default: 'Pending',
  },
  receipt: {
    type: String,
    default: null, 
  },
  courtNo: {
    type: String,
    default: null, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('SessionRequest', SessionRequestSchema);


