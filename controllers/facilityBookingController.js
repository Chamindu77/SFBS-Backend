
const cloudinary = require('../config/cloudinaryConfig'); // Cloudinary configuration
const multer = require('multer');
const QRCode = require('qrcode');
const FacilityBooking = require('../models/FacilityBooking');
const sendFacilityBookingConfirmationEmail = require('../utils/facilityEmailService'); // Import the email sending function

// Use Multer's memory storage to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

const ALL_SLOTS = [
  "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
  "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
  "16:00 - 17:00", "17:00 - 18:00", 
];

// Utility function to upload files to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: folder }, (error, result) => {
      if (error) {
        return reject(error);  // Reject the promise in case of error
      }
      resolve(result);  // Resolve the promise with Cloudinary result
    }).end(buffer);  // Use the buffer to upload the file
  });
};

exports.createFacilityBooking = [
  upload.single('receipt'),  // Multer middleware to handle file upload
  async (req, res) => {
    const { userName, userEmail, userPhoneNumber, sportName, courtNumber, courtPrice, date, timeSlots } = req.body;

    try {
      if (!req.file) {
        return res.status(400).json({ msg: 'Receipt is required for booking' });
      }

      // Upload the receipt to Cloudinary in the 'facility_receipts' folder
      const receiptResult = await uploadToCloudinary(req.file.buffer, 'facility_receipts');
      const receiptUrl = receiptResult.secure_url; // Cloudinary receipt URL

      let slotsArray = typeof timeSlots === 'string' ? JSON.parse(timeSlots) : timeSlots;
      if (!Array.isArray(slotsArray)) {
        return res.status(400).json({ msg: 'Invalid timeSlots format. Must be an array.' });
      }

      const invalidSlots = slotsArray.filter(slot => !ALL_SLOTS.includes(slot));
      if (invalidSlots.length > 0) {
        return res.status(400).json({ msg: 'Invalid time slots', invalidSlots });
      }

      const bookingDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (bookingDate < today) {
        return res.status(400).json({ msg: 'Booking date cannot be in the past' });
      }

      const existingBookings = await FacilityBooking.find({
        courtNumber,
        date,
        sportName,
        timeSlots: { $in: slotsArray }
      });

      if (existingBookings.length > 0) {
        const unavailableSlots = existingBookings.flatMap(booking => booking.timeSlots)
                                                .filter(slot => slotsArray.includes(slot));
        return res.status(400).json({ msg: 'Some time slots are already booked', unavailableSlots });
      }

      const totalHours = slotsArray.length;
      const totalPrice = courtPrice * totalHours;

      // Create new facility booking in the database
      const facilityBooking = new FacilityBooking({
        userId: req.user.id,
        userName,
        userEmail,
        userPhoneNumber,
        sportName,
        courtNumber,
        courtPrice,
        date,
        timeSlots: slotsArray,
        totalHours,
        totalPrice,
        receipt: receiptUrl  // Store Cloudinary receipt URL
      });

      await facilityBooking.save();

      // Generate QR code for the booking
      const qrCodeData = JSON.stringify({
        bookingId: facilityBooking._id,
        userName: facilityBooking.userName,
        userEmail: facilityBooking.userEmail,
        sportName: facilityBooking.sportName,
        courtNumber: facilityBooking.courtNumber,
        date: facilityBooking.date,
        timeSlots: facilityBooking.timeSlots,
        totalHours: facilityBooking.totalHours,
        courtPrice: facilityBooking.courtPrice,
        totalPrice: facilityBooking.totalPrice
      });

      // Generate QR code as a buffer
      const qrCodeBuffer = await QRCode.toBuffer(qrCodeData);  // Create QR code buffer

      // Upload QR code to Cloudinary in the 'facility_qrcodes' folder
      const qrCodeResult = await uploadToCloudinary(qrCodeBuffer, 'facility_qrcodes');  // Upload QR code to a different folder
      facilityBooking.qrCode = qrCodeResult.secure_url;  // Store Cloudinary QR code URL

      await facilityBooking.save();

      // Send booking confirmation email
      await sendFacilityBookingConfirmationEmail(userEmail, {
        bookingId: facilityBooking._id,
        userName,
        sportName,
        courtNumber,
        date: facilityBooking.date,
        timeSlots: slotsArray,
        totalHours,
        totalPrice,
        receipt: facilityBooking.receipt,
        qrCode: facilityBooking.qrCode
      });

      // Send response to the client
      res.status(201).json({
        msg: 'Booking created successfully, and confirmation email sent',
        facilityBooking,
      });
    } catch (err) {
      console.error('Error creating facility booking:', err.message);
      res.status(500).json({ msg: 'Server error' });
    }
  }
];


exports.getAvailableTimeSlots = async (req, res) => {
  const { courtNumber, date, sportName } = req.body;

  try {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const bookings = await FacilityBooking.find({
      courtNumber,
      sportName,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const bookedSlots = bookings.flatMap(booking => booking.timeSlots);
    const availableSlots = ALL_SLOTS.filter(slot => !bookedSlots.includes(slot));

    res.json({ availableSlots });
  } catch (err) {
    console.error('Error fetching available time slots:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};


/**
 * Get all facility bookings with details and receipt URLs.
 * @route GET /api/facility-booking
 * @access Private (Admin only)
 */
exports.getAllFacilityBookings = async (req, res) => {
  try {
    // Check if the user has admin rights
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }

    // Retrieve all bookings with user details
    const facilityBookings = await FacilityBooking.find()
      .populate('userId', 'name email role');

    // Base URL for accessing receipt files
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/facility-receipts/`;

    // Format bookings with user details and receipt URLs
    const bookingsWithUserDetails = facilityBookings.map(booking => ({
      _id: booking._id,
      userId: booking.userId._id,
      userName: booking.userId.name,
      role: booking.userId.role,
      userEmail: booking.userId.email,
      userPhoneNumber: booking.userPhoneNumber,
      sportName: booking.sportName,
      courtNumber: booking.courtNumber,
      courtPrice: booking.courtPrice,
      date: booking.date,
      timeSlots: booking.timeSlots,
      totalHours: booking.totalHours,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      receipt: booking.receipt ? `${baseUrl}${path.basename(booking.receipt)}` : null,
      __v: booking.__v
    }));

    res.json(bookingsWithUserDetails);
  } catch (err) {
    console.error('Error fetching all facility bookings:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * Get a specific facility booking by ID with user details and receipt URL.
 * @route GET /api/facility-booking/:id
 * @access Private
 */
exports.getFacilityBookingById = async (req, res) => {
  try {
    // Find the booking by ID and populate user details
    const booking = await FacilityBooking.findById(req.params.id)
      .populate('userId', 'name email role');

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Base URL for accessing receipt files
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/facility-receipts/`;

    // Format booking with user details and receipt URL
    const bookingWithUserDetails = {
      _id: booking._id,
      userId: booking.userId._id,
      userName: booking.userId.name,
      role: booking.userId.role,
      userEmail: booking.userId.email,
      userPhoneNumber: booking.userPhoneNumber,
      sportName: booking.sportName,
      courtNumber: booking.courtNumber,
      courtPrice: booking.courtPrice,
      date: booking.date,
      timeSlots: booking.timeSlots,
      totalHours: booking.totalHours,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      receipt: booking.receipt ? `${baseUrl}${path.basename(booking.receipt)}` : null,
      __v: booking.__v
    };

    res.json(bookingWithUserDetails);
  } catch (err) {
    console.error('Error fetching booking by ID:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * Get facility bookings by user ID with user details and receipt URL.
 * @route GET /api/facility-booking/user/:userId
 * @access Private
 */
exports.getFacilityBookingsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find all facility bookings for the specified user ID
    const facilityBookings = await FacilityBooking.find({ userId })
      .populate('userId', 'name email role');

    if (facilityBookings.length === 0) {
      return res.status(404).json({ msg: 'No bookings found for this user' });
    }

    // Base URL for accessing receipt files
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/facility-receipts/`;

    // Format bookings with user details and receipt URL
    const bookingsWithUserDetails = facilityBookings.map(booking => ({
      _id: booking._id,
      userId: booking.userId._id,
      userName: booking.userId.name,
      role: booking.userId.role,
      userEmail: booking.userId.email,
      userPhoneNumber: booking.userPhoneNumber,
      sportName: booking.sportName,
      courtNumber: booking.courtNumber,
      courtPrice: booking.courtPrice,
      date: booking.date,
      timeSlots: booking.timeSlots,
      totalHours: booking.totalHours,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      receipt: booking.receipt ? `${baseUrl}${path.basename(booking.receipt)}` : null,
      __v: booking.__v
    }));

    res.json(bookingsWithUserDetails);
  } catch (err) {
    console.error('Error fetching facility bookings by user ID:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

const fs = require('fs');

/**
 * Serve the QR code as a downloadable PNG file.
 * @route GET /api/facility-booking/:id/download-qr
 * @access Private
 */
exports.downloadQrCode = async (req, res) => {
  try {
    // Find the booking by ID
    const booking = await FacilityBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Check if the QR code file exists
    if (!booking.qrCode || !fs.existsSync(booking.qrCode)) {
      return res.status(404).json({ msg: 'QR code not found' });
    }

    // Serve the QR code file for download
    res.download(booking.qrCode, `Booking-${booking._id}-QRCode.png`, (err) => {
      if (err) {
        console.error('Error downloading QR code:', err.message);
        return res.status(500).json({ msg: 'Server error' });
      }
    });
  } catch (err) {
    console.error('Error downloading QR code:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};


const Facility = require('../models/Facility');


// Controller to find available facilities by sport, date, and time slot with full details
exports.getAvailableFacilities = async (req, res) => {
  const { sportName, date, timeSlot } = req.body;

  try {
    // Validate if all required fields are present
    if (!sportName || !date || !timeSlot) {
      return res.status(400).json({ msg: 'Please provide sport name, date, and time slot' });
    }

    // Convert date to proper format and set the time to start and end of the day
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Fetch all bookings for the given sport on the specified date
    const bookings = await FacilityBooking.find({
      sportName,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlots: timeSlot, // Check if the requested time slot is already booked
    });

    // Extract the court numbers that are already booked for the requested time slot
    const bookedCourts = bookings.map(booking => booking.courtNumber);

    // Get all courts (facilities) for the requested sport, filtering out the booked ones
    const availableFacilities = await Facility.find({
      sportName,
      courtNumber: { $nin: bookedCourts }  // Exclude courts that are already booked
    });

    if (availableFacilities.length === 0) {
      return res.status(404).json({ msg: 'No available facilities for the selected time slot' });
    }

    // Return all available facilities with full details (like court number, price, etc.)
    res.json({ availableFacilities });
  } catch (err) {
    console.error('Error fetching available facilities:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
