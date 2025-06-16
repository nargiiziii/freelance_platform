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
import ProposalList from "../proposalList/ProposalList";

function EmployeeDash() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const projects = useSelector((state) => state.projects.employerProjects);
  const status = useSelector((state) => state.projects.status);

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

  const handleCreateEscrow = (project) => {
    if (!project.proposals?.length) {
      alert("Нет доступных предложений от фрилансеров");
      return;
    }
    const freelancerId = project.proposals[0].freelancer;
    const amount = project.budget;

    dispatch(createEscrow({ projectId: project._id, freelancerId, amount }));
  };

  const handleRelease = (escrowId) => {
    dispatch(releaseFunds(escrowId));
  };

  const handleRefund = (escrowId) => {
    dispatch(refundFunds(escrowId));
  };

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
        <aside className={style.sidebar}>
          <ul>
            {["Размещение задания", "Размещённые проекты", "Отзывы"].map(
              (section) => (
                <li
                  key={section}
                  className={
                    activeSection === section ? style.activeSection : ""
                  }
                  onClick={() => setActiveSection(section)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setActiveSection(section);
                  }}
                >
                  {section}
                </li>
              )
            )}
          </ul>
        </aside>

        <main className={style.sectionContent}>
          {activeSection === "Размещение задания" && (
            <section className={style.section}>
              <h3>Размещение задания</h3>
              <button onClick={() => navigate("/create-project")}>
                + Новое задание
              </button>
            </section>
          )}

          {activeSection === "Размещённые проекты" && (
            <section className={style.section}>
              <h3>Размещённые проекты</h3>
              <div>
                <button onClick={() => setFilterStatus("all")}>Все</button>
                <button onClick={() => setFilterStatus("open")}>
                  Открытые
                </button>
                <button onClick={() => setFilterStatus("completed")}>
                  Завершенные
                </button>
              </div>
              {status === "loading" ? (
                <p>Загрузка проектов...</p>
              ) : filteredProjects.length === 0 ? (
                <p>Вы ещё не разместили ни одного проекта.</p>
              ) : (
                <div className={style.projectList}>
                  {filteredProjects.map((project) => (
                    <div key={project._id} className={style.projectCard}>
                      <h4>{project.title}</h4>
                      <p>{project.description}</p>
                      <p>
                        <strong>Бюджет:</strong> {project.budget}₽
                      </p>
                      <p>
                        <strong>Статус:</strong>{" "}
                        {project.status === "open" ? "Открыт" : "Закрыт"}
                      </p>
                      <p>
                        <strong>Создан:</strong>{" "}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>

                      {/* ✅ Показ откликов всегда */}
                      <ProposalList proposals={project.proposals || []} />

                      {/* 💰 Escrow блок */}
                      {project.escrow ? (
                        <div className={style.escrowBox}>
                          <p>
                            <strong>Escrow статус:</strong>{" "}
                            {project.escrow.status}
                          </p>

                          {project.escrow.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleRelease(project.escrow._id)
                                }
                              >
                                ✅ Выпустить средства
                              </button>
                              <button
                                onClick={() => handleRefund(project.escrow._id)}
                              >
                                ↩️ Вернуть средства
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <button onClick={() => handleCreateEscrow(project)}>
                          💰 Заморозить средства
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
    </div>
  );
}

export default EmployeeDash;
