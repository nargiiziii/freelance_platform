import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./MyJobs.module.scss";
import axios from "../../axiosInstance";
import ConfirmModal from "../../components/confirmModal/ConfirmModal"; // 💡 импорт модалки

const MyJobs = () => {
  const { user } = useSelector((state) => state.auth);
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "employer") {
      fetchProjects();
    }
  }, [statusFilter]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        `/projects/my-projects${statusFilter ? `?status=${statusFilter}` : ""}`
      );
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
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

  return (
    <div className={styles.myJobs}>
      <h2>📄 Мои проекты</h2>

      <select onChange={(e) => setStatusFilter(e.target.value)} defaultValue="">
        <option value="">Все</option>
        <option value="open">Открыт</option>
        <option value="in_progress">В работе</option>
        <option value="submitted">Отправлена работа</option>
        <option value="completed">Завершён</option>
      </select>

      {projects.map((project) => (
        <div key={project._id} className={styles.card}>
          <h3>📌 {project.title}</h3>
          <p>📂 Категория: {project.category}</p>
          <p>💰 Бюджет: {project.budget}₽</p>
          <p>🗓 Дата: {new Date(project.createdAt).toLocaleDateString()}</p>
          <p>👥 Откликов: {project.proposals?.length || 0}</p>
          <p>⏳ Статус: {project.status}</p>

          <button onClick={() => navigate(`/proposals/${project._id}`)}>
            📥 Посмотреть предложения
          </button>
          {project.status === "open" && (
            <>
              <button onClick={() => navigate(`/edit-project/${project._id}`)}>
                ✏️ Редактировать
              </button>
              <button onClick={() => confirmDelete(project._id)}>
                🗑 Удалить
              </button>
            </>
          )}
        </div>
      ))}

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
