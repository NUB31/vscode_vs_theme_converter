import { Users } from "@prisma/client";

declare global {
  declare namespace Express {
    interface Request {
      user: Users;
    }
  }
}
