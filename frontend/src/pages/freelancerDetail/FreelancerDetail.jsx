// 📁 src/pages/freelancerDetail/FreelancerDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import style from "./FreelancerDetail.module.scss";

const FreelancerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [freelancer, setFreelancer] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        const userRes = await fetch(`http://localhost:3000/api/users/${id}`);
        const statsRes = await fetch(`http://localhost:3000/api/users/freelancer-stats/${id}`);

        const userData = await userRes.json();
        const statsData = await statsRes.json();

        setFreelancer(userData);
        setStats(statsData);
        setLoading(false);
      } catch (err) {
        console.error("Freelancer məlumatları yüklənərkən xəta baş verdi", err);
        setLoading(false);
      }
    };

    fetchFreelancer();
  }, [id]);

  if (loading) return <p className={style.loading}>Profil yüklənir...</p>;
  if (!freelancer) return <p className={style.error}>Freelancer tapılmadı</p>;

  return (
    <div className={style.detailContainer}>
      <div className={style.header}>
        {freelancer.avatar ? (
          <img src={`http://localhost:3000/${freelancer.avatar}`} alt="avatar" className={style.avatar} />
        ) : (
          <div className={style.avatarFallback}>{freelancer.name[0]}</div>
        )}
        <div className={style.info}>
          <h2>{freelancer.name}</h2>
          <p>{freelancer.email}</p>
          <p className={style.bio}>{freelancer.bio || "Haqqında məlumat yoxdur"}</p>
          <div className={style.stats}>
            <p>Son aktivlik: {new Date(stats?.lastSeen).toLocaleDateString()}</p>
            <p>Göndərilən təkliflər: {stats?.proposalsCount}</p>
            <p>Reytinq: ⭐ {stats?.averageRating}</p>
          </div>
        </div>
      </div>

      <div className={style.section}>
        <h3>Bacarıqlar</h3>
        {freelancer.skills?.length ? (
          <div className={style.skillsList}>
            {freelancer.skills.map((skill, i) => (
              <span key={i} className={style.skillBadge}>{skill}</span>
            ))}
          </div>
        ) : (
          <p>Bacarıqlar qeyd edilməyib</p>
        )}
      </div>

      <div className={style.section}>
        <h3>Portfolio</h3>
        {freelancer.portfolio?.length ? (
          <div className={style.portfolioGrid}>
            {freelancer.portfolio.map((item, i) => (
              <div key={i} className={style.portfolioCard}>
                <div
                  className={style.image}
                  style={{
                    backgroundImage: `url(${
                      item.image ? `http://localhost:3000/uploads/${item.image}` : "https://via.placeholder.com/400x300"
                    })`,
                  }}
                ></div>
                <div className={style.portfolioInfo}>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Portfolio mövcud deyil</p>
        )}
      </div>

      <button
        className={style.messageButton}
        onClick={() => navigate(`/messages?user=${freelancer._id}`)}
      >
        Mesaj göndər
      </button>
    </div>
  );
};

export default FreelancerDetail;
