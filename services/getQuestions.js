import { connectdb } from "../db/dbconnect.js";
import easyProblems from "../db/models/easy.js";
import mediumProblems from "../db/models/medium.js";
import hardProblems from "../db/models/hard.js";
import dotenv from "dotenv";
dotenv.config();

// Updated function to get 10 Easy questions
const getEasyQuestions = async () => {
  const questions = await easyProblems.aggregate([
    { $sample: { size: 10 } } // Randomly select 10 documents
  ]);
  return questions;
};

// Updated function to get 10 Medium questions
const getMediumQuestions = async () => {
  const questions = await mediumProblems.aggregate([
    { $sample: { size: 10 } } // Randomly select 10 documents
  ]);
  return questions;
};

// Updated function to get 10 Hard questions
const getHardQuestions = async () => {
  const questions = await hardProblems.aggregate([
    { $sample: { size: 10 } } // Randomly select 10 documents
  ]);
  return questions;
};

const getQuestions = async () => {
  const easyQuestions = await getEasyQuestions();
  const mediumQuestions = await getMediumQuestions();
  const hardQuestions = await getHardQuestions();
  return {
    easyQuestions,
    mediumQuestions,
    hardQuestions,
  };
};

export default getQuestions;
