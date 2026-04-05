const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const session = require("express-session");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use(session({
  secret: "rahasia",
  resave: false,
  saveUninitialized: true
}));

// ================= DATABASE =================
if (!fs.existsSync("db.json")) fs.writeFileSync("db.json", "[]");
if (!fs.existsSync("db-user.json")) fs.writeFileSync("db-user.json", "[]");

const readDB = () => JSON.parse(fs.readFileSync("db.json"));
const writeDB = (data) => fs.writeFileSync("db.json", JSON.stringify(data, null, 2));

const readUser = () => JSON.parse(fs.readFileSync("db-user.json"));
const writeUser = (data) => fs.writeFileSync("db-user.json", JSON.stringify(data, null, 2));

// ================= CONFIG =================
const RATE = 0.85;

// ================= ADMIN LOGIN =================
const ADMIN = { username: "admin", password: "12345" };

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN.username && password === ADMIN.password) {
    req.session.admin = true;
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// ================= USER REGISTER =================
app.post("/register", (req, res) => {
  let users = readUser();

  if (users.find(u => u.username === req.body.username)) {
    return res.json({ error: "User sudah ada" });
  }

  users.push({
    id: Date.now(),
    username: req.body.username,
    password: req.body.password,
    saldo: 0
  });

  writeUser(users);
  res.json({ message: "Register sukses" });
});

// ================= USER LOGIN =================
app.post("/user/login", (req, res) => {
  let users = readUser();

  const user = users.find(u =>
    u.username === req.body.username &&
    u.password === req.body.password
  );

  if (user) {
    req.session.user = user.id;
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// ================= GET USER =================
app.get("/user/me", (req, res) => {
  if (!req.session.user) return res.json(null);

  let users = readUser();
  const user = users.find(u => u.id === req.session.user);

  res.json(user);
});

// ================= UPLOAD =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ================= KIRIM TRANSAKSI =================
app.post("/kirim", upload.single("bukti"), (req, res) => {
  let db = readDB();

  const nominal = parseInt(req.body.nominal);

  // anti fraud minimal
  if (nominal < 5000) {
    return res.json({ error: "Minimal 5rb" });
  }

  const hasil = Math.floor(nominal * RATE);

  const data = {
    id: Date.now(),
    userId: req.session.user || null,
    nomor: req.body.nomor,
    nominal,
    hasil,
    provider: req.body.provider,
    tujuan: req.body.tujuan,
    bukti: req.file ? req.file.filename : null,
    status: "pending",
  };

  db.push(data);
  writeDB(db);

  res.json({ message: "Terkirim!", hasil });
});

// ================= ADMIN LIHAT =================
app.get("/admin/transaksi", (req, res) => {
  if (!req.session.admin) return res.status(403).json({});

  res.json(readDB());
});

// ================= UPDATE STATUS =================
app.post("/admin/update/:id", (req, res) => {
  if (!req.session.admin) return res.status(403).json({});

  let db = readDB();
  let users = readUser();

  const id = parseInt(req.params.id);
  const status = req.body.status;

  db = db.map(t => {
    if (t.id === id && t.status !== "sukses") {

      if (status === "sukses" && t.userId) {
        users = users.map(u => {
          if (u.id === t.userId) {
            return { ...u, saldo: u.saldo + t.hasil };
          }
          return u;
        });
      }

      return { ...t, status };
    }
    return t;
  });

  writeDB(db);
  writeUser(users);

  res.json({ message: "Updated" });
});

// ================= STATS =================
app.get("/admin/stats", (req, res) => {
  if (!req.session.admin) return res.status(403).json({});

  let db = readDB();

  let total = 0;
  let profit = 0;

  db.forEach(t => {
    if (t.status === "sukses") {
      total += t.nominal;
      profit += (t.nominal - t.hasil);
    }
  });

  res.json({ total, profit });
});

// ================= WITHDRAW =================
app.post("/withdraw", (req, res) => {
  if (!req.session.user) return res.json({ error: "Login dulu" });

  let users = readUser();
  const userId = req.session.user;

  const amount = parseInt(req.body.amount);

  users = users.map(u => {
    if (u.id === userId) {
      if (u.saldo < amount) {
        return u;
      }
      return { ...u, saldo: u.saldo - amount };
    }
    return u;
  });

  writeUser(users);

  res.json({ message: "Withdraw diproses" });
});

// ================= SERVER =================
app.listen(3000, () => {
  console.log("🔥 Server jalan di http://localhost:3000");
});
