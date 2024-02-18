import mongoose from "mongoose";

const hardProblemsSchema = new mongoose.Schema({
  id:{
    type: Number,
    required: true,
  },
  problem: {
    type: String,
    required: true,
  },
  description:{
    type: String,
    required: true,
    default: "Type your answer as a message. Make sure you spell your answer correctly",
  },
  answer: {
    type: String,
    required: true,
  },
});

const HardProblems = mongoose.model("HardProblems", hardProblemsSchema);

export default HardProblems;