import React, { createContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import api, { setupInterceptors } from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigation = useNavigation();
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userPasswordChanged, setUserPasswordChanged] = useState(null);

  useEffect(() => {
    if (user && userPasswordChanged) {
      const passwordchangedat = new Date(userPasswordChanged).getTime();
      const tokenIssuedAt = user.iat * 1000;

      if (passwordchangedat > tokenIssuedAt) {
        autologout4();
      }
    }
  }, [user, userPasswordChanged]);

  useEffect(() => {
    if (userStatus && userStatus === "Deactivated") {
      autologout();
    } else if (userStatus && userStatus === "Archived") {
      autologout2();
    } else if (userStatus && userStatus === "Password Not Set") {
      autologout3();
    }
  }, [user, userStatus]);

  useEffect(() => {
    const checkRefreshToken = async () => {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      if (!refreshToken) {
        setIsAuthenticated(false);
        return;
      }
      try {
        const response = await axios.post(
          "https://ebarrio-mobile-backend.onrender.com/api/checkrefreshtoken",
          {
            refreshToken,
          }
        );
        console.log("You have a token");
        setUser(response.data.decoded);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Axios error:", error.message);
        setIsAuthenticated(false);
      }
    };
    checkRefreshToken();
  }, []);

  const autologout4 = async () => {
    try {
      await api.post(`/changedpassword`);
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("accessToken");
      setIsAuthenticated(false);
      setUser(null);
      navigation.navigate("Login");
    } catch (error) {
      console.log("Error", error);
    }
  };

  const autologout3 = async () => {
    try {
      await api.post(`/updateduser`);
      alert(
        "You've been logged out because your account credentials has been updated. If this is unexpected, please contact the admin."
      );
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("accessToken");
      setUser(null);
      setIsAuthenticated(false);
      navigation("Login");
    } catch (error) {
      console.log("Error", error);
    }
  };

  const autologout2 = async () => {
    try {
      await api.post(`/archiveduser/${user.userID}`);
      alert(
        "You've been logged out because your account has been archived. If this is unexpected, please contact the admin."
      );
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("accessToken");
      setUser(null);
      setIsAuthenticated(false);
      navigation("Login");
    } catch (error) {
      console.log("Error", error);
    }
  };

  const autologout = async () => {
    try {
      await api.post(`/deactivateduser`);
      alert(
        "You've been logged out because your account has been deactivated. If this is unexpected, please contact the admin."
      );
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("accessToken");
      setUser(null);
      setIsAuthenticated(false);
      navigation("Login");
    } catch (error) {
      console.log("Error", error);
    }
  };

  const login = async (credentials) => {
    try {
      const res = await axios.post(
        "https://ebarrio-mobile-backend.onrender.com/api/login",
        credentials
      );

      const { accessToken, refreshToken, user } = res.data;

      await SecureStore.setItemAsync("accessToken", accessToken);
      await SecureStore.setItemAsync("refreshToken", refreshToken);

      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      const response = error.response;
      if (response && response.data) {
        console.log("❌ Error status:", response.status);
        alert(response.data.message || "Something went wrong.");
      } else {
        console.log("❌ Network or unknown error:", error.message);
        alert("An unexpected error occurred.");
      }
    }
  };

  const logout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await api.post("/logout");
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("accessToken");
      setUser(null);
      setIsAuthenticated(false);
      navigation.navigate("Login");
    } catch (error) {
      console.log("Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setupInterceptors(logout);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        isAuthenticated,
        setUserStatus,
        isFirstLaunch,
        userPasswordChanged,
        setUserPasswordChanged,
        logout,
        loading,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
