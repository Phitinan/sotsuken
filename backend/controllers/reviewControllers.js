import {
  getSpotWithSubdocs,
  findSubdocOrFail,
  assertOwnerOrAdmin
} from "../services/spotSubdocService.js";

export const getSpotReviews = async (req, res) => {
  try {
    const spot = await getSpotWithSubdocs({
      spotId: req.params.spotId,
      subdocField: "reviews",
      populate: "username avatar"
    });

    res.json({
      reviews: spot.reviews,
      ratingSummary: spot.ratingSummary
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const addSpotReview = async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be 1–5" });
  }

  try {
    const spot = await getSpotWithSubdocs({
      spotId: req.params.spotId,
      subdocField: "reviews"
    });

    const alreadyReviewed = spot.reviews.some(
      r => r.userId.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(409).json({ error: "You already reviewed this spot" });
    }

    spot.reviews.push({
      userId: req.user._id,
      rating,
      comment,
      createdAt: new Date()
    });

    const total = spot.reviews.reduce((s, r) => s + r.rating, 0);
    spot.ratingSummary = {
      average: Number((total / spot.reviews.length).toFixed(2)),
      count: spot.reviews.length
    };

    await spot.save();

    res.status(201).json({
      reviews: spot.reviews,
      ratingSummary: spot.ratingSummary
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteSpotReview = async (req, res) => {
  const { spotId, reviewId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(spotId) ||
    !mongoose.Types.ObjectId.isValid(reviewId)
  ) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const spot = await Spot.findById(spotId);
    if (!spot) {
      return res.status(404).json({ error: "Spot not found" });
    }

    const review = spot.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Author or admin only
    if (
      review.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    review.deleteOne(); // important: NOT filter()

    // Recalculate rating summary
    if (spot.reviews.length === 0) {
      spot.ratingSummary = { average: 0, count: 0 };
    } else {
      const total = spot.reviews.reduce((sum, r) => sum + r.rating, 0);
      spot.ratingSummary = {
        average: Number((total / spot.reviews.length).toFixed(2)),
        count: spot.reviews.length
      };
    }

    await spot.save();

    res.status(200).json({
      reviews: spot.reviews,
      ratingSummary: spot.ratingSummary
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * PUT /spots/:spotId/reviews/:reviewId
 * Update own review (or admin)
 */
export const updateSpotReview = async (req, res) => {
  const { spotId, reviewId } = req.params;
  const { rating, comment } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(spotId) ||
    !mongoose.Types.ObjectId.isValid(reviewId)
  ) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const spot = await Spot.findById(spotId);
    if (!spot) {
      return res.status(404).json({ error: "Spot not found" });
    }

    const review = spot.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Authorization
    if (
      review.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Validation
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be 1–5" });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    // Recalculate summary
    const total = spot.reviews.reduce((sum, r) => sum + r.rating, 0);
    spot.ratingSummary = {
      average: Number((total / spot.reviews.length).toFixed(2)),
      count: spot.reviews.length
    };

    await spot.save();

    res.status(200).json({
      reviews: spot.reviews,
      ratingSummary: spot.ratingSummary
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ error: "Server error" });
  }
};