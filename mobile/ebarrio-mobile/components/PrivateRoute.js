import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import LoadingScreen from "./LoadingScreen";

const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    if (isAuthenticated === false) {
      setTimeout(() => {
        navigation.navigate("Login");
      }, 1000);
    }
  }, [isAuthenticated, navigation]);

  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }
  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  return element;
};

export default PrivateRoute;
