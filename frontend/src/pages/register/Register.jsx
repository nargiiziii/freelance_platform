import React, { useState } from "react";
import axios from "../../axiosInstance";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; // ✅
import { getProfile } from "../../redux/features/authSlice"; // ✅
import style from "./Register.module.scss";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // ✅

  const [form, setForm] = useState({
    role: "freelancer",
    name: "",
    email: "",
    password: "",
    bio: "",
    skills: [],
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

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      if (form.skills.length)
        formData.append("skills", JSON.stringify(form.skills));
      if (form.portfolio.length)
        formData.append("portfolio", JSON.stringify(form.portfolio));

      const response = await axios.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, // ✅ важно
      });

      console.log("Успешно зарегистрированы:", response.data);

      // ✅ Получаем профиль после регистрации
      await dispatch(getProfile());

      // ✅ Переход к Dashboard
      navigate("/dashboard");
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
