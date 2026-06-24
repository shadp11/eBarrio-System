import SOS from "../models/SOS.js";
import { rds } from "../index.js";
import {
  getActiveSOSUtils,
  getPendingSOSUtils,
  sendPushNotification,
  sendNotificationUpdate,
} from "../utils/collectionUtils.js";
import ActivityLog from "../models/ActivityLogs.js";
import User from "../models/Users.js";
import Notification from "../models/Notifications.js";
import Employee from "../models/Employees.js";

export const cancelSOS = async (req, res) => {
  try {
    const { userID, resID } = req.user;
    const { reportID } = req.params;

    const isLimited = await rds.get(`limitCancellation_${userID}`);
    if (isLimited) {
      return res.status(403).json({
        message: "You have reached the maximum of 3 cancellations for today.",
      });
    }

    const users = await User.find({
      status: { $in: ["Active", "Inactive"] },
      role: { $nin: ["Resident", "Technical Admin"] },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const cancelledCount = await SOS.countDocuments({
      resID,
      status: "Cancelled",
      updatedAt: { $gte: today, $lt: tomorrow },
    });

    if (cancelledCount >= 3) {
      await rds.setex(`limitCancellation_${userID}`, 86400, "true");
      return res.status(403).json({
        message: "You have reached the maximum of 3 cancellations for today.",
      });
    }

    const report = await SOS.findById(reportID).populate({
      path: "resID",
      select: "firstname lastname",
    });

    report.status = "Cancelled";

    await report.save();

    await ActivityLog.insertOne({
      userID,
      action: "Cancel",
      target: "SOS",
      description: `User cancelled their SOS report.`,
    });

    const io = req.app.get("socketio");

    io.to("sos").emit("sos", {
      title: `❌ Emergency Cancelled`,
      message: `${report.resID.firstname} ${report.resID.lastname} has cancelled their emergency report.`,
      timestamp: report.createdAt,
    });

    for (const user of users) {
      if (user?.pushtoken) {
        try {
          await sendPushNotification(
            user.pushtoken,
            `❌ Emergency Cancelled`,
            `${report.resID.firstname} ${report.resID.lastname} has cancelled their emergency report.`,
            "SOSRequests"
          );

          console.log(`✅ Notification sent to ${user.username}`);
        } catch (err) {
          console.error(
            `❌ Failed to send notification to ${user.username}:`,
            err
          );
        }
      } else {
        console.log("⚠️ No push token found for user:", user.username);
      }
      await Notification.create({
        userID: user._id,
        title: `❌ Emergency Cancelled`,
        message: `${report.resID.firstname} ${report.resID.lastname} has cancelled their emergency report.`,
        redirectTo: "SOSRequests",
      });
      sendNotificationUpdate(user._id.toString(), io);
    }

    return res
      .status(200)
      .json({ message: "SOS report cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRespondedSOS = async (req, res) => {
  try {
    const { empID } = req.user;
    const reports = await SOS.find({
      "responder.empID": empID,
      status: { $in: ["Resolved", "False Alarm"] },
    }).populate({
      path: "resID",
      select: "firstname lastname age mobilenumber picture householdno",
      populate: {
        path: "householdno",
        select: "address",
      },
    });
    return res.status(200).json(reports);
  } catch (error) {
    console.error("Error get responded SOS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const submitFalseAlarm = async (req, res) => {
  try {
    const { userID, empID } = req.user;
    const { reportID } = req.params;
    const { falseAlarmForm } = req.body;

    const report = await SOS.findById(reportID)
      .populate({
        path: "resID",
        select: "lastname firstname",
      })
      .populate({
        path: "responder",
        populate: {
          path: "empID",
          populate: {
            path: "userID",
            select: "_id pushtoken",
          },
        },
      });

    const employee = await Employee.findById(empID).populate({
      path: "resID",
      select: "lastname firstname",
    });

    const webAdmins = await User.find({
      role: { $in: ["Secretary", "Clerk", "Justice"] },
    });
    report.postreportdetails = falseAlarmForm.postreportdetails;
    report.evidence = falseAlarmForm.evidence;
    report.status = "False Alarm";

    await report.save();

    const io = req.app.get("socketio");

    for (const user of webAdmins) {
      io.to(user._id.toString()).emit("sos", {
        title: `🆘 Emergency Update`,
        message: `${employee.resID.firstname} ${employee.resID.lastname} has submitted a false alarm report regarding ${report.resID.firstname} ${report.resID.lastname}'s emergency.`,
        timestamp: report.updatedAt,
        redirectTo: "RespondedSOS",
      });
      await Notification.create({
        userID: user._id,
        title: `🆘 Emergency Update`,
        message: `${employee.resID.firstname} ${employee.resID.lastname} has submitted a false alarm report regarding ${report.resID.firstname} ${report.resID.lastname}'s emergency.`,
        redirectTo: "/sos-update-reports",
      });
      sendNotificationUpdate(user._id.toString(), io);
    }

    for (const user of report.responder) {
      if (user.empID.userID._id.toString() !== userID.toString()) {
        if (user.empID.userID.pushtoken) {
          await sendPushNotification(
            user.empID.userID.pushtoken,
            `🆘 Emergency Report Update`,
            `${employee.resID.firstname} ${employee.resID.lastname} has submitted a false alarm report regarding ${report.resID.firstname} ${report.resID.lastname}'s emergency.`,
            "RespondedSOS"
          );
        } else {
          console.log("⚠️ No push token found for user:", user.username);
        }
        io.to(user.empID.userID._id.toString()).emit("sos", {
          title: `🆘 Emergency Update`,
          message: `${employee.resID.firstname} ${employee.resID.lastname} has submitted a false alarm report regarding ${report.resID.firstname} ${report.resID.lastname}'s emergency.`,
          timestamp: report.updatedAt,
          redirectTo: "RespondedSOS",
        });
        await Notification.create({
          userID: user.empID.userID._id,
          title: `🆘 Emergency Update`,
          message: `${employee.resID.firstname} ${employee.resID.lastname} has submitted a false alarm report regarding ${report.resID.firstname} ${report.resID.lastname}'s emergency.`,
          redirectTo: "RespondedSOS",
        });
        sendNotificationUpdate(user.empID.userID._id.toString(), io);
      }
    }
    await ActivityLog.insertOne({
      userID,
      action: "Update",
      target: "SOS",
      description: `User submitted a false alarm report for ${report.resID.lastname}, ${report.resID.firstname}'s SOS report.`,
    });

    return res
      .status(200)
      .json({ message: "You have marked the report as a false alarm." });
  } catch (error) {
    console.error("Error submitting false alarm report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const submitPostIncident = async (req, res) => {
  try {
    const { userID, empID } = req.user;
    const { reportID } = req.params;
    const { postIncidentForm } = req.body;

    const report = await SOS.findById(reportID)
      .populate({
        path: "resID",
        select: "lastname firstname",
      })
      .populate({
        path: "responder",
        populate: {
          path: "empID",
          populate: {
            path: "userID",
            select: "_id pushtoken",
          },
        },
      });

    const employee = await Employee.findById(empID).populate({
      path: "resID",
      select: "lastname firstname",
    });

    const webAdmins = await User.find({
      role: { $in: ["Secretary", "Clerk", "Justice"] },
    });

    report.postreportdetails = postIncidentForm.postreportdetails;
    report.evidence = postIncidentForm.evidence;
    report.status = "Resolved";

    await report.save();

    const io = req.app.get("socketio");

    for (const user of webAdmins) {
      io.to(user._id.toString()).emit("sos", {
        title: `🆘 Emergency Update`,
        message: `${employee.resID.firstname} ${employee.resID.lastname} has submitted a post-incident report regarding ${report.resID.firstname} ${report.resID.lastname}'s emergency.`,
        timestamp: report.updatedAt,
        redirectTo: "RespondedSOS",
      });
      await Notification.create({
        userID: user._id,
        title: `🆘 Emergency Update`,
        message: `${employee.resID.firstname} ${employee.resID.lastname} has submitted a post-incident report regarding ${report.resID.firstname} ${report.resID.lastname}'s emergency.`,
        redirectTo: "/sos-update-reports",
      });
      sendNotificationUpdate(user._id.toString(), io);
    }

    for (const user of report.responder) {
      if (user.empID.userID._id.toString() !== userID.toString()) {
        if (user.empID.userID.pushtoken) {
          await sendPushNotification(
            user.empID.userID.pushtoken,
            `🆘 Emergency Report Update`,
            `${employee.resID.firstname} ${employee.resID.lastname} has submitted a post-incident report regarding ${report.resID.firstname} ${report.resID.lastname}'s emergency.`,
            "RespondedSOS"
          );
        } else {
          console.log("⚠️ No push token found for user:", user.username);
        }
        io.to(user.empID.userID._id.toString()).emit("sos", {
          title: `🆘 Emergency Update`,
          message: `${employee.resID.firstname} ${employee.resID.lastname} has submitted a post-incident report regarding ${report.resID.firstname} ${report.resID.lastname}'s emergency.`,
          timestamp: report.updatedAt,
          redirectTo: "RespondedSOS",
        });
        await Notification.create({
          userID: user.empID.userID._id,
          title: `🆘 Emergency Update`,
          message: `${employee.resID.firstname} ${employee.resID.lastname} has submitted a post-incident report regarding ${report.resID.firstname} ${report.resID.lastname}'s emergency.`,
          redirectTo: "RespondedSOS",
        });
        sendNotificationUpdate(user.empID.userID._id.toString(), io);
      }
    }

    await ActivityLog.insertOne({
      userID,
      action: "Update",
      target: "SOS",
      description: `User submitted a post-incident report for ${report.resID.lastname}, ${report.resID.firstname}'s SOS report.`,
    });

    return res
      .status(200)
      .json({ message: "The report has been successfully resolved." });
  } catch (error) {
    console.error("Error submitting post incident report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const didntArriveSOS = async (req, res) => {
  try {
    const { empID, userID } = req.user;
    const { reportID } = req.params;
    const report = await SOS.findById(reportID).populate({
      path: "resID",
      select: "lastname firstname",
    });

    const user = await User.findOne({ resID: report.resID });
    const employee = await Employee.findById(empID).populate({
      path: "resID",
      select: "firstname lastname",
    });

    const responder = report.responder.find(
      (rep) => rep.empID.toString() === empID
    );

    if (!responder) {
      return res.status(400).json({ message: "You are not a responder yet" });
    }

    const responderIndex = report.responder.findIndex(
      (rep) => rep.empID.toString() === empID
    );

    const currentResponder = report.responder[responderIndex];

    if (currentResponder.isHead && report.responder.length > 1) {
      report.responder[responderIndex + 1].isHead = true;
    }

    if (report.responder.length === 1) {
      report.status = "Pending";
    }
    report.responder.splice(responderIndex, 1);

    await report.save();

    const io = req.app.get("socketio");
    io.to(user._id.toString()).emit("sosUpdate", {
      title: `🆘 Emergency Report Update`,
      message: `${employee.resID.firstname} ${employee.resID.lastname} didn't arrive to your location.`,
      timestamp: report.updatedAt,
    });

    if (user?.pushtoken) {
      await sendPushNotification(
        user.pushtoken,
        `🆘 Emergency Report Update`,
        `${employee.resID.firstname} ${employee.resID.lastname} didn't arrive to your location.`,
        "SOSStatusPage"
      );
    } else {
      console.log("⚠️ No push token found for user:", user.username);
    }

    await Notification.insertOne({
      userID: user._id,
      title: `🆘 Emergency Report Update`,
      message: `${employee.resID.firstname} ${employee.resID.lastname} didn't arrive to your location.`,
      redirectTo: "SOSStatusPage",
    });

    await ActivityLog.insertOne({
      userID,
      action: "Update",
      target: "SOS",
      description: `User marked themselves as didn't arrive to ${report.resID.lastname}, ${report.resID.firstname}'s SOS report location.`,
    });

    return res.status(200).json({
      message:
        "You have marked yourself as did not arrive at the report location.",
    });
  } catch (error) {
    console.error("Error get pending SOS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const arrivedSOS = async (req, res) => {
  try {
    const { empID, userID } = req.user;
    const { reportID } = req.params;
    const report = await SOS.findById(reportID).populate({
      path: "resID",
      select: "lastname firstname",
    });

    const user = await User.findOne({ resID: report.resID });
    const employee = await Employee.findById(empID).populate({
      path: "resID",
      select: "firstname lastname",
    });

    const responder = report.responder.find(
      (rep) => rep.empID.toString() === empID
    );

    if (!responder) {
      return res.status(400).json({ message: "You are not a responder yet" });
    }

    responder.status = "Arrived";
    responder.arrivedat = new Date();

    await report.save();

    const io = req.app.get("socketio");
    io.to(user._id.toString()).emit("sosUpdate", {
      title: `🆘 Emergency Report Update`,
      message: `${employee.resID.firstname} ${employee.resID.lastname} has arrived to your location.`,
      timestamp: report.updatedAt,
    });

    if (user?.pushtoken) {
      await sendPushNotification(
        user.pushtoken,
        `🆘 Emergency Report Update`,
        `${employee.resID.firstname} ${employee.resID.lastname} has arrived to your location.`,
        "SOSStatusPage"
      );
    } else {
      console.log("⚠️ No push token found for user:", user.username);
    }

    await Notification.insertOne({
      userID: user._id,
      title: `🆘 Emergency Report Update`,
      message: `${employee.resID.firstname} ${employee.resID.lastname} has arrived to your location.`,
      redirectTo: "SOSStatusPage",
    });

    await ActivityLog.insertOne({
      userID,
      action: "Update",
      target: "SOS",
      description: `User marked themselves as arrived to ${report.resID.lastname}, ${report.resID.firstname}'s SOS report location.`,
    });

    return res.status(200).json({
      message: "You have marked yourself as arrived at the report location.",
    });
  } catch (error) {
    console.error("Error get pending SOS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const headingSOS = async (req, res) => {
  try {
    const { empID, userID } = req.user;
    const { reportID } = req.params;
    const report = await SOS.findById(reportID).populate({
      path: "resID",
      select: "lastname firstname",
    });
    const user = await User.findOne({ resID: report.resID });
    const employee = await Employee.findById(empID).populate({
      path: "resID",
      select: "firstname lastname",
    });
    const alreadyResponder = report.responder.some(
      (r) => r.empID.toString() === empID
    );
    if (alreadyResponder) {
      return res.status(400).json({ message: "You are already a responder" });
    }

    const isHead = report.responder.length === 0;

    report.responder.push({
      empID,
      status: "Heading",
      arrivedat: null,
      isHead,
    });

    report.status = "Ongoing";

    await report.save();

    const io = req.app.get("socketio");
    io.to(user._id.toString()).emit("sosUpdate", {
      title: `🆘 Emergency Report Update`,
      message: `${employee.resID.firstname} ${employee.resID.lastname} is on the way.`,
      timestamp: report.updatedAt,
    });

    if (user?.pushtoken) {
      await sendPushNotification(
        user.pushtoken,
        `🆘 Emergency Report Update`,
        `${employee.resID.firstname} ${employee.resID.lastname} is on the way.`,
        "SOSStatusPage"
      );
    } else {
      console.log("⚠️ No push token found for user:", user.username);
    }

    await Notification.insertOne({
      userID: user._id,
      title: `🆘 Emergency Report Update`,
      message: `${employee.resID.firstname} ${employee.resID.lastname} is on the way.`,
      redirectTo: "SOSStatusPage",
    });

    await ActivityLog.insertOne({
      userID,
      action: "Update",
      target: "SOS",
      description: `User marked themselves as heading to ${report.resID.lastname}, ${report.resID.firstname}'s SOS report location.`,
    });

    return res.status(200).json({
      message: "You have marked yourself as heading at the report location.",
    });
  } catch (error) {
    console.error("Error get pending SOS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPendingSOS = async (req, res) => {
  try {
    const reports = await getPendingSOSUtils();

    return res.status(200).json(reports);
  } catch (error) {
    console.error("Error get pending SOS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getActiveSOS = async (req, res) => {
  try {
    const { resID } = req.user;
    const report = await getActiveSOSUtils(resID);

    return res.status(200).json(report);
  } catch (error) {
    console.error("Error get active SOS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendSOSWithDetails = async (req, res) => {
  try {
    const { resID, userID } = req.user;
    const { location, reportdetails, reporttype } = req.body;

    const report = new SOS({
      location,
      resID,
      reportdetails,
      reporttype,
    });

    const users = await User.find({
      status: { $in: ["Active", "Inactive"] },
      role: { $nin: ["Resident", "Technical Admin"] },
    });

    await report.save();

    const populatedReport = await report.populate({
      path: "resID",
      select: "firstname lastname",
    });

    await ActivityLog.insertOne({
      userID,
      action: "Create",
      target: "SOS",
      description: `User sent an SOS report.`,
    });

    const io = req.app.get("socketio");

    io.to("sos").emit("sos", {
      title: `🆘 Emergency Alert`,
      message: `${populatedReport.resID.firstname} ${populatedReport.resID.lastname} needs help!`,
      timestamp: report.createdAt,
    });

    for (const user of users) {
      if (user?.pushtoken) {
        try {
          await sendPushNotification(
            user.pushtoken,
            `🆘 Emergency Alert`,
            `${populatedReport.resID.firstname} ${populatedReport.resID.lastname} needs help!`,
            "SOSRequests"
          );

          console.log(`✅ Notification sent to ${user.username}`);
        } catch (err) {
          console.error(
            `❌ Failed to send notification to ${user.username}:`,
            err
          );
        }
      } else {
        console.log("⚠️ No push token found for user:", user.username);
      }
      await Notification.create({
        userID: user._id,
        title: `🆘 Emergency Alert`,
        message: `${populatedReport.resID.firstname} ${populatedReport.resID.lastname} needs help!`,
        redirectTo: "SOSRequests",
      });
      sendNotificationUpdate(user._id.toString(), io);
    }

    return res.status(200).json({ message: "SOS has been sent successfully." });
  } catch (error) {
    console.error("Error sending SOS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendSOS = async (req, res) => {
  try {
    const { resID, userID } = req.user;
    const { location } = req.body;

    const report = new SOS({
      location,
      resID,
    });

    const users = await User.find({
      status: { $in: ["Active", "Inactive"] },
      role: { $nin: ["Resident", "Technical Admin"] },
    });

    await report.save();

    const populatedReport = await report.populate({
      path: "resID",
      select: "firstname lastname",
    });

    await ActivityLog.insertOne({
      userID,
      action: "Create",
      target: "SOS",
      description: `User sent an SOS report.`,
    });

    const io = req.app.get("socketio");

    io.to("sos").emit("sos", {
      title: `🆘 Emergency Alert`,
      message: `${populatedReport.resID.firstname} ${populatedReport.resID.lastname} needs help!`,
      timestamp: report.createdAt,
    });

    for (const user of users) {
      if (user?.pushtoken) {
        try {
          await sendPushNotification(
            user.pushtoken,
            `🆘 Emergency Alert`,
            `${populatedReport.resID.firstname} ${populatedReport.resID.lastname} needs help!`,
            "SOSRequests"
          );

          console.log(`✅ Notification sent to ${user.username}`);
        } catch (err) {
          console.error(
            `❌ Failed to send notification to ${user.username}:`,
            err
          );
        }
      } else {
        console.log("⚠️ No push token found for user:", user.username);
      }
      await Notification.create({
        userID: user._id,
        title: `🆘 Emergency Alert`,
        message: `${populatedReport.resID.firstname} ${populatedReport.resID.lastname} needs help!`,
        redirectTo: "SOSRequests",
      });
      sendNotificationUpdate(user._id.toString(), io);
    }

    return res.status(200).json({ message: "SOS has been sent successfully." });
  } catch (error) {
    console.error("Error sending SOS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
