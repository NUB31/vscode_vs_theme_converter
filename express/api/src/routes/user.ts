import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import authenticateToken from "../middleware/authenticateUser.js";
import sanitizeUser from "../utility/sanitizeUser.js";

const router = express.Router();
const { user } = new PrismaClient();

// user routes
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const row = await user.findUniqueOrThrow({
      where: {
        id: req.user.id,
      },
    });
    res.json(sanitizeUser(row));
  } catch (err) {
    console.error(err);
    res.status(500).json("Something went wrong, try logging out and in again");
  }
});

router.post("/", async (req: Request, res: Response) => {
  if (!req.body.password || !req.body.username || !req.body.email)
    return res
      .status(422)
      .json(
        "Request invalid, the request body must contain a minium of a username, email and password"
      );

  try {
    let row = await user.create({
      data: {
        username: req.body.username,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10),
        gender: req.body.gender,
        picture: req.body.picture,
      },
    });
    const accessToken = jwt.sign(
      sanitizeUser(row),
      process.env.JWT_TOKEN || "changeMe"
    );
    res.cookie("jwt", accessToken).json(sanitizeUser(row));
  } catch (err) {
    console.error(err);
    res.status(500).json("Something went wrong");
  }
});

router.put("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const row = await user.update({
      data: {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
          ? await bcrypt.hash(req.body.password, 10)
          : undefined,
        gender: req.body.gender,
        picture: req.body.picture,
      },
      where: {
        id: req.user.id,
      },
    });
    const accessToken = jwt.sign(
      sanitizeUser(row),
      process.env.JWT_TOKEN || "changeMe"
    );
    // res.cookie("jwt", accessToken).end();
    res.cookie("jwt", accessToken).json(sanitizeUser(row));
  } catch (err) {
    console.error(err);
    res.status(500).json("Something went wrong");
  }
});

export default router;
