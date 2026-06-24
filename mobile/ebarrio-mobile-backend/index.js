import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { Server } from "socket.io";
import http from "http";
import Redis from "ioredis";
import { watchAllCollectionsChanges } from "./controllers/watchDB.js";
import { createAdapter } from "@socket.io/redis-adapter";
import { registerSocketEvents, connectedUsers } from "./utils/socket.js";
import cron from "node-cron";
import { checkRainForecast } from "./controllers/weatherController.js";
import { sendEventNotification } from "./utils/collectionUtils.js";

configDotenv();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const rds = new Redis(process.env.REDIS_URL);
const subClient = rds.duplicate();

export { rds };

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.adapter(createAdapter(rds, subClient));

app.set("socketio", io);
app.use("/api", authRoutes);

rds.ping((err, result) => {
  if (err) {
    console.error("Error connecting to Redis:", err);
  } else {
    console.log("Connected to Redis:", result); // Should print 'PONG'
  }
});

rds.on("error", (err) => {
  console.error("Redis connection error: ", err);
});

cron.schedule("*/30 * * * *", () => {
  console.log("⏰ Running rain check every 30 mins...");
  checkRainForecast();
});

cron.schedule("0 8 * * *", async () => {
  console.log("⏰ Running event check every 8 AM...");
  sendEventNotification();
});

const PORT = process.env.PORT;
server.listen(PORT, async () => {
  try {
    console.log(`Server is running on port ${PORT}`);
    await connectDB();
    registerSocketEvents(io);
    watchAllCollectionsChanges(io);
  } catch (error) {
    console.log("Error during startup:", error);
  }
});
