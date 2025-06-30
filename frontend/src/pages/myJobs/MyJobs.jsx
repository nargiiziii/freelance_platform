import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./MyJobs.module.scss";
import axios from "../../axiosInstance";
import ConfirmModal from "../../components/confirmModal/ConfirmModal";

// Иконки
import { FaFileAlt, FaThumbtack, FaSearch, FaEdit, FaTrash, FaCheck } from "react-icons/fa";

const MyJobs = () => {
  const { user } = useSelector((state) => state.auth);
  const [projects, setProjects] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "employer") fetchProjects();
  }, [selectedStatuses, sortBy]);

  const fetchProjects = async () => {
    try {
      const query = selectedStatuses.length
        ? `?status=${selectedStatuses.join(",")}`
        : "";
      const res = await axios.get(`/projects/my-projects${query}`);
      setProjects(sortProjects(res.data));
    } catch (err) {
      console.error(err);
    }
  };

  const sortProjects = (projects) => {
    const sorted = [...projects];
    if (sortBy === "date_desc") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "date_asc") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "responses_desc") {
      sorted.sort(
        (a, b) => (b.proposals?.length || 0) - (a.proposals?.length || 0)
      );
    } else if (sortBy === "responses_asc") {
      sorted.sort(
        (a, b) => (a.proposals?.length || 0) - (b.proposals?.length || 0)
      );
    }
    return sorted;
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setSelectedStatuses((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const handleSortCheckbox = (value) => {
    setSortBy((prev) => (prev === value ? "" : value));
  };

  const confirmDelete = (id) => {
    setProjectToDelete(id);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/projects/${projectToDelete}`);
      setShowModal(false);
      setProjectToDelete(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setProjectToDelete(null);
  };

  const isCompleted = (status) => status === "closed";

  const getStatusLabel = (status) => {
    switch (status) {
      case "open":
        return "Открыт";
      case "in_progress":
        return "В работе";
      case "submitted":
        return "Работа отправлена";
      case "closed":
        return "Завершён";
      default:
        return status;
    }
  };

  return (
    <div className={styles.myJobs}>
      <h2><FaFileAlt /> Мои проекты</h2>

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <div className={styles.filters}>
            <div className={styles.checkboxGroup}>
              {["open", "in_progress", "submitted", "closed"].map((status) => (
                <label key={status}>
                  <input
                    type="checkbox"
                    value={status}
                    onChange={handleStatusChange}
                    checked={selectedStatuses.includes(status)}
                  />
                  {getStatusLabel(status)}
                </label>
              ))}
            </div>

            <div className={styles.checkboxGroup}>
              <span className={styles.sortLabel}>Сортировать по:</span>
              <label>
                <input
                  type="checkbox"
                  checked={sortBy === "date_desc"}
                  onChange={() => handleSortCheckbox("date_desc")}
                />
                Новые сначала
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={sortBy === "date_asc"}
                  onChange={() => handleSortCheckbox("date_asc")}
                />
                Старые сначала
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={sortBy === "responses_desc"}
                  onChange={() => handleSortCheckbox("responses_desc")}
                />
                Больше откликов
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={sortBy === "responses_asc"}
                  onChange={() => handleSortCheckbox("responses_asc")}
                />
                Меньше откликов
              </label>
            </div>
          </div>
        </div>

        <div className={styles.projects}>
          {projects.map((project) => {
            const completed = isCompleted(project.status);
            const noProposals = project.proposals?.length === 0;
            const proposalCount =
              project.proposals?.filter((p) => p.status !== "rejected").length ||
              0;

            return (
              <div
                key={project._id}
                className={`${styles.projectCard} ${
                  completed ? styles.completedCard : ""
                }`}
              >
                {completed && (
                  <span className={styles.completedLabel}>
                    <FaCheck /> Завершено
                  </span>
                )}

                <div className={styles.cardContent}>
                  <div className={styles.infoBlock}>
                    <h3 className={styles.projectTitle}>
                      <FaThumbtack /> {project.title}
                      <span className={styles.statusWithBadge}>
                        <span
                          className={`${styles.statusLabel} ${styles[project.status]}`}
                        >
                          {getStatusLabel(project.status)}
                        </span>
                        <span className={styles.badge}>{proposalCount}</span>
                      </span>
                    </h3>

                    <p className={styles.postedDate}>
                      Posted in {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                    <p className={styles.projectText}>
                      Категория: {project.category}
                    </p>
                    <p className={styles.projectText}>
                      Бюджет: {project.budget}₽
                    </p>
                    <p className={styles.projectText}>
                      {project.description.slice(0, 100)}...
                    </p>
                  </div>

                  <div className={styles.buttonGroup}>
                    <button
                      className={styles.actionButton}
                      onClick={() =>
                        navigate(`/employer/project/${project._id}`)
                      }
                    >
                      <FaSearch /> Подробнее
                    </button>

                    {!completed && project.status === "open" && (
                      <>
                        <button
                          className={styles.actionButton}
                          onClick={() =>
                            navigate(`/edit-project/${project._id}`)
                          }
                        >
                          <FaEdit /> Редактировать
                        </button>

                        {noProposals && (
                          <button
                            className={styles.deleteButton}
                            onClick={() => confirmDelete(project._id)}
                          >
                            <FaTrash /> Удалить
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <ConfirmModal
          message="Вы точно хотите удалить проект?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default MyJobs;
