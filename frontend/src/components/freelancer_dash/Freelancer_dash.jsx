import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "../../axiosInstance";
import { getFreelancerProjects } from "../../redux/features/projectSlice";
import AddPortfolioModal from "../addPortfolioModal/AddPortfolioModal";
import style from "./Freelancer_dash.module.scss";
import SubmitWorkModal from "../submitWork/SubmitWorkModal";
import {
  fetchReviewsForUser,
  fetchUserReviews,
} from "../../redux/features/reviewSlice";
import FreelancerProposals from "../freelancerProposals/FreelancerProposals";
import { fetchFreelancerStats } from "../../redux/features/userSlice";
import { getProfile } from "../../redux/features/authSlice";
import { FaStar } from "react-icons/fa";
import {
  FaClock,
  FaPaperPlane,
  FaProjectDiagram,
  FaMoneyBillWave,
  FaCalendarAlt,
} from "react-icons/fa";
import { HiOutlineLightningBolt } from "react-icons/hi";

function FreelancerDash() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const projects = useSelector((state) => state.projects.freelancerProjects);
  const reviews = useSelector((state) => state.reviews.reviews);
  const loading = useSelector((state) => state.reviews.loading);

  const [activeSection, setActiveSection] = useState("Profil");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  const sections = ["Profil", "Portfolio", "Rəylər"];

  useEffect(() => {
    dispatch(getFreelancerProjects());
  }, [dispatch]);

  useEffect(() => {
    if (user?.portfolio) setPortfolio(user.portfolio);
  }, [user]);

  const stats = useSelector((state) => state.user.stats);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchFreelancerStats(user.id));
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(
        projects.filter((project) => project.status === filterStatus)
      );
    }
  }, [filterStatus, projects]);

  useEffect(() => {
    if (!user?.id) return;
    dispatch(fetchReviewsForUser(user.id));
  }, [user?.id, dispatch]);

  const handleProjectAdded = (updatedUser) => {
    setPortfolio(updatedUser.portfolio || []);
  };

  const handleDelete = async (itemId) => {
    try {
      await axios.delete(`/users/portfolio/${itemId}`);
      dispatch(getProfile());
    } catch (err) {
      console.error("Silinmə xətası:", err);
      alert("Layihəni silmək zamanı xəta baş verdi.");
    }
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  if (!user) return <p>Yüklənir...</p>;

  return (
    <div className={style.freelancerContent}>
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
          <p className={style.name}>{user.name || "Ad göstərilməyib"}</p>
          <p className={style.role}>{user.role || "Rol göstərilməyib"}</p>
          <p className={style.balance}>
            <strong>Balans:</strong>{" "}
            {user.balance?.toLocaleString("ru-RU") || 0}₼
          </p>
          <button onClick={handleEditProfile} className={style.editButton}>
            Profili redaktə et
          </button>
        </div>
      </div>

      <div className={style.rightSide}>
        <div className={style.tabMenu}>
          {sections.map((section) => (
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

        <main className={style.sectionContent}>
          {activeSection === "Profil" && (
            <section className={style.section}>
              <h3>Profil</h3>
              <div className={style.profileTwoColumn}>
                <div className={style.leftColumn}>
                  <div className={style.bioBox}>
                    <strong>Bioqrafiya:</strong>
                    <p>{user.bio || "Açıqlama yoxdur"}</p>
                  </div>

                  <div className={style.skillsBox}>
                    <strong>Bacarıqlar:</strong>
                    {user.skills?.length ? (
                      <div className={style.skillsList}>
                        {user.skills.map((skill, index) => (
                          <span key={index} className={style.skillBadge}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span>Bacarıq yoxdur</span>
                    )}
                  </div>

                  <div className={style.statusBox}>
                    <p>
                      <strong>Status:</strong>{" "}
                      {user.isAvailable ? "Mövcuddur" : "Mövcud deyil"}
                    </p>
                    <p>
                      <strong>Tamamlanmış layihələr:</strong>{" "}
                      {user.completedProjectsCount || 0}
                    </p>
                  </div>
                </div>

                <div className={style.activityCard}>
                  <h4>Fəaliyyət</h4>
                  <p>
                    <FaClock className={style.icon} /> Son giriş:{" "}
                    {stats?.lastSeen
                      ? new Date(stats.lastSeen).toLocaleDateString()
                      : "Məlumat yoxdur"}
                  </p>
                  <p>
                    <FaPaperPlane className={style.icon} /> Göndərilən
                    müraciətlər: {stats?.proposalsCount ?? 0}
                  </p>
                  <p>
                    <FaStar className={style.icon} /> Orta reytinq:{" "}
                    {stats?.averageRating ?? "0.0"}
                  </p>
                  <p>
                    <FaProjectDiagram className={style.icon} /> Aktiv layihələr:{" "}
                    {stats?.activeProjectsCount ?? 0}
                  </p>
                  <p>
                    <HiOutlineLightningBolt className={style.icon} /> Ortalama
                    cavab vaxtı:{" "}
                    {stats?.averageResponseTime ?? "Məlumat yoxdur"}
                  </p>
                  <p>
                    <FaCalendarAlt className={style.icon} /> Platformaya
                    qoşulma:{" "}
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Məlumat yoxdur"}
                  </p>
                  <p>
                    <FaMoneyBillWave className={style.icon} /> Ümumi qazanc:{" "}
                    {user.balance?.toLocaleString("ru-RU") || 0}₼
                  </p>
                </div>
              </div>

              <div className={style.proposalsWrapper}>
                <h4>📁 Müraciət tarixçəsi</h4>
                <FreelancerProposals />
              </div>
            </section>
          )}

          {activeSection === "Portfolio" && (
            <section className={style.section}>
              <h3>Portfel</h3>
              <button
                className={style.addProjectButton}
                onClick={() => setIsModalOpen(true)}
              >
                + Layihə əlavə et
              </button>
              {portfolio?.length ? (
                <div className={style.portfolioGrid}>
                  {portfolio.map((item, i) => (
                    <div
                      key={item._id || i}
                      className={style.portfolioItem}
                      style={{
                        backgroundImage: `url(${
                          item.image
                            ? `http://localhost:3000/uploads/${item.image}`
                            : "https://via.placeholder.com/400x300"
                        })`,
                      }}
                    >
                      <div className={style.portfolioContent}>
                        <strong>{item.title}</strong>
                        <p>{item.description}</p>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={style.viewButton}
                        >
                          Layihəyə bax
                        </a>
                      </div>
                      <button
                        className={style.deleteButton}
                        onClick={() => handleDelete(item._id)}
                      >
                        🗑 Sil
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Portfel boşdur</p>
              )}
              <AddPortfolioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProjectAdded={handleProjectAdded}
                userId={user._id}
              />
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
                        {[...Array(5)].map((_, index) => (
                          <FaStar
                            key={index}
                            size={18}
                            color={
                              index < review.rating ? "#b48bfb" : "#e0d3f9"
                            }
                            className={style.star}
                          />
                        ))}
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

      {showSubmitModal && (
        <SubmitWorkModal
          projectId={showSubmitModal}
          onClose={() => setShowSubmitModal(null)}
        />
      )}
    </div>
  );
}

export default FreelancerDash;
