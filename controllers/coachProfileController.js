// const mongoose = require('mongoose');
// const CoachProfile = require('../models/CoachProfile');
// const Review = require('../models/Review');
// const multer = require('multer');
// const path = require('path');

// // Configure Multer for handling file uploads
// const storage = multer.diskStorage({
//   destination: './uploads/images',
//   filename: (req, file, cb) => {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 1000000 }, 
//   fileFilter: (req, file, cb) => {
//     checkFileType(file, cb);
//   }
// }).single('image');

// function checkFileType(file, cb) {
//   const filetypes = /jpeg|jpg|png|gif/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);

//   if (extname && mimetype) {
//     return cb(null, true);
//   } else {
//     cb('Error: Images Only!');
//   }
// }

// // Create a new coach profile
// exports.createCoachProfile = async (req, res) => {
//   try {
//     const { coachName, coachLevel, coachingSport, coachPrice, availableTimeSlots, experience, offerSessions, sessionDescription } = req.body;

//     // Ensure only coaches can create a profile
//     if (req.user.role !== 'Coach') {
//       return res.status(403).json({ msg: 'Access denied. Only coaches can create a profile.' });
//     }

//     // Validate availableTimeSlots to ensure all dates are within the next 7 days
//     const today = new Date();
//     const sevenDaysFromNow = new Date(today);
//     sevenDaysFromNow.setDate(today.getDate() + 7);

//     const isValidSlots = availableTimeSlots.every(slot => {
//       const slotDate = new Date(slot.date);
//       return slotDate >= today && slotDate <= sevenDaysFromNow;
//     });

//     if (!isValidSlots) {
//       return res.status(400).json({ msg: 'All available time slots must be within the next 7 days.' });
//     }

//     const newCoachProfile = new CoachProfile({
//       userId: req.user.id,
//       coachName,
//       coachLevel,
//       coachingSport,
//       coachPrice: {
//         individualSessionPrice: coachPrice.individualSessionPrice,
//         groupSessionPrice: coachPrice.groupSessionPrice
//       },
//       availableTimeSlots,
//       experience,
//       offerSessions,
//       sessionDescription
//     });

//     await newCoachProfile.save();
//     res.json(newCoachProfile);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };

// // Update an existing coach profile
// exports.updateCoachProfile = async (req, res) => {
//   try {
//     // Ensure only coaches can update a profile
//     if (req.user.role !== 'Coach') {
//       return res.status(403).json({ msg: 'Access denied. Only coaches can update a profile.' });
//     }

//     const { coachName, coachLevel, coachingSport, coachPrice, availableTimeSlots, experience, offerSessions, sessionDescription } = req.body;

//     let coachProfile = await CoachProfile.findById(req.params.id);

//     if (!coachProfile) {
//       return res.status(404).json({ msg: 'Coach profile not found' });
//     }

//     if (availableTimeSlots) {
//       // Validate updated availableTimeSlots to ensure all dates are within the next 7 days
//       const today = new Date();
//       const sevenDaysFromNow = new Date(today);
//       sevenDaysFromNow.setDate(today.getDate() + 7);

//       const isValidSlots = availableTimeSlots.every(slot => {
//         const slotDate = new Date(slot.date);
//         return slotDate >= today && slotDate <= sevenDaysFromNow;
//       });

//       if (!isValidSlots) {
//         return res.status(400).json({ msg: 'All available time slots must be within the next 7 days.' });
//       }

//       coachProfile.availableTimeSlots = availableTimeSlots;
//     }

//     if (coachName) coachProfile.coachName = coachName;
//     if (coachLevel) coachProfile.coachLevel = coachLevel;
//     if (coachingSport) coachProfile.coachingSport = coachingSport;
//     if (coachPrice) {
//       coachProfile.coachPrice.individualSessionPrice = coachPrice.individualSessionPrice;
//       coachProfile.coachPrice.groupSessionPrice = coachPrice.groupSessionPrice;
//     }
//     if (experience) coachProfile.experience = experience;
//     if (offerSessions) coachProfile.offerSessions = offerSessions;
//     if (sessionDescription) coachProfile.sessionDescription = sessionDescription;

//     coachProfile.updatedAt = Date.now();

//     await coachProfile.save();
//     res.json(coachProfile);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };



// // Get all coach profiles with average ratings
// exports.getAllCoachProfiles = async (req, res) => {
//   try {
//     const coachProfiles = await CoachProfile.find();

//     const profilesWithAvgRating = await Promise.all(coachProfiles.map(async profile => {
//       const reviews = await Review.find({ coachProfileId: profile._id });
//       const avgRating = reviews.length > 0 
//         ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
//         : null;

//       return {
//         ...profile.toObject(),
//         avgRating: avgRating ? avgRating.toFixed(2) : null 
//       };
//     }));

//     res.json(profilesWithAvgRating);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };

// // Get a specific coach profile by CoachProfile ID with average rating
// exports.getCoachProfileByCoachProfileId = async (req, res) => {
//   try {
//     const coachProfile = await CoachProfile.findById(req.params.id);

//     if (!coachProfile) {
//       return res.status(404).json({ msg: 'Coach profile not found' });
//     }

//     const reviews = await Review.find({ coachProfileId: req.params.id });

//     const avgRating = reviews.length > 0 
//       ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
//       : null;

//     res.json({
//       ...coachProfile.toObject(),
//       avgRating: avgRating ? avgRating.toFixed(2) : null 
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };


// // Controller: Get a specific coach profile by userId with average rating
// exports.getCoachProfileByUserId = async (req, res) => {
//   try {
//     // Find coach profile by userId, passed through the request parameters
//     const coachProfile = await CoachProfile.findOne({ userId: req.params.userId });

//     if (!coachProfile) {
//       return res.status(404).json({ msg: 'Coach profile not found' });
//     }

//     // Find reviews related to the coach profile by coachProfile _id
//     const reviews = await Review.find({ coachProfileId: coachProfile._id });

//     // Calculate the average rating if reviews exist
//     const avgRating = reviews.length > 0 
//       ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
//       : null;

//     // Return the coach profile with the average rating
//     res.json({
//       ...coachProfile.toObject(),
//       avgRating: avgRating ? avgRating.toFixed(2) : null 
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };

// // Toggle the status of a coach profile
// exports.toggleCoachProfileStatus = async (req, res) => {
//   try {
//     const userId = req.params.id;

//     const coachProfile = await CoachProfile.findOne({ userId });

//     if (!coachProfile) {
//       return res.status(404).json({ msg: 'Coach profile not found' });
//     }

//     coachProfile.isActive = !coachProfile.isActive;
//     await coachProfile.save();

//     res.json(coachProfile);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };

// // Upload a coach profile image
// exports.uploadCoachProfileImage = (req, res) => {
//   upload(req, res, async (err) => {
//     try {
//       if (err) {
//         return res.status(400).json({ msg: err });
//       }

//       if (!req.file) {
//         return res.status(400).json({ msg: 'No file uploaded' });
//       }

//       let coachProfile = await CoachProfile.findOne({ userId: req.user.id });

//       if (!coachProfile) {
//         return res.status(404).json({ msg: 'Coach profile not found' });
//       }

//       const imageUrl = `http://localhost:5000/uploads/images/${req.file.filename}`;

//       coachProfile.image = imageUrl;
//       await coachProfile.save();

//       res.json(coachProfile);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server error');
//     }
//   });
// };

// // Update a coach profile image
// exports.updateCoachProfileImage = (req, res) => {
//   upload(req, res, async (err) => {
//     try {
//       if (err) {
//         return res.status(400).json({ msg: err });
//       }

//       if (!req.file) {
//         return res.status(400).json({ msg: 'No file uploaded' });
//       }

//       let coachProfile = await CoachProfile.findById(req.params.id);

//       if (!coachProfile) {
//         return res.status(404).json({ msg: 'Coach profile not found' });
//       }

//       const imageUrl = `http://localhost:5000/uploads/images/${req.file.filename}`;

//       coachProfile.image = imageUrl;
//       await coachProfile.save();

//       res.json(coachProfile);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server error');
//     }
//   });
// };


const cloudinary = require('../config/cloudinaryConfig'); // Cloudinary configuration
const multer = require('multer');
const CoachProfile = require('../models/CoachProfile');
const Review = require('../models/Review');

// Configure Multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Utility function to upload files to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: folder }, (error, result) => {
      if (error) {
        return reject(error); // Reject in case of error
      }
      resolve(result); // Resolve with Cloudinary result
    }).end(buffer); // Use the buffer to upload the file
  });
};

// Create a new coach profile
exports.createCoachProfile = async (req, res) => {
  try {
    const { coachName, coachLevel, coachingSport, coachPrice, availableTimeSlots, experience, offerSessions, sessionDescription } = req.body;

    if (req.user.role !== 'Coach') {
      return res.status(403).json({ msg: 'Access denied. Only coaches can create a profile.' });
    }

    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const isValidSlots = availableTimeSlots.every(slot => {
      const slotDate = new Date(slot.date);
      return slotDate >= today && slotDate <= sevenDaysFromNow;
    });

    if (!isValidSlots) {
      return res.status(400).json({ msg: 'All available time slots must be within the next 7 days.' });
    }

    const newCoachProfile = new CoachProfile({
      userId: req.user.id,
      coachName,
      coachLevel,
      coachingSport,
      coachPrice: {
        individualSessionPrice: coachPrice.individualSessionPrice,
        groupSessionPrice: coachPrice.groupSessionPrice
      },
      availableTimeSlots,
      experience,
      offerSessions,
      sessionDescription
    });

    await newCoachProfile.save();
    res.json(newCoachProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update an existing coach profile
exports.updateCoachProfile = async (req, res) => {
  try {
    if (req.user.role !== 'Coach') {
      return res.status(403).json({ msg: 'Access denied. Only coaches can update a profile.' });
    }

    const { coachName, coachLevel, coachingSport, coachPrice, availableTimeSlots, experience, offerSessions, sessionDescription } = req.body;

    let coachProfile = await CoachProfile.findById(req.params.id);

    if (!coachProfile) {
      return res.status(404).json({ msg: 'Coach profile not found' });
    }

    if (availableTimeSlots) {
      const today = new Date();
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);

      const isValidSlots = availableTimeSlots.every(slot => {
        const slotDate = new Date(slot.date);
        return slotDate >= today && slotDate <= sevenDaysFromNow;
      });

      if (!isValidSlots) {
        return res.status(400).json({ msg: 'All available time slots must be within the next 7 days.' });
      }

      coachProfile.availableTimeSlots = availableTimeSlots;
    }

    if (coachName) coachProfile.coachName = coachName;
    if (coachLevel) coachProfile.coachLevel = coachLevel;
    if (coachingSport) coachProfile.coachingSport = coachingSport;
    if (coachPrice) {
      coachProfile.coachPrice.individualSessionPrice = coachPrice.individualSessionPrice;
      coachProfile.coachPrice.groupSessionPrice = coachPrice.groupSessionPrice;
    }
    if (experience) coachProfile.experience = experience;
    if (offerSessions) coachProfile.offerSessions = offerSessions;
    if (sessionDescription) coachProfile.sessionDescription = sessionDescription;

    coachProfile.updatedAt = Date.now();

    await coachProfile.save();
    res.json(coachProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Upload a coach profile image using Cloudinary
exports.uploadCoachProfileImage = [
  upload.single('image'), // Use multer middleware for single image upload
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' });
      }

      let coachProfile = await CoachProfile.findOne({ userId: req.user.id });

      if (!coachProfile) {
        return res.status(404).json({ msg: 'Coach profile not found' });
      }

      // Upload image to Cloudinary
      const imageResult = await uploadToCloudinary(req.file.buffer, 'coach_profiles');
      const imageUrl = imageResult.secure_url; // Get Cloudinary URL

      coachProfile.image = imageUrl; // Save Cloudinary image URL to profile
      await coachProfile.save();

      res.json(coachProfile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
];

// Update a coach profile image using Cloudinary
exports.updateCoachProfileImage = [
  upload.single('image'), // Use multer middleware for single image upload
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' });
      }

      let coachProfile = await CoachProfile.findById(req.params.id);

      if (!coachProfile) {
        return res.status(404).json({ msg: 'Coach profile not found' });
      }

      // Upload new image to Cloudinary
      const imageResult = await uploadToCloudinary(req.file.buffer, 'coach_profiles');
      const imageUrl = imageResult.secure_url; // Get Cloudinary URL

      coachProfile.image = imageUrl; // Save Cloudinary image URL to profile
      await coachProfile.save();

      res.json(coachProfile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
];

// Other methods (getAllCoachProfiles, getCoachProfileByCoachProfileId, etc.) remain unchanged



// Get all coach profiles with average ratings
exports.getAllCoachProfiles = async (req, res) => {
  try {
    const coachProfiles = await CoachProfile.find();

    const profilesWithAvgRating = await Promise.all(coachProfiles.map(async profile => {
      const reviews = await Review.find({ coachProfileId: profile._id });
      const avgRating = reviews.length > 0 
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
        : null;

      return {
        ...profile.toObject(),
        avgRating: avgRating ? avgRating.toFixed(2) : null 
      };
    }));

    res.json(profilesWithAvgRating);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get a specific coach profile by CoachProfile ID with average rating
exports.getCoachProfileByCoachProfileId = async (req, res) => {
  try {
    const coachProfile = await CoachProfile.findById(req.params.id);

    if (!coachProfile) {
      return res.status(404).json({ msg: 'Coach profile not found' });
    }

    const reviews = await Review.find({ coachProfileId: req.params.id });

    const avgRating = reviews.length > 0 
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
      : null;

    res.json({
      ...coachProfile.toObject(),
      avgRating: avgRating ? avgRating.toFixed(2) : null 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get a specific coach profile by userId with average rating
exports.getCoachProfileByUserId = async (req, res) => {
  try {
    const coachProfile = await CoachProfile.findOne({ userId: req.params.userId });

    if (!coachProfile) {
      return res.status(404).json({ msg: 'Coach profile not found' });
    }

    const reviews = await Review.find({ coachProfileId: coachProfile._id });

    const avgRating = reviews.length > 0 
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
      : null;

    res.json({
      ...coachProfile.toObject(),
      avgRating: avgRating ? avgRating.toFixed(2) : null 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Toggle the status of a coach profile
exports.toggleCoachProfileStatus = async (req, res) => {
  try {
    const userId = req.params.id;

    const coachProfile = await CoachProfile.findOne({ userId });

    if (!coachProfile) {
      return res.status(404).json({ msg: 'Coach profile not found' });
    }

    coachProfile.isActive = !coachProfile.isActive;
    await coachProfile.save();

    res.json(coachProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
