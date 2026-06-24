import React, { useState, useContext, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";
import SessionTimeout from "./components/SessionTimeout";
import Chat from "./components/Chat";
import { AuthContext } from "./context/AuthContext";
import { SocketContext } from "./context/SocketContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import softNotification from "./assets/soft-notification.mp3";

const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isAuthenticated, playNotificationSound } =
    useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;

    if (isOpen) {
      return;
    }
    const handleChatEvent = (chat) => {
      playNotificationSound(softNotification);
      toast.info(
        <div onClick={() => setIsOpen(true)} style={{ cursor: "pointer" }}>
          <strong>{chat.title}</strong>
          <div>{chat.message}</div>
        </div>
      );
    };

    socket.on("chats", handleChatEvent);
    return () => socket.off("chats", handleChatEvent);
  }, [socket, isOpen]);

  return (
    <div className={`page-grid ${isCollapsed ? "collapsed" : ""}`}>
      {isAuthenticated && user && (
        <Sidebar
          isCollapsed={isCollapsed}
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />
      )}

      <Navbar isCollapsed={isCollapsed} />
      <div className="page-content">
        <Outlet />
      </div>

      {isAuthenticated && user && user.role !== "Technical Admin" && (
        <Chat isOpen={isOpen} setIsOpen={setIsOpen} />
      )}
      <SessionTimeout timeout={15 * 60 * 1000} />
    </div>
  );
};

export default AppLayout;
