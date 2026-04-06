require("dotenv").config()

const express = require("express")
const session = require("express-session")
const path = require("path")
const mongoose = require("mongoose")

// HANDLE ERROR BIAR KELIHATAN DI LOG
process.on("unhandledRejection", err => {
  console.error("UNHANDLED ERROR:", err)
})

const app = express()

// ===== MIDDLEWARE =====
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(session({
  secret: process.env.SESSION_SECRET || "rahasia",
  resave: false,
  saveUninitialized: true
}))

// ===== STATIC FILE =====
app.use(express.static("public"))

// ===== CONFIG ADMIN =====
const ADMIN_USER = process.env.ADMIN_USER || "admin"
const ADMIN_PASS = process.env.ADMIN_PASS || "12345"

// ===== MODEL =====
const Transaksi = mongoose.model("Transaksi", {
  nomor: String,
  provider: String,
  nominal: Number,
  hasil: Number,
  status: String,
  tanggal: String
})

// ===== AUTH =====
function auth(req, res, next) {
  if (!req.session.login) {
    return res.redirect("/login.html")
  }
  next()
}

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.redirect("/login.html")
})

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.login = true
    return res.redirect("/dashboard.html")
  }

  res.send("Login gagal")
})

// DASHBOARD
app.get("/dashboard.html", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "public/dashboard.html"))
})

// TRANSAKSI PAGE
app.get("/transaksi.html", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "public/transaksi.html"))
})

// ADD TRANSAKSI
app.post("/api/transaksi", auth, async (req, res) => {
  try {
    const { nomor, provider, nominal } = req.body

    const data = {
      nomor,
      provider,
      nominal: Number(nominal),
      hasil: Number(nominal) * 0.8,
      status: "Pending",
      tanggal: new Date().toLocaleString()
    }

    await Transaksi.create(data)

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.json({ success: false })
  }
})

// GET TRANSAKSI
app.get("/api/transaksi", auth, async (req, res) => {
  const data = await Transaksi.find().sort({ _id: -1 })
  res.json(data)
})

// UPDATE STATUS
app.post("/api/update", auth, async (req, res) => {
  const { id, status } = req.body
  await Transaksi.findByIdAndUpdate(id, { status })
  res.json({ success: true })
})

// LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html")
  })
})

// ===== START SERVER (ANTI CRASH) =====
async function startServer() {
  try {
    console.log("Connecting Mongo...")

    await mongoose.connect(process.env.MONGO_URI)

    console.log("MongoDB CONNECTED")

    const PORT = process.env.PORT || 3000

    app.listen(PORT, "0.0.0.0", () => {
      console.log("Server jalan di port " + PORT)
    })

  } catch (err) {
    console.error("GAGAL CONNECT MONGO:", err)
  }
}

startServer()
