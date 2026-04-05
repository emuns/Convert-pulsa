const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// session
app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: true,
  })
);

// 👉 FIX PENTING: serve semua file dari root folder
app.use(express.static(__dirname));

// ================= ROUTE =================

// root → login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// proses login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "123") {
    req.session.user = username;
    return res.redirect("/dashboard");
  }

  res.send("Login gagal");
});

// dashboard (protected)
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
