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
        "Пожалуйста, заполните все поля корректно. Бюджет должен быть положительным числом, и выберите категорию."
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
        const message =
          err?.response?.data?.message || "Your balance is empty!";
        toast.error(message);
      });
  };

  return (
    <div className={style.modal}>
      <form onSubmit={handleSubmit}>
        <h3>Новое задание</h3>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название проекта"
          required
        />

        <h4 className={style.subTitle}>Выберите категорию</h4>
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
          placeholder="Описание проекта"
          required
        />

        <div className={style.skillsSection}>
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Добавить навык"
          />
          <button type="button" onClick={addSkill}>
            +
          </button>

          <div className={style.skillsList}>
            {skillsRequired.map((skill, idx) => (
              <span key={idx} className={style.skillItem}>
                {skill}
                <button type="button" onClick={() => removeSkill(skill)}>✕</button>
              </span>
            ))}
          </div>
        </div>

        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Бюджет в USD"
          required
        />

        <div className={style.buttonGroup}>
          <button type="submit">Создать</button>
          <button type="button" onClick={() => navigate("/my-jobs")}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectPage;
