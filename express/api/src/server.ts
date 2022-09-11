// imports

import express, { Request, Response } from "express";
import { dirname } from "path";

import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs-extra";
import http from "http";
import multer from "multer";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";

dotenv.config();

// Define app port
const port = process.env.PORT || 3002;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// All uploaded files will go to this path
const upload = multer({ dest: `${__dirname}/upload/` });

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

app.use(
  express.json({
    limit: "100mb",
  })
);

app.use("/files", express.static(`${__dirname}/files`));
app.use("/", express.static(`${__dirname}/static`));

io.on("connection", (socket) => {
  io.to(socket.id).emit("statusUpdate", {
    status: "success",
    message: "<p>Connection established to server</p>",
  });
});

// Upload single file
app.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file)
      return res.status(400).json({
        status: "error",
        message: "No file found in request",
        data: null,
      });

    const socketId = req.headers.authorization
      ? req.headers.authorization
      : null;

    const newFileName = req.file.filename + req.file.originalname;
    const uploadedFilePath = `${__dirname}/upload/${newFileName}`;
    await fs.rename(
      `${__dirname}/upload/${req.file.filename}`,
      `${uploadedFilePath}`
    );

    const executableName = "applyTheme.exe";

    const tempFolderName = uuid();
    const tempFolderPath = `${__dirname}/temp/${tempFolderName}`;

    const conversionScriptPath = `${__dirname}/scripts/convertToVs/bin/Debug/net6.0`;
    const fileAsPkgdefName = `${path.parse(newFileName).name}.pkgdef`;
    const fileAsPkgdef = `${tempFolderPath}/pkgdef/${fileAsPkgdefName}`;
    const generateExecutablePath = `${tempFolderPath}/generateExecutable`;

    if (socketId)
      io.to(socketId).emit("statusUpdate", {
        status: "info",
        message: "<p>File received, starting conversion</p>",
      });

    try {
      if (socketId)
        io.to(socketId).emit("statusUpdate", {
          status: "info",
          message: `<p>Creating copy of ${executableName} project</p>`,
        });
      await fs.copy(
        `${__dirname}/scripts/generateExecutable`,
        `${generateExecutablePath}`,
        {
          overwrite: true,
        }
      );
      if (socketId)
        io.to(socketId).emit("statusUpdate", {
          status: "success",
          message: `<p>Copy of ${executableName} created</p>`,
        });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: "error",
        message: `<p>Error copying ${executableName}</p>`,
        data: null,
      });
      return;
    }

    if (socketId)
      io.to(socketId).emit("statusUpdate", {
        status: "info",
        message: `<p>Running conversion script</p>`,
      });

    exec(
      `cd ${conversionScriptPath} && sudo ./ThemeConverter -i "${uploadedFilePath}" -o "${tempFolderPath}/pkgdef"`,
      async (error, stdout, stderr) => {
        if (error || stderr) {
          console.error(
            error && stderr
              ? `error: ${error.message} \n stderr: ${stderr}`
              : error
              ? `error: ${error.message}`
              : stderr
              ? `stderr: ${stderr}`
              : `Unhandled error`
          );
          console.error(`stdout: ${stdout}`);

          res.status(500).json({
            status: "error",
            message: `<p>Could not run the conversion script <br> ${
              error && stderr
                ? `error: ${error.message} \n stderr: ${stderr}`
                : error
                ? `error: ${error.message}`
                : stderr
                ? `stderr: ${stderr}`
                : `Unhandled error`
            }</p>`,
            data: null,
          });
          cleanUp([tempFolderPath, uploadedFilePath]);
          return;
        }

        console.log(`stdout: ${stdout}`);

        if (socketId)
          io.to(socketId).emit("statusUpdate", {
            message: `<p>${stdout}</p>`,
          });

        try {
          if (socketId)
            io.to(socketId).emit("statusUpdate", {
              status: "info",
              message: `<p>Creating public folder "${tempFolderName}"</p>`,
            });

          await fs.ensureDir(`${__dirname}/files/${tempFolderName}`);

          if (socketId)
            io.to(socketId).emit("statusUpdate", {
              status: "success",
              message: `<p>Folder "${tempFolderName}" created successfully</p>`,
            });
        } catch (err) {
          console.error(err);
          res.status(500).json({
            status: `<p>Error creating public folder "${tempFolderName}"</p>`,
            data: null,
          });
          cleanUp([tempFolderPath, uploadedFilePath]);
          return;
        }

        // TODO: Create and run "create executable script" and then uncomment below

        try {
          if (socketId)
            io.to(socketId).emit("statusUpdate", {
              status: "info",
              message: `<p>Moving executable to public folder</p>`,
            });
          //  Use this one when done
          // await fs.move(
          //   `${generateExecutablePath}/bin/Debug/net6.0/${executableName}`,
          //   `${__dirname}/files/${tempFolderName}/${executableName}`
          // );
          await fs.copyFile(
            fileAsPkgdef,
            `${__dirname}/files/${tempFolderName}/${fileAsPkgdefName}`
          );
          if (socketId)
            io.to(socketId).emit("statusUpdate", {
              status: "success",
              message: `<p>Executable moved successfully</p>`,
            });

          if (socketId)
            io.to(socketId).emit("statusUpdate", {
              status: "info",
              message: `<p>Removing temporary files</p>`,
            });
          cleanUp([tempFolderPath, uploadedFilePath]);
          if (socketId)
            io.to(socketId).emit("statusUpdate", {
              status: "success",
              message: `<p>Removed temporary files</p>`,
            });
        } catch (err) {
          console.error(err);
          res.status(500).json({
            status: "error",
            message: "<p>Error moving executable</p>",
            data: null,
          });
          cleanUp([tempFolderPath, uploadedFilePath]);
          return;
        }

        return res.status(201).json({
          status: "success",
          message: `<p>Conversion completed. For further instructions, visit <strong><a href='${process.env.CLIENT_PUBLIC_URL}/help/installation'>${process.env.CLIENT_PUBLIC_URL}/help/installation</a></strong></p>`,
          data: {
            url: `${process.env.API_PUBLIC_URL}/files/${tempFolderName}/${fileAsPkgdefName}`,
          },
        });
      }
    );
  }
);

async function cleanUp(paths: string[]) {
  try {
    paths.forEach(async (path) => {
      exec(`sudo rm -r "${path}"`, async (error, stdout, stderr) => {
        if (error || stderr) {
          console.error(
            error && stderr
              ? `error: ${error.message} \n stderr: ${stderr}`
              : error
              ? `error: ${error.message}`
              : stderr
              ? `stderr: ${stderr}`
              : `Unhandled error`
          );
          console.error(`stdout: ${stdout}`);
        }
      });
    });
  } catch (err) {
    console.error(err);
  }
}

// Create required folders and launch server
exec(
  `mkdir -p ${__dirname}/temp && mkdir -p ${__dirname}/files && mkdir -p ${__dirname}/upload`,
  (error, stdout, stderr) => {
    if (error) throw console.error(`error: ${error.message}`);
    if (stderr) throw console.error(`stderr: ${stderr}`);
    // Listens on ENV or default port
    server.listen(port, () => console.log(`Listening on port: ${port}!`));
  }
);
