import { PrismaClient } from "@prisma/client";

declare global {
  // This is to ensure that there's only a single instance of PrismaClient in the development environment
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
