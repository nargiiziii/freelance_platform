import React from "react";
import styles from "./Footer.module.scss";
import logo from "/images/logo_dark.png";
import { FaTwitter, FaFacebookF, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footContent}>
        <div className={styles.brand}>
          <img src={logo} alt="Remotix logo" />
          <p>Find your job here and enjoy</p>
        </div>

        <nav className={styles.nav}>
          <h3>Navigation</h3>
          <ul>
            <li><a href="#about">About Us</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </nav>

        <div className={styles.contacts}>
          <h3>Contact</h3>
          <p>
            Email: <a href="mailto:remotix@gmail.com">remotix@gmail.com</a>
          </p>
          <p>Phone: +1 (XXX) XXX-XXX</p>
          <div className={styles.socials}>
            <a href="https://twitter.com" target="_blank" rel="noreferrer"><FaTwitter /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
          </div>
        </div>
      </div>
      <div className={styles.copy}>© 2025 Remotix. All rights reserved.</div>
    </footer>
  );
};

export default Footer;
