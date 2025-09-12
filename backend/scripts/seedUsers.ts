import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import { UserModel } from "../src/models/User";
import { Role } from "../src/auth/roles";

configDotenv(); 
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/tg-cloudflare-bot";

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("🔌 Connected to MongoDB");

    await UserModel.deleteMany({ username: /testuser/i });

    const users = [
      {
        telegramId: 1001,
        username: "testuser1",
        isAllowed: true,
        roles: [Role.USER],
      },
      {
        telegramId: 1002,
        username: "testuser2",
        isAllowed: false,
        roles: [Role.USER],
      },
      {
        telegramId: 1003,
        username: "testadmin",
        isAllowed: true,
        roles: [Role.ADMIN],
      },
      {
        telegramId: 1004,
        username: "multiuser",
        isAllowed: true,
        roles: [Role.USER, Role.ADMIN],
      },
    ];

    const result = await UserModel.insertMany(users);
    console.log(`✅ Seeded ${result.length} test users`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

seedUsers();
