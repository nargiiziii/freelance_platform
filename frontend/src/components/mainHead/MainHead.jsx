import React from "react";
import { Link } from "react-router-dom";
import style from "./MainHead.module.scss";

const MainHead = () => {
  // Пример простой проверки: залогинен ли пользователь
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className={style.mainHead}>
      <div>
        <h2>Hire Top Freelancers & Pay Safely with Escrow</h2>
        <p>
          Find trusted freelancers or clients and make safe payments with our
          built-in escrow system.
        </p>

        {isLoggedIn ? (
          <button>
            <Link to="/dashboard" className={style.button}>
              Go to Dashboard
            </Link>
          </button>
        ) : (
          <button>
            <Link to="/register" className={style.button}>
              Get Started
            </Link>
          </button>
        )}
      </div>
      <img src="/images/working_woman.png" alt="Working Woman" />
    </div>
  );
};

export default MainHead;
