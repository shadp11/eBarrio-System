import axios from "axios";
import { createContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigation = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [userPasswordChanged, setUserPasswordChanged] = useState(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const playNotificationSound = (sound) => {
    const audio = new Audio(sound);
    audio.currentTime = 0;
    audio.play().catch((err) => console.log("Audio play failed:", err));
  };

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
    axios
      .get("http://localhost:5000/api/checkrefreshtoken", {
        withCredentials: true,
      })
      .then((response) => {
        console.log("You have a token");
        setUser(response.data.decoded);
        setIsAuthenticated(true);
      })
      .catch(() => {
        console.log("You don't have a token");
        setIsAuthenticated(false);
      });
  }, [navigation]);

  const autologout = async () => {
    try {
      await api.post(`/deactivateduser/${user.userID}`);
      alert(
        "You've been logged out because your account has been deactivated. If this is unexpected, please contact the admin."
      );
      setIsAuthenticated(false);
      navigation("/login");
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
      setIsAuthenticated(false);
      navigation("/login");
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
      setIsAuthenticated(false);
      navigation("/login");
    } catch (error) {
      console.log("Error", error);
    }
  };

  const autologout4 = async () => {
    try {
      await api.post(`/changedpassword`);
      setIsAuthenticated(false);
      setUser(null);
      navigation("/login");
    } catch (error) {
      console.log("Error", error);
    }
  };

  const logout = async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/logout",
        {
          userID: user.userID,
        },
        { withCredentials: true }
      );
      setIsAuthenticated(false);
      setUser(null);
      navigation("/login");
    } catch (error) {
      console.log("Error", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        setUser,
        setUserStatus,
        setUserPasswordChanged,
        logoutLoading,
        isAuthenticated,
        playNotificationSound,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
