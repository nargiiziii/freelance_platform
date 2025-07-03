import React, { useState } from "react";
import axios from "../../axiosInstance";
import { useDispatch } from "react-redux";
import { getProfile } from "../../redux/features/authSlice";
import style from "./AddPortfolioModal.module.scss";

const AddPortfolioModal = ({ isOpen, onClose, userId }) => {
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [date, setDate] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setLink("");
      setTechnologies("");
      setDate("");
      setImageFile(null);
      setError(null);
    }
  }, [isOpen]);

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
      await axios.post("http://localhost:3000/api/users/portfolio", formData);
      await dispatch(getProfile());
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Layihəni əlavə edərkən xəta baş verdi"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.overlay}>
      <div className={style.modal}>
        <button className={style.closeIcon} onClick={onClose} type="button">
          ×
        </button>

        <form onSubmit={handleSubmit}>
          <div className={style.uploadField}>
            <label>Layihənin şəkli</label>
            <div className={style.uploadRow}>
              <div className={style.fileInputWrapper}>
                <label className={style.customButton}>
                  Fayl yüklə
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </label>
              </div>

              {imageFile && (
                <div className={style.previewBlock}>
                  <div className={style.fileName}>{imageFile.name}</div>
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Ön baxış"
                    className={style.imagePreview}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={style.field}>
            <label>Layihənin adı *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={style.field}>
            <label>Təsvir *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className={style.field}>
            <label>Layihəyə keçid</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://"
            />
          </div>

          <div className={style.field}>
            <label>Texnologiyalar (vergüllə ayırın)</label>
            <input
              type="text"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="React, Node.js, MongoDB"
            />
          </div>

          <div className={style.field}>
            <label>İcra tarixi</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {error && <p className={style.error}>{error}</p>}

          <div className={style.buttons}>
            <button type="submit" disabled={loading}>
              {loading ? "Yüklənir..." : "Layihə əlavə et"}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              Ləğv et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPortfolioModal;
