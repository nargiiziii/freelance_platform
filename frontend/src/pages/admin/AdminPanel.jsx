import React, { useEffect, useState } from "react";
import axios from "../../axiosInstance";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/"); // 🚫 Защита от доступа
    } else {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const resStats = await axios.get("/api/admin/dashboard-stats", { withCredentials: true });
      const resUsers = await axios.get("/api/admin/users", { withCredentials: true });
      setStats(resStats.data);
      setUsers(resUsers.data);
    } catch (err) {
      console.error("Ошибка при получении данных:", err.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Админ-Панель</h2>

      {stats && (
        <ul>
          <li>Всего пользователей: {stats.users}</li>
          <li>Фрилансеров: {stats.freelancers}</li>
          <li>Нанимателей: {stats.employers}</li>
          <li>Проектов: {stats.projects}</li>
          <li>Escrow-сделок: {stats.escrows}</li>
          <li>Завершённых проектов: {stats.completedProjects}</li>
        </ul>
      )}

      <h3>Пользователи</h3>
      <table>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isBlocked ? "Заблокирован" : "Активен"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
