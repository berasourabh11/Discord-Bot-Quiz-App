import easyProblems from "./db/models/easy.js";
import mediumProblems from "./db/models/medium.js";
import hardProblems from "./db/models/hard.js";
import { connectdb } from "./db/dbconnect.js";
import { initialEasyProblems } from "./data/easyProblems.js";
import dotenv from "dotenv";
import { initialMediumProblems } from "./data/mediumProblems.js";
import { initialHardProblems } from "./data/hardProblems.js";
dotenv.config();


async function seed() {
  await connectdb();
  await hardProblems.insertMany(initialHardProblems);
  await easyProblems.insertMany(initialEasyProblems);
  await mediumProblems.insertMany(initialMediumProblems);
  console.log("Seeded the database");
  process.exit(0);
}

seed();
