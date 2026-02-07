"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Intercept 401 responses to auto-logout
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // ✅ Set token if available on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ Fetch current user with token
  const fetchUser = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      console.log("AuthContext: Fetching user from", baseURL);
      const response = await axios.get(`${baseURL}/api/auth/me`);
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error("Fetch user failed:", error);
      // Token might be expired or invalid
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Manual login
  const login = async (email, password) => {
    const baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
    const response = await axios.post(`${baseURL}/api/auth/login`, { email, password });
    const { token, user } = response.data;

    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(user);

    return response.data;
  };

  // ✅ Manual registration
  const register = async (userData) => {
    const baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
    const response = await axios.post(`${baseURL}/api/auth/register`, userData);
    const { token, user } = response.data;

    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(user);

    return response.data;
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  // ✅ Called by frontend after Google OAuth redirect
  const loginWithToken = async (token) => {
    try {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return await fetchUser(); // fetch user data after setting token
    } catch (error) {
      logout();
      return { error };
    }
  };

  // ✅ Trigger Google OAuth flow
  const loginWithGoogle = () => {
    const baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

    window.open(`${baseURL}/api/auth/google`, "_self");
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    loginWithToken,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
