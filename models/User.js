const mongoose = require('mongoose');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['User', 'Coach', 'Admin'],
    default: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Encrypt password before saving the user
UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.AES_SECRET_KEY, 'hex'),
    Buffer.from(process.env.AES_IV, 'hex')
  );
  let encrypted = cipher.update(this.password, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  this.password = encrypted;
  next();
});

// Decrypt password for comparison
UserSchema.methods.decryptPassword = function (password) {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.AES_SECRET_KEY, 'hex'),
    Buffer.from(process.env.AES_IV, 'hex')
  );
  let decrypted = decipher.update(this.password, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted === password;
};

module.exports = mongoose.model('User', UserSchema);
