import React, { useState, useEffect } from "react";
import Logo from "../logo/Logo";
import Navlist from "../navlist/Navlist";
import style from "./Navbar.module.scss";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  // 👉 Закрытие сайдбара при расширении экрана
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 767 && isOpen) {
        setIsOpen(false);
        setIsClosing(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  return (
    <div className={style.navbar}>
      <Logo />

      <div className={style.nav_right}>
        <Navlist />
      </div>

      {!isOpen && (
        <div className={style.burger} onClick={() => setIsOpen(true)}>
          <GiHamburgerMenu size={24} />
        </div>
      )}

      {isOpen && (
        <>
          <div
            className={style.sidebarOverlay}
            onClick={handleClose}
          />
          <div className={`${style.sidebar} ${isClosing ? style.closing : ""}`}>
            <button className={style.closeBtn} onClick={handleClose}>
              <IoMdClose size={30} />
            </button>
            <div className={style.sidebarContent}>
              <Navlist onClick={handleClose} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;
