// imports

import express, { Request, Response } from "express";
import path, { dirname } from "path";

import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import http from "http";
import multer from "multer";
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
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_PUBLIC_URL,
    methods: ["GET", "POST"],
  },
});

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
    if (
      path.extname(req.file.originalname) !== ".json" &&
      path.extname(req.file.originalname) !== ".jsonc"
    ) {
      res.status(500).json({
        status: "error",
        message: `<p>Not a json or jsonc file</p>`,
        data: null,
      });
      return;
    }

    const socketId = req.headers.authorization ? req.headers.authorization : "";

    let newFileName: string;

    const newFileNameWithoutUuid =
      path.parse(req.file.originalname).name + ".json";

    newFileName = req.file.filename + newFileNameWithoutUuid;

    let uploadedFilePath = `${__dirname}/upload/${newFileName}`;
    io.to(socketId).emit("statusUpdate", {
      status: "info",
      message: "<p>Moving file to temporary folder</p>",
    });
    await fs.rename(
      `${__dirname}/upload/${req.file.filename}`,
      `${uploadedFilePath}`
    );
    io.to(socketId).emit("statusUpdate", {
      status: "success",
      message: "<p>File moved successfully</p>",
    });

    const executableName = "vsThemeApplyer.exe";

    const tempFolderName = uuid();
    const tempFolderPath = `${__dirname}/temp/${tempFolderName}`;

    const conversionScriptPath = `${__dirname}/scripts/convertToVs/bin/Debug/net6.0`;
    const fileAsPkgdefName = `${
      path.parse(newFileNameWithoutUuid).name
    }.pkgdef`;
    const generateExecutablePath = `${tempFolderPath}/generateExecutable`;

    // TODO: Uncomment json file
    // io.to(socketId).emit("statusUpdate", {
    //   status: "info",
    //   message: `<p>Uncommenting the json file</p>`,
    // });
    // const ws = await fs.createWriteStream(`${uploadedFilePath}.temp`);
    // const rl = readline.createInterface({
    //   input: fs.createReadStream(uploadedFilePath),
    // });
    // try {
    //   rl.on("line", async (line: string) => {
    //     let newString = line;

    //     if (line.replace(/ /g, "").startsWith("//")) {
    //       newString = newString.replace(/ /g, "").substring(2);
    //     }
    //     if (
    //       !line.replace(/ /g, "").endsWith(",") &&
    //       !line.replace(/ /g, "").endsWith("EOF") &&
    //       !line.replace(/ /g, "").endsWith("{") &&
    //       !line.replace(/ /g, "").endsWith(":") &&
    //       !line.replace(/ /g, "").endsWith("[")
    //     ) {
    //       newString += ",";
    //     }
    //     await ws.write(newString);
    //   });
    // } catch (err) {
    //   console.error(err);
    //   res.status(500).json({
    //     status: "error",
    //     message: `<p>Error copying ${executableName}</p>`,
    //     data: null,
    //   });
    //   return;
    // }
    // io.to(socketId).emit("statusUpdate", {
    //   status: "success",
    //   message: `<p>Done uncommenting file</p>`,
    // });

    io.to(socketId).emit("statusUpdate", {
      status: "info",
      message: "<p>Starting conversion script</p>",
    });
    try {
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

    io.to(socketId).emit("statusUpdate", {
      status: "info",
      message: `<p>Running conversion script</p>`,
    });

    try {
      io.to(socketId).emit("statusUpdate", {
        status: "info",
        message: `<p>Moving uplaoded filen to temp folder</p>`,
      });
      await fs.move(
        uploadedFilePath,
        `${tempFolderPath}/${newFileNameWithoutUuid}`
      );
      uploadedFilePath = `${tempFolderPath}/${newFileNameWithoutUuid}`;
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: `<p>Error moving  ${newFileNameWithoutUuid}</p>`,
        data: null,
      });
      cleanUp([tempFolderPath]);
      return;
    }

    exec(
      `cd ${conversionScriptPath} && sudo ./ThemeConverter -i "${uploadedFilePath}" -o "${generateExecutablePath}/"`,
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
          cleanUp([tempFolderPath]);
          return;
        }

        try {
          await fs.rename(
            `${generateExecutablePath}/${fileAsPkgdefName}`,
            `${generateExecutablePath}/ThemeToConvert.pkgdef`
          );
        } catch (err) {
          res.status(500).json({
            status: "error",
            message: `<p>Error renaming theme file</p>`,
            data: null,
          });
          cleanUp([tempFolderPath]);
          return;
        }

        console.log(`stdout: ${stdout}`);

        io.to(socketId).emit("statusUpdate", {
          message: `<p>${stdout}</p>`,
        });

        try {
          io.to(socketId).emit("statusUpdate", {
            status: "info",
            message: `<p>Creating public folder "${tempFolderName}"</p>`,
          });

          await fs.ensureDir(`${__dirname}/files/${tempFolderName}`);

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
          cleanUp([tempFolderPath]);
          return;
        }

        io.to(socketId).emit("statusUpdate", {
          status: "info",
          message: `<p>Generating executable</p>`,
        });
        // TODO: Create and run "create executable script" and then uncomment below
        exec(
          `cd ${generateExecutablePath} && sudo dotnet publish vsThemeApplyer.csproj -r win-x86 -p:PublishSingleFile=true --self-contained false`,
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
                message: `<p>Could not run the "Generate Executable" script <br> ${
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
              cleanUp([tempFolderPath]);
              return;
            }

            io.to(socketId).emit("statusUpdate", {
              status: "success",
              message: `<p>Executable created successfully</p>`,
            });

            try {
              io.to(socketId).emit("statusUpdate", {
                status: "info",
                message: `<p>Moving executable to public folder</p>`,
              });

              await fs.copyFile(
                `${generateExecutablePath}/bin/Debug/net6.0-windows/win-x86/publish/${executableName}`,
                `${__dirname}/files/${tempFolderName}/${executableName}`
              );

              io.to(socketId).emit("statusUpdate", {
                status: "success",
                message: `<p>Executable moved successfully</p>`,
              });

              io.to(socketId).emit("statusUpdate", {
                status: "info",
                message: `<p>Removing temporary files</p>`,
              });
              cleanUp([tempFolderPath]);

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
              cleanUp([tempFolderPath]);
              return;
            }

            return res.status(201).json({
              status: "success",
              message: `<p>Conversion completed. For further instructions, visit <strong><a href='${process.env.CLIENT_PUBLIC_URL}/help/installation'>${process.env.CLIENT_PUBLIC_URL}/help/installation</a></strong></p>`,
              data: {
                url: `${process.env.API_PUBLIC_URL}/files/${tempFolderName}/${executableName}`,
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

// Create required folders and launch server
await fs.ensureDir(`${__dirname}/files`);
await fs.ensureDir(`${__dirname}/temp`);
await fs.ensureDir(`${__dirname}/upload`);
// Listens on ENV or default port
server.listen(port, () => console.log(`Listening on port: ${port}!`));
