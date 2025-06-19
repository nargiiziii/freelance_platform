import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../redux/features/authSlice";
import style from "./Navlist.module.scss";

const Navlist = () => {
  const user = useSelector((state) => state.auth.user);
  const chats = useSelector((state) => state.messages.chats);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  const getDashboardPath = () => {
    if (user?.role === "freelancer") return "/freelancer-dash";
    if (user?.role === "employer") return "/employee-dash";
    return "/";
  };

  // Подсчёт общего количества непрочитанных сообщений
  const totalUnread = chats?.reduce((acc, chat) => {
    return acc + (chat.unreadCount || 0);
  }, 0);

  return (
    <ul className={style.ul}>
      <li className={style.li}>
        <Link to="/">HOME</Link>
      </li>

      {!user && (
        <>
          <li className={style.li}>
            <Link to="/login">LOGIN</Link>
          </li>
          <li className={style.li}>
            <Link to="/register">
              <button className={style.button}>SIGN UP</button>
            </Link>
          </li>
        </>
      )}

      {user && user.role === "freelancer" && (
        <>
          <li className={style.li}>
            <Link to="/jobs">Jobs</Link>
          </li>
          <li className={style.li}>
            <Link to="/my-proposals">My Proposals</Link>
          </li>
          <li className={style.li}>
            <Link to="/freelancer/projects">My Projects</Link>
          </li>
          <li className={style.li} style={{ position: "relative" }}>
            <Link to="/messages">
              Messages
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
            <Link to="/escrow">Escrow</Link>
          </li>
        </>
      )}

      {user && user.role === "employer" && (
        <>
          <li className={style.li}>
            <Link to="/create-project">Post a Job</Link>
          </li>
          <li className={style.li}>
            <Link to="/my-jobs">My Jobs</Link>
          </li>
          <li className={style.li} style={{ position: "relative" }}>
            <Link to="/messages">
              Messages
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
            <Link to="/freelancers">Find Freelancers</Link>
          </li>
          <li className={style.li}>
            <Link to="/escrow">Escrow</Link>
          </li>
        </>
      )}

      {user && (
        <>
          <li className={style.li}>
            <Link to={getDashboardPath()} className={style.profileLink}>
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
              Logout
            </button>
          </li>
        </>
      )}
    </ul>
  );
};

export default Navlist;
