import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../axiosInstance";
import ProposalListEmp from "../../components/proposalListEmp/ProposalListEmp";
import style from "./ProjectDetails.module.scss";
import ReviewForm from "../../components/reviewForm/ReviewForm";
import useNotificationCleaner from "../../hooks/useNotificationCleaner";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  useNotificationCleaner([`new-${id}`, `sub-${id}`]);

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

  if (!project) return <p className={style.loading}>Загрузка проекта...</p>;

  const acceptedProposal = project.proposals?.find(
    (p) =>
      ["accepted", "submitted"].includes(p.status) &&
      p.freelancer._id === project.escrow?.freelancer
  );

  const freelancer = acceptedProposal?.freelancer;

  return (
    <div className={style.projectPage}>
      <div className={style.layout}>
        <div className={style.leftColumn}>
          <div className={style.projectHeader}>
            <h1 className={style.title}>{project.title}</h1>
            <p className={style.description}>{project.description}</p>
          </div>
          <div className={style.infoBox}>
            <p><strong>Бюджет:</strong> {project.budget}₽</p>
            <p><strong>Статус:</strong> {project.status}</p>
            <p><strong>Создан:</strong> {new Date(project.createdAt).toLocaleString()}</p>
          </div>

          <section className={style.section}>
            <h2 className={style.sectionTitle}>Принятый фрилансер</h2>
            {acceptedProposal && freelancer ? (
              <div className={style.freelancerCard}>
                <div className={style.freelancerInfo}>
                  <div className={style.freelancerText}>
                    <p><strong>Имя:</strong> {freelancer.name || "Без имени"}</p>
                    <p><strong>Email:</strong> {freelancer.email}</p>
                    <p><strong>Рейтинг:</strong> {freelancer.rating || "—"}</p>
                    {!acceptedProposal.workFile && (
                      <p className={style.notice}>Фрилансер ещё не сдал работу.</p>
                    )}
                  </div>
                  {freelancer.avatar && (
                    <img
                      src={`http://localhost:3000/${freelancer.avatar}`}
                      alt="Avatar"
                      className={style.avatar}
                    />
                  )}
                </div>

                {project.status === "closed" &&
                  project.escrow?.status === "released" &&
                  acceptedProposal?.workFile && (
                    <div className={style.reviewBox}>
                      <h3 className={style.sectionTitle}>Оцените фрилансера</h3>
                      <ReviewForm
                        toUserId={freelancer._id}
                        projectId={project._id}
                      />
                    </div>
                  )}
              </div>
            ) : (
              <p className={style.notice}>Фрилансер ещё не выбран.</p>
            )}
          </section>
        </div>

        {/* Правая колонка — отклики */}
        <div className={style.rightColumn}>
          <section className={style.section}>
            <ProposalListEmp projectId={project._id} onProjectUpdated={setProject} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
