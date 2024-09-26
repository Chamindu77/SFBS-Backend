const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EquipmentBookingSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
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
  dateTime: {
    type: Date,
    required: true,
  },
  equipmentName: {
    type: String,
    required: true
  },
  sportName: {
    type: String,
    required: true
  },
  equipmentPrice: {
    type: Number,
    required: true
  },
  quantity: {
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
  qrCode: {
    type: String 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EquipmentBooking', EquipmentBookingSchema);
