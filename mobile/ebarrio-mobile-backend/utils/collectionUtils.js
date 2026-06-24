import Announcement from "../models/Announcements.js";
import CourtReservation from "../models/CourtReservations.js";
import Blotter from "../models/Blotters.js";
import User from "../models/Users.js";
import Certificate from "../models/Certificates.js";
import axios from "axios";
import Notification from "../models/Notifications.js";
import mongoose from "mongoose";
import EmergencyHotline from "../models/EmergencyHotlines.js";
import SOS from "../models/SOS.js";

export const getPendingSOSUtils = async (resID) => {
  try {
    const reports = await SOS.find({
      status: { $in: ["Pending", "Ongoing"] },
    }).populate({
      path: "resID",
      select: "firstname lastname age mobilenumber picture householdno",
      populate: {
        path: "householdno",
        select: "address",
      },
    });
    return reports;
  } catch (error) {
    console.error("Error fetching SOS:", error);
    return 0;
  }
};

export const getActiveSOSUtils = async (resID) => {
  try {
    const report = await SOS.find({
      status: { $in: ["Pending", "Ongoing"] },
      resID: resID,
    }).populate({
      path: "responder.empID",
      select: "resID position",
      populate: {
        path: "resID",
        select: "firstname lastname mobilenumber picture",
      },
    });
    return report;
  } catch (error) {
    console.error("Error fetching SOS:", error);
    return 0;
  }
};

export const getAllNotificationsUtils = async (userID) => {
  try {
    const notifs = await Notification.find({
      userID: userID,
    });
    return notifs;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return 0;
  }
};

export const getUnreadNotifications = async (userID) => {
  try {
    const count = await Notification.countDocuments({
      read: false,
      userID: userID,
    });
    return count;
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return 0;
  }
};
export const getUsersUtils = async () => {
  try {
    const users = await User.find()
      .populate({
        path: "resID",
        select: "firstname middlename lastname picture",
      })
      .populate({
        path: "empID",
        populate: {
          path: "resID",
          select: "firstname middlename lastname picture",
        },
      });
    const formatDatePH = (date) => {
      return new Date(date).toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    return users.map((user) => ({
      ...user.toObject(),
      createdAt: formatDatePH(user.createdAt),
      updatedAt: formatDatePH(user.updatedAt),
    }));

    return users;
  } catch (error) {
    throw new Error("Error fetching users: " + error.message);
  }
};

export const sendEventNotification = async () => {
  const db = mongoose.connection.db;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const announcements = await db
    .collection("announcements")
    .find({ status: { $ne: "Archived" } })
    .toArray();

  const todaysEvents = announcements.filter((announcement) => {
    const times = announcement.times || {};
    for (const key in times) {
      const start = new Date(times[key].starttime);
      const end = new Date(times[key].endtime);
      if (start < tomorrow && end > today) {
        return true;
      }
    }
    return false;
  });

  if (todaysEvents.length === 0) return;

  const users = await db
    .collection("users")
    .find({ pushtoken: { $exists: true } })
    .toArray();

  for (const user of users) {
    console.log("Push token", user.pushtoken);
    await sendPushNotification(
      user.pushtoken,
      "📅 Today's Events",
      `The barangay have ${todaysEvents.length} event(s) today!`,
      "BrgyCalendar"
    );
  }
  console.log(`Notified users of ${todaysEvents.length} event(s) today.`);
};

export const sendNotificationUpdate = async (userID, io) => {
  const notifications = await Notification.find({ userID });
  io.to(userID).emit("notificationUpdate", notifications);
};

export const sendPushNotification = async (pushtoken, title, body, screen) => {
  if (!pushtoken?.startsWith("ExponentPushToken")) {
    console.error("Invalid Expo push token:", pushtoken);
    return;
  }

  try {
    const response = await axios.post("https://exp.host/--/api/v2/push/send", {
      to: pushtoken,
      sound: "default",
      title,
      body,
      data: { screen: screen },
    });
    console.log("✅ Push notification sent! Response:", response.data);
  } catch (error) {
    console.error("❌ Failed to send push notification:", error.message);
  }
};

export const findUserIDByResID = async (resID) => {
  const user = await User.findOne({ resID: resID });
  if (!user) return null;
  return user._id;
};

export const getServicesUtils = async (userID) => {
  try {
    const user = await User.findById(userID);
    const resID = user.resID;

    const certificates = await Certificate.find(
      { resID: resID },
      { certID: 0 }
    );

    const reservations = await CourtReservation.find({ resID: resID });

    const blotters = await Blotter.find({ complainantID: resID })
      .populate({
        path: "subjectID",
        select: "firstname lastname address",
      })
      .populate({ path: "witnessID", select: "firstname lastname" });

    const certificatesWithType = certificates.map((c) => ({
      ...c.toObject(),
      type: "Certificate",
    }));
    const reservationsWithType = reservations.map((r) => {
      const timesObj = Object.fromEntries(r.times);
      return {
        ...r.toObject(),
        type: "Reservation",
        times: timesObj,
      };
    });
    const blottersWithType = blotters.map((b) => ({
      ...b.toObject(),
      type: "Blotter",
    }));

    const combined = [
      ...certificatesWithType,
      ...reservationsWithType,
      ...blottersWithType,
    ];

    return combined;
  } catch (error) {
    throw new Error("Error fetching services: " + error.message);
  }
};

export const getEmergencyHotlinesUtils = async () => {
  try {
    const emergency = await EmergencyHotline.find({
      status: { $ne: "Archived" },
    });

    return emergency;
  } catch (error) {
    throw new Error("Error fetching announcements: " + error.message);
  }
};

export const getAnnouncementsUtils = async () => {
  try {
    const announcements = await Announcement.find().populate({
      path: "uploadedby",
      select: "position",
      populate: {
        path: "resID",
        select: "firstname middlename lastname picture",
      },
    });

    return announcements;
  } catch (error) {
    throw new Error("Error fetching announcements: " + error.message);
  }
};
