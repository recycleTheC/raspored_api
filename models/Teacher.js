const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TeacherSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("teacher", TeacherSchema);
