import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "../../axiosInstance";
import { setUser } from "../../redux/features/authSlice";
import style from "./EditProfile.module.scss";

function EditProfile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    avatar: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
      setAvatarFile(null);
    }
  }, [user]);

  // useEffect(() => {
  //   console.log("Current user from Redux store:", user);
  // }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        alert("Пожалуйста, выберите файл изображения (jpg, png, gif и др.)");
        return;
      }
      setAvatarFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // console.log("user перед отправкой:", user);
    // console.log("user._id перед отправкой:", user?.id);

    if (!user?.id) {
      alert(
        "Ошибка: пользователь не найден или не загружен (user.id отсутствует)"
      );
      return;
    }

    try {
      let avatarUrl = form.avatar;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("image", avatarFile, avatarFile.name);
        // console.log("Отправляемый файл:", avatarFile.name);

        const res = await axios.post("/upload", formData);
        // console.log("URL аватара после загрузки:", res.data.url);

        avatarUrl = res.data.url.replace(/^\/+/, ""); // Убираем ведущий слэш
      }

      const updated = {
        name: form.name,
        email: form.email,
        bio: form.bio,
        avatar: avatarUrl,
      };

      // Используем user._id для запроса
      const res = await axios.put(`/users/${user.id}`, updated);

      dispatch(setUser(res.data));
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Ошибка при обновлении профиля");
    }
  };

  return (
    <div className={style.container}>
      <h2 className={style.title}>Редактировать профиль</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Имя"
          required
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          placeholder="О себе"
        />
        <input key={form.avatar} type="file" onChange={handleFileChange} />
        <button type="submit">Сохранить</button>
      </form>
    </div>
  );
}

export default EditProfile;
