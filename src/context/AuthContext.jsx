import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("med_mate_user");
    const savedToken = localStorage.getItem("med_mate_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    } else {
      // Clear inconsistent data
      localStorage.removeItem("med_mate_user");
      localStorage.removeItem("med_mate_token");
    }
    setLoading(false);
  }, []);

  const signup = async (userData) => {
    const response = await API.post("/auth/signup", userData);
    return response.data;
  };

  const verifyEmail = async (verificationData) => {
    const response = await API.post("/auth/verify-email", verificationData);
    return response.data;
  };

  const resendCode = async (email) => {
    const response = await API.post("/auth/resend-code", { email });
    return response.data;
  };

  const forgotPassword = async (email) => {
    const response = await API.post("/auth/forgotpassword", { email });
    return response.data;
  };

  const verifyResetCode = async (email, code) => {
    const response = await API.post("/auth/verify-reset-code", { email, code });
    return response.data;
  };

  const resetPassword = async (resetData) => {
    const response = await API.put("/auth/resetpassword", resetData);
    return response.data;
  };

  const login = async (credentials) => {
    const response = await API.post("/auth/login", credentials);
    if (response.data.success) {
      const { token, user: loggedInUser } = response.data;
      setUser(loggedInUser);
      localStorage.setItem("med_mate_token", token);
      localStorage.setItem("med_mate_user", JSON.stringify(loggedInUser));
    }
    return response.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("med_mate_user");
    localStorage.removeItem("med_mate_token");
  };

  const updateProfile = async ({ firstName, lastName }) => {
    const response = await API.put("/auth/profile", { firstName, lastName });
    if (response.data.success && response.data.user) {
      setUser(response.data.user);
      localStorage.setItem("med_mate_user", JSON.stringify(response.data.user));
    }
    return response.data;
  };

  const updatePassword = async ({ currentPassword, newPassword }) => {
    const response = await API.put("/auth/password", { currentPassword, newPassword });
    return response.data;
  };

  const isAuthenticated = !!user;
  const role = user?.role || "patient";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        role,
        login,
        logout,
        signup,
        verifyEmail,
        resendCode,
        forgotPassword,
        verifyResetCode,
        resetPassword,
        updateProfile,
        updatePassword,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
