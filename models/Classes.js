const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var ClassesScheme = Schema({
  name: {
    type: String,
    required: true,
  },
  teacher: {
    type: [Schema.Types.ObjectId],
    ref: "teacher",
  },
});

module.exports = mongoose.model("classes", ClassesScheme);
