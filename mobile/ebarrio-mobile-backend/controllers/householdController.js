import Household from "../models/Households.js";
export const getAllHousehold = async (req, res) => {
  try {
    const households = await Household.find({
      status: { $nin: ["Archived", "Rejected"] },
    }).populate("members.resID");
    res.status(200).json(households);
  } catch (error) {
    console.log("Error fetching households", error);
    res.status(500).json({ message: "Failed to fetch households" });
  }
};
