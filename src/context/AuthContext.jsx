import React, { createContext, useState, useContext, useEffect } from "react";
import { getProfile } from "../apis/auth";
import { useLocation, useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    id: "",
    username: "",
    name: "",
    phone: "",
    department: "",
    permissions: "",
    roles: "",
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const checkAuthUser = async () => {
    try {
      const profileData = await getProfile();
      const { id, username, name, phone, department, permissions, roles } =
        profileData?.data;
      setUser({
        id,
        name,
        username,
        phone,
        department,
        permissions,
        roles,
      });
      setIsLoading(false);
      setIsAuthenticated(true);
    } catch (error) {
      setIsLoading(false);
      setIsAuthenticated(false);
      navigate("/login");
    }
  };

  useEffect(() => {
    if (
      localStorage.getItem("token") === null &&
      sessionStorage.getItem("token") === null
    )
      navigate("/login");
    if(pathname === '/')navigate("/warehouse/home");

  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, checkAuthUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
