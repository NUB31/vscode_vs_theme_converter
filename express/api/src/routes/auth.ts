import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import sanitizeUser from "../utility/sanitizeUser.js";

const router = express.Router();
const { user } = new PrismaClient();

router.post("/login", async (req: Request, res: Response) => {
  if (!req.body.login || !req.body.password)
    return res
      .status(403)
      .json(
        "Request invalid, the request body must contain a minium of a username and password"
      );
  try {
    const rows = await user.findMany({
      where: {
        OR: [{ username: req.body.login }, { email: req.body.login }],
      },
    });

    if (rows.length === 0) {
      return res
        .status(401)
        .json(`User with username "${req.body.login}" not found`);
    } else if (rows.length > 1) {
      return res
        .status(403)
        .json(
          `There are multiple accounts with the username/email "${req.body.login}" \n Please use email instead!"`
        );
    }

    let [row] = rows;

    bcrypt.compare(
      req.body.password,
      row.password,
      (err: any, result: boolean) => {
        if (err) {
          console.error(err);
          return res.status(403).json(err.code);
        }
        if (!result) return res.status(401).json("Password is wrong");
        const accessToken = jwt.sign(
          sanitizeUser(row),
          process.env.JWT_TOKEN || "changeMe"
        );
        res.cookie("jwt", accessToken).json(sanitizeUser(row));
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json("Something went wrong");
  }
});

export default router;
