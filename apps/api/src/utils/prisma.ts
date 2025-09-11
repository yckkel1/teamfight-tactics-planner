import { PrismaClient } from "@prisma/client";

// single place to manage the Prisma client lifecycle
export const prisma = new PrismaClient();
