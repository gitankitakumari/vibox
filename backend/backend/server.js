import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// serve songs folder
app.use("/songs", express.static(join(__dirname, "../songs")));

const PORT = 5000;
let otpStore = {};

// =======================
// LOAD TRACKS (ROBUST)
// =======================
let allTracks = [];

const possiblePaths = [
  join(__dirname, "tracks.json"),
  join(process.cwd(), "tracks.json"),
  "C:/Users/ANKITA/OneDrive/Desktop/vibox music project/backend/tracks.json"
];

let loaded = false;

for (const p of possiblePaths) {
  console.log("Checking:", p);

  if (fs.existsSync(p)) {
    try {
      const data = fs.readFileSync(p, "utf8");
      const parsed = JSON.parse(data);

      if (Array.isArray(parsed) && parsed.length > 0) {
        allTracks = parsed;
        console.log(`✅ Loaded ${allTracks.length} tracks from:`, p);
        loaded = true;
        break;
      } else {
        console.log("⚠️ File exists but empty:", p);
      }
    } catch (err) {
      console.log("❌ JSON error at:", p);
    }
  } else {
    console.log("❌ Not found:", p);
  }
}

if (!loaded) {
  console.log("🚨 NO TRACKS LOADED — CHECK tracks.json LOCATION");
}

// =======================
// API
// =======================
app.get("/api/tracks", (req, res) => {
  res.json({
    totalTracks: allTracks.length,
    tracks: allTracks
  });
});

// =======================
// OTP CONFIG
// =======================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vibox.musicapp@gmail.com",
    pass: "xzsdlmsqcalkgaid"
  }
});

// =======================
// SEND OTP
// =======================
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = { otp, expiry: Date.now() + 5 * 60 * 1000 };

  try {
    await transporter.sendMail({
      from: "vibox.musicapp@gmail.com",
      to: email,
      subject: "VI-BOX Verification Code",
      text: `Your OTP is ${otp}`
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// =======================
// VERIFY OTP
// =======================
app.post("/verify-otp", (req, res) => {
  const { email, userOtp } = req.body;
  const data = otpStore[email];

  if (!data) return res.status(400).json({ success: false });

  if (Date.now() > data.expiry) {
    delete otpStore[email];
    return res.status(400).json({ success: false });
  }

  if (data.otp == userOtp) {
    delete otpStore[email];
    return res.json({ success: true });
  }

  return res.status(400).json({ success: false });
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`🔥 Server running: http://localhost:${PORT}`);
});