const Mongoose = require("mongoose");

const Schema = Mongoose.Schema;

const taskSchema = new Schema({
  id: {
    type: Number,
    required: false
  },
  content: {
    type: String,
    required: false
  }
});

module.exports = Mongoose.model("task", taskSchema);
