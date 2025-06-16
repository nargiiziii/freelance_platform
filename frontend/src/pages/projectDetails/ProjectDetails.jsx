// src/pages/ProjectDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getEmployerProjects } from "../../redux/features/projectSlice";
import ProposalList from "../../components/proposalList/ProposalList";
import style from "./ProjectDetails.module.scss";

const ProjectDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.projects.employerProjects);
  const [project, setProject] = useState(null);

  useEffect(() => {
    dispatch(getEmployerProjects());
  }, [dispatch]);

  useEffect(() => {
    const current = projects.find((p) => p._id === id);
    setProject(current);
  }, [projects, id]);

  if (!project) return <p>Загрузка проекта...</p>;

  return (
    <div className={style.projectPage} style={{ padding: "40px" }}>
      <h1>{project.title}</h1>
      <p>{project.description}</p>
      <p>
        <strong>Бюджет:</strong> {project.budget}₽
      </p>
      <p>
        <strong>Статус:</strong> {project.status}
      </p>
      <p>
        <strong>Создан:</strong> {new Date(project.createdAt).toLocaleString()}
      </p>

      {/* 🔹 Отклики */}
      <section style={{ marginTop: "30px" }}>
        <h2>Отклики</h2>
        <ProposalList proposals={project.proposals || []} />
      </section>

      {/* 🔹 Фрилансер */}
      <section style={{ marginTop: "30px" }}>
        <h2>Принятый фрилансер</h2>
        {project.proposals?.find((p) => p.status === "accepted") ? (
          (() => {
            const acceptedProposal = project.proposals.find(
              (p) => p.status === "accepted"
            );
            const freelancer = acceptedProposal.freelancer;

            return (
              <div>
                <p>
                  <strong>Имя:</strong> {freelancer?.name || "Без имени"}
                </p>
                <p>
                  <strong>Email:</strong> {freelancer?.email}
                </p>
                <p>
                  <strong>Рейтинг:</strong> {freelancer?.rating || "—"}
                </p>
                {freelancer?.avatar && (
                  <img
                    src={`http://localhost:3000/${freelancer.avatar}`}
                    alt="Avatar"
                    style={{
                      width: "100px",
                      borderRadius: "50%",
                      marginTop: "10px",
                    }}
                  />
                )}
              </div>
            );
          })()
        ) : (
          <p>Фрилансер ещё не выбран.</p>
        )}
      </section>
    </div>
  );
};

export default ProjectDetails;
