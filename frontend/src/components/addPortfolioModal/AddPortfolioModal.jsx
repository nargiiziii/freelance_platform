import React, { useState } from "react";
import axios from "../../axiosInstance"; // ✅ Путь подгони под структуру
import style from "./AddPortfolioModal.module.scss";

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

      const newProject =
        response.data.newProject || response.data.project || response.data;

      onProjectAdded(newProject);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Ошибка при добавлении проекта");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.overlay}>
      <div className={style.modal}>
        <h2>Добавить проект в портфолио</h2>
        <form onSubmit={handleSubmit}>
          <div className={style.field}>
            <label>Изображение проекта</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>

          <div className={style.field}>
            <label>Название проекта *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={style.field}>
            <label>Описание *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className={style.field}>
            <label>Ссылка на проект</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://"
            />
          </div>

          <div className={style.field}>
            <label>Технологии (через запятую)</label>
            <input
              type="text"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="React, Node.js, MongoDB"
            />
          </div>

          <div className={style.field}>
            <label>Дата выполнения</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {error && <p className={style.error}>{error}</p>}

          <div className={style.buttons}>
            <button type="submit" disabled={loading}>
              {loading ? "Сохраняем..." : "Добавить проект"}
            </button>
            <button
              type="button"
              onClick={onClose}
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

export default AddPortfolioModal;
