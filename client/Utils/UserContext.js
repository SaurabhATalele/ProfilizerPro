"use client";
import React, { createContext, useState } from "react";

// Create a context object
const UserContext = createContext();

const initialState = {
  user: {},
  setUser: () => {},
};

// Create a provider component
export function UserProvider({ children }) {
  const [user, setUser] = useState(initialState);

  // The value prop should contain the value you want to pass down
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
