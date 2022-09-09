import { NextFunction, Request, Response } from "express";

import schedule from "node-schedule";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

let uniqueVisitors: string[] = [];
let transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

schedule.scheduleJob(" 0 0 12 1/1 * ? * ", async () => {
  await transporter.sendMail({
    from: "oliverlhs@outlook.com", // list of receivers
    to: "oliverlhs@outlook.com", // list of receivers
    subject: `Daily visitor report for Example.com`, // Subject line
    text: `The site had ${uniqueVisitors.length} visitors the last hour`,
  });
  uniqueVisitors = [];
});

export const countUniqueIps = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (
    typeof ip === "string" &&
    !uniqueVisitors.includes(ip) &&
    !req.url.includes(".")
  ) {
    uniqueVisitors.push(ip);
  }
  next();
};
