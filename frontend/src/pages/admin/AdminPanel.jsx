import React, { useEffect, useState } from "react";
import axios from "../../axiosInstance";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import style from "./AdminPanel.module.scss";
import EditProject from "../editProject/EditProject";
import CreateUserForAdmin from "../../components/createUserForAdmin/CreateUserForAdmin";

export default function AdminPanel() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    } else {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      const [
        resStats,
        resUsers,
        resProjects,
        resProposals,
        resEscrows,
        resReviews,
      ] = await Promise.all([
        axios.get("/admin/dashboard-stats"),
        axios.get("/admin/users"),
        axios.get("/admin/projects"),
        axios.get("/admin/proposals"),
        axios.get("/admin/escrows"),
        axios.get("/admin/reviews"),
      ]);
      setStats(resStats.data);
      setUsers(resUsers.data);
      setProjects(resProjects.data);
      setProposals(resProposals.data);
      setEscrows(resEscrows.data);
      setReviews(resReviews.data);
    } catch (err) {
      console.error("Ошибка загрузки:", err.message);
    }
  };

  const handleUserAction = async (id, action) => {
    try {
      await axios.put(`/admin/${action}-user/${id}`);
      fetchAllData();
    } catch (err) {
      console.error("Ошибка:", err.message);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      await axios.delete(`/admin/${type}/${id}`);
      fetchAllData();
    } catch (err) {
      console.error(`Ошибка удаления ${type}:`, err.message);
    }
  };

  const handleEscrowAction = async (id, action) => {
    try {
      await axios.put(`/admin/escrows/${id}/${action}`);
      fetchAllData();
    } catch (err) {
      console.error("Ошибка Escrow:", err.message);
    }
  };

  const renderSidebar = () => (
    <aside className={style.sidebar}>
      <div className={style.adminInfo}>
        <div
          className={style.avatar}
          style={{
            backgroundImage: `url(http://localhost:3000/${user?.avatar})`,
          }}
        ></div>
        <div className={style.adminText}>
          <strong>Администратор</strong>
          <p className={style.status}>● онлайн</p>
        </div>
      </div>

      <nav>
        <ul>
          <li
            className={activeTab === "dashboard" ? style.active : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            📊 Dashboard
          </li>
          <li
            className={activeTab === "users" ? style.active : ""}
            onClick={() => setActiveTab("users")}
          >
            👥 Пользователи
          </li>
          <li
            className={activeTab === "projects" ? style.active : ""}
            onClick={() => setActiveTab("projects")}
          >
            📁 Проекты
          </li>
          <li
            className={activeTab === "proposals" ? style.active : ""}
            onClick={() => setActiveTab("proposals")}
          >
            📝 Отклики
          </li>
          <li
            className={activeTab === "escrows" ? style.active : ""}
            onClick={() => setActiveTab("escrows")}
          >
            💰 Escrow
          </li>
          <li
            className={activeTab === "reviews" ? style.active : ""}
            onClick={() => setActiveTab("reviews")}
          >
            ⭐ Отзывы
          </li>
        </ul>
      </nav>
    </aside>
  );

  const renderDashboard = () => (
    <div className={style.dashboardGrid}>
      <div className={`${style.card} ${style.pink}`}>
        <h3>Проекты</h3>
        <p>{stats?.projects}</p>
      </div>
      <div className={`${style.card} ${style.blue}`}>
        <h3>Пользователи</h3>
        <p>{stats?.users}</p>
      </div>
      <div className={`${style.card} ${style.green}`}>
        <h3>Отзывы</h3>
        <p>{stats?.comments}</p>
      </div>
      <div className={`${style.card} ${style.orange}`}>
        <h3>Посетители</h3>
        <p>{stats?.newVisitors}</p>
      </div>
      <div className={style.chartPlaceholder}>
        <h3>CPU Usage</h3>
        <div className={style.fakeChart}></div>
      </div>
    </div>
  );

  const renderTable = (columns, data) => (
    <table className={style.table}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>{data}</tbody>
    </table>
  );

  const renderContent = () => {
    if (activeTab === "dashboard") return renderDashboard();

    if (activeTab === "users")
      return (
        <>
          <button
            className={style.addButton}
            onClick={() => setModalOpen(true)}
          >
            ➕ Добавить нового пользователя
          </button>

          {modalOpen && (
            <div className={style.modalOverlay}>
              <div className={style.modalContent}>
                <CreateUserForAdmin
                  onUserAdded={() => {
                    fetchAllData();
                    setModalOpen(false);
                  }}
                />
                <button
                  className={style.closeButton}
                  onClick={() => setModalOpen(false)}
                >
                  ✖
                </button>
              </div>
            </div>
          )}
          {renderTable(
            ["Имя", "Email", "Роль", "Статус", "Действия"],
            users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.isBlocked ? "Заблокирован" : "Активен"}</td>
                <td>
                  <button
                    onClick={() =>
                      handleUserAction(u._id, u.isBlocked ? "unblock" : "block")
                    }
                  >
                    {u.isBlocked ? "Разблокировать" : "Заблокировать"}
                  </button>
                  <button onClick={() => handleDelete("delete-user", u._id)}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))
          )}
        </>
      );

    if (activeTab === "projects")
      return (
        <>
          {renderTable(
            ["Название", "Статус", "Бюджет", "Категория", "Действия"],
            projects.map((p) => (
              <tr key={p._id}>
                <td>{p.title}</td>
                <td>{p.status}</td>
                <td>{p.budget}$</td>
                <td>{p.category}</td>
                <td>
                  <button onClick={() => setEditingProject(p)}>
                    ✏️ Редактировать
                  </button>
                  <button onClick={() => handleDelete("projects", p._id)}>
                    🗑️ Удалить
                  </button>
                </td>
              </tr>
            ))
          )}
          {editingProject && (
            <EditProject
              project={editingProject}
              fromAdmin={true}
              onClose={() => {
                setEditingProject(null);
                fetchAllData();
              }}
            />
          )}
        </>
      );

    if (activeTab === "proposals")
      return renderTable(
        ["Цена", "Статус", "Сообщение", "Удалить"],
        proposals.map((p) => (
          <tr key={p._id}>
            <td>{p.price}$</td>
            <td>{p.status}</td>
            <td>{p.coverLetter?.slice(0, 50)}...</td>
            <td>
              <button onClick={() => handleDelete("proposals", p._id)}>
                Удалить
              </button>
            </td>
          </tr>
        ))
      );

    if (activeTab === "escrows")
      return (
        <div className={style.escrowGrid}>
          {escrows.map((e) => (
            <div key={e._id} className={style.escrowCard}>
              <h3>Проект: {e.project?.title || "—"}</h3>
              <p>
                <strong>Фрилансер:</strong> {e.freelancer?.name || "—"} (
                {e.freelancer?.email})
              </p>
              <p>
                <strong>Наниматель:</strong> {e.employer?.name || "—"} (
                {e.employer?.email})
              </p>
              <p>
                <strong>Сумма:</strong> {e.amount}$
              </p>
              <p>
                <strong>Статус:</strong> {e.status}
              </p>
              <div className={style.actions}>
                <button onClick={() => handleEscrowAction(e._id, "release")}>
                  💸 Выплатить
                </button>
                <button onClick={() => handleEscrowAction(e._id, "refund")}>
                  ↩️ Вернуть
                </button>
              </div>
            </div>
          ))}
        </div>
      );

    if (activeTab === "reviews")
      return renderTable(
        ["Оценка", "Комментарий", "Удалить"],
        reviews.map((r) => (
          <tr key={r._id}>
            <td>{r.rating}⭐</td>
            <td>{r.comment}</td>
            <td>
              <button onClick={() => handleDelete("reviews", r._id)}>
                Удалить
              </button>
            </td>
          </tr>
        ))
      );
  };

  return (
    <div className={style.wrapper}>
      {renderSidebar()}
      <main className={style.main}>{renderContent()}</main>
    </div>
  );
}
