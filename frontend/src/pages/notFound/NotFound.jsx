import React, { useContext } from "react";
import { Link } from "react-router-dom";
import style from "./NotFound.module.scss";
import { ThemeContext } from "../../context/ThemeContext";

const NotFound = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className={`${style.notFound} ${darkMode ? style.dark : ""}`}>
      <div className={style.content}>
        <h1>404</h1>
        <p>Üzr istəyirik, belə bir səhifə mövcud deyil.</p>

        {/* 🎬 Локальная гифка из public/images */}
        <div className={style.gifWrapper}>
          <img
            src="\images\bobawooyo-dog-confused.gif"
            alt="Confused Dog"
          />
        </div>

        <Link to="/" className={style.homeBtn}>
          Ana səhifəyə qayıt
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
