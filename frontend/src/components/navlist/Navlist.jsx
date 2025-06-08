import React from "react";
import { Link } from "react-router-dom";
import style from "./Navlist.module.scss";
const Navlist = () => {
  return (
    <ul className={style.ul}>
  <li className={style.li}>
    <Link to={"/"}>HOME</Link>
  </li>
  <li className={style.li}>
    <Link to={"/login"}>LOGIN</Link>
  </li>
  <li className={style.li}>
    <button className={style.button}>
      <Link to={"/register"}>SIGN UP</Link>
    </button>
  </li>
</ul>

  );
};

export default Navlist;
