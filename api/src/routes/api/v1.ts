// imports
import express, { Request, Response } from "express";
import path, { dirname } from "path";
import { exec } from "child_process";
import { v4 as uuid } from "uuid";
import multer from "multer";
import fs from "fs-extra";
import { io } from "../../server.js";
import { fileURLToPath } from "url";
let router = express.Router();

// All uploaded files will go to this path
const upload = multer({ dest: "upload" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Open upp files directory to url /api/v1/files
router.use("/files", express.static(`files`));

// Main file conversion handler
router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    console.log("Upload received");
    // If no file has been uploaded
    if (!req.file)
      return res.status(400).json({
        status: "error",
        message: "No file found in request",
        data: null,
      });

    // if file is not a json or jsonc file
    if (
      path.extname(req.file.originalname) !== ".json" &&
      path.extname(req.file.originalname) !== ".jsonc"
    ) {
      return res.status(500).json({
        status: "error",
        message: `<p>Not a json or jsonc file</p>`,
        data: null,
      });
    }

    const messagesCount = 5;
    let progress = 0;

    // Get the socket id from the user (The frontend sends the socket id in the auth header)
    const socketId = req.headers.authorization ? req.headers.authorization : "";

    let newFileName: string;

    const newFileNameWithoutUuid =
      path.parse(req.file.originalname).name + ".json";

    newFileName = req.file.filename + newFileNameWithoutUuid;

    let uploadedFilePath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "upload",
      newFileName
    );

    io.to(socketId).emit("statusUpdate", {
      status: "info",
      message: "<p>Renaming theme file</p>",
    });

    await fs.rename(
      path.join(__dirname, "..", "..", "..", "upload", req.file.filename),
      uploadedFilePath
    );

    progress = (100 / messagesCount) * 1;
    io.to(socketId).emit("statusUpdate", {
      status: "success",
      message: "<p>Done renaming uploaded theme file</p>",
      progress: progress,
    });

    const executableName = "vsThemeApplyer.exe";

    const tempFolderName = uuid();
    const tempFolderPath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "temp",
      tempFolderName
    );

    const conversionScriptPath = path.join(
      __dirname,
      "..",
      "..",
      "scripts",
      "convertToVs"
    );

    const generateExecutablePath = `${tempFolderPath}/generateExecutable`;

    try {
      io.to(socketId).emit("statusUpdate", {
        status: "info",
        message: `<p>Creating copy of ${executableName} project</p>`,
      });

      await fs.copy(
        path.join(__dirname, "..", "..", "scripts", "generateExecutable"),
        `${generateExecutablePath}`,
        {
          overwrite: true,
        }
      );
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: "error",
        message: `<p>Error copying ${executableName}</p>`,
        data: null,
      });
    }

    progress = (100 / messagesCount) * 2;
    io.to(socketId).emit("statusUpdate", {
      status: "success",
      message: `<p>Done creating copy of ${executableName}</p>`,
    });

    try {
      io.to(socketId).emit("statusUpdate", {
        status: "info",
        message: `<p>Moving theme to the copied ${executableName}</p>`,
      });

      await fs.move(
        uploadedFilePath,
        `${tempFolderPath}/${newFileNameWithoutUuid}`
      );

      uploadedFilePath = `${tempFolderPath}/${newFileNameWithoutUuid}`;
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: "error",
        message: `<p>Error moving ${newFileNameWithoutUuid}</p>`,
        data: null,
      });
      return cleanUp([tempFolderPath]);
    }

    io.to(socketId).emit("statusUpdate", {
      status: "info",
      message: `<p>Converting theme file to pkgdef</p>`,
    });

    exec(
      `cd ${conversionScriptPath} && ./ThemeConverter -i "${uploadedFilePath}" -o "${generateExecutablePath}/"`,
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
            message: `<p>Error occurred when converting to pkgdef file</p>`,
            data: null,
          });
          return cleanUp([tempFolderPath]);
        }

        try {
          io.to(socketId).emit("statusUpdate", {
            status: "info",
            message: `<p>Renaming theme file to match value in resources.resx</p>`,
          });

          await fs.rename(
            `${generateExecutablePath}/${
              path.parse(newFileNameWithoutUuid).name
            }.pkgdef`,
            `${generateExecutablePath}/ThemeToConvert.pkgdef`
          );
        } catch (err) {
          res.status(500).json({
            status: "error",
            message: `<p>Error renaming theme file</p>`,
            data: null,
          });
          return cleanUp([tempFolderPath]);
        }

        progress = (100 / messagesCount) * 3;
        io.to(socketId).emit("statusUpdate", {
          status: "success",
          message: `<p>Done renaming theme file</p>`,
        });

        try {
          io.to(socketId).emit("statusUpdate", {
            status: "info",
            message: `<p>Creating public facing folder "${tempFolderName}"</p>`,
          });

          await fs.ensureDir(`files/${tempFolderName}`);
        } catch (err) {
          console.error(err);
          res.status(500).json({
            status: "error",
            message: `<p>Error creating public folder "${tempFolderName}"</p>`,
            data: null,
          });
          return cleanUp([tempFolderPath]);
        }

        io.to(socketId).emit("statusUpdate", {
          status: "info",
          message: `<p>Compiling vsThemeApplyer</p>`,
        });

        exec(
          `cd ${generateExecutablePath} && dotnet publish vsThemeApplyer.csproj -r win-x86 -p:PublishSingleFile=true --self-contained false`,
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
                message: `<p>Error when compiling ${executableName}</p>`,
                data: null,
              });
              return cleanUp([tempFolderPath]);
            }

            progress = (100 / messagesCount) * 4;
            io.to(socketId).emit("statusUpdate", {
              status: "success",
              message: `<p>Done compiling ${executableName}</p>`,
            });

            try {
              io.to(socketId).emit("statusUpdate", {
                status: "info",
                message: `<p>Moving executable to public folder</p>`,
              });

              await fs.copyFile(
                `${generateExecutablePath}/bin/Debug/net6.0-windows/win-x86/publish/${executableName}`,
                `files/${tempFolderName}/${executableName}`
              );

              io.to(socketId).emit("statusUpdate", {
                status: "info",
                message: `<p>Cleaning up temporary files</p>`,
              });
              cleanUp([tempFolderPath]);
            } catch (err) {
              console.error(err);
              res.status(500).json({
                status: "error",
                message: "<p>Error moving executable to public folder</p>",
                data: null,
              });
              return cleanUp([tempFolderPath]);
            }

            progress = (100 / messagesCount) * 5;
            return res.status(201).json({
              status: "success",
              message: `<p>Conversion completed. For further instructions, visit <strong><a href='https://github.com/NUB31/vscode_vs_theme_converter'>https://github.com/NUB31/vscode_vs_theme_converter</a></strong></p>`,
              data: {
                url: `/api/v1/files/${tempFolderName}/${executableName}`,
                progress: progress,
              },
            });
          }
        );
      }
    );
  }
);

async function cleanUp(paths: string[]) {
  try {
    paths.forEach(async (path) => {
      try {
        await fs.remove(path);
      } catch (err) {
        console.error(err);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

export default router;
