// imports

import express, { Request, Response } from "express";
import path, { dirname } from "path";

import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import http from "http";
import multer from "multer";

dotenv.config();

// Define app port
const port = process.env.PORT || 3002;

// All uploaded files will go to this path
const upload = multer({ dest: "./upload/" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// You cannot use * origin when including credentials
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_PUBLIC_URL,
  })
);
// Get access to jwt cookie
// app.use(cookieParser());
// For parsing different types of requests, and set limit high to prevent error
app.use(
  express.json({
    limit: "100mb",
  })
);

// Main API routes
// Router routes
// app.use("/auth", authRoute);
// app.use("/user", userRoute);
// Set /upload endpoint to point to upload folder
// app.use("/upload", express.static("upload"));
app.use("/files", express.static("files"));

io.on("connection", (socket) => {
  console.log("a user connected");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/static/index.html"));
});

// Upload single file
app.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json("No file found in request");

    let newFileName = req.file.filename + req.file.originalname;

    await fs.rename(`./upload/${req.file.filename}`, `./upload/${newFileName}`);

    exec("ls -la", (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });

    res.status(201).json({
      location: `${process.env.API_PUBLIC_URL}/upload/${newFileName}`,
    });
  }
);

// Listens on ENV or default port
server.listen(port, () => console.log(`Listening on port: ${port}!`));
