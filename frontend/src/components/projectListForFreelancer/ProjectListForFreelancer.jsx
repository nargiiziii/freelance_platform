// 🔧 Новый компонент: ProjectListForFreelancer.jsx
// Показывает список открытых проектов с кнопкой "Откликнуться"

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOpenProjects } from "../../redux/features/projectSlice";
import { createProposal } from "../../redux/features/proposalSlice";
import { Link } from "react-router-dom";

function ProjectListForFreelancer() {
  const dispatch = useDispatch();
  const { openProjects: projects, status } = useSelector(
    (state) => state.projects
  );
  const [coverLetter, setCoverLetter] = useState("");
  const [price, setPrice] = useState("");
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    dispatch(getOpenProjects());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeProject) return;
    dispatch(
      createProposal({
        projectId: activeProject._id,
        coverLetter,
        price: Number(price),
      })
    );
    setActiveProject(null);
    setCoverLetter("");
    setPrice("");
  };

  if (status === "loading") return <p>Загрузка проектов...</p>;

  return (
    <section>
      <h3>Открытые проекты</h3>
      <ul>
        {projects
          .filter((project) => project.status === "open") // 👈 фильтрация
          .map((project) => (
            <li key={project._id} style={{ marginBottom: "1rem" }}>
              <h4>{project.title}</h4>
              <p>{project.description}</p>
              <p>
                <strong>Бюджет:</strong> {project.budget}₽
              </p>
              {/* 💬 Кнопка: отправить сообщение нанимателю */}
              {project.employer && (
                <p>
                  <strong>Наниматель:</strong> {project.employer.name}
                  <Link to={`/chatRoom/${project.employer._id}`}>
                    <button>Написать нанимателю</button>
                  </Link>
                </p>
              )}

              <button onClick={() => setActiveProject(project)}>
                Откликнуться
              </button>
            </li>
          ))}
      </ul>

      {activeProject && (
        <form onSubmit={handleSubmit}>
          <h4>Отклик на: {activeProject.title}</h4>
          <textarea
            required
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Сопроводительное письмо"
          ></textarea>
          <input
            type="number"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Предложенная цена"
          />
          <button type="submit">Отправить отклик</button>
        </form>
      )}
    </section>
  );
}

export default ProjectListForFreelancer;
