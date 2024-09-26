// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');
// const Joi = require('joi');

// dotenv.config();

// /**
//  * Registers a new user and returns a JWT token.
//  */

// const registerSchema = Joi.object({
//   name: Joi.string().min(3).max(30).required(),
//   email: Joi.string().email().required(),
//   password: Joi.string().min(6).required(),
//   role: Joi.string().valid('User', 'Coach', 'Admin').required(),
// });

// exports.register = async (req, res) => {
//   const { error } = registerSchema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ msg: error.details[0].message });
//   }

//   const { name, email, password, role } = req.body;

//   try {
//     let user = await User.findOne({ email });

//     if (user) {
//       return res.status(400).json({ msg: 'User already exists' });
//     }

//     user = new User({
//       name,
//       email,
//       password, 
//       role,
//     });

//     await user.save();

//     const payload = {
//       id: user.id,
//       role: user.role,
//       email: user.email,
//       name: user.name,
//       exp: Math.floor(Date.now() / 1000) + 60 * 60 * 10,
//       iat: Math.floor(Date.now() / 1000),
//       iss: 'sport-facility-booking-system',
//     };

//     jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
//       if (err) throw err;
//       res.json({ token });
//     });
//   } catch (err) {
//     console.error('Error during registration:', err.message);
//     res.status(500).send('Server error');
//   }
// };

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Joi = require('joi');
const sendUserRegistrationEmail = require('../utils/userEmailService');

dotenv.config();

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('User', 'Coach', 'Admin').required(),
});

exports.register = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }

  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role,
    });

    await user.save();

    const payload = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 10,
      iat: Math.floor(Date.now() / 1000),
      iss: 'sport-facility-booking-system',
    };

    jwt.sign(payload, process.env.JWT_SECRET, async (err, token) => {
      if (err) throw err;

      // Send registration confirmation email
      await sendUserRegistrationEmail(email, name);

      res.json({ token });
    });
  } catch (err) {
    console.error('Error during registration:', err.message);
    res.status(500).send('Server error');
  }
};


/**
 * Logs in a user and returns a JWT token.
 */

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address.',
    'string.empty': 'Email is required.'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long.',
    'string.empty': 'Password is required.'
  }),
  // role: Joi.string().valid('User', 'Coach', 'Admin').required().messages({
  //   'any.only': 'Please select a valid role.',
  //   'string.empty': 'Role is required.'
  // })
});

exports.login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // if (user.role !== role) {
    //   return res.status(400).json({ msg: 'Role mismatch' });
    // }

    const isMatch = user.decryptPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Password' });
    }

    const payload = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 10),
      iat: Math.floor(Date.now() / 1000),
      iss: 'sport-facility-booking-system',
    };

    jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).send('Server error');
  }
};