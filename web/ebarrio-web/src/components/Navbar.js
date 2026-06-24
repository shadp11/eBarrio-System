import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { InfoContext } from "../context/InfoContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import api from "../api";
import { SocketContext } from "../context/SocketContext";
import { useConfirm } from "../context/ConfirmContext";

//STYLES
import "../Stylesheets/NavBar.css";

//ICONS
import { PiSignOutBold } from "react-icons/pi";
import { IoMdSettings, IoIosArrowDown } from "react-icons/io";
import { IoNotifications } from "react-icons/io5";
import { TbAdjustmentsHorizontal } from "react-icons/tb";

const Navbar = ({ isCollapsed }) => {
  const confirm = useConfirm();
  dayjs.extend(relativeTime);
  const navigation = useNavigate();
  const [profileDropdown, setprofileDropdown] = useState(false);
  const [notificationDropdown, setnotificationDropdown] = useState(false);
  const [filterDropdown, setfilterDropdown] = useState(false);
  const { logout, user, logoutLoading } = useContext(AuthContext);
  const { residents, fetchResidents } = useContext(InfoContext);
  const { fetchNotifications, notifications } = useContext(SocketContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [profilePic, setProfilePic] = useState(null);
  const [sortOption, setSortOption] = useState("All");
  const [name, setName] = useState(null);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const filterRef = useRef(null);

  //To handle close when click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target) &&
        notificationDropdown
      ) {
        setnotificationDropdown(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        profileDropdown
      ) {
        setprofileDropdown(false);
      }

      if (
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        filterDropdown
      ) {
        setfilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationDropdown, profileDropdown, filterDropdown]);

  useEffect(() => {
    fetchResidents();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (isAuthenticated && Array.isArray(residents) && user) {
      const match = residents.find((res) => res?.empID?._id === user.empID);
      if (match) {
        setProfilePic(match.picture);
        setName(`${match.firstname} ${match.lastname}`);
      }
    }
  }, [isAuthenticated, residents, user]);

  const filteredNotifications = notifications.filter((notif) => {
    if (sortOption === "All") return true;
    if (sortOption === "Read") return notif.read === true;
    if (sortOption === "Unread") return notif.read === false;
    return true;
  });

  const toggleProfileDropdown = () => {
    setprofileDropdown(!profileDropdown);
  };

  const toggleNotificationDropdown = () => {
    setnotificationDropdown(!notificationDropdown);
  };

  const toggleFilterDropdown = () => {
    setfilterDropdown(!filterDropdown);
  };

  const handleNotif = async (notifID, redirectTo) => {
    try {
      await api.put(`/readnotification/${notifID}`);
      setnotificationDropdown(false);
      if (redirectTo === "SOSRequests") {
        navigation("/sos-update-reports");
      } else {
        navigation(redirectTo);
      }
    } catch (error) {
      console.log("Error in reading notification", error);
    }
  };

  const truncateNotifMessage = (message, wordLimit = 25) => {
    const words = message.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + " ..."
      : message;
  };

  const handleLogout = async () => {
    const isConfirmed = await confirm(
      "Logging out will return you to the login page. Press confirm to continue.",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    logout();
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/readnotifications");
    } catch (error) {
      console.log("Error in marking all as read", error);
    }
  };

  return (
    <>
      <header
        className={`navbar ${isCollapsed ? "left-[5rem]" : "left-[18rem]"}`}
      >
        <div className="navbar-right">
          {user?.role !== "Technical Admin" && (
            <div className="relative" ref={notifRef}>
              {notifications.some((n) => n.read === false) && (
                <div className="notif-dot"></div>
              )}

              <IoNotifications
                className={`navbar-icon ${
                  user?.role !== "Technical Admin" ? "" : "mt-3"
                }`}
                onClick={toggleNotificationDropdown}
              />

              {notificationDropdown && (
                <div className="notif-dropdown-container">
                  {/* Header */}
                  <div className="notif-header-container">
                    <div className="notif-title-container">
                      <h1 className="notif-title">Notifications</h1>
                      <h1 className="text-xs bg-[#BC0F0F] text-[#fff] px-1 rounded-full ml-2">
                        {notifications.reduce(
                          (count, notification) =>
                            notification.read ? count : count + 1,
                          0
                        )}
                      </h1>
                    </div>
                    <div className="relative" ref={filterRef}>
                      <TbAdjustmentsHorizontal
                        className="notif-filter-icon"
                        onClick={toggleFilterDropdown}
                      />
                      {filterDropdown && (
                        <div className="notif-filter-dropdown">
                          <ul className="w-full">
                            <div className="notif-filter-item">
                              <li
                                className="notif-filter-text"
                                onClick={() => {
                                  setSortOption("All");
                                  setfilterDropdown(false);
                                }}
                              >
                                All
                              </li>
                            </div>
                            <div className="notif-filter-item">
                              <li
                                className="notif-filter-text"
                                onClick={() => {
                                  setSortOption("Read");
                                  setfilterDropdown(false);
                                }}
                              >
                                Read
                              </li>
                            </div>
                            <div className="notif-filter-item">
                              <li
                                className="notif-filter-text"
                                onClick={() => {
                                  setSortOption("Unread");
                                  setfilterDropdown(false);
                                }}
                              >
                                Unread
                              </li>
                            </div>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scrollable Notification List */}
                  <div className="notif-list-container hide-scrollbar">
                    {filteredNotifications.length === 0 ? (
                      <div className="notif-empty-container">
                        {sortOption === "Read" ? (
                          <p className="notif-empty-text">
                            You're all caught up. No read notifications.
                          </p>
                        ) : sortOption === "Unread" ? (
                          <p className="notif-empty-text">
                            You're all caught up. No unread notifications.
                          </p>
                        ) : (
                          <p className="notif-empty-text">
                            You're all caught up. No notifications.
                          </p>
                        )}
                      </div>
                    ) : (
                      [...filteredNotifications]
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt) - new Date(a.createdAt)
                        )
                        .map((notif, index) => (
                          <div
                            onClick={() =>
                              handleNotif(notif._id, notif.redirectTo)
                            }
                            key={index}
                            className="notif-item-container"
                          >
                            <div className="notif-item-inner">
                              <div className="notif-item-text-container">
                                <label className="notif-title-text font-bold">
                                  {notif.title}
                                </label>
                                <label className="notif-title-text font-semibold">
                                  {truncateNotifMessage(notif.message)}
                                </label>
                                <label className="notif-time-text">
                                  {dayjs(notif.createdAt).fromNow()}
                                </label>
                              </div>

                              <div
                                className={`notif-read-dot ${
                                  notif.read ? "bg-transparent" : "bg-blue-500"
                                }`}
                              ></div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3">
                    <h1 onClick={markAllAsRead} className="notif-markall">
                      Mark all as read
                    </h1>
                  </div>
                </div>
              )}
            </div>
          )}

          {user?.role !== "Technical Admin" && (
            <img
              src={profilePic}
              alt="Profile"
              className="navbar-profile-img"
            />
          )}

          {/* User Information */}
          <div className="navbar-user-info">
            {user?.role === "Technical Admin" ? (
              <h2 className="user-name-text mt-2">Technical Admin</h2>
            ) : (
              <>
                <h2 className="user-name-text">{name}</h2>
                {user?.role && <h2 className="user-role-text">{user.role}</h2>}
              </>
            )}
          </div>
          {/* Profile Image and Dropdown */}
          <div className="relative" ref={profileRef}>
            <IoIosArrowDown
              className={`${
                user?.role !== "Technical Admin"
                  ? "cursor-pointer"
                  : "mt-3 cursor-pointer"
              }`}
              onClick={toggleProfileDropdown}
            />
            {profileDropdown && (
              <div className="navbar-dropdown">
                <ul className="w-full">
                  <div className="navbar-dropdown-item">
                    <IoMdSettings className="account-icon" />
                    <li
                      className="account-text"
                      onClick={() => {
                        setprofileDropdown(false);
                        navigation("/account");
                      }}
                    >
                      Account Settings
                    </li>
                  </div>
                  <div className="navbar-dropdown-item ">
                    <PiSignOutBold className="signout-icon" />
                    <li
                      className="signout-text"
                      onClick={handleLogout}
                      disabled={logoutLoading}
                    >
                      {logoutLoading ? "Logging out..." : "Logout"}
                    </li>
                  </div>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
