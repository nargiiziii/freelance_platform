import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../redux/features/authSlice";
import style from "./Navlist.module.scss";
import NotificationDropdown from "../notificationDropdown/NotificationDropdown";
import { ThemeContext } from "../../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";

const Navlist = ({ onClick }) => {
  const user = useSelector((state) => state.auth.user);
  const chats = useSelector((state) => state.messages.chats);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
    if (onClick) onClick();
  };

  const getDashboardPath = () => {
    if (user?.role === "freelancer") return "/freelancer-dash";
    if (user?.role === "employer") return "/employee-dash";
    return "/";
  };

  const totalUnread = chats?.reduce((acc, chat) => {
    return acc + (chat.unreadCount || 0);
  }, 0);

  return (
    <ul className={style.ul}>
      <li className={style.li}>
        <Link to="/" onClick={onClick}>
          ANA SƏHİFƏ
        </Link>
      </li>

      {!user && (
        <>
          <li className={style.li}>
            <Link to="/login" onClick={onClick}>
              GİRİŞ
            </Link>
          </li>
          <li className={style.li}>
            <Link to="/register" onClick={onClick}>
              <button className={style.button}>QEYDİYYAT</button>
            </Link>
          </li>
        </>
      )}

      {user && user.role === "freelancer" && (
        <>
          <li className={style.li}>
            <Link to="/jobs" onClick={onClick}>
              ELANLAR
            </Link>
          </li>
          <li className={style.li}>
            <Link to="/my-proposals" onClick={onClick}>
              TƏKLİFLƏRİM
            </Link>
          </li>
          <li className={style.li} style={{ position: "relative" }}>
            <Link to="/messages" onClick={onClick}>
              MESAJLAR
              {totalUnread > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-10px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "12px",
                  }}
                >
                  {totalUnread}
                </span>
              )}
            </Link>
          </li>
          <li className={style.li}>
            <Link to="/escrow" onClick={onClick}>
              ESCROW
            </Link>
          </li>
        </>
      )}

      {user && user.role === "employer" && (
        <>
          <li className={style.li}>
            <Link to="/create-project" onClick={onClick}>
              İŞ YERLƏŞDİR
            </Link>
          </li>
          <li className={style.li}>
            <Link to="/my-jobs" onClick={onClick}>
              ELANLARIM
            </Link>
          </li>
          <li className={style.li} style={{ position: "relative" }}>
            <Link to="/messages" onClick={onClick}>
              MESAJLAR
              {totalUnread > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-10px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "12px",
                  }}
                >
                  {totalUnread}
                </span>
              )}
            </Link>
          </li>
          <li className={style.li}>
            <Link to="/freelancers" onClick={onClick}>
              FRELANSER AXTAR
            </Link>
          </li>
          <li className={style.li}>
            <Link to="/escrow" onClick={onClick}>
              ESCROW
            </Link>
          </li>
        </>
      )}

      {user && (
        <>
          <li className={style.li}>
            <NotificationDropdown role={user.role} />
          </li>

          <li className={style.li}>
            <Link
              to={getDashboardPath()}
              className={style.profileLink}
              onClick={onClick}
            >
              {user.avatar ? (
                <img
                  src={`http://localhost:3000/${user.avatar}`}
                  alt="Avatar"
                  className={style.avatar}
                />
              ) : (
                <div className={style.avatarPlaceholder}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </Link>
          </li>

          <li className={style.li}>
            <button className={style.button} onClick={handleLogout}>
              ÇIXIŞ
            </button>
          </li>
        </>
      )}

      <li className={style.li}>
        <button
          onClick={() => {
            setDarkMode((prev) => !prev);
            if (onClick) onClick();
          }}
          className={style.themeButton}
          title="Rejimi dəyiş"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </li>
    </ul>
  );
};

export default Navlist;
