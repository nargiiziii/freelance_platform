// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, RouterProvider } from "react-router-dom";
import Register from "./pages/register/Register";
import Login from "./pages/login/Login";
import { createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import EditProfile from "./pages/editProf/EditProdile";
import ProjectsList from "./components/projectsList/ProjectsList";
import FreelancerDash from "./components/freelancer_dash/Freelancer_dash";
import EmployeeDash from "./components/employee_dash/Employee_dash";

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
        path: "/freelancer-dash",
        element: <FreelancerDash />,
      },
            {
        path: "/employee-dash",
        element: <EmployeeDash />,
      },
      {
        path: "/edit-profile",
        element: <EditProfile />,
      },
      {
        path: "/jobs",
        element: <ProjectsList />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
