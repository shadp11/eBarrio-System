import User from "../models/Users.js";
import Resident from "../models/Residents.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import axios from "axios";
import { rds } from "../index.js";
import ActivityLog from "../models/ActivityLogs.js";

configDotenv();
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

export const changedPasswordUser = async (req, res) => {
  try {
    const { userID } = req.user;

    const user = await User.findById(userID);
    user.status = "Inactive";
    user.set("pushtoken", undefined);
    await user.save();
    res.status(200).json({
      message:
        "You've been logged out because your account credentials has been updated. If this is unexpected, please contact the admin.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatedUser = async (req, res) => {
  try {
    const { userID } = req.user;

    const user = await User.findById(userID);
    user.status = "Password Not Set";
    user.passwordistoken = true;
    user.set("pushtoken", undefined);

    await user.save();

    res.status(200).json({
      message:
        "You've been logged out because your account credentials has been updated. If this is unexpected, please contact the admin.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const archivedUser = async (req, res) => {
  try {
    const { userID } = req.params;

    const user = await User.findById(userID);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.status = "Archived";
    user.set("pushtoken", undefined);
    await user.save();

    res.status(200).json({
      message:
        "You've been logged out because your account has been archived. If this is unexpected, please contact the admin.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deactivatedUser = async (req, res) => {
  try {
    const { userID } = req.user;
    const user = await User.findById(userID);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.status = "Deactivated";
    user.set("pushtoken", undefined);
    await user.save();

    res.status(200).json({
      message:
        "You've been logged out because your account has been deactivated. If this is unexpected, please contact the admin.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkUsername = async (req, res) => {
  try {
    const { userID } = req.user;
    const { username } = req.params;

    const isLimited = await rds.get(`limitUsernameChange_${userID}`);

    if (isLimited) {
      return res.status(403).json({
        message: "You can only change your username once every 30 days.",
      });
    }

    const usernameTaken = await User.findOne({ username });

    if (usernameTaken) {
      return res.status(409).json({ message: "Username is already taken." });
    }
    return res.status(200).json({ message: "Username does not exist yet" });
  } catch (error) {
    console.error("Error in checking username:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMobileNumber = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username })
      .populate({
        path: "empID",
        select: "resID",
        populate: {
          path: "resID",
          select: "mobilenumber",
        },
      })
      .populate({
        path: "resID",
        select: "mobilenumber",
      });

    if (!user) {
      return res.status(404).json({ message: "Username not found!" });
    }

    return res.status(200).json({
      mobilenumber: user.empID?.resID.mobilenumber || user.resID?.mobilenumber,
    });
  } catch (error) {
    console.error("Error in sending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { username, OTP } = req.body;

    rds.get(`username_${username}`, (err, storedOTP) => {
      if (err) {
        console.error("Error retrieving OTP from Redis:", err);
        return res.status(500).json({ message: "Failed to verify OTP" });
      }

      if (!storedOTP) {
        return res.status(400).json({
          message: "We couldn’t verify that code. Please check and try again.",
        });
      }

      if (storedOTP === OTP.toString()) {
        return res.status(200).json({ message: "OTP verified successfully!" });
      } else {
        return res.status(400).json({
          message: "We couldn’t verify that code. Please check and try again.",
        });
      }
    });
  } catch (error) {
    console.error("Error in sending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { username, mobilenumber } = req.body;
    const response = await axios.post("https://api.semaphore.co/api/v4/otp", {
      apikey: process.env.SEMAPHORE_KEY,
      number: mobilenumber,
      message:
        "Your one time password is {otp}. Please use it within 5 minutes.",
    });
    rds.setex(`username_${username}`, 300, response.data[0]?.code.toString());
    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error in sending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshAccessToken = (req, res) => {
  const refreshToken = req.header("Authorization")?.split(" ")[1];

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required." });
  }

  try {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET,
      async (err, decodedRefresh) => {
        if (err) {
          return res.status(401).json({ message: "Invalid refresh token" });
        }
        const newAccessToken = jwt.sign(
          {
            userID: decodedRefresh.userID,
            resID: decodedRefresh.resID,
            role: decodedRefresh.role,
            name: decodedRefresh.name,
            picture: decodedRefresh.picture,
            username: decodedRefresh.username,
            empID: decodedRefresh.empID,
          },
          process.env.ACCESS_SECRET,
          {
            expiresIn: "15m",
          }
        );
        console.log("Access token refreshed");
        return res.status(200).json({
          message: "Access token refreshed",
          accessToken: newAccessToken,
        });
      }
    );
  } catch (error) {
    console.error("Error verifying refresh token:", error);
    res.status(401).json({ message: "Invalid or expired refresh token." });
  }
};

export const checkRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    console.log("Got Refresh Token", refreshToken);
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid refresh token" });
        }
        return res.status(200).json({
          message: "Refresh token is still valid",
          decoded,
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkResident = async (req, res) => {
  try {
    const { username, firstname, lastname, mobilenumber } = req.body;

    const resident = await Resident.findOne({
      $expr: {
        $and: [
          {
            $eq: [
              {
                $toLower: {
                  $replaceAll: {
                    input: "$firstname",
                    find: " ",
                    replacement: "",
                  },
                },
              },
              firstname.toLowerCase().replace(/\s+/g, ""),
            ],
          },
          {
            $eq: [
              {
                $toLower: {
                  $replaceAll: {
                    input: "$lastname",
                    find: " ",
                    replacement: "",
                  },
                },
              },
              lastname.toLowerCase().replace(/\s+/g, ""),
            ],
          },
          { $eq: ["$mobilenumber", mobilenumber.trim()] },
        ],
      },
      empID: { $exists: false },
    });

    if (!resident) {
      return res.status(404).json({ message: "Resident not found." });
    }

    if (resident.status === "Pending") {
      return res
        .status(404)
        .json({ message: "Your resident profile is still pending approval." });
    }

    if (resident.userID) {
      return res
        .status(409)
        .json({ message: "Resident already has an account." });
    }

    const user = await User.findOne({ username });

    if (user) {
      return res.status(409).json({ message: "Username already exists" });
    }

    return res.status(200).json({
      message: "Resident found",
      resID: resident._id,
    });
  } catch (error) {
    console.error("Error in checking resident:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { username, password, resID } = req.body;

    const resident = await Resident.findById(resID);

    const user = new User({
      username,
      password,
      resID,
    });

    await user.save();

    resident.userID = user._id;

    await resident.save();
    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const { userID } = req.user;
    const user = await User.findById(userID);

    user.set("pushtoken", undefined);
    user.status = "Inactive";
    user.save();

    await ActivityLog.insertOne({
      userID,
      action: "Logout",
      target: "User Accounts",
      description: "User logged out successfully.",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkCredentials = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user || user.status === "Archived") {
      console.log("❌ Account not found");
      return res.status(404).json({
        message: "Kindly check your details and try again.",
      });
    }
    if (user.status === "Deactivated") {
      console.log("❌ Account is deactivated");
      return res.status(403).json({
        message: "Account is deactivated.",
      });
    }

    if (user.status === "Password Not Set") {
      rds.get(`userID_${user._id}`, (err, storedToken) => {
        if (err) {
          console.error("Error retrieving token from Redis:", err);
          return res.status(500).json({ message: "Failed to verify token" });
        }

        if (!storedToken) {
          return res
            .status(400)
            .json({ message: "Token has expired or does not exist" });
        }

        if (storedToken === password) {
          return res
            .status(200)
            .json({ message: "Token verified successfully!" });
        } else {
          return res.status(400).json({ message: "Invalid token" });
        }
      });
      return;
    }

    const key = `login_attempts_${user._id}`;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      rds.incr(key, async (err, attempts) => {
        if (err) {
          console.error("Redis error:", err);
        }

        if (attempts === 1) {
          rds.expire(key, 1800);
        }

        await ActivityLog.insertOne({
          userID: user._id,
          action: "Failed Login",
          target: "User Accounts",
          description: "The login attempt failed due to an incorrect password.",
        });

        if (attempts > 5) {
          await ActivityLog.insertOne({
            userID: user._id,
            action: "Failed Login",
            target: "User Accounts",
            description:
              "User was locked out due to many failed login attempts.",
          });
          return res.status(429).json({
            message:
              "Too many failed login attempts. Please try again after 30 minutes.",
          });
        }

        return res.status(403).json({
          message: "Kindly check your details and try again.",
        });
      });
      return;
    }
    return res.status(200).json({
      message: "Credentials verified",
    });
  } catch (error) {
    console.error("Error in checking credentials:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ username })
      .select("empID resID role")
      .populate({
        path: "empID",
        populate: {
          path: "resID",
        },
      })
      .populate("resID");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resID =
      user?.resID?._id?.toString() || user?.empID?.resID?._id?.toString();
    const name =
      user?.resID?.firstname && user?.resID?.lastname
        ? `${user.resID.firstname} ${user.resID.lastname}`
        : user?.empID?.resID?.firstname && user?.empID?.resID?.lastname
        ? `${user.empID.resID.firstname} ${user.empID.resID.lastname}`
        : "Unknown";
    const picture = user?.resID?.picture || user?.empID?.resID?.picture || null;
    const role = user?.role;
    const empID = user?.empID?._id?.toString() || null;

    const accessToken = jwt.sign(
      {
        userID: user._id.toString(),
        resID,
        role,
        name,
        picture,
        username,
        empID,
      },
      ACCESS_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      {
        userID: user._id.toString(),
        resID,
        role,
        name,
        picture,
        username,
        empID,
      },
      REFRESH_SECRET,
      {
        expiresIn: "30d",
      }
    );

    const decoded = jwt.decode(refreshToken);

    await ActivityLog.insertOne({
      userID: user._id,
      action: "Login",
      target: "User Accounts",
      description: "User logged in successfully.",
    });

    rds.del(`login_attempts_${user._id}`, (err) => {
      if (err) {
        console.error("Error deleting login attempts key:", err);
      }
    });

    return res.status(200).json({
      message: "User logged in successfully",
      accessToken,
      refreshToken,
      user: decoded,
    });
  } catch (error) {
    console.error("Error in logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
