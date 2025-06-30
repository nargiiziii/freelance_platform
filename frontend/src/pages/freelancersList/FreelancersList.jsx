import React, { useEffect, useState } from "react";
import style from "./FreelancersList.module.scss";
import { Link } from "react-router-dom";

const categories = ["Все", "Web Development", "Design", "Writing", "Marketing"];

const FreelancersList = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState(["Все"]);

  const fetchFreelancers = (categories = []) => {
    setLoading(true);
    const query =
      categories.includes("Все") || categories.length === 0
        ? ""
        : `?category=${encodeURIComponent(categories.join(","))}`;
    fetch(`http://localhost:3000/api/users/freelancers/all${query}`)
      .then((res) => res.json())
      .then((data) => {
        setFreelancers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchFreelancers(selectedCategories);
  }, []);

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;

    if (value === "Все") {
      if (checked) {
        setSelectedCategories(["Все"]);
        fetchFreelancers(["Все"]);
      } else {
        setSelectedCategories([]);
        fetchFreelancers([]);
      }
      return;
    }

    let updatedCategories = checked
      ? [...selectedCategories.filter((c) => c !== "Все"), value]
      : selectedCategories.filter((cat) => cat !== value);

    if (updatedCategories.length === 0) {
      updatedCategories = ["Все"];
    }

    setSelectedCategories(updatedCategories);
    fetchFreelancers(updatedCategories);
  };

  if (loading) return <p className={style.loading}>Загрузка фрилансеров...</p>;

  return (
    <div className={style.freelancerList}>
      <h2>Список фрилансеров</h2>

      <div className={style.layout}>
        <div className={style.sidebar}>
          <div className={style.checkboxGroup}>
            {categories.map((cat) => (
              <label key={cat} className={style.checkboxLabel}>
                <input
                  type="checkbox"
                  value={cat}
                  checked={selectedCategories.includes(cat)}
                  onChange={handleCategoryChange}
                />
                {cat}
              </label>
            ))}
          </div>
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

                  {user.skills?.length > 0 && (
                    <div className={style.skills}>
                      {user.skills.map((skill, i) => (
                        <span key={i} className={style.skill}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {user.portfolio?.length > 0 && (
                    <div className={style.portfolio}>
                      <strong>Портфолио:</strong>
                      <div className={style.portfolioGallery}>
                        {user.portfolio.map((item, i) => (
                          <div key={i} className={style.portfolioItem}>
                            {item.link ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={
                                    item.image
                                      ? `http://localhost:3000/uploads/${item.image}`
                                      : "/default-portfolio.jpg"
                                  }
                                />
                                <div className={style.title}>
                                  {item.title || "Проект"}
                                </div>
                              </a>
                            ) : (
                              <div className={style.noLink}>
                                <img
                                  src={`http://localhost:3000/${item.image}`}
                                  alt={item.title || "Проект"}
                                />
                                <div className={style.title}>{item.title}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
    </div>
  );
};

export default FreelancersList;
