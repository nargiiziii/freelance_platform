// ProjectListForFreelancer.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOpenProjects } from "../../redux/features/projectSlice";
import { createProposal } from "../../redux/features/proposalSlice";
import { Link } from "react-router-dom";
import style from "./ProjectListForFreelancer.module.scss";

function ProjectListForFreelancer() {
  const dispatch = useDispatch();
  const { openProjects: projects, status } = useSelector((state) => state.projects);
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

  if (status === "loading") {
    return <p className={style.loading}>Загрузка проектов...</p>;
  }

  return (
    <section className={style.wrapper}>
      <aside className={style.leftPanel}>
        <h3 className={style.heading}>Открытые проекты</h3>
        <div className={style.selectBar}>
          <select onChange={(e) => dispatch(getOpenProjects(e.target.value))}>
            <option value="">Все категории</option>
            <option value="Web Development">Web Development</option>
            <option value="Design">Design</option>
            <option value="Writing">Writing</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
      </aside>

      <div className={style.projectList}>
        {projects
          .filter((project) => project.status === "open")
          .map((project) => (
            <div key={project._id} className={style.card}>
              <div className={style.headerRow}>
                <h4 className={style.title}>{project.title}</h4>
                {project.employer && (
                  <Link
                    to={`/messages?user=${project.employer._id}`}
                    className={style.messageLink}
                  >
                    <button className={style.messageBtn}>Написать</button>
                  </Link>
                )}
              </div>
              <p className={style.description}>{project.description}</p>
              <p><strong>Бюджет:</strong> {project.budget}₽</p>
              <p><strong>Категория:</strong> {project.category || "Не указана"}</p>
              {project.employer && (
                <div className={style.employerInfo}>
                  <strong>Наниматель:</strong> {project.employer.name}
                </div>
              )}

              <button
                className={style.respondBtn}
                onClick={() =>
                  setActiveProject(
                    activeProject?._id === project._id ? null : project
                  )
                }
              >
                {activeProject?._id === project._id ? "Скрыть форму" : "Откликнуться"}
              </button>

              {activeProject?._id === project._id && (
                <form className={style.responseForm} onSubmit={handleSubmit}>
                  <textarea
                    required
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Сопроводительное письмо"
                  />
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Предложенная цена"
                  />
                  <button type="submit" className={style.submitBtn}>
                    Отправить отклик
                  </button>
                </form>
              )}
            </div>
          ))}
      </div>
    </section>
  );
}

export default ProjectListForFreelancer;
