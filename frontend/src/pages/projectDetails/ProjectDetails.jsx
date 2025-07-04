import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "../../axiosInstance";
import ProposalListEmp from "../../components/proposalListEmp/ProposalListEmp";
import style from "./ProjectDetails.module.scss";
import ReviewForm from "../../components/reviewForm/ReviewForm";
import useNotificationCleaner from "../../hooks/useNotificationCleaner";
import {
  fetchUserReviews,
  checkIfReviewed,
} from "../../redux/features/reviewSlice";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const hasReviewed = useSelector((state) => state.reviews.hasReviewed);
  useNotificationCleaner([`new-${id}`, `sub-${id}`]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error("Layihə yüklənərkən xəta baş verdi:", err);
      }
    };

    fetchProject();
    dispatch(fetchUserReviews());
  }, [id, dispatch]);

  useEffect(() => {
    if (project?.escrow?.freelancer && project._id) {
      dispatch(
        checkIfReviewed({
          toUserId: project.escrow.freelancer,
          projectId: project._id,
        })
      );
    }
  }, [dispatch, project]);

  if (!project) return <p className={style.loading}>Layihə yüklənir...</p>;

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

          {/* ✅ Bacarıqlar */}
          {project.skillsRequired?.length > 0 && (
            <div className={style.skillsBox}>
              <h4 className={style.skillsTitle}>Tələb olunan bacarıqlar:</h4>
              <ul className={style.skillsList}>
                {project.skillsRequired.map((skill, idx) => (
                  <li key={idx} className={style.skillItem}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          <div className={style.infoBox}>
            <p><strong>Ümumi büdcə:</strong> {project.budget}₽</p>
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Yaradılma tarixi:</strong> {new Date(project.createdAt).toLocaleString("az-Latn")}</p>
          </div>

          <section className={style.section}>
            <h2 className={style.sectionTitle}>Qəbul olunmuş freelancer</h2>
            {acceptedProposal && freelancer ? (
              <div className={style.freelancerCard}>
                <div className={style.freelancerInfo}>
                  <div className={style.freelancerText}>
                    <p><strong>Ad:</strong> {freelancer.name || "Ad yoxdur"}</p>
                    <p><strong>Email:</strong> {freelancer.email}</p>
                    <p><strong>Reytinq:</strong> {freelancer.rating || "—"}</p>
                    {!acceptedProposal.workFile && (
                      <p className={style.notice}>Freelancer hələ işi təhvil verməyib.</p>
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
                  acceptedProposal?.workFile &&
                  !hasReviewed && (
                    <div className={style.reviewBox}>
                      <h3 className={style.sectionTitle}>Freelancer-i qiymətləndirin</h3>
                      <ReviewForm
                        toUserId={freelancer._id}
                        projectId={project._id}
                        onSubmitSuccess={() => {
                          dispatch(fetchUserReviews());
                          dispatch(
                            checkIfReviewed({
                              toUserId: freelancer._id,
                              projectId: project._id,
                            })
                          );
                        }}
                      />
                    </div>
                  )}
              </div>
            ) : (
              <p className={style.notice}>Hələ freelancer seçilməyib.</p>
            )}
          </section>
        </div>

        {/* Sağ sütun — təkliflər */}
        <div className={style.rightColumn}>
          <section className={style.section}>
            <ProposalListEmp
              projectId={project._id}
              onProjectUpdated={setProject}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
