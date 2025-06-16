// src/components/Loader.jsx
import React from "react";
import { CircularProgress, Box } from "@mui/material";

const Loader = () => {
  return (
    <Box mt={10} display="flex" justifyContent="center" alignItems="center">
      <CircularProgress />
    </Box>
  );
};

export default Loader;
