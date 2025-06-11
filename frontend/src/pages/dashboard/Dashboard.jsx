import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import style from "./Dashboard.module.scss";
import { CircularProgress, Box, Typography } from "@mui/material";
import AddPortfolioModal from "../../components/addPortfolioModal/AddPortfolioModal";

function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [portfolio, setPortfolio] = useState([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleProjectAdded = (updatedUser) => {
    setPortfolio(updatedUser.portfolio || []); 
  };

  
useEffect(() => {
  const fetchUserData = async () => {
    try {
      if (!user || !user.id) return;
      const response = await fetch(`http://localhost:3000/api/users/${user.id}`);
      if (!response.ok) throw new Error("Ошибка при загрузке данных");
      const userData = await response.json();
      setData(userData);
      setPortfolio(userData.portfolio || []);
      if (userData.role === "freelancer") {
        setActiveSection("Профиль");
      } else if (userData.role === "employer") {
        setActiveSection("Размещение задания");
      }
    } catch (error) {
      console.error("Ошибка при получении данных пользователя:", error);
    }
  };

  fetchUserData();
}, [user]);
console.log("User from Redux:", user);


  if (!data) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        mt={8}
      >
        <CircularProgress color="secondary" />
        <Typography variant="h6" mt={2} color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  const handleEditProfile = () => {
    navigate(`/edit-profile`);
  };

  const freelancerSections = ["Профиль", "Портфолио", "Отзывы", "Баланс"];
  const employerSections = [
    "Размещение задания",
    "Статистика проектов",
    "Отзывы",
  ];

  const sections =
    data.role === "freelancer"
      ? freelancerSections
      : data.role === "employer"
      ? employerSections
      : [];

  return (
    <>
      <h2 className={style.title}>Dashboard</h2>

      <div className={style.dashboard}>
        <div className={style.profile}>
          {data.avatar ? (
            <img
              className={style.avatar}
              src={`http://localhost:3000/${data.avatar}`}
              alt="Avatar"
            />
          ) : (
            <div className={style.avatarPlaceholder}>
              {data.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}

          <div className={style.info}>
            <p className={style.name}>{data.name}</p>
            <p className={style.role}>{data.role}</p>
            <p className={style.balance}>
              <strong>Balance:</strong> {data.balance?.toLocaleString("ru-RU") || 0}₽
            </p>
            <button onClick={handleEditProfile} className={style.editButton}>
              Edit Profile
            </button>
          </div>
        </div>

        {(data.role === "freelancer" || data.role === "employer") && (
          <div className={style.freelancerContent}>
            <aside className={style.sidebar}>
              <ul>
                {sections.map((section) => (
                  <li
                    key={section}
                    className={
                      activeSection === section ? style.activeSection : ""
                    }
                    onClick={() => setActiveSection(section)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setActiveSection(section);
                      }
                    }}
                  >
                    {section}
                  </li>
                ))}
              </ul>
            </aside>

            <main className={style.sectionContent}>
              {data.role === "freelancer" && activeSection === "Профиль" && (
                <section className={style.section}>
                  <h3>Профиль</h3>
                  <p>
                    <strong>Bio:</strong> {data.bio || "Нет описания"}
                  </p>
                  <p>
                    <strong>Skills:</strong>{" "}
                    {data.skills?.length
                      ? data.skills.join(", ")
                      : "Нет навыков"}
                  </p>
                  <p>
                    <strong>Статус:</strong>{" "}
                    {data.isAvailable ? "Доступен" : "Не доступен"}
                  </p>
                  <p>
                    <strong>Выполнено проектов:</strong>{" "}
                    {data.completedProjectsCount || 0}
                  </p>
                </section>
              )}

              {data.role === "freelancer" && activeSection === "Портфолио" && (
                <section className={style.section}>
                  <h3>Портфолио</h3>
                  <button className={style.addProjectButton} onClick={openModal}>
                    + Добавить проект
                  </button>

                  {Array.isArray(portfolio) && portfolio.length > 0 ? (
                    <div className={style.portfolioGrid}>
                      {portfolio.map((item, i) => {
                        if (!item) return null; // <-- Проверяем, что item определён
                        return (
                          <div key={item._id || i} className={style.portfolioItem}>
                            <img
                              src={
                                item.image
                                  ? `http://localhost:3000/uploads/${item.image}`
                                  : "https://via.placeholder.com/200x150"
                              }
                              alt={item.title || "Project image"}
                              className={style.portfolioImage}
                            />
                            <div>
                              <strong>{item.title}</strong>
                              <p>{item.description}</p>
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Смотреть
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p>Портфолио отсутствует</p>
                  )}

                  {/* Логируем userId, который передаём в AddPortfolioModal */}
                  {/* {console.log("data:", data)} */}

                  <AddPortfolioModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onProjectAdded={handleProjectAdded}
                    userId={data._id}
                  />
                </section>
              )}

              {data.role === "freelancer" && activeSection === "Отзывы" && (
                <section className={style.section}>
                  <h3>Отзывы</h3>
                  {data.reviews?.length ? (
                    <ul>
                      {data.reviews.map((review, i) => (
                        <li key={review.id || i}>
                          <strong>{review.authorName || "Аноним"}:</strong>{" "}
                          {review.comment} — Оценка: ⭐ {review.rating}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Отзывы отсутствуют</p>
                  )}
                </section>
              )}

              {data.role === "freelancer" && activeSection === "Баланс" && (
                <section className={style.section}>
                  <h3>Баланс и статистика</h3>
                  <p>Текущий баланс: {data.balance?.toLocaleString("ru-RU") || 0}₽</p>
                  <p>Выполнено заказов: {data.completedProjectsCount || 0}</p>
                  <p>Средняя оценка: ⭐ {data.rating?.toFixed(1) || "—"}</p>
                </section>
              )}

              {data.role === "employer" && activeSection === "Размещение задания" && (
                <section className={style.section}>
                  <h3>Размещение задания</h3>
                  <button
                    onClick={() =>
                      alert("Добавить логику создания нового задания")
                    }
                  >
                    + Новое задание
                  </button>
                </section>
              )}

              {data.role === "employer" && activeSection === "Статистика проектов" && (
                <section className={style.section}>
                  <h3>Статистика проектов</h3>
                  <p>Размещено проектов: {data.postedProjectsCount || 0}</p>
                </section>
              )}

              {data.role === "employer" && activeSection === "Отзывы" && (
                <section className={style.section}>
                  <h3>Отзывы</h3>
                  {data.reviews?.length ? (
                    <ul>
                      {data.reviews.map((review, i) => (
                        <li key={review.id || i}>
                          <strong>{review.authorName || "Аноним"}:</strong>{" "}
                          {review.comment} — Оценка: ⭐ {review.rating}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Отзывы отсутствуют</p>
                  )}
                </section>
              )}
            </main>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
