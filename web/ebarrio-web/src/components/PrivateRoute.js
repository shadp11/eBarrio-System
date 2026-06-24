import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

//SCREENS
import LoadingScreen from "./LoadingScreen";

const PrivateRoute = ({ element, allowedRoles }) => {
  const { isAuthenticated, user } = useContext(AuthContext);

  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // return <Navigate to="/dashboard" replace />;
    if (user?.role === "Technical Admin") {
      return <Navigate to="/user-accounts" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return element;
};

export default PrivateRoute;
