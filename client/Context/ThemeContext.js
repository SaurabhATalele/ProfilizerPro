"use client";
import React, { createContext, useState, useContext } from "react";

// Define your initial theme
const initialTheme = {
  darkMode: false,
  toggleDarkMode: () => {},
};

// Create a context for your theme
const ThemeContext = createContext(initialTheme);

// Create a provider component to wrap your application
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Create a custom hook to consume the theme context
export const useTheme = () => {
  return useContext(ThemeContext);
};
