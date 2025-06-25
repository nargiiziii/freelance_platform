import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getFreelancerProjects } from "../../redux/features/projectSlice";
import AddPortfolioModal from "../addPortfolioModal/AddPortfolioModal";
import style from "./Freelancer_dash.module.scss";
import SubmitWorkModal from "../submitWork/SubmitWorkModal";
import { fetchReviewsForUser, fetchUserReviews } from "../../redux/features/reviewSlice";
import FreelancerProposals from "../freelancerProposals/FreelancerProposals";
import { fetchFreelancerStats } from "../../redux/features/userSlice";

function FreelancerDash() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const projects = useSelector((state) => state.projects.freelancerProjects);
  const reviews = useSelector((state) => state.reviews.reviews);
  const loading = useSelector((state) => state.reviews.loading);

  const [activeSection, setActiveSection] = useState("Профиль");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  const sections = ["Профиль", "Портфолио", "Отзывы"];

  useEffect(() => {
    dispatch(getFreelancerProjects());
  }, [dispatch]);

  useEffect(() => {
    if (user?.portfolio) setPortfolio(user.portfolio);
  }, [user]);

  const stats = useSelector((state) => state.user.stats);
  // console.log("stats из Redux:", stats);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchFreelancerStats(user.id));
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(
        projects.filter((project) => project.status === filterStatus)
      );
    }
  }, [filterStatus, projects]);

  useEffect(() => {
    if (!user?.id) return;
    dispatch(fetchReviewsForUser(user.id)); 
  }, [user?.id, dispatch]);

  const handleProjectAdded = (updatedUser) => {
    setPortfolio(updatedUser.portfolio || []);
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  if (!user) return <p>Загрузка...</p>;
  return (
    <div className={style.freelancerContent}>
      <div className={style.profile}>
        {user.avatar ? (
          <img
            className={style.avatar}
            src={`http://localhost:3000/${user.avatar}`}
            alt="Avatar"
          />
        ) : (
          <div className={style.avatarPlaceholder}>
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        <div className={style.info}>
          <p className={style.name}>{user.name || "Имя не указано"}</p>
          <p className={style.role}>{user.role || "Роль не указана"}</p>
          <p className={style.balance}>
            <strong>Баланс:</strong>{" "}
            {user.balance?.toLocaleString("ru-RU") || 0}₽
          </p>
          <button onClick={handleEditProfile} className={style.editButton}>
            Редактировать профиль
          </button>
        </div>
      </div>

      <div className={style.rightSide}>
        <div className={style.tabMenu}>
          {sections.map((section) => (
            <button
              key={section}
              className={`${style.tabButton} ${
                activeSection === section ? style.activeTab : ""
              }`}
              onClick={() => setActiveSection(section)}
            >
              {section}
            </button>
          ))}
        </div>

        <main className={style.sectionContent}>
          {activeSection === "Профиль" && (
            <section className={style.section}>
              <h3>Профиль</h3>
              <div className={style.profileTwoColumn}>
                <div className={style.leftColumn}>
                  <div className={style.bioBox}>
                    <strong>Биография:</strong>
                    <p>{user.bio || "Нет описания"}</p>
                  </div>

                  <div className={style.skillsBox}>
                    <strong>Навыки:</strong>
                    {user.skills?.length ? (
                      <div className={style.skillsList}>
                        {user.skills.map((skill, index) => (
                          <span key={index} className={style.skillBadge}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span>Нет навыков</span>
                    )}
                  </div>

                  <div className={style.statusBox}>
                    <p>
                      <strong>Статус:</strong>{" "}
                      {user.isAvailable ? "Доступен" : "Не доступен"}
                    </p>
                    <p>
                      <strong>Выполнено проектов:</strong>{" "}
                      {user.completedProjectsCount || 0}
                    </p>
                  </div>
                </div>

                <div className={style.activityCard}>
                  <h4>Активность</h4>
                  <p>
                    🔄 Последний вход:{" "}
                    {stats?.lastSeen
                      ? new Date(stats.lastSeen).toLocaleDateString()
                      : "Нет данных"}
                  </p>
                  <p>📤 Отправлено откликов: {stats?.proposalsCount ?? 0}</p>
                  <p>⭐ Общий рейтинг: {stats?.averageRating ?? "0.0"}</p>
                </div>
              </div>

              <div className={style.proposalsWrapper}>
                <h4>📁 История откликов</h4>
                <FreelancerProposals />
              </div>
            </section>
          )}

          {activeSection === "Портфолио" && (
            <section className={style.section}>
              <h3>Портфолио</h3>
              <button
                className={style.addProjectButton}
                onClick={() => setIsModalOpen(true)}
              >
                + Добавить проект
              </button>
              {portfolio?.length ? (
                <div className={style.portfolioGrid}>
                  {portfolio.map((item, i) => (
                    <div
                      key={item._id || i}
                      className={style.portfolioItem}
                      style={{
                        backgroundImage: `url(${
                          item.image
                            ? `http://localhost:3000/uploads/${item.image}`
                            : "https://via.placeholder.com/400x300"
                        })`,
                      }}
                    >
                      <div className={style.portfolioContent}>
                        <strong>{item.title}</strong>
                        <p>{item.description}</p>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={style.viewButton}
                        >
                          Смотреть проект
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Портфолио отсутствует</p>
              )}
              <AddPortfolioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProjectAdded={handleProjectAdded}
                userId={user._id}
              />
            </section>
          )}

          {activeSection === "Отзывы" && (
            <section className={`${style.section} ${style.reviewsSection}`}>
              <h3>Отзывы</h3>
              {loading ? (
                <p className={style.reviewsLoading}>Загрузка отзывов...</p>
              ) : reviews.length ? (
                <ul>
                  {reviews.map((review, i) => (
                    <li key={review._id || i} className={style.reviewItem}>
                      <div className={style.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                      <div className={style.reviewUser}>
                        {review.fromUser?.name || "Аноним"}
                      </div>
                      <div className={style.reviewStars}>
                        {"⭐".repeat(review.rating)}
                      </div>
                      <div className={style.reviewComment}>
                        {review.comment}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={style.reviewsEmpty}>Отзывы отсутствуют</p>
              )}
            </section>
          )}
        </main>
      </div>

      {showSubmitModal && (
        <SubmitWorkModal
          projectId={showSubmitModal}
          onClose={() => setShowSubmitModal(null)}
        />
      )}
    </div>
  );
}

export default FreelancerDash;
