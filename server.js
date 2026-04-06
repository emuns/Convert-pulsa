require('dotenv').config()

const express = require('express')
const session = require('express-session')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// 🔥 TRUST PROXY (WAJIB Railway)
app.set('trust proxy', 1)

// 🔥 STATIC PUBLIC (WAJIB)
app.use(express.static(path.join(__dirname, 'public')))

// 🔥 SESSION
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

// ================= LOGIN =================
const ADMIN_USER = 'admin'
const ADMIN_PASS = '12345'

// ================= ROUTES =================

// 🔥 ROOT (INI KUNCI BIAR GA BLANK)
app.get('/', (req, res) => {
  res.redirect('/login.html')
})

// 🔥 LOGIN FORM
app.post('/login', (req, res) => {
  const { username, password } = req.body

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.login = true
    return res.redirect('/dashboard.html')
  }

  res.send('Login gagal ❌')
})

// 🔥 AUTH PROTECT (OPSIONAL)
app.get('/dashboard.html', (req, res, next) => {
  if (!req.session.login) return res.redirect('/login.html')
  next()
})

// LOGOUT
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html')
  })
})

// ================= START =================
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server jalan di port ' + PORT)
})
