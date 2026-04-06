require('dotenv').config()

const express = require('express')
const session = require('express-session')
const path = require('path')

const app = express()

// PORT Railway (WAJIB ADA fallback)
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Static folder (WAJIB biar HTML kebaca)
app.use(express.static("public"))

// Session fix
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: true
}))

// USER LOGIN
const ADMIN_USER = process.env.ADMIN_USER || "admin"
const ADMIN_PASS = process.env.ADMIN_PASS || "12345"

// ROOT
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'))
app.get("/", (req, res) => {
  res.send("SERVER HIDUP ✅");
});

// LOGIN PAGE
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'))
})

// LOGIN POST
app.post('/login', (req, res) => {
  const { username, password } = req.body

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.login = true
    return res.redirect('/dashboard')
  }

  res.send(`
    <h3>Login gagal ❌</h3>
    <a href="/login">Coba lagi</a>
  `)
})

// AUTH MIDDLEWARE
function auth(req, res, next) {
  if (req.session.login) return next()
  res.redirect('/login')
}

// DASHBOARD
app.get('/dashboard', auth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'))
})

// LOGOUT
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login')
  })
})

// START SERVER
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server jalan di port " + PORT)
})
