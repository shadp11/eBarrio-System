import { createContext, useState, useEffect, useContext } from "react";
import api from "../api";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import alertNotification from "../assets/alert-notification.mp3";
// Create a context for socket connection
export const SocketContext = createContext();

export const InfoContext = createContext(undefined);

const socket = io("http://localhost:5000/website", {
  withCredentials: true,
});

export const InfoProvider = ({ children }) => {
  const {
    isAuthenticated,
    setUserStatus,
    user,
    setUserPasswordChanged,
    playNotificationSound,
  } = useContext(AuthContext);
  const [residents, setResidents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [emergencyhotlines, setEmergencyHotlines] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [courtreservations, setCourtReservations] = useState([]);
  const [blotterreports, setBlotterReports] = useState([]);
  const [activitylogs, setActivityLogs] = useState([]);
  const [household, setHousehold] = useState([]);
  const [FAQslist, setFAQslist] = useState([]);
  const [chats, setChats] = useState([]);
  const [AIMessages, setAIMessages] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [assignedAdmin, setAssignedAdmin] = useState(null);
  const [pendingReservations, setPendingReservations] = useState(null);
  const [pendingDocuments, setPendingDocuments] = useState(null);
  const [pendingHouseholds, setPendingHouseholds] = useState(null);
  const [pendingBlotters, setPendingBlotters] = useState(null);
  const [pendingResidents, setPendingResidents] = useState(null);
  const [activeSOS, setActiveSOS] = useState(null);
  const [reports, setReports] = useState(null);

  const announcementInitialForm = {
    category: "",
    title: "",
    content: "",
    picture: "",
    date: [],
    times: {},
    eventdetails: "",
  };

  const residentInitialForm = {
    id: "",
    signature: "",
    firstname: "",
    middlename: "",
    lastname: "",
    suffix: "",
    alias: "",
    salutation: "",
    sex: "",
    gender: "",
    birthdate: "",
    birthplace: "",
    civilstatus: "",
    bloodtype: "",
    religion: "",
    nationality: "",
    voter: "",
    precinct: "",
    deceased: "",
    email: "",
    mobilenumber: "+63",
    telephone: "+63",
    facebook: "",
    emergencyname: "",
    emergencymobilenumber: "+63",
    emergencyaddress: "",
    numberofsiblings: "",
    numberofchildren: "",
    employmentstatus: "",
    employmentfield: "",
    occupation: "",
    monthlyincome: "",
    educationalattainment: "",
    typeofschool: "",
    course: "",
  };
  const blotterInitialForm = {
    complainantID: "",
    complainantname: "",
    complainantaddress: "",
    complainantcontactno: "+63",
    complainantsignature: "",
    subjectID: "",
    subjectname: "",
    subjectaddress: "",
    typeofthecomplaint: "",
    details: "",
    date: "",
    starttime: "",
    endtime: "",
  };

  const householdInitialForm = {
    members: [{ resident: "", resID: "" }],
    vehicles: [],
    ethnicity: "",
    tribe: "",
    sociostatus: "",
    nhtsno: "",
    watersource: "",
    toiletfacility: "",
    housenumber: "",
    street: "",
    HOAname: "",
    address: "",
  };

  const [residentForm, setResidentForm] = useState(() => {
    const savedForm = localStorage.getItem("residentForm");
    return savedForm ? JSON.parse(savedForm) : residentInitialForm;
  });

  const [blotterForm, setBlotterForm] = useState(() => {
    const savedForm = localStorage.getItem("blotterForm");
    return savedForm ? JSON.parse(savedForm) : blotterInitialForm;
  });

  const [announcementForm, setAnnouncementForm] = useState(() => {
    const savedForm = localStorage.getItem("announcementForm");
    return savedForm ? JSON.parse(savedForm) : announcementInitialForm;
  });

  const [householdForm, setHouseholdForm] = useState(() => {
    const savedForm = localStorage.getItem("householdForm");
    return savedForm ? JSON.parse(savedForm) : householdInitialForm;
  });

  useEffect(() => {
    if (user && isAuthenticated) {
      socket.emit("register", user.userID, user.role);
    }
  }, [user, isAuthenticated]);
  useEffect(() => {
    localStorage.setItem("residentForm", JSON.stringify(residentForm));
  }, [residentForm]);

  useEffect(() => {
    localStorage.setItem("blotterForm", JSON.stringify(blotterForm));
  }, [blotterForm]);

  useEffect(() => {
    localStorage.setItem("announcementForm", JSON.stringify(announcementForm));
  }, [announcementForm]);

  useEffect(() => {
    let interval;

    if (activeSOS) {
      interval = setInterval(() => {
        playNotificationSound(alertNotification);
      }, 2000);

      playNotificationSound(alertNotification);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSOS]);

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

  const fetchResidents = async () => {
    try {
      const response = await api.get("/getresidents");
      setResidents(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch residents:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/getemployees");
      setEmployees(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch employees:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/getusers");
      setUsers(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await api.get("/getcertificates");
      console.log(response.data);
      setCertificates(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch certificates:", error);
    }
  };

  const fetchEmergencyHotlines = async () => {
    try {
      const response = await api.get("/getemergencyhotlines");
      setEmergencyHotlines(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch emergency hotlines:", error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get("/getannouncements");
      setAnnouncements(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch announcements:", error);
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

  const fetchBlotterReports = async () => {
    try {
      const response = await api.get("/getblotters");
      setBlotterReports(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch blotter reports:", error);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await api.get("/getactivitylogs");
      setActivityLogs(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch activity logs:", error);
    }
  };

  const fetchHouseholds = async () => {
    try {
      const response = await api.get("/gethouseholds");
      setHousehold(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
    }
  };

  const fetchFAQslist = async () => {
    try {
      const response = await api.get("/getfaqs");
      setFAQslist(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch FAQs:", error);
    }
  };
  const fetchChats = async () => {
    try {
      const response = await api.get("/getchats");
      const filteredChats = response.data.filter((chat) =>
        chat.messages.some(
          (m) =>
            m.message !==
            "This conversation has been forwarded to the barangay office. An admin will get back to you shortly."
        )
      );
      setChats(filteredChats);
    } catch (error) {
      console.error("❌ Failed to fetch FAQs:", error);
    }
  };

  const fetchPendingResidents = async () => {
    try {
      const response = await api.get("/pendingresidents");
      setPendingResidents(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch FAQs:", error);
    }
  };

  const fetchPendingDocuments = async () => {
    try {
      const response = await api.get("/pendingdocuments");
      setPendingDocuments(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch FAQs:", error);
    }
  };

  const fetchPendingReservations = async () => {
    try {
      const response = await api.get("/pendingreservations");
      setPendingReservations(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
    }
  };

  const fetchPendingBlotters = async () => {
    try {
      const response = await api.get("/pendingblotters");
      setPendingBlotters(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
    }
  };

  const fetchPendingHouseholds = async () => {
    try {
      const response = await api.get("/pendinghouseholds");
      setPendingHouseholds(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
    }
  };

  const fetchActiveSOS = async () => {
    try {
      const response = await api.get("/activesos");
      setActiveSOS(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch FAQs:", error);
    }
  };

  const fetchPrompts = async () => {
    try {
      const res = await api.get("/getprompts");
      const prompts = res.data;
      const messages = prompts.flatMap((p) => [
        {
          from: "user",
          message: p.prompt,
          timestamp: new Date(p.createdAt),
        },
        {
          from: "ai",
          message: p.response,
          timestamp: new Date(p.createdAt),
        },
      ]);
      setAIMessages(messages);
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get("/getreports");
      setReports(res.data);
    } catch (error) {
      console.error("❌ Failed to fetch SOS reports:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingReservations();
      fetchPendingResidents();
      fetchPendingDocuments();
      fetchPendingBlotters();
      fetchPendingHouseholds();
      fetchActiveSOS();
      fetchUsers();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    socket.on("dbChange", (updatedData) => {
      if (updatedData.type === "residents") {
        setResidents(updatedData.data);
      } else if (updatedData.type === "employees") {
        setEmployees(updatedData.data);
      } else if (updatedData.type === "users") {
        setUsers(updatedData.data);
      } else if (updatedData.type === "certificates") {
        setCertificates(updatedData.data);
      } else if (updatedData.type === "emergencyhotlines") {
        setEmergencyHotlines(updatedData.data);
      } else if (updatedData.type === "announcements") {
        setAnnouncements(updatedData.data);
      } else if (updatedData.type === "courtreservations") {
        setCourtReservations(updatedData.data);
      } else if (updatedData.type === "blotterreports") {
        setBlotterReports(updatedData.data);
      } else if (updatedData.type === "activitylogs") {
        setActivityLogs(updatedData.data);
      } else if (updatedData.type === "faqs") {
        setFAQslist(updatedData.data);
      } else if (updatedData.type === "household") {
        setHousehold(updatedData.data);
      } else if (updatedData.type === "pendingresidents") {
        setPendingResidents(updatedData.data);
      } else if (updatedData.type === "pendingdocuments") {
        setPendingDocuments(updatedData.data);
      } else if (updatedData.type === "pendingreservations") {
        setPendingReservations(updatedData.data);
      } else if (updatedData.type === "pendingblotters") {
        setPendingBlotters(updatedData.data);
      } else if (updatedData.type === "pendinghouseholds") {
        setPendingHouseholds(updatedData.data);
      } else if (updatedData.type === "reports") {
        setReports(updatedData.data);
      } else if (updatedData.type === "activesos") {
        setActiveSOS(updatedData.data);
      } else if (updatedData.type === "prompts") {
        const prompts = updatedData.data;
        const messages = prompts.flatMap((p) => [
          {
            from: "user",
            message: p.prompt,
            timestamp: new Date(p.createdAt),
          },
          {
            from: "ai",
            message: p.response,
            timestamp: new Date(p.createdAt),
          },
        ]);
        setAIMessages(messages);
      }
    });

    return () => {
      socket.off("dbChange");
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      <InfoContext.Provider
        value={{
          residents,
          employees,
          users,
          certificates,
          emergencyhotlines,
          announcements,
          courtreservations,
          blotterreports,
          residentForm,
          blotterForm,
          announcementForm,
          household,
          FAQslist,
          pendingReservations,
          pendingResidents,
          pendingDocuments,
          pendingHouseholds,
          pendingBlotters,
          activeSOS,
          fetchPendingResidents,
          fetchReports,
          reports,
          chats,
          roomId,
          setRoomId,
          assignedAdmin,
          setAssignedAdmin,
          setChats,
          setAnnouncementForm,
          fetchActivityLogs,
          fetchPrompts,
          AIMessages,
          setAIMessages,
          activitylogs,
          householdForm,
          setHouseholdForm,
          setBlotterForm,
          setResidentForm,
          fetchHouseholds,
          fetchResidents,
          fetchEmployees,
          fetchUsers,
          fetchCertificates,
          fetchEmergencyHotlines,
          fetchAnnouncements,
          fetchReservations,
          fetchBlotterReports,
          fetchFAQslist,
          fetchChats,
        }}
      >
        {children}
      </InfoContext.Provider>
    </SocketContext.Provider>
  );
};
