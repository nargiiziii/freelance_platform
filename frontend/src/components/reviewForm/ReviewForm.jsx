import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { sendReview } from "../../redux/features/reviewSlice";
import style from "./ReviewForm.module.scss";

const ReviewForm = ({ toUserId, projectId, onSubmitSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const reviewData = {
      toUser: toUserId,
      projectId,
      rating,
      comment,
    };

    try {
      await dispatch(sendReview(reviewData)).unwrap();
      toast.success("Rəy uğurla göndərildi!");
      setSubmitted(true);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      toast.error(
        "Rəyi göndərərkən xəta baş verdi: " +
          (typeof err === "string" ? err : "Zəhmət olmasa bir az sonra yenidən cəhd edin")
      );
    }
  };

  if (submitted) {
    return <p className={style.successMessage}>Rəyiniz üçün təşəkkür edirik!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={style.reviewForm}>
      <div className={style.ratingRow}>
        <label>Qiymət:</label>
        <div className={style.starRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`${style.star} ${
                (hoveredRating || rating) >= star ? style.filled : ""
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <label>Rəy:</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        rows={4}
      />

      <button type="submit">Rəyi göndər</button>
    </form>
  );
};

export default ReviewForm;
