import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { sendReview } from "../../redux/features/reviewSlice";
import style from "./ReviewForm.module.scss";

const ReviewForm = ({ toUserId, projectId, onSubmitSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
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
      toast.success("Отзыв успешно отправлен!");
      setRating(5);
      setHoveredRating(0);
      setComment("");
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      toast.error(
        "Ошибка при отправке отзыва: " +
          (typeof err === "string" ? err : "Попробуйте позже")
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={style.reviewForm}>
      <div className={style.ratingRow}>
        <label>Оценка:</label>
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

      <label>Комментарий:</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        rows={4}
      />

      <button type="submit">Отправить отзыв</button>
    </form>
  );
};

export default ReviewForm;
