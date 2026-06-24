import EmergencyHotline from "../models/EmergencyHotlines.js";
import { getEmergencyHotlinesUtils } from "../utils/collectionUtils.js";

export const getEmergencyHotlines = async (req, res) => {
  try {
    const emergency = await getEmergencyHotlinesUtils();
    return res.status(200).json(emergency);
  } catch (error) {
    console.error("Error in fetching emergency hotlines:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
