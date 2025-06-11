import React, { useState } from "react";
import axios from "axios";

const AddPortfolioModal = ({ isOpen, onClose, onProjectAdded, userId }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [date, setDate] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const techArray = technologies
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("link", link);
    formData.append("technologies", JSON.stringify(techArray));
    formData.append("date", date);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/portfolio",
        formData
      );

      const newProject = response.data.newProject || response.data.project || response.data; // зависит от API

      onProjectAdded(newProject); // передаём только новый проект
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Ошибка при добавлении проекта");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Добавить проект в портфолио</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label>Изображение проекта</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>

          <div style={styles.field}>
            <label>Название проекта *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={styles.field}>
            <label>Описание *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div style={styles.field}>
            <label>Ссылка на проект</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://"
            />
          </div>

          <div style={styles.field}>
            <label>Технологии (через запятую)</label>
            <input
              type="text"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="React, Node.js, MongoDB"
            />
          </div>

          <div style={styles.field}>
            <label>Дата выполнения</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div style={{ marginTop: 20 }}>
            <button type="submit" disabled={loading}>
              {loading ? "Сохраняем..." : "Добавить проект"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ marginLeft: 10 }}
              disabled={loading}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    width: "90%",
    maxWidth: 500,
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  },
  field: {
    marginBottom: 15,
    display: "flex",
    flexDirection: "column",
  },
};

export default AddPortfolioModal;
