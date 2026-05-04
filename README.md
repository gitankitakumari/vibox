# 🎧 Vibox — Full Stack Music Streaming Web App

Vibox is a modern **music streaming web application** built using **HTML, CSS, JavaScript, and Node.js**.
It provides an interactive UI for browsing songs and a backend system for managing song data.

---

## 🚀 Features

* 🎵 Play, pause, and skip songs
* 📁 Artist-wise song organization
* ❤️ Playlist management
* 🔍 Discover & trending sections
* 🎨 Clean and responsive UI
* ⚡ Fast performance with modular code
* 🧠 JSON-based dynamic song loading

---

## 🏗️ Project Structure

```id="h7b9r2"
vibox/
│
├── frontend/                 # Main UI (runs in browser)
│   ├── pages/
│   ├── css/
│   ├── js/
│   ├── assets/
│   │   ├── images/
│   │   └── songs/            # songs.json per artist
│
├── backend/                  # Optional Node.js backend
│   ├── server.js
│   ├── generateJson.js
│   ├── package.json
│
└── README.md
```

---

## ⚙️ How It Works

### Frontend

* Displays UI and handles user interaction
* Loads songs dynamically from `songs.json`
* Uses HTML5 Audio API for playback

### Backend (Optional)

* Node.js server for handling song data
* `generateJson.js` helps generate structured JSON files

---

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js

---

## 🚀 Getting Started

### 1️⃣ Clone Repository

```id="o2k5zd"
git clone https://github.com/your-username/vibox.git
cd vibox
```

---

### 2️⃣ Run Frontend

Open in browser:

```id="fw6jxt"
frontend/pages/index.html
```

---

### 3️⃣ Run Backend (Optional)

```id="d8p4yf"
cd backend
npm install
node server.js
```

---

## 📌 Note

* Audio files are not included in the repository to keep it lightweight
* Song data is managed using `songs.json` files
* Backend is optional and used for local development

---

## 💡 Key Highlights

* Modular folder structure
* Scalable music system
* Clean UI/UX
* Separation of frontend and backend

---

## 🚀 Future Improvements

* AI-based song recommendation 🎯
* User authentication
* Cloud storage for songs
* Real-time streaming integration

---
## 🔗 Links

- 🌐 Live Demo: https://gitankitakumari.github.io/vibox/
- 📂 GitHub: https://github.com/gitankitakumari/vibox
## 👩‍💻 Author

**Ankita Kumari**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
