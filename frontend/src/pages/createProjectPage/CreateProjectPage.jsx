// src/pages/CreateProjectPage.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProject } from "../../redux/features/projectSlice";
import style from "./CreateProjectPage.module.scss"

const CreateProjectPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [budget, setBudget] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const parsedBudget = Number(budget);

    if (!trimmedTitle || !trimmedDescription || isNaN(parsedBudget) || parsedBudget <= 0) {
      alert("Пожалуйста, заполните все поля корректно. Бюджет должен быть положительным числом.");
      return;
    }

    const skillsArray = skillsRequired
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    dispatch(createProject({
      title: trimmedTitle,
      description: trimmedDescription,
      skillsRequired: skillsArray,
      budget: parsedBudget,
    }))
      .unwrap()
      .then(() => {
        navigate("/dashboard"); // или /dashboard?section=projects
      })
      .catch((err) => {
        alert("Ошибка при создании проекта: " + err);
      });
  };

  return (
    <div className={style.modal}>
      <form onSubmit={handleSubmit}>
        <h3>Новое задание</h3>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание"
          required
        />
        <input
          value={skillsRequired}
          onChange={(e) => setSkillsRequired(e.target.value)}
          placeholder="Навыки (через запятую)"
        />
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Бюджет"
          required
        />
        <button type="submit">Создать</button>
        <button type="button" onClick={() => navigate("/dashboard")}>Отмена</button>
      </form>
    </div>
  );
};

export default CreateProjectPage;
