import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/features/authSlice";
import style from "./Navlist.module.scss";

const Navlist = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const getDashboardPath = () => {
    if (user?.role === "freelancer") return "/dashboard";
    if (user?.role === "employer") return "/dashboard";
    return "/";
  };

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
            <Link to="/freelancer/proposals">My Proposals</Link>
          </li>
          <li className={style.li}>
            <Link to="/freelancer/projects">My Projects</Link>
          </li>
          <li className={style.li}>
            <Link to="/messages">Messages</Link>
          </li>
        </>
      )}

      {user && user.role === "employer" && (
        <>
          <li className={style.li}>
            <Link to="/post-job">Post a Job</Link>
          </li>
          <li className={style.li}>
            <Link to="/employer/jobs">My Jobs</Link>
          </li>
          <li className={style.li}>
            <Link to="/messages">Messages</Link>
          </li>
          <li className={style.li}>
            <Link to="/freelancers">Find Freelancers</Link>
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
