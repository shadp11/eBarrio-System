import User from "../models/Users.js";
import Resident from "../models/Residents.js";
import Blotter from "../models/Blotters.js";
import ActivityLog from "../models/ActivityLogs.js";
import { sendNotificationUpdate } from "../utils/collectionUtils.js";
import Notification from "../models/Notifications.js";

export const sendBlotter = async (req, res) => {
  try {
    const { userID } = req.user;
    const { updatedForm } = req.body;
    const blotter = new Blotter({
      ...updatedForm,
    });
    await blotter.save();

    const resident = await Resident.findById(blotter.complainantID);

    const io = req.app.get("socketio");

    io.emit("blotterreports", {
      title: "Blotter Report",
      message: `${resident.firstname} ${resident.lastname} filed a blotter.`,
      timestamp: blotter.createdAt,
    });

    const allUsers = await User.find(
      {
        status: { $in: ["Active", "Inactive"] },
        role: { $in: ["Secretary", "Justice"] },
        _id: { $ne: req.user.userID },
      },
      "_id"
    );

    const notifications = allUsers.map((user) => ({
      userID: user._id,
      title: "📄 Blotter Report",
      message: `${resident.firstname} ${resident.lastname} filed a blotter.`,
      redirectTo: "/blotter-reports",
    }));

    await Notification.insertMany(notifications);

    notifications.forEach((notif) => {
      sendNotificationUpdate(notif.userID.toString(), io);
    });

    await ActivityLog.insertOne({
      userID,
      action: "Create",
      target: "Blotter Reports",
      description: `User submitted a blotter report.`,
    });
    return res.status(200).json({ message: "Blotter submitted successfully!" });
  } catch (error) {
    console.error("Error submitting blotters:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
