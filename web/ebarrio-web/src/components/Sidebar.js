import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { InfoContext } from "../context/InfoContext";

//STYLES
import "../Stylesheets/SideBar.css";

//ICONS
import { IoIosPeople } from "react-icons/io";
import { PiCourtBasketballFill, PiUserSwitchFill } from "react-icons/pi";
import { RiContactsBook3Fill } from "react-icons/ri";
import { FaUsersCog } from "react-icons/fa";
import { MdDashboard, MdEditDocument } from "react-icons/md";
import { IoPeople, IoDocumentTextSharp } from "react-icons/io5";
import {
  BiMenuAltLeft,
  BiMenu,
  BiSolidMegaphone,
  BiSolidCctv,
} from "react-icons/bi";
import { AiFillAlert } from "react-icons/ai";
import { BsFillHouseFill } from "react-icons/bs";
import AppLogo from "../assets/applogo-darkbg.png";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const {
    pendingReservations,
    pendingBlotters,
    pendingHouseholds,
    pendingResidents,
    pendingDocuments,
    activeSOS,
  } = useContext(InfoContext);
  const location = useLocation();
  if (!user) return null;
  const Menus = [
    (user.role === "Secretary" ||
      user.role === "Clerk" ||
      user.role === "Justice") && {
      title: "Dashboard",
      icon: <MdDashboard />,
      path: "/dashboard",
    },
    (user.role === "Secretary" || user.role === "Technical Admin") && {
      title: "Employees",
      icon: <IoPeople />,
      path: "/employees",
    },
    (user.role === "Secretary" ||
      user.role === "Technical Admin" ||
      user.role === "Clerk") && {
      title: (
        <div className="flex items-center gap-2">
          Residents
          {pendingResidents > 0 && (
            <span className="ml-1 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
          )}
        </div>
      ),
      icon: <IoIosPeople />,
      path: "/residents",
    },
    (user.role === "Secretary" ||
      user.role === "Clerk" ||
      user.role === "Technical Admin") && {
      title: (
        <div className="flex items-center gap-2">
          Households
          {pendingHouseholds > 0 && (
            <span className="ml-1 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
          )}
        </div>
      ),
      icon: <BsFillHouseFill />,
      path: "/households",
    },
    (user.role === "Justice" || user.role === "Secretary") && {
      title: (
        <div className="flex items-center gap-2">
          Blotter Reports
          {pendingBlotters > 0 && (
            <span className="ml-1 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
          )}
        </div>
      ),
      icon: <MdEditDocument />,
      path: "/blotter-reports",
    },
    (user.role === "Secretary" || user.role === "Clerk") && {
      title: (
        <div className="flex items-center gap-2">
          Document Requests
          {pendingDocuments > 0 && (
            <span className="ml-1 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
          )}
        </div>
      ),
      icon: <IoDocumentTextSharp />,
      path: "/document-requests",
    },
    (user.role === "Secretary" || user.role === "Clerk") && {
      title: (
        <div className="flex items-center gap-2">
          Court Reservations
          {pendingReservations > 0 && (
            <span className="ml-1 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
          )}
        </div>
      ),
      icon: <PiCourtBasketballFill />,
      path: "/court-reservations",
    },
    (user.role === "Secretary" ||
      user.role === "Clerk" ||
      user.role === "Justice") && {
      title: "Announcements",
      icon: <BiSolidMegaphone />,
      path: "/announcements",
    },
    (user.role === "Secretary" ||
      user.role === "Clerk" ||
      user.role === "Justice") && {
      title: (
        <div className="flex items-center gap-2">
          SOS Update Reports
          {activeSOS > 0 && (
            <span className="ml-1 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
          )}
        </div>
      ),
      icon: <AiFillAlert />,
      path: "/sos-update-reports",
    },
    (user.role === "Secretary" ||
      user.role === "Clerk" ||
      user.role === "Justice") && {
      title: "River Snapshots",
      icon: <BiSolidCctv />,
      path: "/river-snapshots",
    },
    (user.role === "Secretary" || user.role === "Clerk") && {
      title: "Emergency Hotlines",
      icon: <RiContactsBook3Fill />,
      path: "/emergency-hotlines",
    },
    (user.role === "Secretary" || user.role === "Technical Admin") && {
      title: "User Accounts",
      icon: <FaUsersCog />,
      path: "/user-accounts",
    },
    (user.role === "Secretary" || user.role === "Technical Admin") && {
      title: "Activity Logs",
      icon: <PiUserSwitchFill />,
      path: "/activity-logs",
    },
  ].filter(Boolean);

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="flex flex-col overflow-y-auto h-full hide-scrollbar">
        <div
          className={`sidebar-toggle-btn ${isCollapsed ? "m-3" : ""}`}
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <div className="block">
              <BiMenu className="text-xl" />
            </div>
          ) : (
            <>
              {/* For smaller screens*/}
              <div className="block sm:block md:hidden lg:hidden ml-3 mb-2">
                <BiMenu className="text-xl" />
              </div>

              {/* For medium and large screens*/}
              <div className="hidden sm:hidden md:block lg:block">
                <BiMenuAltLeft className="text-xl" />
              </div>
            </>
          )}
        </div>

        <div
          className={`sidebar-logo-container ${
            isCollapsed ? "justify-start mt-4" : "justify-center"
          }`}
        >
          <img
            src={AppLogo}
            alt="App Logo"
            className={`sidebar-logo-img ${
              isCollapsed ? "rotate-[360deg]" : ""
            }`}
            style={{
              filter: "drop-shadow(8px 8px 10px rgba(0, 0, 0, 0.3))",
            }}
          />
          <span
            className={`flex flex-col text-center ${
              isCollapsed ? "hidden" : "block"
            }`}
          >
            <h1 className="sidebar-app-name">eBarrio</h1>
            <h1 className="text-[rgba(255,255,255,0.50)] text-[12px] text-[#808080] font-subTitle font-semibold hidden md:block lg:block">
              Barangay Management <br /> Disaster Response System
            </h1>
          </span>
        </div>

        <ul className="sidebar-menu">
          {Menus.map((menu, index) => {
            //Custom active highlight for residents subpage
            const isResidentsActive =
              menu.path === "/residents" &&
              ["/residents", "/create-resident"].includes(location.pathname);

            //Custom active highlight for blotter subpage
            const isBlotterActive =
              menu.path === "/blotter-reports" &&
              location.pathname.startsWith("/create-blotter");

            const isDefaultActive = location.pathname === menu.path;

            const isActive =
              isResidentsActive || isBlotterActive || isDefaultActive;

            return (
              <li key={index} className="sidebar-menu-item group mb-[-5px]">
                <NavLink
                  to={menu.path}
                  className={`flex items-center sidebar-menu-item-link ${
                    isActive ? "sidebar-active" : ""
                  }`}
                >
                  <span
                    className={`sidebar-menu-item-icon ml-2 ${
                      isCollapsed ? "ml-3" : ""
                    }`}
                    aria-hidden="true"
                  >
                    {menu.icon}
                  </span>
                  <span
                    className={`sidebar-menu-item-title ${
                      isCollapsed ? "hidden" : "block"
                    }`}
                  >
                    {menu.title}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
