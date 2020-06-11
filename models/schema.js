const mongoose = require("mongoose");

const empSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  emp_id: Number,
  emp_name:String,
  contact_no: String,
  contact_no: Number,
  emergency_no: Number,
  address: String,
  reporting_manager: String,
  leaves_remaining:Number
});

const main = mongoose.model('emp', empSchema, 'hrbot');

module.exports = main;
