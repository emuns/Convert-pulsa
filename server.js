require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");

const Transaksi = require("./models/Transaksi");

const app = express();

// ================= DATABASE =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "rahasia",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));

// ================= RATE =================
const RATE = 0.8; // 80%

// ================= ROUTES =================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

// LOGIN
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

// DASHBOARD
app.get("/dashboard", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const data = await Transaksi.find().sort({ createdAt: -1 });

  let html = "<h1>Dashboard</h1><a href='/logout'>Logout</a><br><br>";

  data.forEach((t) => {
    html += `
      <div style="border:1px solid #ccc;padding:10px;margin:10px;">
        Nomor: ${t.nomor} <br>
        Nominal: ${t.nominal} <br>
        Hasil: ${t.hasil} <br>
        Status: ${t.status}
      </div>
    `;
  });

  res.send(html);
});

// TRANSAKSI PAGE
app.get("/transaksi", (req, res) => {
  res.sendFile(path.join(__dirname, "public/transaksi.html"));
});

// SIMPAN TRANSAKSI
app.post("/transaksi", async (req, res) => {
  const { nomor, nominal } = req.body;

  const hasil = nominal * RATE;

  const data = new Transaksi({
    nomor,
    nominal,
    rate: RATE,
    hasil,
  });

  await data.save();

  res.send(`
    <h2>Berhasil</h2>
    <p>Hasil yang didapat: ${hasil}</p>
    <a href="/">Kembali</a>
  `);
});

// UPDATE STATUS
app.get("/update/:id/:status", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  await Transaksi.findByIdAndUpdate(req.params.id, {
    status: req.params.status,
  });

  res.redirect("/dashboard");
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// START
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server jalan " + PORT));
