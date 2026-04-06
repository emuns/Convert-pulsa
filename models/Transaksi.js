const mongoose = require("mongoose");

const transaksiSchema = new mongoose.Schema({
  nomor: String,
  nominal: Number,
  rate: Number,
  hasil: Number,
  status: {
    type: String,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaksi", transaksiSchema);
