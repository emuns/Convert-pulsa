const {
 default: makeWASocket,
 useMultiFileAuthState,
 fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");
const fs = require("fs");

async function startBot() {

 // 🔐 session login
 const { state, saveCreds } = await useMultiFileAuthState("session");

 // 🔄 ambil versi terbaru WA
 const { version } = await fetchLatestBaileysVersion();

 const sock = makeWASocket({
  version,
  auth: state,
  browser: ["Android", "Chrome", "1.0.0"]
 });

 // 💾 simpan session
 sock.ev.on("creds.update", saveCreds);

 // 🔌 koneksi WA
 sock.ev.on("connection.update", (update) => {
  const { connection, qr } = update;

  if (qr) {
   console.log("📲 Scan QR ini di WhatsApp kamu:");
   qrcode.generate(qr, { small: true });
  }

  if (connection === "open") {
   console.log("✅ Bot berhasil login & aktif 🔥");
  }

  if (connection === "close") {
   console.log("❌ Koneksi terputus, mencoba ulang...");
   startBot(); // auto reconnect
  }
 });

 // 📩 HANDLE PESAN MASUK
 sock.ev.on("messages.upsert", async ({ messages }) => {
  const msg = messages[0];
  if (!msg.message) return;

  const from = msg.key.remoteJid;
  const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

  console.log("📩 Pesan masuk:", text);

  // ===== MENU =====
  if (text === "menu") {
   await sock.sendMessage(from, {
    text:
`🔥 MENU BOT 🔥

1. cek saldo
2. info
3. ping

Ketik salah satu ya 👆`
   });
  }

  // ===== PING TEST =====
  if (text === "ping") {
   await sock.sendMessage(from, { text: "pong 🟢 bot aktif" });
  }

  // ===== CEK SALDO =====
  if (text === "cek saldo") {

   let users = [];

   try {
    users = JSON.parse(fs.readFileSync("db-user.json"));
   } catch {
    users = [];
   }

   let user = users.find(u => from.includes(u.nomor));

   if (user) {
    await sock.sendMessage(from, {
     text: "💰 Saldo kamu: Rp " + user.saldo
    });
   } else {
    await sock.sendMessage(from, {
     text: "❌ Kamu belum terdaftar"
    });
   }
  }

  // ===== INFO =====
  if (text === "info") {
   await sock.sendMessage(from, {
    text: "🤖 Bot Convert Pulsa Aktif 24 Jam 🔥"
   });
  }

 });

}

// 🚀 jalankan bot
startBot();
