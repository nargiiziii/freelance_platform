import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getFreelancerProjects } from "../../redux/features/projectSlice";
import AddPortfolioModal from "../addPortfolioModal/AddPortfolioModal";
import style from "./Freelancer_dash.module.scss";
import ProjectListForFreelancer from "../projectListForFreelancer/ProjectListForFreelancer";
import SubmitWorkModal from "../submitWork/SubmitWorkModal";
import EscrowCardd from "../escrowCardd/EscrowCardd";

function FreelancerDash() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const projects = useSelector((state) => state.projects.freelancerProjects);

  const [activeSection, setActiveSection] = useState("Профиль");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  const sections = ["Профиль", "Портфолио", "Активные проекты", "Отзывы"];

  useEffect(() => {
    dispatch(getFreelancerProjects());
  }, [dispatch]);
  useEffect(() => {
    console.log("Projects:", projects);
  }, [projects]);

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
        <aside className={style.sidebar}>
          <ul>
            {sections.map((section) => (
              <li
                key={section}
                className={activeSection === section ? style.activeSection : ""}
                onClick={() => setActiveSection(section)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setActiveSection(section);
                  }
                }}
              >
                {section}
              </li>
            ))}
          </ul>
        </aside>

        <main className={style.sectionContent}>
          {activeSection === "Профиль" && (
            <section className={style.section}>
              <h3>Профиль</h3>
              <p>
                <strong>Биография:</strong> {user.bio || "Нет описания"}
              </p>
              <p>
                <strong>Навыки:</strong>{" "}
                {user.skills?.length ? user.skills.join(", ") : "Нет навыков"}
              </p>
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

          {activeSection === "Активные проекты" && (
            <section className={style.section}>
              <h3>Активные проекты</h3>
              <div>
                <button onClick={() => setFilterStatus("all")}>Все</button>
                <button onClick={() => setFilterStatus("open")}>
                  Открытые
                </button>
                <button onClick={() => setFilterStatus("completed")}>
                  Завершенные
                </button>
              </div>
              {filteredProjects?.length ? (
                <ul>
                  {filteredProjects.map((project) => (
                    <li key={project._id}>
                      <h4>
                        {project.title} - Статус: {project.status}
                      </h4>
                      {project.status === "in_progress" && (
                        <button onClick={() => setShowSubmitModal(project._id)}>
                          📤 Отправить работу
                        </button>
                      )}
                      <EscrowCardd project={project} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p>У вас нет активных проектов</p>
              )}
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
                            : "https://via.placeholder.com/200x150"
                        }
                        alt={item.title || "Project image"}
                        className={style.portfolioImage}
                      />
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.description}</p>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Смотреть
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
            <section className={style.section}>
              <h3>Отзывы</h3>
              {user.reviews?.length ? (
                <ul>
                  {user.reviews.map((review, i) => (
                    <li key={review.id || i}>
                      <strong>{review.authorName || "Аноним"}:</strong>{" "}
                      {review.comment} — Оценка: ⭐ {review.rating}
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
