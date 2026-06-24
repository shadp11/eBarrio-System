import { bucket } from "../firebaseAdmin.js";
import { rds } from "../index.js";
import ActivityLog from "../models/ActivityLogs.js";
import Resident from "../models/Residents.js";
import axios from "axios";

export async function alertResidents(req, res) {
  try {
    const { userID } = req.user;
    const { alertResidentsMessage } = req.body;

    const cooldown = await rds.get("limitAlert");
    if (cooldown) {
      const secondsLeft = await rds.ttl("limitAlert");
      const minutesLeft = Math.ceil(secondsLeft / 60);

      return res.status(429).json({
        message: `Alert already sent. Please wait ${minutesLeft} minute(s) before sending again.`,
      });
    }

    const residents = await Resident.find({
      status: { $nin: ["Archived", "Rejected", "Pending"] },
    }).select("mobilenumber");

    const uniqueNumbers = [
      ...new Set(residents.map((r) => r.mobilenumber).filter((num) => !!num)),
    ];

    const smsPromises = uniqueNumbers.map((number) =>
      axios.post("https://api.semaphore.co/api/v4/priority", {
        apikey: process.env.SEMAPHORE_KEY,
        number,
        message: alertResidentsMessage,
      })
    );

    await Promise.all(smsPromises);

    await rds.setex(`limitAlert`, 600, "true");

    await ActivityLog.insertOne({
      userID,
      action: "Notify",
      target: "River Snapshots",
      description: `User alerted residents about the water level.`,
    });

    return res.status(200).json({
      message: "Residents have been successfully alerted.",
    });
  } catch (err) {
    console.error("❌ Failed to get alert residents:", err);
    res
      .status(500)
      .json({ error: "Failed to alert residents", details: err.message });
  }
}

export async function getLatestSnapshot(req, res) {
  try {
    const [files] = await bucket.getFiles({ prefix: "snapshots/" });

    const snapshots = files
      .filter((file) => file.name.endsWith(".jpg"))
      .sort((a, b) => a.name.localeCompare(b.name));

    const latest = snapshots.at(-1);

    if (!latest) {
      return res.status(404).json({ error: "No snapshots found" });
    }

    await latest.makePublic();

    const latestFilename = latest.name.split("/").pop();
    let latestDatetime = "Unknown";

    const latestMatch = latestFilename.match(
      /snapshot-(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})/
    );

    if (latestMatch) {
      const [_, year, month, day, hour, minute, second] = latestMatch;
      const utcDate = new Date(
        Date.UTC(year, month - 1, day, hour, minute, second)
      );

      latestDatetime = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(utcDate);
    }

    // Get last 6 before the latest
    const recentHistory = snapshots.slice(-7, -1).reverse();

    const historyData = await Promise.all(
      recentHistory.map(async (file) => {
        await file.makePublic();
        const filename = file.name.split("/").pop(); // e.g., snapshot_20250709_135500.jpg

        const match = filename.match(
          /snapshot-(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})/
        );
        let datetime = "Unknown";

        if (match) {
          const [_, year, month, day, hour, minute, second] = match;
          const utcDate = new Date(
            Date.UTC(year, month - 1, day, hour, minute, second)
          );
          datetime = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Manila",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }).format(utcDate);
        }

        return {
          url: file.publicUrl(),
          name: filename,
          datetime,
        };
      })
    );

    console.log(historyData);
    return res.status(200).json({
      latest: { url: latest.publicUrl(), datetime: latestDatetime },
      history: historyData,
    });
  } catch (err) {
    console.error("❌ Failed to get latest snapshot:", err);
    res
      .status(500)
      .json({ error: "Failed to get snapshot", details: err.message });
  }
}
