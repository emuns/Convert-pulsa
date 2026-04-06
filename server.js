require('dotenv').config()

const express = require('express')
const session = require('express-session')
const path = require('path')

const app = express()

const PORT = process.env.PORT || 3000

// middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// WAJIB: serve folder public
app.use(express.static(path.join(__dirname, 'public')))

// session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: true
}))

// login config
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || '12345'

// root → login
app.get('/', (req, res) => {
  res.redirect('/login')
})

// login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'))
})

// login process
app.post('/login', (req, res) => {
  const { username, password } = req.body

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.login = true
    return res.redirect('/dashboard')
  }

  res.send('Login gagal')
})

// middleware auth
function auth(req, res, next) {
  if (req.session.login) return next()
  res.redirect('/login')
}

// dashboard
app.get('/dashboard', auth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'))
})

// logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login')
  })
})

// START SERVER (WAJIB)
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server jalan di port ' + PORT)
})
