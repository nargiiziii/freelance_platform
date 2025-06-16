import React, { useEffect, useState } from "react";
import style from "./FreelancersList.module.scss";
import { Link } from "react-router-dom";

const FreelancersList = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/users/freelancers/all")
      .then((res) => res.json())
      .then((data) => {
        setFreelancers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Загрузка фрилансеров...</p>;

  return (
    <div className={style.freelancerList}>
      <h2>Список фрилансеров</h2>
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
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <p>{user.bio}</p>
              {/* 💬 Кнопка для перехода в чат с фрилансером */}
              <Link to={`/chatRoom/${user._id}`}>
                <button>Отправить сообщение</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreelancersList;
