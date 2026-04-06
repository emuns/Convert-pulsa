require('dotenv').config()

const express = require('express')
const session = require('express-session')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set('trust proxy', 1)

app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: process.env.SESSION_SECRET || 'rahasia',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

// ================= DATA (sementara) =================
let transaksi = []

// ================= CONFIG =================
const ADMIN_USER = process.env.ADMIN_USER
const ADMIN_PASS = process.env.ADMIN_PASS

// ================= ROUTES =================

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

// PROTECT DASHBOARD
function auth(req, res, next) {
  if (!req.session.login) return res.redirect('/login.html')
  next()
}

app.get('/dashboard.html', auth, (req, res, next) => next())
app.get('/transaksi.html', auth, (req, res, next) => next())

// ================= API =================

// TAMBAH TRANSAKSI
app.post('/api/transaksi', auth, (req, res) => {
  const { nomor, provider, nominal } = req.body

  const data = {
    id: Date.now(),
    nomor,
    provider,
    nominal,
    rate: 0.8,
    hasil: nominal * 0.8,
    status: 'pending',
    tanggal: new Date().toLocaleString()
  }

  transaksi.push(data)
  res.json({ success: true })
})

// LIST TRANSAKSI
app.get('/api/transaksi', auth, (req, res) => {
  res.json(transaksi)
})

// UPDATE STATUS
app.post('/api/update', auth, (req, res) => {
  const { id, status } = req.body

  transaksi = transaksi.map(t =>
    t.id == id ? { ...t, status } : t
  )

  res.json({ success: true })
})

// LOGOUT
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html')
  })
})

// START
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server jalan di port ' + PORT)
})
