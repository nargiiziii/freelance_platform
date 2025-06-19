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
    <div className={styles.editProject}>
      <h2>Редактировать проект</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Название"
          value={project.title}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Описание"
          value={project.description}
          onChange={handleChange}
        />
        <input
          type="number"
          name="budget"
          placeholder="Бюджет"
          value={project.budget}
          onChange={handleChange}
        />
        <input
          type="text"
          name="category"
          placeholder="Категория"
          value={project.category}
          onChange={handleChange}
        />
        <div className={styles.buttons}>
          <button type="submit">💾 Сохранить</button>
          <button type="button" onClick={handleCancel}>❌ Отмена</button>
        </div>
      </form>
    </div>
  );
};

export default EditProject;
