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
  },
  answer: {
    type: String,
    required: true,
  },
});

const HardProblems = mongoose.model("HardProblems", hardProblemsSchema);

export default HardProblems;