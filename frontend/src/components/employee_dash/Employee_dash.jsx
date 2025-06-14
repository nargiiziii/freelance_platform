import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createProject, getEmployerProjects } from "../../redux/features/projectSlice";
import AddProjectModal from "../addProjectModal/AddProjectModal";
import style from "./Employee_dash.module.scss";

function EmployeeDash({ data }) {
  const [activeSection, setActiveSection] = useState("Размещение задания");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filteredProjects, setFilteredProjects] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const sections = ["Размещение задания", "Размещённые проекты", "Отзывы"];

  // Загрузка проектов при монтировании
  useEffect(() => {
    dispatch(getEmployerProjects())
      .then(response => setProjects(response.payload))
      .catch(err => console.error("Ошибка при получении проектов:", err));
  }, [dispatch]);

  // Фильтрация по статусу
  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(
        projects.filter((project) => project.status === filterStatus)
      );
    }
  }, [filterStatus, projects]);

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  // ✅ Обновляем список после создания проекта
  const handleNewProject = (projectData) => {
    dispatch(createProject(projectData))
      .unwrap()
      .then(() => {
        dispatch(getEmployerProjects())
          .then(response => {
            setProjects(response.payload); // ✅ вручную обновляем стейт
          })
          .catch((err) => {
            console.error("Ошибка при обновлении списка проектов:", err);
          });
      })
      .catch((err) => {
        console.error("Ошибка при создании проекта:", err);
      });
  };

  return (
    <div className={style.employeeContent}>
      <div className={style.profile}>
        {data.avatar ? (
          <img
            className={style.avatar}
            src={`http://localhost:3000/${data.avatar}`}
            alt="Avatar"
          />
        ) : (
          <div className={style.avatarPlaceholder}>
            {data.name?.[0]?.toUpperCase() || "U"}
          </div>
        )}

        <div className={style.info}>
          <p className={style.name}>{data.name}</p>
          <p className={style.role}>{data.role}</p>
          <p className={style.balance}>
            <strong>Баланс:</strong> {data.balance?.toLocaleString("ru-RU") || 0}₽
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
          {activeSection === "Размещение задания" && (
            <section className={style.section}>
              <h3>Размещение задания</h3>
              <button onClick={() => setIsModalOpen(true)}>+ Новое задание</button>
            </section>
          )}

          {activeSection === "Размещённые проекты" && (
            <section className={style.section}>
              <h3>Размещённые проекты</h3>
              <div>
                <button onClick={() => setFilterStatus("all")}>Все</button>
                <button onClick={() => setFilterStatus("open")}>Открытые</button>
                <button onClick={() => setFilterStatus("completed")}>Завершенные</button>
              </div>
              {filteredProjects.length === 0 ? (
                <p>Вы ещё не разместили ни одного проекта.</p>
              ) : (
                <div className={style.projectList}>
                  {filteredProjects.map((project) => (
                    <div key={project._id} className={style.projectCard}>
                      <h4 className={style.projectTitle}>{project.title}</h4>
                      <p className={style.projectDescription}>{project.description}</p>
                      <p className={style.projectInfo}>
                        <strong>Бюджет:</strong> {project.budget}₽
                      </p>
                      <p className={style.projectInfo}>
                        <strong>Статус:</strong> {project.status === "open" ? "Открыт" : "Закрыт"}
                      </p>
                      <p className={style.projectInfo}>
                        <strong>Создан:</strong>{" "}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === "Отзывы" && (
            <section className={style.section}>
              <h3>Отзывы</h3>
              {data.reviews?.length ? (
                <ul>
                  {data.reviews.map((review, i) => (
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

      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewProject}
      />
    </div>
  );
}

export default EmployeeDash;
