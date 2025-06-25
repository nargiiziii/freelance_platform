import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyProposals } from "../../redux/features/proposalSlice";
import { useNavigate } from "react-router-dom";
import style from "./FreelancerProposals.module.scss";

export default function FreelancerProposals() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myProposals, status } = useSelector((state) => state.proposal);

  useEffect(() => {
    dispatch(getMyProposals());
  }, [dispatch]);

  if (status === "loading") return <p>Загрузка откликов...</p>;
  if (!myProposals.length) return <p>Вы пока не отправили ни одного отклика.</p>;

  const recentProposals = myProposals.slice(0, 3); // последние 3

  return (
    <div className={style.responsesWrapper}>
      <div className={style.responsesGrid}>
        {recentProposals.map((item) => (
          <div className={style.card} key={item._id}>
            <h5>💼 {item.project?.title || "Без названия"}</h5>
            <p><strong>Дата:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
            <p><strong>Цена:</strong> {item.price} ₽</p>
            <p><strong>Сообщение:</strong> {item.coverLetter}</p>
            <span className={`${style.status} ${style[item.status]}`}>
              {item.status === "pending" && "⏳ Ожидание"}
              {item.status === "accepted" && "✅ Принят"}
              {item.status === "rejected" && "❌ Отклонён"}
              {item.status === "submitted" && "📤 Отправлена работа"}
            </span>
          </div>
        ))}
      </div>

      <button className={style.viewAllBtn} onClick={() => navigate("/my-proposals")}>
        Смотреть все отклики →
      </button>
    </div>
  );
}
