import dotenv from "dotenv";
import { beforeAll, beforeEach, afterEach, afterAll, vi } from "vitest";
import { prisma } from "../src/infrastructure/database/index.ts";

// Load test environment
dotenv.config({
  path: ".env.test",
});

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  vi.clearAllMocks();
});

afterEach(async () => {
  vi.restoreAllMocks();
});

afterAll(async () => {
  await prisma.$disconnect();
});