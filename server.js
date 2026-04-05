const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const PORT = 3000;

// DB LOCAL (sementara)
mongoose.connect("mongodb://127.0.0.1:27017/pulsa");

const User = mongoose.model("User", {
  username: String,
  password: String,
  saldo: Number
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true
}));

app.use(express.static("public"));

// auto admin
(async () => {
  const cek = await User.findOne({ username: "admin" });
  if (!cek) {
    const hash = await bcrypt.hash("123456", 10);
    await User.create({
      username: "admin",
      password: hash,
      saldo: 100000
    });
    console.log("Admin dibuat");
  }
})();

// login
app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.json({ success: false });

  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) return res.json({ success: false });

  req.session.user = user._id;
  res.json({ success: true });
});

app.listen(PORT, () => console.log("Server jalan"));
