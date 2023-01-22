// imports
import express from "express";
import { Server } from "socket.io";
import dotenv from "dotenv";
import fs from "fs-extra";
import http from "http";
import v1apiRoute from "./routes/api/v1.js";

// Import environment variables from .env file
dotenv.config();

// Define app port
const port = process.env.PORT || 80;

const app = express();
const server = http.createServer(app);
export const io = new Server(server);

// Socket io initial connection
io.on("connection", (socket) => {
  io.to(socket.id).emit("statusUpdate", {
    status: "success",
    message: "<p>Connection established to server</p>",
  });
});

// Setup middleware
// Handle application/json requests
app.use(express.json());
// All api routes
app.use("/api/v1", v1apiRoute);

// Open upp files directory to url /api/v1/files
app.use(express.static("src/static"));
// Serve static index.html file
app.get("/", (req, res) => {
  res.sendFile("src/static/index.html");
});

// Create required folders and launch server
await fs.ensureDir(`files`);
await fs.ensureDir(`temp`);
await fs.ensureDir(`upload`);

// Listens on ENV or default port
server.listen(port, () => console.log(`Listening on port: ${port}!`));
