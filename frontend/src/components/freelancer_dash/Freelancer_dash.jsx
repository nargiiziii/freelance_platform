import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getFreelancerProjects } from "../../redux/features/projectSlice";
import AddPortfolioModal from "../addPortfolioModal/AddPortfolioModal";
import style from "./Freelancer_dash.module.scss";
import SubmitWorkModal from "../submitWork/SubmitWorkModal";
import { fetchUserReviews } from "../../redux/features/reviewSlice";

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
    dispatch(fetchUserReviews(user.id));
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
              <p>
                <strong>Биография:</strong> {user.bio || "Нет описания"}
              </p>
              <div className={style.skillsContainer}>
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
                  <span> Нет навыков </span>
                )}
              </div>

              <p>
                <strong>Статус:</strong>{" "}
                {user.isAvailable ? "Доступен" : "Не доступен"}
              </p>
              <p>
                <strong>Выполнено проектов:</strong>{" "}
                {user.completedProjectsCount || 0}
              </p>
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
                    <div key={item._id || i} className={style.portfolioItem}>
                      <img
                        src={
                          item.image
                            ? `http://localhost:3000/uploads/${item.image}`
                            : "https://via.placeholder.com/400x300"
                        }
                        alt={item.title || "Project image"}
                        className={style.portfolioImage}
                      />
                      <div className={style.overlay}>
                        <div className={style.portfolioContent}>
                          <div className={style.portfolioText}>
                            <strong>{item.title}</strong>
                            <p>{item.description}</p>
                          </div>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={style.viewButton}
                          >
                            Смотреть
                          </a>
                        </div>
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
            <section className={style.section}>
              <h3>Отзывы</h3>
              {loading ? (
                <p>Загрузка отзывов...</p>
              ) : reviews.length ? (
                <ul>
                  {reviews.map((review, i) => (
                    <li key={review._id || i}>
                      <strong>{review.fromUser?.name || "Аноним"}:</strong>{" "}
                      {review.comment} — Оценка: ⭐ {review.rating} <br />
                      <small>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Отзывы отсутствуют</p>
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
