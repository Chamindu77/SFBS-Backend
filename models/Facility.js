const mongoose = require('mongoose');

// Define the schema for facility
const FacilitySchema = new mongoose.Schema({
  courtNumber: {
    type: String,
    required: true
  },
  sportName: {
    type: String,
    required: true
  },
  sportCategory: {
    type: String,
    required: true
  },
  courtPrice: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
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

module.exports = mongoose.model('Facility', FacilitySchema);
