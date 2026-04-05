const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const path = require('path')

const app = express()

// middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(session({
  secret: 'rahasia123',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

// static file
app.use(express.static(path.join(__dirname, 'public')))

// ===== ROUTE =====

// halaman login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'))
})

// proses login
app.post('/login', (req, res) => {
  const { username, password } = req.body

  // akun default
  if (username === 'admin' && password === 'admin123') {
    req.session.user = username
    return res.json({ success: true })
  }

  res.json({ success: false })
})

// dashboard (harus login)
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/')
  }

  res.sendFile(path.join(__dirname, 'public/dashboard.html'))
})

// logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
})

// ===== SERVER =====
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log('Server jalan di port ' + PORT)
})
