const Review = require('../models/Review');
const CoachProfile = require('../models/CoachProfile');

exports.addReview = async (req, res) => {
  const { coachProfileId, rating, comment } = req.body;

  try {
    const userId = req.user.id;

    // Check if the coach profile exists
    const coachProfile = await CoachProfile.findById(coachProfileId);
    if (!coachProfile) {
      return res.status(404).json({ msg: 'Coach profile not found' });
    }

    // Create new review
    const review = new Review({
      userId,
      coachProfileId,
      rating,
      comment
    });

    await review.save();

    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.getReviewsByCoach = async (req, res) => {
  try {
    const coachProfileId = req.params.coachProfileId;

    // Retrieve all reviews for a specific coach profile and populate userId to get the user's name
    const reviews = await Review.find({ coachProfileId }).populate('userId', 'name');

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ msg: 'No reviews found' });
    }

    // Calculate the average rating
    const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    // Transform the reviews to the desired format
    const transformedReviews = reviews.map(review => ({
      _id: review._id,
      userId: review.userId._id,
      name: review.userId.name,
      coachProfileId: review.coachProfileId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      __v: review.__v
    }));

    // Send the response including the reviews and the average rating
    res.json({
      avgRating: avgRating.toFixed(2),  
      reviews: transformedReviews
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
