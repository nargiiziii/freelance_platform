import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../axiosInstance";
import ProposalList from "../../components/proposalList/ProposalList";
import style from "./ProjectDetails.module.scss";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error("Ошибка загрузки проекта:", err);
      }
    };
    fetchProject();
  }, [id]);

  if (!project) return <p>Загрузка проекта...</p>;

  const acceptedProposal = project.proposals?.find(
    (p) =>
      ["accepted", "submitted"].includes(p.status) &&
      p.freelancer._id === project.escrow?.freelancer
  );

  const freelancer = acceptedProposal?.freelancer;

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
        <ProposalList projectId={project._id} />
      </section>

      {/* 🔹 Принятый фрилансер */}
      <section style={{ marginTop: "30px" }}>
        <h2>Принятый фрилансер</h2>
        {acceptedProposal && freelancer ? (
          <div>
            <p>
              <strong>Имя:</strong> {freelancer.name || "Без имени"}
            </p>
            <p>
              <strong>Email:</strong> {freelancer.email}
            </p>
            <p>
              <strong>Рейтинг:</strong> {freelancer.rating || "—"}
            </p>
            {freelancer.avatar && (
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
            {!acceptedProposal.workFile && <p>Фрилансер ещё не сдал работу.</p>}
          </div>
        ) : (
          <p>Фрилансер ещё не выбран.</p>
        )}
      </section>
    </div>
  );
};

export default ProjectDetails;
