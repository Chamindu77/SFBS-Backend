// const upload = require('../middleware/uploadMiddleware');
// const Facility = require('../models/Facility');


// /**
//  * Create a new facility.
//  * Requires image upload and facility details in request body.
//  */
// exports.createFacility = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       return res.status(400).json({ msg: 'Error uploading image: ' + err.message });
//     }

//     const { courtNumber, sportName, sportCategory, courtPrice } = req.body;

//     if (!req.file) {
//       return res.status(400).json({ msg: 'Image upload is required.' });
//     }

//     try {
//       const imageUrl = `${req.protocol}://${req.get('host')}/uploads/images/${req.file.filename}`;

//       const newFacility = new Facility({
//         courtNumber,
//         sportName,
//         sportCategory,
//         courtPrice,
//         image: imageUrl
//       });

//       await newFacility.save();
//       res.status(201).json(newFacility);
//     } catch (err) {
//       console.error('Error creating facility:', err.message);
//       res.status(500).json({ msg: 'Server error while creating facility.' });
//     }
//   });
// };

// /**
//  * Retrieve all facilities.
//  * Admin only.
//  */
// exports.getAllFacilities = async (req, res) => {
//   try {
//     const facilities = await Facility.find();
//     res.json(facilities);
//   } catch (err) {
//     console.error('Error fetching facilities:', err.message);
//     res.status(500).json({ msg: 'Server error while fetching facilities.' });
//   }
// };

// /**
//  * Retrieve available facilities.
//  * Accessible to users.
//  */
// exports.getAvailableFacilities = async (req, res) => {
//   try {
//     const facilities = await Facility.find({ isActive: true });
//     res.json(facilities);
//   } catch (err) {
//     console.error('Error fetching available facilities:', err.message);
//     res.status(500).json({ msg: 'Server error while fetching available facilities.' });
//   }
// };

// /**
//  * Update a facility's details.
//  * Requires image upload if updating image.
//  */
// exports.updateFacility = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       return res.status(400).json({ msg: 'Error uploading image: ' + err.message });
//     }

//     const { courtNumber, sportName, sportCategory, courtPrice } = req.body;

//     try {
//       const facility = await Facility.findById(req.params.id);

//       if (!facility) {
//         return res.status(404).json({ msg: 'Facility not found.' });
//       }

//       facility.courtNumber = courtNumber || facility.courtNumber;
//       facility.sportName = sportName || facility.sportName;
//       facility.sportCategory = sportCategory || facility.sportCategory;
//       facility.courtPrice = courtPrice || facility.courtPrice;
//       facility.updatedAt = Date.now();

//       if (req.file) {
//         facility.image = `${req.protocol}://${req.get('host')}/uploads/images/${req.file.filename}`;
//       }

//       await facility.save();
//       res.json(facility);
//     } catch (err) {
//       console.error('Error updating facility:', err.message);
//       res.status(500).json({ msg: 'Server error while updating facility.' });
//     }
//   });
// };

// /**
//  * Delete a facility.
//  */
// exports.deleteFacility = async (req, res) => {
//   try {
//     const facility = await Facility.findById(req.params.id);

//     if (!facility) {
//       return res.status(404).json({ msg: 'Facility not found.' });
//     }

//     await Facility.deleteOne({ _id: req.params.id });
//     res.json({ msg: 'Facility removed successfully.' });
//   } catch (err) {
//     console.error('Error deleting facility:', err.message);
//     res.status(500).json({ msg: 'Server error while deleting facility.' });
//   }
// };

// /**
//  * Get a facility by its ID.
//  */
// exports.getFacilityById = async (req, res) => {
//   try {
//     const facility = await Facility.findById(req.params.id);

//     if (!facility) {
//       return res.status(404).json({ msg: 'Facility not found.' });
//     }

//     res.json(facility);
//   } catch (err) {
//     console.error('Error fetching facility:', err.message);
//     res.status(500).json({ msg: 'Server error while fetching facility.' });
//   }
// };

// /**
//  * Toggle a facility's active status.
//  */
// exports.toggleFacilityStatus = async (req, res) => {
//   try {
//     const facility = await Facility.findById(req.params.id);

//     if (!facility) {
//       return res.status(404).json({ msg: 'Facility not found.' });
//     }

//     facility.isActive = !facility.isActive;
//     facility.updatedAt = Date.now();

//     await facility.save();
//     res.json(facility);
//   } catch (err) {
//     console.error('Error toggling facility status:', err.message);
//     res.status(500).json({ msg: 'Server error while toggling facility status.' });
//   }
// };

const cloudinary = require('../config/cloudinaryConfig'); // Cloudinary configuration
const multer = require('multer');
const Facility = require('../models/Facility');

// Configure Multer to store files in memory (for Cloudinary upload)
const upload = multer({ storage: multer.memoryStorage() });

// Utility function to upload files to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: folder }, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    }).end(buffer);
  });
};

/**
 * Create a new facility.
 * Requires image upload and facility details in request body.
 */
exports.createFacility = [
  upload.single('image'), // Multer middleware for single image upload
  async (req, res) => {
    try {
      const { courtNumber, sportName, sportCategory, courtPrice } = req.body;

      if (!req.file) {
        return res.status(400).json({ msg: 'Image upload is required.' });
      }

      // Upload image to Cloudinary
      const imageResult = await uploadToCloudinary(req.file.buffer, 'facility_images');
      const imageUrl = imageResult.secure_url; // Get the Cloudinary image URL

      // Create new facility
      const newFacility = new Facility({
        courtNumber,
        sportName,
        sportCategory,
        courtPrice,
        image: imageUrl
      });

      await newFacility.save();
      res.status(201).json(newFacility);
    } catch (err) {
      console.error('Error creating facility:', err.message);
      res.status(500).json({ msg: 'Server error while creating facility.' });
    }
  }
];

/**
 * Update a facility's details.
 * Requires image upload if updating image.
 */
exports.updateFacility = [
  upload.single('image'), // Multer middleware for single image upload
  async (req, res) => {
    try {
      const { courtNumber, sportName, sportCategory, courtPrice } = req.body;

      const facility = await Facility.findById(req.params.id);

      if (!facility) {
        return res.status(404).json({ msg: 'Facility not found.' });
      }

      // Update facility fields
      facility.courtNumber = courtNumber || facility.courtNumber;
      facility.sportName = sportName || facility.sportName;
      facility.sportCategory = sportCategory || facility.sportCategory;
      facility.courtPrice = courtPrice || facility.courtPrice;
      facility.updatedAt = Date.now();

      if (req.file) {
        // Upload new image to Cloudinary if an image is uploaded
        const imageResult = await uploadToCloudinary(req.file.buffer, 'facility_images');
        facility.image = imageResult.secure_url; // Update facility image URL
      }

      await facility.save();
      res.json(facility);
    } catch (err) {
      console.error('Error updating facility:', err.message);
      res.status(500).json({ msg: 'Server error while updating facility.' });
    }
  }
];


/**
 * Retrieve all facilities.
 * Admin only.
 */
exports.getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.json(facilities);
  } catch (err) {
    console.error('Error fetching facilities:', err.message);
    res.status(500).json({ msg: 'Server error while fetching facilities.' });
  }
};

/**
 * Retrieve available facilities.
 * Accessible to users.
 */
exports.getAvailableFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find({ isActive: true });
    res.json(facilities);
  } catch (err) {
    console.error('Error fetching available facilities:', err.message);
    res.status(500).json({ msg: 'Server error while fetching available facilities.' });
  }
};


/**
 * Delete a facility.
 */
exports.deleteFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({ msg: 'Facility not found.' });
    }

    await Facility.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Facility removed successfully.' });
  } catch (err) {
    console.error('Error deleting facility:', err.message);
    res.status(500).json({ msg: 'Server error while deleting facility.' });
  }
};

/**
 * Get a facility by its ID.
 */
exports.getFacilityById = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({ msg: 'Facility not found.' });
    }

    res.json(facility);
  } catch (err) {
    console.error('Error fetching facility:', err.message);
    res.status(500).json({ msg: 'Server error while fetching facility.' });
  }
};

/**
 * Toggle a facility's active status.
 */
exports.toggleFacilityStatus = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({ msg: 'Facility not found.' });
    }

    facility.isActive = !facility.isActive;
    facility.updatedAt = Date.now();

    await facility.save();
    res.json(facility);
  } catch (err) {
    console.error('Error toggling facility status:', err.message);
    res.status(500).json({ msg: 'Server error while toggling facility status.' });
  }
};
