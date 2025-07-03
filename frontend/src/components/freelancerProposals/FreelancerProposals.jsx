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

  if (status === "loading") return <p>Oflaynlar yüklənir...</p>;
  if (!myProposals.length) return <p>Hələ heç bir müraciət göndərməmisiniz.</p>;

  const recentProposals = myProposals.slice(0, 3); // son 3

  return (
    <div className={style.responsesWrapper}>
      <div className={style.responsesGrid}>
        {recentProposals.map((item) => (
          <div className={style.card} key={item._id}>
            <h5>💼 {item.project?.title || "Başlıqsız"}</h5>
            <p><strong>Tarix:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
            <p><strong>Qiymət:</strong> {item.price} ₼</p>
            <p><strong>Mesaj:</strong> {item.coverLetter}</p>
            <span className={`${style.status} ${style[item.status]}`}>
              {item.status === "pending" && "⏳ Gözləmədədir"}
              {item.status === "accepted" && "✅ Qəbul edilib"}
              {item.status === "refunded" && " Geri qaytarılıb"}
              {item.status === "rejected" && "❌ Rədd edilib"}
              {item.status === "submitted" && "📤 İş göndərilib"}
            </span>
          </div>
        ))}
      </div>

      <button className={style.viewAllBtn} onClick={() => navigate("/my-proposals")}>
        Bütün müraciətlərə bax →
      </button>
    </div>
  );
}
