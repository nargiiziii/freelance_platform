import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./MyJobs.module.scss";
import axios from "../../axiosInstance";
import ConfirmModal from "../../components/confirmModal/ConfirmModal";

const MyJobs = () => {
  const { user } = useSelector((state) => state.auth);
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "employer") fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        `/projects/my-projects${statusFilter ? `?status=${statusFilter}` : ""}`
      );
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

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setProjects((prev) => sortProjects(prev));
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

  return (
    <div className={styles.myJobs}>
      <h2>📄 Мои проекты</h2>

      <div className={styles.filters}>
        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          defaultValue=""
        >
          <option value="">Все статусы</option>
          <option value="open">Открыт</option>
          <option value="in_progress">В работе</option>
          <option value="submitted">Отправлена работа</option>
          <option value="closed">Завершён</option>
        </select>

        <select onChange={handleSortChange} defaultValue="">
          <option value="">Сортировать по</option>
          <option value="date_desc">Новые сначала</option>
          <option value="date_asc">Старые сначала</option>
          <option value="responses_desc">Больше откликов</option>
          <option value="responses_asc">Меньше откликов</option>
        </select>
      </div>

      {projects.map((project) => {
        const completed = isCompleted(project.status);
        const noProposals = project.proposals?.length === 0;
        const firstFreelancerId = project.proposals?.[0]?.freelancer?._id;

        return (
          <div
            key={project._id}
            className={`${styles.projectCard} ${
              completed ? styles.completedCard : ""
            }`}
          >
            {completed && (
              <span className={styles.completedLabel}>✔ Завершено</span>
            )}
            <h3 className={styles.projectTitle}>
              📌 {project.title}
            </h3>
            <p className={styles.projectText}>
              {project.description.slice(0, 100)}...
            </p>
            <p className={styles.projectText}>
              Категория: {project.category}
            </p>
            <p className={styles.projectText}>
              Бюджет: {project.budget}₽
            </p>
            <p className={styles.projectText}>
              Дата: {new Date(project.createdAt).toLocaleDateString()}
            </p>
            <p className={styles.projectText}>
              Откликов:{" "}
              {project.proposals?.filter((p) => p.status !== "rejected").length || 0}
            </p>
            <p className={styles.projectText}>
              Статус: {project.status}
            </p>

            <div className={styles.buttonGroup}>
              <button
                className={styles.actionButton}
                onClick={() => navigate(`/employer/project/${project._id}`)}
              >
                🔍 Подробнее
              </button>

              {!completed && project.status === "open" && (
                <>
                  <button
                    className={styles.actionButton}
                    onClick={() => navigate(`/edit-project/${project._id}`)}
                  >
                    ✏️ Редактировать
                  </button>

                  {noProposals && (
                    <button
                      className={styles.deleteButton}
                      onClick={() => confirmDelete(project._id)}
                    >
                      🗑 Удалить
                    </button>
                  )}
                </>
              )}

              {firstFreelancerId && (
                <button
                  className={styles.actionButton}
                  onClick={() => navigate(`/messages?user=${firstFreelancerId}`)}
                >
                  💬 Написать сообщение
                </button>
              )}
            </div>
          </div>
        );
      })}

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
