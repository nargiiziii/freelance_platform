import React from "react";
import { Link } from "react-router-dom";
import style from "./MainHead.module.scss";

const MainHead = () => {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className={style.mainHead}>
      <div>
        <h2>Ən Yaxşı Freelancerləri İşə Götür və Ödənişləri Təhlükəsiz Et</h2>
        <p>
          Etibarlı freelancer və ya müştəri tapın, daxili escrow sistemi ilə təhlükəsiz ödənişlər edin.
        </p>

        {isLoggedIn ? (
          <button>
            <Link to="/dashboard" className={style.button}>
              İdarəetmə Panelinə Keç
            </Link>
          </button>
        ) : (
          <button>
            <Link to="/register" className={style.button}>
              Başla
            </Link>
          </button>
        )}
      </div>
      <img src="/images/working_woman.png" alt="İşləyən Qadın" />
    </div>
  );
};

export default MainHead;
