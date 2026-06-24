import Announcement from "../models/Announcements.js";
import { getAnnouncementsUtils } from "../utils/collectionUtils.js";
import Notification from "../models/Notifications.js";
import { sendNotificationUpdate } from "../utils/collectionUtils.js";
import Resident from "../models/Residents.js";
import User from "../models/Users.js";
import ActivityLog from "../models/ActivityLogs.js";
import Employee from "../models/Employees.js";

export const unheartAnnouncement = async (req, res) => {
  try {
    const { announcementID } = req.params;
    const userID = req.user.userID;
    const announcement = await Announcement.findById(announcementID);

    announcement.hearts = announcement.hearts - 1;
    announcement.heartedby = announcement.heartedby.filter(
      (id) => !id.equals(userID)
    );

    await announcement.save();

    let likerName = "Someone";

    if (role === "Resident") {
      const resident = await Resident.findOne({ userID }).select(
        "firstname lastname"
      );
      if (resident) {
        likerName = `${resident.firstname} ${resident.lastname}`;
      }
    } else if (role === "Official") {
      const employee = await Employee.findOne({ userID });
      const resident = await Resident.findById(employee.resID).select(
        "firstname lastname"
      );
      if (employee) {
        likerName = `${resident.firstname} ${resident.lastname}`;
      }
    }
    const io = req.app.get("socketio");

    const user = await User.findOne({ empID: announcement.uploadedby });

    await Notification.deleteOne({
      announcementID: announcement._id,
      message: `${likerName} liked your post`,
    });

    sendNotificationUpdate(user._id.toString(), io);

    await ActivityLog.insertOne({
      userID,
      action: "Unlike",
      target: "Announcements",
      description: `User unliked ${announcement.title} post`,
    });

    res.status(200).json({ message: "Announcement unliked successfully" });
  } catch (error) {
    console.error("Error in unliking announcements:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const heartAnnouncement = async (req, res) => {
  try {
    const { announcementID } = req.params;
    const { userID, role } = req.user;
    const announcement = await Announcement.findById(announcementID);

    announcement.hearts = announcement.hearts + 1;
    announcement.heartedby.push(userID);

    await announcement.save();

    let likerName = "Someone";

    if (role === "Resident") {
      const resident = await Resident.findOne({ userID }).select(
        "firstname lastname"
      );
      if (resident) {
        likerName = `${resident.firstname} ${resident.lastname}`;
      }
    } else if (role === "Official") {
      const employee = await Employee.findOne({ userID });
      const resident = await Resident.findById(employee.resID).select(
        "firstname lastname"
      );
      if (employee) {
        likerName = `${resident.firstname} ${resident.lastname}`;
      }
    }
    const user = await User.findOne({ empID: announcement.uploadedby });

    const io = req.app.get("socketio");

    io.to(user._id).emit("announcement", {
      title: `❤️ ${announcement.title}`,
      message: `${likerName} liked your post`,
      timestamp: announcement.updatedAt,
    });

    const notification = {
      userID: user._id,
      title: `❤️ ${announcement.title}`,
      message: `${likerName} liked your post`,
      redirectTo: "/announcements",
      announcementID: announcement._id,
    };

    await Notification.insertOne(notification);
    sendNotificationUpdate(user._id.toString(), io);

    await ActivityLog.insertOne({
      userID,
      action: "Like",
      target: "Announcements",
      description: `User liked ${announcement.title} post`,
    });

    res.status(200).json({ message: "Announcement liked successfully" });
  } catch (error) {
    console.error("Error in liking announcements:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const formattedAnnouncement = await getAnnouncementsUtils();
    res.status(200).json(formattedAnnouncement);
  } catch (error) {
    console.error("Error in fetching announcements:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
