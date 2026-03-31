import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const email = "admin@example.com";
  const password = "Admin@123";

  const hashed = await bcrypt.hash(password, 10);

  // delete all existing users
  await prisma.user.deleteMany();

  // create fresh admin
  await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: "ADMIN",
    },
  });

  return Response.json({ message: "Admin created successfully" });
}