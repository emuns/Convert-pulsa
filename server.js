require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// session
app.use(session({
  secret: process.env.SESSION_SECRET || "secret123",
  resave: false,
  saveUninitialized: true
}));

// static folder (WAJIB untuk public)
app.use(express.static("public"));

// akun admin dari .env
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "12345";

// ================= ROUTES =================

// root → login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// halaman login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

// proses login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.login = true;
    return res.redirect("/dashboard");
  }

  res.send(`
    <h3>Login gagal ❌</h3>
    <a href="/login">Coba lagi</a>
  `);
});

// middleware auth
function auth(req, res, next) {
  if (req.session.login) {
    next();
  } else {
    res.redirect("/login");
  }
}

// dashboard (protected)
app.get("/dashboard", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

// logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// start server
app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
