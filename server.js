require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();

// ===== CONFIG =====
const PORT = process.env.PORT || 8080;

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "rahasia",
    resave: false,
    saveUninitialized: true,
  })
);

// ===== DATABASE =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

// ===== ROUTE TEST =====
app.get("/", (req, res) => {
  res.send("🔥 Server convert pulsa aktif!");
});

// ===== START SERVER =====
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server jalan di port", PORT);
});
