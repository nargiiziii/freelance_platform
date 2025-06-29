import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

useEffect(() => {
  console.log("darkMode:", darkMode); // 👈 добавь это
  if (darkMode) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
  localStorage.setItem("darkMode", darkMode);
}, [darkMode]);


  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
