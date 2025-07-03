import React, { useState } from "react";
import axios from "../../axiosInstance";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import style from "./Register.module.scss";
import { HiPlusSm } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";

export default function Register() {
  const navigate = useNavigate();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState("");

  const categories = ["Web Development", "Design", "Writing", "Marketing"];

  const initialValues = {
    role: "freelancer",
    name: "",
    email: "",
    password: "",
    bio: "",
    category: "",
  };

  const validationSchema = Yup.object({
    role: Yup.string().required(),
    name: Yup.string().required("Ad vacibdir"),
    email: Yup.string().email("Etibarsız e-poçt").required("E-poçt vacibdir"),
    password: Yup.string()
      .min(6, "Minimum 6 simvol")
      .required("Şifrə vacibdir"),
    bio: Yup.string().required("Haqqınızda məlumat vacibdir"),
    category: Yup.string().when("role", (role, schema) =>
      role === "freelancer"
        ? schema.required("Kateqoriya vacibdir")
        : schema.notRequired()
    ),
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setNewSkill("");
  };

  const removeSkill = (index) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values) => {
    setError("");
    try {
      const formData = new FormData();
      formData.append("role", values.role);
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("bio", values.bio);
      if (values.role === "freelancer") {
        formData.append("category", values.category);
      }

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      if (skills.length > 0) {
        formData.append("skills", JSON.stringify(skills));
      }

      await axios.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Qeydiyyat zamanı xəta baş verdi"
      );
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form className={style.form}>
          <div className={style.buttonGroup}>
            <button
              type="button"
              className={`${style.toggleButton} ${
                values.role === "freelancer" ? style.active : ""
              }`}
              onClick={() => {
                setFieldValue("role", "freelancer");
                setFieldValue("category", "");
              }}
            >
              Freelancer
            </button>
            <button
              type="button"
              className={`${style.toggleButton} ${
                values.role === "employer" ? style.active : ""
              }`}
              onClick={() => {
                setFieldValue("role", "employer");
                setFieldValue("category", "");
              }}
            >
              İşəgötürən
            </button>
          </div>

          <Field name="name" placeholder="Adınız" className={style.input} />
          <ErrorMessage name="name" component="div" className={style.error} />

          <Field
            name="email"
            type="email"
            placeholder="E-poçt"
            className={style.input}
          />
          <ErrorMessage name="email" component="div" className={style.error} />

          <Field
            name="password"
            type="password"
            placeholder="Şifrə"
            className={style.input}
          />
          <ErrorMessage
            name="password"
            component="div"
            className={style.error}
          />

          <Field
            as="textarea"
            name="bio"
            placeholder="Özünüz haqqında məlumat verin"
            className={style.textarea}
          />
          <ErrorMessage name="bio" component="div" className={style.error} />

          {values.role === "freelancer" && (
            <>
              <p>Kateqoriyanı seçin:</p>
              <div className={style.buttonGroup}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`${style.toggleButton} ${
                      values.category === cat ? style.active : ""
                    }`}
                    onClick={() => setFieldValue("category", cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <ErrorMessage
                name="category"
                component="div"
                className={style.error}
              />

              <div className={style.skillsSection}>
                <div className={style.skillsHeader}>
                  <label className={style.label}>Bacarıqlar:</label>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Bacarıq daxil edin"
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
                  {skills.map((skill, index) => (
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
              <img
                src={avatarPreview}
                alt="Profil şəkli"
                className={style.avatarPreview}
              />
            ) : (
              "Profil şəkli yükləyin"
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className={style.fileInput}
            />
          </label>

          <button type="submit" className={style.button}>
            Qeydiyyat
          </button>

          {error && <p className={style.error}>{error}</p>}
        </Form>
      )}
    </Formik>
  );
}
