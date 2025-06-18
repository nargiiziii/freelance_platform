// src/pages/CreateProjectPage.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProject } from "../../redux/features/projectSlice";
import style from "./CreateProjectPage.module.scss";

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
        alert("Ошибка при создании проекта: " + err);
      });
  };

  return (
    <div className={style.modal}>
      <form onSubmit={handleSubmit}>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Выберите категорию</option>
          <option value="Web Development">Web Development</option>
          <option value="Design">Design</option>
          <option value="Writing">Writing</option>
          <option value="Marketing">Marketing</option>
        </select>

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
        <button type="button" onClick={() => navigate("/dashboard")}>
          Отмена
        </button>
      </form>
    </div>
  );
};

export default CreateProjectPage;
