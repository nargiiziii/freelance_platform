import React from "react";
import { Link } from "react-router-dom";
import style from "./Navlist.module.scss";
const Navlist = () => {
  return (
    <ul>
      <li>
        <Link to={"/"}>HOME</Link>
      </li>
      <li>
        <Link to={"/login"}>lOGIN</Link>
      </li>
      <li>
        <button>
          <Link to={"/register"}>SIGN UP</Link>
        </button>
      </li>
    </ul>
  );
};

export default Navlist;
