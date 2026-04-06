require("dotenv").config();
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();

// ✅ WAJIB: pakai PORT dari Railway
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "rahasia",
    resave: false,
    saveUninitialized: true,
  })
);

// ✅ CONNECT MONGO (optional tapi aman)
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("Mongo Error:", err.message));
}

// ✅ ROUTE UTAMA (WAJIB ADA)
app.get("/", (req, res) => {
  res.send("🚀 Convert Pulsa API Aktif!");
});

// contoh route test
app.get("/test", (req, res) => {
  res.json({ status: "OK" });
});

// ✅ LISTEN (INI PENTING BANGET)
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server jalan di port " + PORT);
});
