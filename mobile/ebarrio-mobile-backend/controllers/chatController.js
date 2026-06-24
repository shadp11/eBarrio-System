import FAQ from "../models/FAQs.js";
import User from "../models/Users.js";
import Chat from "../models/Chats.js";

export const getChatHistory = async (req, res) => {
  try {
    const { userID } = req.user;

    const history = await Chat.find({
      participants: userID,
      isCleared: { $ne: true },
    })
      .populate("participants", "firstname lastname picture") // populate participant names and roles
      .populate("responder", "firstname lastname picture") // optional: staff info
      .populate("messages.from", "firstname lastname picture") // show sender's name
      .populate("messages.to", "firstname lastname picture"); // show recipient's name

    return res.status(200).json(history);
  } catch (error) {
    console.error("Error getting chat history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getActive = async (req, res) => {
  try {
    const secretary = await User.findOne({ role: "Secretary" });
    const clerk = await User.findOne({ role: "Clerk" });

    const secretaryOnline = secretary?.status === "Active";
    const clerkOnline = clerk?.status === "Active";

    return res.status(200).json({
      Secretary: secretaryOnline,
      Clerk: clerkOnline,
    });
  } catch (error) {
    console.error("Error checking active status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ status: "Active" });

    return res.status(200).json(faqs);
  } catch (error) {
    console.error("Error in getting FAQs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
