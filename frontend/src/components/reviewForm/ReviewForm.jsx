import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { sendReview } from "../../redux/features/reviewSlice";

const ReviewForm = ({ toUserId, projectId, onSubmitSuccess }) => {
  const [rating, setRating] = useState(5);
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
      toast.success("✅ Отзыв успешно отправлен!");
      setRating(5);
      setComment("");
      if (onSubmitSuccess) onSubmitSuccess(); // скроет форму после отправки
    } catch (err) {
      toast.error(
        "❌ Ошибка при отправке отзыва: " +
          (typeof err === "string" ? err : "Попробуйте позже")
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
      <h4>Оставить отзыв</h4>
      <label>Оценка (1–5):</label>
      <input
        type="number"
        min="1"
        max="5"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        required
      />
      <br />
      <label>Комментарий:</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        rows={4}
        style={{ width: "100%" }}
      />
      <br />
      <button type="submit">📨 Отправить отзыв</button>
    </form>
  );
};

export default ReviewForm;
