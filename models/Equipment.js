const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  equipmentName: {
    type: String,
    required: true
  },
  sportName: {
    type: String,
    required: true
  },
  rentPrice: {
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

module.exports = mongoose.model('Equipment', EquipmentSchema);
