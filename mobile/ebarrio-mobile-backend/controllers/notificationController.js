import Notification from "../models/Notifications.js";
import {
  getAllNotificationsUtils,
  getUnreadNotifications,
  sendNotificationUpdate,
} from "../utils/collectionUtils.js";

export const unreadNotifications = async (req, res) => {
  try {
    const { userID } = req.user;
    const notifications = await getUnreadNotifications(userID);
    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error getting unread notifications", error);
    res
      .status(500)
      .json({ message: "Failed to fetching unread notifications" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const { userID } = req.user;

    await Notification.updateMany(
      { userID: userID, read: false },
      { $set: { read: true } }
    );

    const io = req.app.get("socketio");
    sendNotificationUpdate(userID, io);

    res
      .status(200)
      .json({ message: "All notification mark as read successfully" });
  } catch (error) {
    console.log("Error fetching marking all as read", error);
    res.status(500).json({ message: "Failed to fetch mark as read" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notifID } = req.params;
    const notification = await Notification.findById(notifID);

    notification.read = true;
    await notification.save();

    const io = req.app.get("socketio");
    sendNotificationUpdate(req.user.userID, io);

    res.status(200).json({ message: "Notification mark as read successfully" });
  } catch (error) {
    console.log("Error fetching marking as read", error);
    res.status(500).json({ message: "Failed to fetch mark as read" });
  }
};

export const getAllNotifications = async (req, res) => {
  try {
    const { userID } = req.user;
    const notifications = await getAllNotificationsUtils(userID);
    if (!notifications) {
      res.status(404).json({ message: "Notifications not found" });
    }
    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error fetching notifications", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};
