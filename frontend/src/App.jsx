import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { getProfile } from "./redux/features/authSlice";
import "./App.css";
// Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Общие страницы
import Layout from "./pages/Layout";
import Register from "./pages/register/Register";
import Login from "./pages/login/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import EditProfile from "./pages/editProf/EditProdile";
import BalancePage from "./pages/balancePage/BalancePage";
import MessagesPage from "./pages/messagesPage/MessagesPage";
import FreelancersList from "./pages/freelancersList/FreelancersList";

// Страницы фрилансера
import FreelancerDash from "./components/freelancer_dash/Freelancer_dash";
import ProjectListForFreelancer from "./components/projectListForFreelancer/ProjectListForFreelancer";
import MyProposalsFreel from "./pages/myProposalsFreel/MyProposalsFreel";

// Страницы работодателя
import EmployeeDash from "./components/employee_dash/Employee_dash";
import CreateProjectPage from "./pages/createProjectPage/CreateProjectPage";
import MyJobs from "./pages/myJobs/MyJobs";
import ProjectDetails from "./pages/projectDetails/ProjectDetails";
import EditProject from "./pages/editProject/EditProject";
import CombinedChatPage from "./pages/messagesPage/MessagesPage";
import AdminPanel from "./pages/admin/AdminPanel";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div style={{ marginTop: "95px" }}>
        <Layout />
      </div>
    ),
    children: [
      { path: "/", element: <Home /> },
      { path: "/register", element: <Register /> },
      { path: "/login", element: <Login /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/edit-profile", element: <EditProfile /> },
      { path: "/escrow", element: <BalancePage /> },
      { path: "/messages", element: <MessagesPage /> },
      { path: "/freelancers", element: <FreelancersList /> },
      { path: "/freelancer-dash", element: <FreelancerDash /> },
      { path: "/jobs", element: <ProjectListForFreelancer /> },
      { path: "/my-proposals", element: <MyProposalsFreel /> },
      { path: "/employee-dash", element: <EmployeeDash /> },
      { path: "/create-project", element: <CreateProjectPage /> },
      { path: "/my-jobs", element: <MyJobs /> },
      { path: "/employer/project/:id", element: <ProjectDetails /> },
      { path: "/edit-project/:id", element: <EditProject /> },
      { path: "/admin", element: <AdminPanel /> },
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

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-left"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="toast-container" 
      />
    </>
  );
}

export default App;
