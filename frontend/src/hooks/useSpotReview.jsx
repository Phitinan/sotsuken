import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function useSpotReview(token) {
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({
    average: 0,
    count: 0
  });
  const [userReview, setUserReview] = useState({ rating: 0, comment: "" })
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUserReviewChange = (e) => {
    const { name, value } = e.target;
    setUserReview(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /* ----------------------------------
     Fetch reviews
  ---------------------------------- */
  const fetchReviews = useCallback(async (spotId) => {
    if (!spotId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `http://localhost:4000/api/spots/${spotId}/reviews`
      );

      setReviews(res.data.reviews || []);
      setRatingSummary(res.data.ratingSummary || { average: 0, count: 0 });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, []);


  /* ----------------------------------
     Add review
  ---------------------------------- */
  const addReview = async ({ spotId }) => {
    if (!token) {
      throw new Error("Authentication required");
    }

    try {
      const res = await axios.post(
        `http://localhost:4000/api/spots/${spotId}/reviews`,
        {
          rating: userReview.rating,
          comment: userReview.comment
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setReviews(res.data.reviews);
      setRatingSummary(res.data.ratingSummary);
      return true;
    } catch (err) {
      if (err.response?.status === 409) {
        throw new Error("You already reviewed this spot");
      }
      throw new Error(err.response?.data?.error || "Failed to add review");
    }
  };

  /* ----------------------------------
     Update review
  ---------------------------------- */
  const updateReview = async (spotId, reviewId, { rating, comment }) => {
    if (!token) {
      throw new Error("Authentication required");
    }

    try {
      const res = await axios.put(
        `http://localhost:4000/api/spots/${spotId}/reviews/${reviewId}`,
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setReviews(res.data.reviews);
      setRatingSummary(res.data.ratingSummary);
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.error || "Failed to update review");
    }
  };

  /* ----------------------------------
     Delete review
  ---------------------------------- */
  const deleteReview = async (spotId, reviewId) => {
    if (!token) {
      throw new Error("Authentication required");
    }

    try {
      const res = await axios.delete(
        `http://localhost:4000/api/spots/${spotId}/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setReviews(res.data.reviews);
      setRatingSummary(res.data.ratingSummary);
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.error || "Failed to delete review");
    }
  };

  return {
    reviews,
    ratingSummary, userReview,handleUserReviewChange,
    setUserReview,
    loading,
    error,
    fetchReviews,
    addReview,
    updateReview,
    deleteReview
  };
}
