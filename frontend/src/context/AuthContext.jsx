import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { Backendurl } from "../App";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Add token to axios default headers
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const response = await axios.get(`${Backendurl}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          // Ensure profile image URL is complete
          const userData = {
            ...response.data,
            profileImage: response.data.profileImage ? 
              (response.data.profileImage.startsWith('http') ? 
                response.data.profileImage : 
                `${Backendurl}${response.data.profileImage}`) : 
              null
          };
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          throw new Error("Invalid response");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Only remove token if it's an auth error (401) or network error
        if (error.response?.status === 401 || error.code === 'ERR_NETWORK') {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (token, userData) => {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setIsLoggedIn(true);
    
    // Ensure profile image URL is complete
    const userWithImage = {
      ...userData,
      profileImage: userData.profileImage ? 
        (userData.profileImage.startsWith('http') ? 
          userData.profileImage : 
          `${Backendurl}${userData.profileImage}`) : 
        null
    };
    setUser(userWithImage);
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setIsLoggedIn(false);
    setUser(null);
  };

  const setUserData = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, loading, setUser: setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
