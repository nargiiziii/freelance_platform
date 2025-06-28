import React, { useState } from "react";
import axios from "axios"; // ✅ используем обычный axios, а не axiosInstance
import style from "./CreateUserForAdmin.module.scss";

export default function CreateUserForAdmin({ onUserAdded }) {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "freelancer",
  });

  const handleAddUser = async () => {
    try {
      await axios.post("http://localhost:3000/api/auth/register", newUser, {
        withCredentials: false, // ❗ не устанавливаем токен нового пользователя
      });

      setNewUser({ name: "", email: "", password: "", role: "freelancer" });
      onUserAdded(); // обновляем список пользователей
    } catch (err) {
      console.error("Ошибка при добавлении пользователя:", err.message);
    }
  };

  return (
    <div className={style.formContainer}>
      <h3>Добавить пользователя</h3>
      <input
        type="text"
        placeholder="Имя"
        value={newUser.name}
        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={newUser.email}
        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Пароль"
        value={newUser.password}
        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
      />
      <select
        value={newUser.role}
        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
      >
        <option value="freelancer">Фрилансер</option>
        <option value="employer">Наниматель</option>
      </select>
      <button onClick={handleAddUser}>Создать</button>
    </div>
  );
}
