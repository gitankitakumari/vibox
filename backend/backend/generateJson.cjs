const fs = require("fs");
const path = require("path");

const basePath = path.join(__dirname, "../frontend/assets/songs");

// 🎯 Title clean (AankhenBhiHoti → Aankhen Bhi Hoti)
function formatTitle(name) {
  return name
    .replace(".mp3", "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\(\d+\)/g, "") // remove (2)
    .trim();
}

// 🎯 ID clean (safe for future)
function cleanId(name, index) {
  return name
    .replace(".mp3", "")
    .toLowerCase()
    .replace(/\(\d+\)/g, `-${index}`) // handle duplicates
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-");
}

fs.readdirSync(basePath).forEach(folder => {
  const folderPath = path.join(basePath, folder);

  if (!fs.lstatSync(folderPath).isDirectory()) return;

  const files = fs.readdirSync(folderPath)
    .filter(file => file.endsWith(".mp3"));

  const artistName = folder
    .replaceAll("-", " ")
    .replace(/\b\w/g, c => c.toUpperCase());

  const songs = files.map((file, index) => ({
    id: cleanId(file, index),
    title: formatTitle(file),
    file: file
  }));

  const json = {
    artist: artistName,
    image: `/assets/artists/${folder}.jpg`,
    songs: songs
  };

  fs.writeFileSync(
    path.join(folderPath, "songs.json"),
    JSON.stringify(json, null, 2)
  );
});

console.log("✅ FINAL CLEAN JSON GENERATED");