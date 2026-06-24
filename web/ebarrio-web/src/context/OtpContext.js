import { createContext, useState, useEffect } from "react";
import api from "../api";

export const OtpContext = createContext();

export const OtpProvider = ({ children }) => {
  const sendOTP = async (username, mobilenumber) => {
    try {
      await api.post("/sendotp", { username, mobilenumber });
    } catch (error) {
      console.log("Error sending OTP", error);
    }
  };

  const verifyOTP = async (username, OTP) => {
    try {
      const response = await api.post("/verifyotp", { username, OTP });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <OtpContext.Provider value={{ sendOTP, verifyOTP }}>
      {children}
    </OtpContext.Provider>
  );
};
