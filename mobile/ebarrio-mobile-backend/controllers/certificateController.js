import User from "../models/Users.js";
import Resident from "../models/Residents.js";
import Certificate from "../models/Certificates.js";
import mongoose from "mongoose";
import Notification from "../models/Notifications.js";
import { sendNotificationUpdate } from "../utils/collectionUtils.js";
import ActivityLog from "../models/ActivityLogs.js";

export const cancelCertReq = async (req, res) => {
  try {
    const { certID } = req.params;
    const { certReason } = req.body;
    const { userID } = req.user;
    const cert = await Certificate.findById(certID);

    const resident = await Resident.findById(cert.resID).select(
      "firstname lastname"
    );

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    cert.status = "Cancelled";
    cert.remarks = certReason;
    await cert.save();

    const io = req.app.get("socketio");

    io.emit("certificates", {
      title: `❌ ${cert.typeofcertificate} Request Cancelled`,
      message: `${resident.firstname} ${
        resident.lastname
      } cancelled their ${cert.typeofcertificate.toLowerCase()} request.`,
      timestamp: cert.createdAt,
      cancelled: true,
    });

    const allUsers = await User.find(
      {
        status: { $in: ["Active", "Inactive"] },
        role: { $in: ["Secretary", "Clerk"] },
        _id: { $ne: resident.userID },
      },
      "_id"
    );

    const notifications = allUsers.map((user) => ({
      userID: user._id,
      title: `❌ ${cert.typeofcertificate} Request Cancelled`,
      message: `${resident.firstname} ${
        resident.lastname
      } cancelled their ${cert.typeofcertificate.toLowerCase()} request.`,
      redirectTo: "/document-requests",
    }));

    await Notification.insertMany(notifications);

    notifications.forEach((notif) => {
      sendNotificationUpdate(notif.userID.toString(), io);
    });

    await ActivityLog.insertOne({
      userID,
      action: "Cancel",
      target: "Document Requests",
      description: `User cancelled their ${cert.typeofcertificate.toLowerCase()} request.`,
    });
    return res
      .status(200)
      .json({ message: "Certificate cancelled successfully!" });
  } catch (error) {
    console.error("Error cancelling certificate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendCertReq = async (req, res) => {
  try {
    const { filteredData, userID } = req.body;

    const userIDAsObjectId = new mongoose.Types.ObjectId(userID);
    const user = await User.findById(userIDAsObjectId);

    const resident = await Resident.findById(user.resID).select(
      "firstname lastname"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const certificate = new Certificate({
      ...filteredData,
      resID: user.resID,
    });
    await certificate.save();

    const io = req.app.get("socketio");

    io.emit("certificates", {
      title: `📄 ${certificate.typeofcertificate} Request`,
      message: `${resident.firstname} ${
        resident.lastname
      } requested ${certificate.typeofcertificate.toLowerCase()}.`,
      timestamp: certificate.createdAt,
    });

    const allUsers = await User.find(
      {
        status: { $in: ["Active", "Inactive"] },
        role: { $in: ["Secretary", "Clerk"] },
        _id: { $ne: userID.userID },
      },
      "_id"
    );

    const notifications = allUsers.map((user) => ({
      userID: user._id,
      title: `📄 ${certificate.typeofcertificate} Request`,
      message: `${resident.firstname} ${
        resident.lastname
      } requested ${certificate.typeofcertificate.toLowerCase()}.`,
      redirectTo: "/document-requests",
    }));

    await Notification.insertMany(notifications);

    notifications.forEach((notif) => {
      sendNotificationUpdate(notif.userID.toString(), io);
    });

    await ActivityLog.insertOne({
      userID,
      action: "Create",
      target: "Document Requests",
      description: `User requested ${certificate.typeofcertificate.toLowerCase()}.`,
    });

    return res
      .status(200)
      .json({ message: "Certificate requested successfully!" });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
