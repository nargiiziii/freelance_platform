// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, RouterProvider } from "react-router-dom";
import Register from "./pages/register/Register";
import Login from "./pages/Login";
import { createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import EditProfile from "./pages/editProf/EditProdile";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div style={{ marginTop: "110px" }}>
        <Layout />
      </div>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/edit-profile",
        element: <EditProfile />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
