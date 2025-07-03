import React, { useState } from "react";
import axios from "axios";
import style from "./CreateUserForAdmin.module.scss";

export default function CreateUserForAdmin({ onUserAdded }) {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "freelancer",
    category: "",
  });

  const handleAddUser = async () => {
    try {
      await axios.post("http://localhost:3000/api/auth/register", newUser, {
        withCredentials: false,
      });

      setNewUser({ name: "", email: "", password: "", role: "freelancer" });
      onUserAdded();
    } catch (err) {
      console.error("İstifadəçi əlavə edilərkən xəta baş verdi:", err.message);
    }
  };

  return (
    <div className={style.formContainer}>
      <h3>İstifadəçi əlavə et</h3>
      <input
        type="text"
        placeholder="Ad"
        value={newUser.name}
        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="E-poçt"
        value={newUser.email}
        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Şifrə"
        value={newUser.password}
        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
      />
      <select
        value={newUser.role}
        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
      >
        <option value="freelancer">Frilanser</option>
        <option value="employer">İşəgötürən</option>
      </select>
      {newUser.role === "freelancer" && (
        <select
          value={newUser.category}
          onChange={(e) => setNewUser({ ...newUser, category: e.target.value })}
        >
          <option value="">Kateqoriya seçin</option>
          <option value="web">Web Development</option>
          <option value="design">Design</option>
          <option value="writing">Writing</option>
          <option value="marketing">Marketing</option>
        </select>
      )}
      <button onClick={handleAddUser}>Yarat</button>
    </div>
  );
}
