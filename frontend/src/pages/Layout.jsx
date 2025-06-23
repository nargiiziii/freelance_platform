import React, { useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchChats } from "../redux/features/messageSlice";
import Footer from "../components/footer/Footer";
import "../index.scss";

const Layout = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  useEffect(() => {
    if (user) {
      dispatch(fetchChats());
    }
  }, [dispatch, user]);

  const hideFooter =
    location.pathname.startsWith("/chat") ||
    location.pathname.startsWith("/create-project") ||
    location.pathname.startsWith("/edit-profile") ||
    location.pathname.startsWith("/edit-project");

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
