import React, { useState, useEffect } from "react";
import style from "./AddProjectModal.module.scss";

const AddProjectModal = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [budget, setBudget] = useState("");

  // Сбросить поля при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setSkillsRequired("");
      setBudget("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      .filter(Boolean); // убираем пустые строки

    onSubmit({
      title: trimmedTitle,
      description: trimmedDescription,
      skillsRequired: skillsArray,
      budget: parsedBudget,
    });

    onClose();
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
        <button type="button" onClick={onClose}>Отмена</button>
      </form>
    </div>
  );
};

export default AddProjectModal;
