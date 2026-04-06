require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "rahasia",
    resave: false,
    saveUninitialized: true,
  })
);

// static
app.use(express.static(path.join(__dirname, "public")));

// routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    req.session.user = username;
    return res.redirect("/dashboard");
  }

  res.send("Login gagal");
});

app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

app.get("/admin", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "public/admin.html"));
});

app.get("/transaksi", (req, res) => {
  res.sendFile(path.join(__dirname, "public/transaksi.html"));
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
