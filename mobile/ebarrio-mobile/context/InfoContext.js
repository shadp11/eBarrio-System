import api from "../api";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import * as SecureStore from "expo-secure-store";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import { SocketContext } from "./SocketContext";
import axios from "axios";

export const InfoContext = createContext(undefined);

export const InfoProvider = ({ children }) => {
  const { isAuthenticated, setUserStatus, user, setUserPasswordChanged } =
    useContext(AuthContext);
  const [emergencyhotlines, setEmergencyHotlines] = useState([]);
  const [weather, setWeather] = useState([]);
  const [residents, setResidents] = useState([]);
  const [courtreservations, setCourtReservations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [events, setEvents] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [active, setActive] = useState([]);
  const [FAQs, setFAQs] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [report, setReport] = useState(null);
  const [pendingReports, setPendingReports] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(null);
  const [respondedSOS, setRespondedSOS] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements) {
      const announcementEvents = (announcements || [])
        .filter((a) => a.status !== "Archived")
        .filter((a) => a.times)
        .flatMap((a) =>
          Object.entries(a.times).map(([dateKey, timeObj]) => ({
            title: a.title,
            category: a.category,
            eventdetails: a.eventdetails,
            start: new Date(timeObj.starttime),
            end: new Date(timeObj.endtime),
            backgroundColor:
              a.category === "General"
                ? "#4A90E2"
                : a.category === "Health & Sanitation"
                ? "#7ED321"
                : a.category === "Public Safety & Emergency"
                ? "#FF0000"
                : a.category === "Education & Youth"
                ? "#FFD942"
                : a.category === "Social Services"
                ? "#B3B6B7"
                : a.category === "Infrastructure"
                ? "#EC9300"
                : "#3174ad",
          }))
        );

      setEvents(announcementEvents);
    }
  }, [announcements]);

  useEffect(() => {
    fetchEmergencyHotlines();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchReport();
      fetchUnreadNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (users && user) {
      users.map((usr) => {
        if (usr._id === user.userID) {
          setUserStatus(usr.status);
          setUserPasswordChanged(usr.passwordchangedat);
        }
      });
    }
  }, [users, user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/getusers");
      setUsers(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await api.get("/getuserdetails");
      setUserDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch user details:", err);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get(`/getservices`);
      setServices(response.data);
    } catch (error) {
      console.error("Failed to fetch user services:", err);
    }
  };

  const fetchEmergencyHotlines = async () => {
    try {
      const response = await api.get("/getemergencyhotlines");
      setEmergencyHotlines(response.data);
      await SecureStore.setItemAsync(
        "emergencyhotlines",
        JSON.stringify(response.data)
      );
    } catch (error) {
      console.error("Failed to fetch emergency hotlines:", err);
    }
  };

  const fetchWeather = async () => {
    try {
      const response = await api.get("/getweather");
      setWeather(response.data);
    } catch (error) {
      console.error("Failed to fetch weather:", err);
    }
  };

  const fetchResidents = async () => {
    try {
      const response = await api.get("/getresidents");
      setResidents(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch residents:", error);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await api.get("/getreservations");
      setCourtReservations(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch reservations:", error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get("/getannouncements");
      setAnnouncements(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch reservations:", error);
    }
  };

  const fetchFAQs = async () => {
    try {
      const response = await api.get("/getfaqs");
      setFAQs(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch reservations:", error);
    }
  };

  const fetchActive = async () => {
    try {
      const response = await api.get("/getactive");
      setActive(response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch reservations:", error);
    }
  };

  const fetchChats = async () => {
    try {
      const response = await api.get("/getchat");
      setChatMessages(response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch chat:", error);
    }
  };

  const fetchReport = async () => {
    try {
      const response = await api.get("/getactivesos");
      setReport(response.data[0]);
    } catch (error) {
      console.error("❌ Failed to fetch report:", error);
    }
  };

  const fetchPendingReports = async () => {
    try {
      const response = await api.get("/getpendingsos");
      setPendingReports(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch pending reports:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/getnotifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch notifications:", error);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const response = await api.get("/getunreadnotifications");
      setUnreadNotifications(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch unread notifications:", error);
    }
  };

  const fetchRespondedSOS = async () => {
    try {
      const response = await api.get("/getrespondedsos");
      setRespondedSOS(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch responded sos:", error);
    }
  };

  const socketRef = useRef(null); // ✅ Persistent ref

  useEffect(() => {
    if (!isAuthenticated || !user?.userID) return;

    // Create socket when authenticated
    const newSocket = io("https://ebarrio-mobile-backend.onrender.com", {
      transports: ["polling", "websocket"],
      withCredentials: true,
      timeout: 60000,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      newSocket.emit("register", user.userID, user.role);
    });

    newSocket.on("connect_error", (err) => {
      console.log("❌ Socket connection failed:", err.message);
    });

    // Cleanup only when user logs out or component unmounts
    return () => {
      if (socketRef.current) {
        newSocket.emit("unregister", user.userID);
        newSocket.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, user?.userID, user?.role]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const handler = (updatedData) => {
      if (updatedData.type === "announcements") {
        setAnnouncements(updatedData.data);
      } else if (updatedData.type === "services") {
        setServices(updatedData.data);
      } else if (updatedData.type === "emergencyhotlines") {
        setEmergencyHotlines(updatedData.data);
      } else if (updatedData.type === "users") {
        setUsers(updatedData.data);
      } else if (updatedData.type === "notifications") {
        setNotifications(updatedData.data);
      } else if (updatedData.type === "unreadnotifications") {
        setUnreadNotifications(updatedData.data);
      } else if (updatedData.type === "report") {
        setReport(updatedData.data[0]);
      } else if (updatedData.type === "pendingReports") {
        setPendingReports(updatedData.data);
      }
    };

    s.on("mobile-dbChange", handler);

    return () => {
      s.off("mobile-dbChange", handler);
    };
  }, []);

  return (
    <InfoContext.Provider
      value={{
        emergencyhotlines,
        weather,
        residents,
        courtreservations,
        announcements,
        userDetails,
        events,
        services,
        FAQs,
        active,
        chatMessages,
        report,
        pendingReports,
        notifications,
        unreadNotifications,
        respondedSOS,
        fetchRespondedSOS,
        fetchNotifications,
        setNotifications,
        setPendingReports,
        setChatMessages,
        fetchServices,
        fetchUserDetails,
        fetchEmergencyHotlines,
        fetchWeather,
        fetchResidents,
        fetchReservations,
        fetchAnnouncements,
        fetchFAQs,
        fetchActive,
        fetchChats,
        fetchReport,
        fetchPendingReports,
      }}
    >
      {children}
    </InfoContext.Provider>
  );
};
