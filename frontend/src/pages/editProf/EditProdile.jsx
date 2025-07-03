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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        alert("Zəhmət olmasa, şəkil faylı seçin (jpg, png, gif və s.)");
        return;
      }
      setAvatarFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      alert("Xəta: istifadəçi tapılmadı və ya yüklənməyib (user.id yoxdur)");
      return;
    }

    try {
      let avatarUrl = form.avatar;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("image", avatarFile, avatarFile.name);

        const res = await axios.post("/upload", formData);
        avatarUrl = res.data.url.replace(/^\/+/, "");
      }

      const updated = {
        name: form.name,
        email: form.email,
        bio: form.bio,
        avatar: avatarUrl,
      };

      const res = await axios.put(`/users/${user.id}`, updated);
      dispatch(setUser(res.data));
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Profil yenilənərkən xəta baş verdi");
    }
  };

  const renderGlowDots = () => {
    const dots = [];
    for (let i = 0; i < 35; i++) {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const size = 40 + Math.random() * 40;
      const delay = Math.random() * 10;
      const duration = 14 + Math.random() * 6;

      dots.push(
        <span
          key={i}
          style={{
            top: `${top}%`,
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }}
        />
      );
    }
    return dots;
  };

  return (
    <div className={style.profileWrapper}>
      <div className={style.glowDots}>{renderGlowDots()}</div>

      <div className={style.container}>
        <h2 className={style.title}>Profilə düzəliş et</h2>
        <form onSubmit={handleSubmit} className={style.form}>
          <div className={style.field}>
            <label>Ad</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Adınızı daxil edin"
              required
            />
          </div>
          <div className={style.field}>
            <label>Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email ünvanınız"
              required
            />
          </div>
          <div className={style.field}>
            <label>Haqqınızda</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Özünüz haqqında məlumat verin..."
            />
          </div>
          <div className={style.avatarField}>
            <label>Avatar</label>
            <div className={style.avatarWrapper}>
              <div className={style.avatarUploadBox}>
                {avatarFile || form.avatar ? (
                  <img
                    src={
                      avatarFile
                        ? URL.createObjectURL(avatarFile)
                        : `/${form.avatar}`
                    }
                    alt="Avatar"
                    className={style.avatarPreview}
                  />
                ) : (
                  <div className={style.avatarPlaceholder}>
                    Şəkil seçin
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={style.avatarInput}
                />
              </div>
            </div>
          </div>

          <div className={style.buttonGroup}>
            <button type="submit" className={style.submitBtn}>
              Yadda saxla
            </button>
            <button
              type="button"
              className={style.cancelBtn}
              onClick={() => navigate(-1)}
            >
              Ləğv et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
