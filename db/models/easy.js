import mongoose from "mongoose";

const easyProblemsSchema = new mongoose.Schema({
  id:{
    type: Number,
    required: true,
  },
  problem: {
    type: String,
    required: true,
  },
  answer: {
    type: Boolean,
    required: true,
  },
});


const easyProblems = mongoose.model("EasyProblems", easyProblemsSchema);

export default easyProblems;