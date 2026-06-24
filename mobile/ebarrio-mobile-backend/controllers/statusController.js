import Resident from "../models/Residents.js";
import User from "../models/Users.js";
import Certificate from "../models/Certificates.js";
import CourtReservation from "../models/CourtReservations.js";
import Blotter from "../models/Blotters.js";
import mongoose, { Mongoose } from "mongoose";
import { getServicesUtils } from "../utils/collectionUtils.js";

export const getServicesSubmitted = async (req, res) => {
  try {
    const userID = new mongoose.Types.ObjectId(req.user.userID);
    const combined = await getServicesUtils(userID);
    // const { userID } = req.params;
    // const user = await User.findById(userID);
    // const resID = user.resID;

    // const certificates = await Certificate.find(
    //   { resID: resID },
    //   { certID: 0 }
    // );

    // const reservations = await CourtReservation.find({ resID: resID });

    // const blotters = await Blotter.find({ complainantID: resID })
    //   .populate({
    //     path: "subjectID",
    //     select: "firstname lastname address",
    //   })
    //   .populate({ path: "witnessID", select: "firstname lastname" });

    // const certificatesWithType = certificates.map((c) => ({
    //   ...c.toObject(),
    //   type: "Certificate",
    // }));
    // const reservationsWithType = reservations.map((r) => ({
    //   ...r.toObject(),
    //   type: "Reservation",
    // }));
    // const blottersWithType = blotters.map((b) => ({
    //   ...b.toObject(),
    //   type: "Blotter",
    // }));

    // const combined = [
    //   ...certificatesWithType,
    //   ...reservationsWithType,
    //   ...blottersWithType,
    // ];

    res.status(200).json(combined);
  } catch (error) {
    console.log("Error getting services submitted", error);
    res.status(500).json({ message: "Failed to get services submitted" });
  }
};
