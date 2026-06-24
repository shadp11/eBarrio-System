import express from "express";
import {
  checkResident,
  registerUser,
  loginUser,
  refreshAccessToken,
  sendOTP,
  checkRefreshToken,
  logoutUser,
  verifyOTP,
  getMobileNumber,
  checkCredentials,
  checkUsername,
  deactivatedUser,
  archivedUser,
  updatedUser,
  changedPasswordUser,
} from "../controllers/authController.js";
import {
  getAllUsers,
  getUserDetails,
  logActivity,
  resetPassword,
  setPushToken,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  cancelCertReq,
  sendCertReq,
} from "../controllers/certificateController.js";
import { getEmergencyHotlines } from "../controllers/emergencyHotlines.js";
import {
  cancelReservationReq,
  getReservations,
  sendReservationReq,
} from "../controllers/courtCountroller.js";
import { sendBlotter } from "../controllers/blotterController.js";
import { getWeather } from "../controllers/weatherController.js";
import {
  createHouseholdResident,
  createResident,
  getAllResidents,
} from "../controllers/residentsController.js";
import {
  getAnnouncements,
  heartAnnouncement,
  unheartAnnouncement,
} from "../controllers/announcementController.js";
import {
  changeMobileNumber,
  changePassword,
  changeSecurityQuestions,
  changeUsername,
  checkPassword,
} from "../controllers/settingsController.js";
import {
  checkOTP,
  checkUser,
  limitOTP,
  newPassword,
  verifySecurityQuestion,
} from "../controllers/forgotPassController.js";
import { getServicesSubmitted } from "../controllers/statusController.js";
import {
  getAllNotifications,
  markAllAsRead,
  markAsRead,
  unreadNotifications,
} from "../controllers/notificationController.js";
import { getAllHousehold } from "../controllers/householdController.js";
import {
  alertResidents,
  getLatestSnapshot,
} from "../controllers/snapshotController.js";
import {
  getActive,
  getChatHistory,
  getFAQs,
} from "../controllers/chatController.js";
import {
  arrivedSOS,
  cancelSOS,
  didntArriveSOS,
  getActiveSOS,
  getPendingSOS,
  getRespondedSOS,
  headingSOS,
  sendSOS,
  sendSOSWithDetails,
  submitFalseAlarm,
  submitPostIncident,
} from "../controllers/SOSController.js";
import {
  getHousehold,
  getProfile,
  updateResident,
} from "../controllers/profileController.js";

const router = express.Router();

router.post("/refresh", refreshAccessToken);
router.post("/checkresident", checkResident);
router.post("/register", registerUser);

//LOGIN
router.post("/login", loginUser);
router.get("/getmobilenumber/:username", getMobileNumber);
router.post("/checkcredentials", checkCredentials);
router.get("/getuserdetails", authMiddleware, getUserDetails);
router.post("/deactivateduser", authMiddleware, deactivatedUser);
router.post("/archiveduser/:userID", authMiddleware, archivedUser);
router.post("/updateduser", authMiddleware, updatedUser);
router.post("/changedpassword", authMiddleware, changedPasswordUser);

router.post("/checkrefreshtoken", checkRefreshToken);
router.get("/refreshtoken", refreshAccessToken);
router.post("/logout", authMiddleware, logoutUser);

//FORGOT PASSWORD
router.get("/checkuser/:username", checkUser);
router.post("/verifyquestion/:username", verifySecurityQuestion);
router.post("/newpassword/:username", authMiddleware, newPassword);
router.get("/limitotp/:username", limitOTP);
router.get("/checkotp/:username", checkOTP);

//USERS
router.put("/resetpassword/:username", resetPassword);
router.post("/logactivity", authMiddleware, logActivity);
router.get("/getusers", authMiddleware, getAllUsers);

//OTP
router.post("/sendotp", sendOTP);
router.post("/verifyotp", verifyOTP);

//CERTIFICATE REQUESTS
router.post("/sendcertrequest", authMiddleware, sendCertReq);
router.put("/cancelcertrequest/:certID", authMiddleware, cancelCertReq);

//COURT RESERVATIONS
router.post("/sendreservationrequest", authMiddleware, sendReservationReq);
router.get("/getreservations", authMiddleware, getReservations);
router.put(
  "/cancelreservationrequest/:reservationID",
  authMiddleware,
  cancelReservationReq
);

//BLOTTER REPORTS
router.post("/sendblotter", authMiddleware, sendBlotter);

//EMERGENCY HOTLINES
router.get("/getemergencyhotlines", authMiddleware, getEmergencyHotlines);

//WEATHER
router.get("/getweather", getWeather);

//RESIDENTS
router.get("/getresidents", getAllResidents);

//ANNOUNCEMENTS
router.get("/getannouncements", getAnnouncements);
router.put(
  "/heartannouncement/:announcementID",
  authMiddleware,
  heartAnnouncement
);
router.put(
  "/unheartannouncement/:announcementID",
  authMiddleware,
  unheartAnnouncement
);

//ACCOUNT SETTINGS
router.get("/checkusername/:username", authMiddleware, checkUsername);
router.put("/changeusername", authMiddleware, changeUsername);
router.put("/changepassword", authMiddleware, changePassword);
router.put("/changemobilenumber", authMiddleware, changeMobileNumber);
router.put("/changesecurityquestions", authMiddleware, changeSecurityQuestions);
router.post("/checkpassword", authMiddleware, checkPassword);

//STATUS
router.get("/getservices", authMiddleware, getServicesSubmitted);

//NOTIFICATIONS
router.put("/setpushtoken", authMiddleware, setPushToken);
router.get("/getnotifications", authMiddleware, getAllNotifications);
router.put("/readnotification/:notifID", authMiddleware, markAsRead);
router.put("/readnotifications", authMiddleware, markAllAsRead);
router.get("/getunreadnotifications", authMiddleware, unreadNotifications);

//RESIDENTS FORM
router.post("/createresident", createResident);
router.post("/household/createresident", createHouseholdResident);
router.get("/gethouseholds", getAllHousehold);

//SNAPSHOTS
router.get("/latestsnapshot", getLatestSnapshot);
router.post("/alertresidents", authMiddleware, alertResidents);

//FAQs
router.get("/getfaqs", authMiddleware, getFAQs);
router.get("/getactive", authMiddleware, getActive);
router.get("/getchat", authMiddleware, getChatHistory);

//SOS
router.post("/sendsos", authMiddleware, sendSOS);
router.post("/sendsoswithdetails", authMiddleware, sendSOSWithDetails);
router.get("/getactivesos", authMiddleware, getActiveSOS);
router.get("/getpendingsos", authMiddleware, getPendingSOS);
router.put("/headingsos/:reportID", authMiddleware, headingSOS);
router.put("/arrivedsos/:reportID", authMiddleware, arrivedSOS);
router.put("/didntarrivesos/:reportID", authMiddleware, didntArriveSOS);
router.put("/postincident/:reportID", authMiddleware, submitPostIncident);
router.put("/falsealarm/:reportID", authMiddleware, submitFalseAlarm);
router.get("/getrespondedsos", authMiddleware, getRespondedSOS);
router.put("/cancelsos/:reportID", authMiddleware, cancelSOS);

//PROFILE
router.get("/getprofile", authMiddleware, getProfile);
router.get("/gethousehold/:householdID", authMiddleware, getHousehold);
router.put("/updateprofile", authMiddleware, updateResident);
export default router;
