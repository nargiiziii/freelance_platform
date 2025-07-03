// src/pages/EmployeeDash.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getEmployerProjects } from "../../redux/features/projectSlice";
import { fetchReviewsForUser } from "../../redux/features/reviewSlice";
import style from "./Employee_dash.module.scss";

function EmployeeDash() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const projects = useSelector((state) => state.projects.employerProjects);
  const status = useSelector((state) => state.projects.status);
  const reviews = useSelector((state) => state.reviews.reviews);
  const loading = useSelector((state) => state.reviews.loading);

  const [activeSection, setActiveSection] = useState("Tapşırıq yerləşdirilməsi");
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
      dispatch(fetchReviewsForUser(user.id));
    }
  }, [user?.id, dispatch]);

  const renderStatus = (status) => {
    switch (status) {
      case "open":
        return <span className={style.statusOpen}>🟣 Açıq</span>;
      case "in_progress":
        return <span className={style.statusInProgress}>🟢 İşlənir</span>;
      case "closed":
        return <span className={style.statusClosed}>🔴 Bağlı</span>;
      default:
        return <span>{status}</span>;
    }
  };

  if (!user) return <p>İstifadəçi məlumatları yüklənir...</p>;

  const totalProjects = projects.length;
  const newProposals = projects.reduce((count, project) => {
    return (
      count +
      (project.proposals?.filter((p) => p.status === "pending").length || 0)
    );
  }, 0);
  const inProgress = projects.filter((p) => p.status === "in_progress").length;

  return (
    <div className={style.employeeContent}>
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
            <strong>Balans:</strong>{" "}
            {user.balance?.toLocaleString("ru-RU") || 0}₽
          </p>
          <button
            onClick={() => navigate("/edit-profile")}
            className={style.editButton}
          >
            Profili redaktə et
          </button>

          <div className={style.stats}>
            <p>👷 Yerləşdirilmiş layihələr: {totalProjects}</p>
            <p>✉️ Yeni müraciətlər: {newProposals}</p>
            <p>🛠️ İşlənənlər: {inProgress}</p>
            <p>
              💸 Balans: {user.balance?.toLocaleString("ru-RU") || 0}₽
              <button
                onClick={() => navigate("/escrow")}
                className={style.topUpButton}
              >
                Balansı artır
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className={style.rightSide}>
        <main className={style.sectionContent}>
          <div className={style.tabMenu}>
            {["Tapşırıq yerləşdirilməsi", "Rəylər"].map((section) => (
              <button
                key={section}
                className={`${style.tabButton} ${
                  activeSection === section ? style.activeTab : ""
                }`}
                onClick={() => setActiveSection(section)}
              >
                {section}
              </button>
            ))}
          </div>

          {activeSection === "Tapşırıq yerləşdirilməsi" && (
            <section className={style.section}>
              <h3>Tapşırıq yerləşdirilməsi</h3>
              <button
                className={style.addBtn}
                onClick={() => navigate("/create-project")}
              >
                + Yeni tapşırıq
              </button>

              <div className={style.projectSection}>
                <h4>Mənim yerləşdirdiyim layihələr</h4>
                <div className={style.statusFilter}>
                  <button onClick={() => setFilterStatus("all")}>Hamısı</button>
                  <button onClick={() => setFilterStatus("open")}>
                    Açıq
                  </button>
                  <button onClick={() => setFilterStatus("in progress")}>
                    İşlənir
                  </button>
                  <button onClick={() => setFilterStatus("closed")}>
                    Bağlı
                  </button>
                </div>

                {status === "loading" ? (
                  <p>Layihələr yüklənir...</p>
                ) : filteredProjects.length === 0 ? (
                  <p>Hələ heç bir layihə yerləşdirməmisiniz.</p>
                ) : (
                  <div className={style.projectList}>
                    {filteredProjects.map((project) => {
                      const hasPendingProposal = project.proposals?.some(
                        (proposal) => proposal.status === "pending"
                      );
                      return (
                        <div key={project._id} className={style.projectCard}>
                          <div className={style.projectHeader}>
                            <h4>{project.title}</h4>
                            {hasPendingProposal && (
                              <span className={style.hasNew}>🟢</span>
                            )}
                          </div>
                          <p>{project.description}</p>
                          <p>
                            <strong>Büdcə:</strong> {project.budget}₽
                          </p>
                          <p>
                            <strong>Status:</strong>{" "}
                            {renderStatus(project.status)}
                          </p>
                          <p>
                            <strong>Yaradılıb:</strong>{" "}
                            {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                          <button
                            onClick={() =>
                              navigate(`/employer/project/${project._id}`)
                            }
                          >
                            Ətraflı bax
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeSection === "Rəylər" && (
            <section className={`${style.section} ${style.reviewsSection}`}>
              <h3>Rəylər</h3>
              {loading ? (
                <p className={style.reviewsLoading}>Rəylər yüklənir...</p>
              ) : reviews.length > 0 ? (
                <ul>
                  {reviews.map((review, i) => (
                    <li key={review._id || i} className={style.reviewItem}>
                      <div className={style.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                      <div className={style.reviewUser}>
                        {review.fromUser?.name || "Anonim"}
                      </div>
                      <div className={style.reviewStars}>
                        {"⭐".repeat(review.rating)}
                      </div>
                      <div className={style.reviewComment}>
                        {review.comment}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={style.reviewsEmpty}>Rəy yoxdur</p>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default EmployeeDash;
