// const mongoose = require('mongoose');

// const CoachProfileSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   coachName: {
//     type: String,
//     required: true
//   },
//   coachLevel: {
//     type: String,
//     required: true,
//     enum: ['Professional Level', 'Intermediate Level', 'Beginner Level']
//   },
//   coachingSport: {
//     type: String,
//     required: true
//   },
//   coachPrice: {
//     type: Number,
//     required: true
//   },
//   availableTimeSlots: {
//     type: [{
//       date: {
//         type: Date,
//         required: true
//       },
//       timeSlot: {
//         type: String,
//         required: true
//       }
//     }],
//     validate: {
//       validator: function(value) {
//         const today = new Date();
//         const sevenDaysFromToday = new Date(today);
//         sevenDaysFromToday.setDate(today.getDate() + 7);

//         return value.every(slot => {
//           const slotDate = new Date(slot.date);
//           return slotDate >= today && slotDate <= sevenDaysFromToday;
//         });
//       },
//       message: 'Time slots must be within the next 7 days.'
//     },
//     required: true
//   },
//   experience: {
//     type: String,
//     required: true
//   },
//   offerSessions: {
//     type: [String],
//     enum: ['Individual Session', 'Group Session'],
//     required: true
//   },
//   sessionDescription: {
//     type: String,
//     required: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   image: {
//     type: String,
//     default: null,
//     required: false
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('CoachProfile', CoachProfileSchema);


// models/CoachProfile.js
const mongoose = require('mongoose');

const CoachProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coachName: {
    type: String,
    required: true
  },
  coachLevel: {
    type: String,
    required: true,
    enum: ['Professional Level', 'Intermediate Level', 'Beginner Level']
  },
  coachingSport: {
    type: String,
    required: true
  },
  coachPrice: {
    individualSessionPrice: {
      type: Number,
      required: false
    },
    groupSessionPrice: {
      type: Number,
      required: false
    }
  },
  availableTimeSlots: {
    type: [{
      date: {
        type: Date,
        required: true
      },
      timeSlot: {
        type: String,
        required: true
      }
    }],
    validate: {
      validator: function(value) {
        const today = new Date();
        const sevenDaysFromToday = new Date(today);
        sevenDaysFromToday.setDate(today.getDate() + 7);

        return value.every(slot => {
          const slotDate = new Date(slot.date);
          return slotDate >= today && slotDate <= sevenDaysFromToday;
        });
      },
      message: 'Time slots must be within the next 7 days.'
    },
    required: false
  },
  experience: {
    type: String,
    required: true
  },
  offerSessions: {
    type: [String],
    enum: ['Individual Session', 'Group Session'],
    required: false
  },
  sessionDescription: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: null,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CoachProfile', CoachProfileSchema);

