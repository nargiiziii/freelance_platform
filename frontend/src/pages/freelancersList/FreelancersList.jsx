import React, { useEffect, useState } from "react";
import style from "./FreelancersList.module.scss";
import { Link } from "react-router-dom";

const FreelancersList = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchFreelancers = (category = "") => {
    setLoading(true);
    fetch(
      `http://localhost:3000/api/users/freelancers/all${
        category ? `?category=${encodeURIComponent(category)}` : ""
      }`
    )
      .then((res) => res.json())
      .then((data) => {
        setFreelancers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setSelectedCategory(selected);
    fetchFreelancers(selected);
  };

  if (loading) return <p className={style.loading}>Загрузка фрилансеров...</p>;

  return (
    <div className={style.freelancerList}>
      <h2>Список фрилансеров</h2>

      <div className={style.topBar}>
        <select
          className={style.select}
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="">Все категории</option>
          <option value="Web Development">Web Development</option>
          <option value="Design">Design</option>
          <option value="Writing">Writing</option>
          <option value="Marketing">Marketing</option>
        </select>
      </div>

      <div className={style.cards}>
        {freelancers.map((user) => (
          <div key={user._id} className={style.card}>
            <div className={style.avatar}>
              {user.avatar ? (
                <img
                  src={`http://localhost:3000/${user.avatar}`}
                  alt="avatar"
                />
              ) : (
                <span>{user.name?.[0]}</span>
              )}
            </div>
            <div className={style.info}>
              <div className={style.details}>
                <h3 className={style.name}>{user.name}</h3>
                {user.category && (
                  <p className={style.category}>{user.category}</p>
                )}
                <p className={style.email}>{user.email}</p>
              </div>
              <div className={style.action}>
                <Link to={`/messages?user=${user._id}`}>
                  <button className={style.button}>Отправить сообщение</button>
                </Link>
                <Link to={`/freelancers/${user._id}`}>
                  <button className={style.button}>Посмотреть профиль</button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreelancersList;
