import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../axiosInstance";
import styles from "./EditProject.module.scss";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState({
    title: "",
    description: "",
    budget: "",
    category: "",
  });

  useEffect(() => {
    axios.get(`/projects/${id}`).then((res) => setProject(res.data));
  }, [id]);

  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/projects/${id}`, project);
      navigate("/my-jobs");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    navigate("/my-jobs");
  };

  return (
    <div className={styles.editProjectWrapper}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Редактировать проект</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="title"
            placeholder="Название"
            value={project.title}
            onChange={handleChange}
            className={styles.input}
          />
          <textarea
            name="description"
            placeholder="Описание"
            value={project.description}
            onChange={handleChange}
            className={styles.textarea}
          />
          <input
            type="number"
            name="budget"
            placeholder="Бюджет"
            value={project.budget}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="text"
            name="category"
            placeholder="Категория"
            value={project.category}
            onChange={handleChange}
            className={styles.input}
          />
          <div className={styles.buttons}>
            <button type="submit" className={styles.saveBtn}>
              💾 Сохранить
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelBtn}
            >
              ❌ Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;
