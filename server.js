require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session (login admin)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rahasia",
    resave: false,
    saveUninitialized: true,
  })
);

// 🔥 static file (WAJIB)
app.use(express.static(path.join(__dirname, "public")));

// =======================
// ROUTES
// =======================

// halaman utama
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

// proses login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    req.session.user = username;
    return res.redirect("/dashboard");
  } else {
    return res.send("Login gagal");
  }
});

// dashboard (protected)
app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

// admin
app.get("/admin", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "public/admin.html"));
});

// transaksi
app.get("/transaksi", (req, res) => {
  res.sendFile(path.join(__dirname, "public/transaksi.html"));
});

// logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// fallback (anti blank putih)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
