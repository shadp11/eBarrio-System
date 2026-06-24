import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import Certificates from "./Certificates";
import CourtReservations from "./CourtReservations";
import { useNavigation } from "@react-navigation/native";
import LoadingScreen from "./LoadingScreen";

const PublicRoute = ({ element }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    if (isAuthenticated === true) {
      setTimeout(() => {
        navigation.navigate("BottomTabs");
      }, 1000);
    }
  }, [isAuthenticated, navigation]);

  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <LoadingScreen />;
  }

  return element;
};

export default PublicRoute;
