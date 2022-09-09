import { Request, Response } from "express";
import express from "express";
import logger from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import { countUniqueIps } from "./middleware/countUniqueIps.js";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var accessLogStream = fs.createWriteStream(
  path.join(__dirname, "..", "ipLog.txt"),
  {
    flags: "a",
  }
);

app.enable("trust proxy");
app.use(compression());
app.use(countUniqueIps);
app.use(logger("common", { stream: accessLogStream }));
app.use(express.static(path.join(__dirname, "build")));

app.get("/*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => console.log(`Website listening on port: ${port}!`));
