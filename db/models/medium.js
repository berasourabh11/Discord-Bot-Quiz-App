import mongoose from "mongoose";

const mediumProblemsSchema = new mongoose.Schema({
  id:{
    type: Number,
    required: true,
  },
  problem: {
    type: String,
    required: true,
  },
  options:{
    type: Array,
    required: true,
  },
  answer: {
    type: Number,
    required: true,
  },
});

const mediumProblems = mongoose.model("MediumProblems", mediumProblemsSchema);

export default mediumProblems;
