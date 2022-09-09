import { User } from "@prisma/client";

export default function sanitizeUser(user: User) {
  return { ...user, password: undefined };
}
