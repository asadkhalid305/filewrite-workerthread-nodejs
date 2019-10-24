const Mongoose = require("mongoose");

const Schema = Mongoose.Schema;

const benchmarkSchema = new Schema({
  index: {
    type: Number,
    required: false
  },
  time: {
    type: String,
    required: false
  }
});

module.exports = Mongoose.model("benchmark", benchmarkSchema);
