const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExamsScheme = new Schema({
  date: {
    type: Date,
    required: true,
    default: new Date(),
  },
  classId: {
    type: Number,
    required: true,
  },
  classKey: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "class",
  },
  content: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("exams", ExamsScheme);
