import React from "react";
import { Link } from "react-router-dom";
import Logo from "../logo/Logo";
import Navlist from "../navlist/Navlist";
import style from "./Navbar.module.scss";
import { GiHamburgerMenu } from "react-icons/gi";

const Navbar = () => {
  return (
    <div className={style.navbar}>
      <Logo />
      <div className={style.nav_right}>
        <Navlist />
      </div>

      <div className={style.burger}>
        <GiHamburgerMenu size={24} />
      </div>
    </div>
  );
};

export default Navbar;
