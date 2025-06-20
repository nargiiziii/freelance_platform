import React, { useState } from "react";
import axios from "../../axiosInstance";
import { useNavigate } from "react-router-dom";
import style from "./Register.module.scss";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    role: "freelancer",
    name: "",
    email: "",
    password: "",
    bio: "",
    category: "",
    skills: [""],
    portfolio: [],
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState("");

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

  const handleSkillChange = (index, value) => {
    const updatedSkills = [...form.skills];
    updatedSkills[index] = value;
    setForm((prev) => ({ ...prev, skills: updatedSkills }));
  };

  const addSkillField = () => {
    setForm((prev) => ({ ...prev, skills: [...prev.skills, ""] }));
  };

  const removeSkillField = (index) => {
    const updatedSkills = [...form.skills];
    updatedSkills.splice(index, 1);
    setForm((prev) => ({ ...prev, skills: updatedSkills }));
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

      console.log("Успешно зарегистрированы");
      navigate("/login");
    } catch (err) {
      console.error("Ошибка регистрации:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Ошибка при регистрации");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={style.form}>
      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className={style.select}
      >
        <option value="freelancer">Freelancer</option>
        <option value="employer">Employer</option>
      </select>

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
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className={style.select}
            required
          >
            <option value="">Выберите профессию</option>
            <option value="Web Development">Web Development</option>
            <option value="Design">Design</option>
            <option value="Writing">Writing</option>
            <option value="Marketing">Marketing</option>
          </select>

          <label className={style.label}>Skills:</label>
          {form.skills.map((skill, index) => (
            <div key={index} className={style.skillRow}>
              <input
                type="text"
                value={skill}
                onChange={(e) => handleSkillChange(index, e.target.value)}
                className={style.input}
                placeholder={`Skill ${index + 1}`}
              />
              {form.skills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSkillField(index)}
                  className={style.removeButton}
                >
                  ❌
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSkillField}
            className={style.addButton}
          >
            ➕ Add Skill
          </button>
        </>
      )}

      <label className={style.fileLabel}>
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Avatar Preview"
            className={style.avatarPreview}
          />
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
