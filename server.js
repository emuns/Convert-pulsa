require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// CONNECT DB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected ✅"))
.catch(err => console.log(err));

// SCHEMA
const TransaksiSchema = new mongoose.Schema({
  nomor: String,
  nominal: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const Transaksi = mongoose.model("Transaksi", TransaksiSchema);

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ROUTE WEB
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API TAMBAH TRANSAKSI
app.post("/api/transaksi", async (req, res) => {
  try {
    const { nomor, nominal } = req.body;

    const data = new Transaksi({ nomor, nominal });
    await data.save();

    res.json({ success: true, message: "Transaksi masuk" });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// API GET TRANSAKSI (ADMIN)
app.get("/api/transaksi", async (req, res) => {
  const data = await Transaksi.find().sort({ createdAt: -1 });
  res.json(data);
});

// UPDATE STATUS
app.post("/api/update/:id", async (req, res) => {
  await Transaksi.findByIdAndUpdate(req.params.id, {
    status: req.body.status
  });
  res.json({ success: true });
});

// START SERVER
app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
