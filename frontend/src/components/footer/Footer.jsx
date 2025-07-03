import React from "react";
import styles from "./Footer.module.scss";
import logo from "/images/logo_dark.png";
import { FaTwitter, FaFacebookF, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footContent}>
        <div className={styles.brand}>
          <img src={logo} alt="Remotix loqosu" />
          <p>İşinizi burada tapın və zövq alın</p>
        </div>

        <nav className={styles.nav}>
          <h3>Naviqasiya</h3>
          <ul>
            <li><a href="#about">Haqqımızda</a></li>
            <li><a href="#faq">Tez-tez verilən suallar</a></li>
          </ul>
        </nav>

        <div className={styles.contacts}>
          <h3>Əlaqə</h3>
          <p>
            E-poçt: <a href="mailto:remotix@gmail.com">remotix@gmail.com</a>
          </p>
          <p>Telefon: +1 (XXX) XXX-XXX</p>
          <div className={styles.socials}>
            <a href="https://twitter.com" target="_blank" rel="noreferrer"><FaTwitter /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
          </div>
        </div>
      </div>
      <div className={styles.copy}>© 2025 Remotix. Bütün hüquqlar qorunur.</div>
    </footer>
  );
};

export default Footer;
