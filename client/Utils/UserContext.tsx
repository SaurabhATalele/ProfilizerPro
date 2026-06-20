"use client";
import React, { createContext, useState, ReactNode } from "react";

export interface User {
  _id?: string;
  username?: string;
  email?: string;
  isAdmin?: boolean;
  [key: string]: any;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
}

const initialState: User = {};

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User>(initialState);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
