import React, { useState } from "react";
import axios from "../../axiosInstance";
import { useNavigate } from "react-router-dom";
import style from "./Register.module.scss";
import { HiPlusSm } from "react-icons/hi"; // новый красивый плюс
import { AiOutlineClose } from "react-icons/ai"; // оставить крестик

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    role: "freelancer",
    name: "",
    email: "",
    password: "",
    bio: "",
    category: "",
    skills: [],
    portfolio: [],
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      formData.append("role", form.role);
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("bio", form.bio);
      formData.append("category", form.category);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const filteredSkills = form.skills.filter((skill) => skill.trim() !== "");
      if (filteredSkills.length)
        formData.append("skills", JSON.stringify(filteredSkills));

      if (form.portfolio.length)
        formData.append("portfolio", JSON.stringify(form.portfolio));

      await axios.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка при регистрации");
    }
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setNewSkill("");
  };

  const removeSkill = (index) => {
    const updatedSkills = [...form.skills];
    updatedSkills.splice(index, 1);
    setForm((prev) => ({ ...prev, skills: updatedSkills }));
  };

  const categories = ["Web Development", "Design", "Writing", "Marketing"];

  return (
    <form onSubmit={handleSubmit} className={style.form}>
      <div className={style.buttonGroup}>
        <button
          type="button"
          className={`${style.toggleButton} ${form.role === "freelancer" ? style.active : ""}`}
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              role: "freelancer",
              category: "",
            }))
          }
        >
          Freelancer
        </button>
        <button
          type="button"
          className={`${style.toggleButton} ${form.role === "employer" ? style.active : ""}`}
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              role: "employer",
              category: "",
            }))
          }
        >
          Employer
        </button>
      </div>

      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        className={style.input}
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className={style.input}
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        className={style.input}
      />

      <textarea
        name="bio"
        placeholder="Tell us about yourself"
        value={form.bio}
        onChange={handleChange}
        className={style.textarea}
      />

      {form.role === "freelancer" && (
        <>
          <div className={style.buttonGroup}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${style.toggleButton} ${form.category === cat ? style.active : ""}`}
                onClick={() => setForm((prev) => ({ ...prev, category: cat }))}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={style.skillsSection}>
            <div className={style.skillsHeader}>
              <label className={style.label}>Skills:</label>
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter a skill"
                className={style.skillInput}
              />
              <button
                type="button"
                onClick={addSkill}
                className={style.addSkillButton}
                style={{ color: "#28a745" }}
              >
                <HiPlusSm size={24} />
              </button>
            </div>

            <div className={style.skillsList}>
              {form.skills.map((skill, index) => (
                <div key={index} className={style.skillItem}>
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className={style.removeSkillButton}
                    style={{ color: "#dc3545" }}
                  >
                    <AiOutlineClose size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <label className={style.fileLabel}>
        {avatarPreview ? (
          <img src={avatarPreview} alt="Avatar Preview" className={style.avatarPreview} />
        ) : (
          "Загрузить фото профиля"
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={style.fileInput}
        />
      </label>

      <button type="submit" className={style.button}>
        Register
      </button>

      {error && <p className={style.error}>{error}</p>}
    </form>
  );
}
