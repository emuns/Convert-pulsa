require('dotenv').config()

const express = require('express')
const session = require('express-session')
const path = require('path')
const mongoose = require('mongoose')

const app = express()

const PORT = process.env.PORT;

// ===== CONNECT MONGODB =====
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB CONNECTED")

    app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
      console.log("Server jalan di port " + (process.env.PORT || 3000))
    })

  } catch (err) {
    console.error("Mongo ERROR:", err)
  }
}

startServer()
// ===== MIDDLEWARE =====
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// ===== SESSION (HARUS DI ATAS ROUTE) =====
app.use(session({
  secret: process.env.SESSION_SECRET || "rahasia",
  resave: false,
  saveUninitialized: true
}))

// ===== STATIC FILE =====
app.use(express.static('public'))

// ===== CONFIG ADMIN =====
const ADMIN_USER = process.env.ADMIN_USER || "admin"
const ADMIN_PASS = process.env.ADMIN_PASS || "12345"

// ===== MODEL =====
const Transaksi = mongoose.model('Transaksi', {
  nomor: String,
  provider: String,
  nominal: Number,
  hasil: Number,
  status: String,
  tanggal: String
})

// ===== AUTH MIDDLEWARE =====
function auth(req, res, next) {
  if (!req.session.login) {
    return res.redirect('/login.html')
  }
  next()
}

// ===== ROUTES =====

// ROOT
app.get('/', (req, res) => {
  res.redirect('/login.html')
})

// LOGIN
app.post('/login', (req, res) => {
  const { username, password } = req.body

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.login = true
    return res.redirect('/dashboard.html')
  }

  res.send('Login gagal ❌')
})

// DASHBOARD
app.get('/dashboard.html', auth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'))
})

// TRANSAKSI PAGE
app.get('/transaksi.html', auth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/transaksi.html'))
})

// ADD TRANSAKSI
app.post('/api/transaksi', auth, async (req, res) => {
  const { nomor, provider, nominal } = req.body

  const data = {
    nomor,
    provider,
    nominal: Number(nominal),
    hasil: Number(nominal) * 0.8,
    status: 'pending',
    tanggal: new Date().toLocaleString()
  }

  await Transaksi.create(data)

  res.json({ success: true })
})

// GET TRANSAKSI
app.get('/api/transaksi', auth, async (req, res) => {
  const data = await Transaksi.find().sort({ _id: -1 })
  res.json(data)
})

// UPDATE STATUS
app.post('/api/update', auth, async (req, res) => {
  const { id, status } = req.body

  await Transaksi.findByIdAndUpdate(id, { status })

  res.json({ success: true })
})

// LOGOUT
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html')
  })
})

// START SERVER
app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
