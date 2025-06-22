// src/pages/EmployeeDash.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createEscrow,
  releaseFunds,
  refundFunds,
} from "../../redux/features/escrowSlice";
import { getEmployerProjects } from "../../redux/features/projectSlice";
import style from "./Employee_dash.module.scss";
import { fetchUserReviews } from "../../redux/features/reviewSlice";

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
      dispatch(fetchUserReviews(user.id));
    }
  }, [dispatch, user]);

  if (!user) return <p>Загрузка данных пользователя...</p>;

  return (
    <div className={style.employeeContent} style={{ marginTop: "110px" }}>
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
        </div>
      </div>

      <div className={style.rightSide}>
        <main className={style.sectionContent}>
          <div className={style.tabMenu}>
            {["Размещение задания", "Размещённые проекты", "Отзывы"].map(
              (section) => (
                <button
                  key={section}
                  className={`${style.tabButton} ${
                    activeSection === section ? style.activeTab : ""
                  }`}
                  onClick={() => setActiveSection(section)}
                >
                  {section}
                </button>
              )
            )}
          </div>

          {activeSection === "Размещение задания" && (
            <section className={style.section}>
              <h3>Размещение задания</h3>
              <button onClick={() => navigate("/create-project")}>+ Новое задание</button>
            </section>
          )}

          {activeSection === "Размещённые проекты" && (
            <section className={style.section}>
              <h3>Размещённые проекты</h3>
              <div>
                <button onClick={() => setFilterStatus("all")}>Все</button>
                <button onClick={() => setFilterStatus("open")}>Открытые</button>
                <button onClick={() => setFilterStatus("closed")}>Завершённые</button>
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
                        <div
                          style={{ display: "flex", alignItems: "center", gap: "8px" }}
                        >
                          <h4>{project.title}</h4>
                          {hasPendingProposal && (
                            <span style={{ color: "green", fontSize: "20px" }}>🟢</span>
                          )}
                        </div>
                        <p>{project.description}</p>
                        <p><strong>Бюджет:</strong> {project.budget}₽</p>
                        <p><strong>Статус:</strong> {project.status}</p>
                        <p><strong>Создан:</strong> {new Date(project.createdAt).toLocaleDateString()}</p>
                        <button onClick={() => navigate(`/employer/project/${project._id}`)}>
                          📂 Подробнее
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeSection === "Отзывы" && (
            <section className={style.section}>
              <h3>Отзывы</h3>
              {loading ? (
                <p>Загрузка отзывов...</p>
              ) : reviews.length > 0 ? (
                <ul>
                  {reviews.map((review, i) => (
                    <li key={review._id || i}>
                      <strong>{review.fromUser?.name || "Аноним"}:</strong> {review.comment} — Оценка: ⭐ {review.rating}
                      <br />
                      <small>{new Date(review.createdAt).toLocaleDateString()}</small>
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
    </div>
  );
}

export default EmployeeDash;
