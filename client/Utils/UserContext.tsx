"use client";
import { createContext, useState, useContext, useLayoutEffect, ReactNode } from "react";
import { getUser } from "@/Utils/Apicalls/User";

export interface User {
  _id?: string;
  username?: string;
  email?: string;
  isAdmin?: boolean;
  [key: string]: any;
}

interface UserContextType {
  user: User;
  isLogin: boolean;
  setUser: (user: User) => void;
  loginUser: (userData: User) => void;
  logoutUser: () => void;
  refreshUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User>({});
  const [isLogin, setIsLogin] = useState<boolean>(false);

  const refreshUser = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLogin(false);
        setUser({});
        return;
      }
      const resp = await getUser();
      const userData = await resp.json();
      if (userData === false || !userData.username) {
        localStorage.removeItem("token");
        setIsLogin(false);
        setUser({});
        return;
      }
      setUser(userData);
      setIsLogin(true);
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("token");
      setIsLogin(false);
      setUser({});
    }
  };

  const loginUser = (userData: User): void => {
    setUser(userData);
    setIsLogin(true);
  };

  const logoutUser = (): void => {
    setUser({});
    setIsLogin(false);
  };

  useLayoutEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLogin, setUser, loginUser, logoutUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export default UserContext;
