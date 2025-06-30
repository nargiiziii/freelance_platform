// src/pages/EmployeeDash.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getEmployerProjects } from "../../redux/features/projectSlice";
import {
  fetchReviewsForUser,
} from "../../redux/features/reviewSlice";
import style from "./Employee_dash.module.scss";

function EmployeeDash() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const projects = useSelector((state) => state.projects.employerProjects);
  const status = useSelector((state) => state.projects.status);
  const reviews = useSelector((state) => state.reviews.reviews);
  const loading = useSelector((state) => state.reviews.loading);

  const [activeSection, setActiveSection] = useState("Размещение задания");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    if (user && (user._id || user.id)) {
      dispatch(getEmployerProjects());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter((p) => p.status === filterStatus));
    }
  }, [filterStatus, projects]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchReviewsForUser(user.id)); // ✅ теперь загружаются отзывы, адресованные нанимателю
    }
  }, [user?.id, dispatch]);

  const renderStatus = (status) => {
    switch (status) {
      case "open":
        return <span className={style.statusOpen}>🟣 Открыт</span>;
      case "in_progress":
        return <span className={style.statusInProgress}>🟢 В работе</span>;
      case "closed":
        return <span className={style.statusClosed}>🔴 Закрыт</span>;
      default:
        return <span>{status}</span>;
    }
  };

  if (!user) return <p>Загрузка данных пользователя...</p>;

  const totalProjects = projects.length;
  const newProposals = projects.reduce((count, project) => {
    return (
      count +
      (project.proposals?.filter((p) => p.status === "pending").length || 0)
    );
  }, 0);
  const inProgress = projects.filter((p) => p.status === "in_progress").length;

  return (
    <div className={style.employeeContent}>
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
          <p className={style.name}>{user.name}</p>
          <p className={style.role}>{user.role}</p>
          <p className={style.balance}>
            <strong>Баланс:</strong>{" "}
            {user.balance?.toLocaleString("ru-RU") || 0}₽
          </p>
          <button
            onClick={() => navigate("/edit-profile")}
            className={style.editButton}
          >
            Редактировать профиль
          </button>

          <div className={style.stats}>
            <p>👷 Проектов размещено: {totalProjects}</p>
            <p>✉️ Новых откликов: {newProposals}</p>
            <p>🛠️ В работе: {inProgress}</p>
            <p>
              💸 Баланс: {user.balance?.toLocaleString("ru-RU") || 0}₽
              <button
                onClick={() => navigate("/escrow")}
                className={style.topUpButton}
              >
                Пополнить
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className={style.rightSide}>
        <main className={style.sectionContent}>
          <div className={style.tabMenu}>
            {["Размещение задания", "Отзывы"].map((section) => (
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

          {activeSection === "Размещение задания" && (
            <section className={style.section}>
              <h3>Размещение задания</h3>
              <button
                className={style.addBtn}
                onClick={() => navigate("/create-project")}
              >
                + Новое задание
              </button>

              <div className={style.projectSection}>
                <h4>Мои размещённые проекты</h4>
                <div className={style.statusFilter}>
                  <button onClick={() => setFilterStatus("all")}>Все</button>
                  <button onClick={() => setFilterStatus("open")}>
                    Открытые
                  </button>
                  <button onClick={() => setFilterStatus("in progress")}>
                    В работе
                  </button>
                  <button onClick={() => setFilterStatus("closed")}>
                    Закрытые
                  </button>
                </div>

                {status === "loading" ? (
                  <p>Загрузка проектов...</p>
                ) : filteredProjects.length === 0 ? (
                  <p>Вы ещё не разместили ни одного проекта.</p>
                ) : (
                  <div className={style.projectList}>
                    {filteredProjects.map((project) => {
                      const hasPendingProposal = project.proposals?.some(
                        (proposal) => proposal.status === "pending"
                      );
                      return (
                        <div key={project._id} className={style.projectCard}>
                          <div className={style.projectHeader}>
                            <h4>{project.title}</h4>
                            {hasPendingProposal && (
                              <span className={style.hasNew}>🟢</span>
                            )}
                          </div>
                          <p>{project.description}</p>
                          <p>
                            <strong>Бюджет:</strong> {project.budget}₽
                          </p>
                          <p>
                            <strong>Статус:</strong>{" "}
                            {renderStatus(project.status)}
                          </p>
                          <p>
                            <strong>Создан:</strong>{" "}
                            {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                          <button
                            onClick={() =>
                              navigate(`/employer/project/${project._id}`)
                            }
                          >
                            Подробнее
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeSection === "Отзывы" && (
            <section className={`${style.section} ${style.reviewsSection}`}>
              <h3>Отзывы</h3>
              {loading ? (
                <p className={style.reviewsLoading}>Загрузка отзывов...</p>
              ) : reviews.length > 0 ? (
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
    </div>
  );
}

export default EmployeeDash;
