// src/App.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { getProfile } from "./redux/features/authSlice";

import Layout from "./pages/Layout";
import Register from "./pages/register/Register";
import Login from "./pages/login/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import EditProfile from "./pages/editProf/EditProdile";
import FreelancerDash from "./components/freelancer_dash/Freelancer_dash";
import EmployeeDash from "./components/employee_dash/Employee_dash";
import CreateProjectPage from "./pages/createProjectPage/CreateProjectPage";
import ProjectListForFreelancer from "./components/projectListForFreelancer/ProjectListForFreelancer";
import MyProposals from "./pages/myProposals/MyProposals";
import BalancePage from "./pages/balancePage/BalancePage";
import ProjectDetails from "./pages/projectDetails/ProjectDetails";
import FreelancersList from "./pages/freelancersList/FreelancersList";
import MessagesPage from "./pages/messagesPage/MessagesPage";
import ChatRoom from "./pages/сhatRoom/ChatRoom";
import MyJobs from "./pages/myJobs/MyJobs";
import EditProject from "./pages/editProject/EditProject";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div style={{ marginTop: "110px" }}>
        <Layout />
      </div>
    ),
    children: [
      { path: "/", element: <Home /> },
      { path: "/register", element: <Register /> },
      { path: "/login", element: <Login /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/freelancer-dash", element: <FreelancerDash /> },
      { path: "/employee-dash", element: <EmployeeDash /> },
      { path: "/edit-profile", element: <EditProfile /> },
      { path: "/escrow", element: <BalancePage /> },
      { path: "/messages", element: <MessagesPage /> },
      { path: "/chatRoom/:userId", element: <ChatRoom /> },
      { path: "/jobs", element: <ProjectListForFreelancer /> },
      { path: "/my-proposals", element: <MyProposals /> },
      { path: "/create-project", element: <CreateProjectPage /> },
      { path: "/freelancers", element: <FreelancersList /> },
      { path: "/my-jobs", element: <MyJobs /> },
      { path: "/employer/project/:id", element: <ProjectDetails /> },
      { path: "/edit-project/:id", element: <EditProject /> },
    ],
  },
]);

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user) {
      dispatch(getProfile());
    }
  }, [dispatch, user]);

  return <RouterProvider router={router} />;
}

export default App;
