require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// ===== DEBUG ENV =====
console.log("ENV CHECK:");
console.log("MONGO_URI:", process.env.MONGO_URI ? "ADA ✅" : "KOSONG ❌");

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ===== ROUTE TEST =====
app.get("/api/test", (req, res) => {
  res.json({ status: "OK", message: "Server hidup 🔥" });
});

// ===== CONNECT MONGODB =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB CONNECTED ✅");

  // START SERVER setelah DB connect
  app.listen(PORT, () => {
    console.log("Server jalan di port " + PORT);
  });

})
.catch((err) => {
  console.log("MongoDB ERROR ❌");
  console.log(err);

  // tetap hidup walau DB gagal
  app.listen(PORT, () => {
    console.log("Server jalan TANPA DB di port " + PORT);
  });
});
