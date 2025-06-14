// Dashboard.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, CircularProgress, Typography } from "@mui/material";
import { fetchUserData } from "../../redux/features/userSlice";
import FreelancerDash from "../../components/freelancer_dash/Freelancer_dash";
import EmployeeDash from "../../components/employee_dash/Employee_dash";
import style from "./Dashboard.module.scss";

function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const { data, status } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserData(user.id));
    }
  }, [user, dispatch]);

  if (status === "loading" || !data) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        mt={8}
      >
        <CircularProgress color="secondary" />
        <Typography variant="h6" mt={2} color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <div className={style.dashboardContainer}>
      <h2 className={style.title}>Dashboard</h2>
      {data.role === "freelancer" && <FreelancerDash data={data} />}
      {data.role === "employer" && <EmployeeDash data={data} />}
    </div>
  );
}

export default Dashboard;