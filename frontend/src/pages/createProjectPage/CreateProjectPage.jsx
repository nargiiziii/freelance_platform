import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProject } from "../../redux/features/projectSlice";
import style from "./CreateProjectPage.module.scss";
import { toast } from "react-toastify";

const CreateProjectPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skillsRequired, setSkillsRequired] = useState([]);
  const [budget, setBudget] = useState("");
  const [category, setCategory] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skillsRequired.includes(skill)) {
      setSkillsRequired((prev) => [...prev, skill]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkillsRequired((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const parsedBudget = Number(budget);

    if (
      !trimmedTitle ||
      !trimmedDescription ||
      isNaN(parsedBudget) ||
      parsedBudget <= 0 ||
      !category
    ) {
      alert(
        "Zəhmət olmasa bütün sahələri düzgün doldurun. Büdcə müsbət ədəd olmalıdır və kateqoriya seçilməlidir."
      );
      return;
    }

    dispatch(
      createProject({
        title: trimmedTitle,
        description: trimmedDescription,
        skillsRequired,
        budget: parsedBudget,
        category,
      })
    )
      .unwrap()
      .then(() => {
        navigate("/dashboard");
      })
      .catch((err) => {
        const message = err?.response?.data?.message || "Balansınız boşdur!";
        toast.error(message);
      });
  };

  return (
    <div className={style.modal}>
      <form onSubmit={handleSubmit}>
        <h3>Yeni layihə</h3>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Layihənin adı"
          required
        />

        <h4 className={style.subTitle}>Kateqoriya seçin</h4>
        <div className={style.categoryButtons}>
          {["Web Development", "Design", "Writing", "Marketing"].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${style.categoryBtn} ${
                category === cat ? style.active : ""
              }`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Layihənin təsviri"
          required
        />

        <div className={style.skillsSection}>
          <div className={style.inputSec}>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Bacarıq əlavə et"
            />
            <button type="button" className={style.addBtn} onClick={addSkill}>
              +
            </button>
          </div>

          <div className={style.skillsList}>
            {skillsRequired.map((skill, idx) => (
              <span key={idx} className={style.skillItem}>
                {skill}
                <button type="button" onClick={() => removeSkill(skill)}>
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Büdcə (USD)"
          required
        />

        <div className={style.buttonGroup}>
          <button type="submit">Yarat</button>
          <button type="button" onClick={() => navigate("/my-jobs")}>
            Ləğv et
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectPage;
