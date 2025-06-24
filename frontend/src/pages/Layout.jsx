import React, { useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchChats } from "../redux/features/messageSlice";
import { getProfile } from "../redux/features/authSlice"; // 👈 импорт профиля
import Footer from "../components/footer/Footer";
import "../index.scss";

const Layout = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  // 👇 Загрузка профиля при старте, если не загружен
  useEffect(() => {
    if (!user) {
      dispatch(getProfile());
    }
  }, [dispatch, user]);

  // Загрузка чатов после получения профиля
  useEffect(() => {
    if (user) {
      dispatch(fetchChats());
    }
  }, [dispatch, user]);

  const hiddenRoutes = [
    "/chat",
    "/create-project",
    "/edit-profile",
    "/edit-project",
    "/messages",
    "/login",
    "/register",
  ];

  const hideFooter = hiddenRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;
