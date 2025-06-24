import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProject } from "../../redux/features/projectSlice";
import style from "./CreateProjectPage.module.scss";
import { toast } from "react-toastify";

const CreateProjectPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [budget, setBudget] = useState("");
  const [category, setCategory] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

    const skillsArray = skillsRequired
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    dispatch(
      createProject({
        title: trimmedTitle,
        description: trimmedDescription,
        skillsRequired: skillsArray,
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

        <input
          value={skillsRequired}
          onChange={(e) => setSkillsRequired(e.target.value)}
          placeholder="Необходимые навыки (через запятую)"
        />

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
