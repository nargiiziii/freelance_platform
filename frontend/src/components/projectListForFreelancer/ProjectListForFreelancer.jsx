import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOpenProjects } from "../../redux/features/projectSlice";
import { Link } from "react-router-dom";
import SendProposalModal from "../../components/sendProposalModal/SendProposalModal";
import style from "./ProjectListForFreelancer.module.scss";

const categories = ["Web Development", "Design", "Writing", "Marketing"];

function ProjectListForFreelancer() {
  const dispatch = useDispatch();
  const { openProjects: projects, status } = useSelector(
    (state) => state.projects
  );
  const [activeProject, setActiveProject] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    dispatch(getOpenProjects());
  }, [dispatch]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategories((prev) =>
      prev.includes(value)
        ? prev.filter((cat) => cat !== value)
        : [...prev, value]
    );
  };

  const filteredProjects = projects
    .filter((project) => project.status === "open")
    .filter((project) =>
      selectedCategories.length > 0
        ? selectedCategories.includes(project.category)
        : true
    );

  if (status === "loading") {
    return <p className={style.loading}>Layihələr yüklənir...</p>;
  }

  return (
    <section className={style.wrapper}>
      <aside className={style.leftPanel}>
        <h3 className={style.heading}>Açıq layihələr</h3>
        <div className={style.selectBar}>
          <p>Kateqoriyalara görə filtr:</p>
          {categories.map((category) => (
            <label key={category} className={style.checkboxLabel}>
              <input
                type="checkbox"
                value={category}
                checked={selectedCategories.includes(category)}
                onChange={handleCategoryChange}
              />
              {category}
            </label>
          ))}
        </div>
      </aside>

      <div className={style.projectList}>
        {filteredProjects.map((project) => (
          <div key={project._id} className={style.card}>
            {project.employer && (
              <div className={style.topRight}>
                <Link
                  to={`/messages?user=${project.employer._id}`}
                  className={style.messageLink}
                >
                  <button className={style.messageBtn}>Yazmaq</button>
                </Link>
              </div>
            )}

            <h4 className={style.title}>{project.title}</h4>
            <p className={style.description}>{project.description}</p>
            <p>
              <strong>Büdcə:</strong> {project.budget}₽
            </p>
            <p>
              <strong>Kateqoriya:</strong> {project.category || "Göstərilməyib"}
            </p>
            {project.employer && (
              <div className={style.employerInfo}>
                <strong>İşəgötürən:</strong> {project.employer.name}
              </div>
            )}
            {project.skillsRequired && project.skillsRequired.length > 0 && (
              <div className={style.skills}>
                {project.skillsRequired.map((skill, index) => (
                  <span key={index} className={style.skill}>
                    {skill}
                  </span>
                ))}
              </div>
            )}
            <div className={style.buttonBlock}>
              <button
                className={style.respondBtn}
                onClick={() => setActiveProject(project)}
              >
                Müraciət et
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeProject && (
        <SendProposalModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
        />
      )}
    </section>
  );
}

export default ProjectListForFreelancer;
