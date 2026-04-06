require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();

// ================== MIDDLEWARE ==================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || "rahasia",
  resave: false,
  saveUninitialized: true
}));

// ================== CONNECT MONGO ==================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.log("❌ MongoDB error:", err.message);
    // JANGAN process.exit() biar Railway gak mati
  });

// ================== ROUTES ==================

// TEST ROOT
app.get("/", (req, res) => {
  res.send("🚀 Server convert pulsa aktif");
});

// LOGIN ADMIN (simple)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    req.session.login = true;
    return res.json({ success: true, message: "Login berhasil" });
  }

  res.json({ success: false, message: "Login gagal" });
});

// DASHBOARD (protected)
app.get("/dashboard", (req, res) => {
  if (!req.session.login) {
    return res.status(401).send("Unauthorized");
  }

  res.send("Welcome Admin 🔐");
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.send("Logout berhasil");
  });
});

// ================== ERROR HANDLER ==================
process.on("uncaughtException", err => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", err => {
  console.error("❌ Unhandled Rejection:", err);
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("🚀 Server jalan di port " + PORT);
});
