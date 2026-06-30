# 💬 PulseFeed — Mini Social Media App

A fully functional mini social media platform built with **HTML, CSS, and JavaScript** (no frameworks). Completed as part of **Task 2** from the Web Development course assignment.

---

## 🔗 Live Demo

> https://mini-media.vercel.app/

---

## ✅ Features Implemented

| Feature | Description |
|---|---|
| 👤 User Profiles | Name, username, bio, avatar, stats (posts/followers/following) |
| 📝 Posts | Create text posts (280 char limit), shown in feed |
| 💬 Comments | Comment on any post, view threaded replies |
| ❤️ Like System | Like/unlike posts with live count |
| ➕ Follow System | Follow/unfollow users, view followers & following lists |
| 🏠 Personalized Feed | Shows posts from people you follow |
| 🔍 Explore | Browse and search all posts/people |
| 🗃️ Database | `localStorage` stores users, posts, comments, follows |
| 📱 Responsive | Works on mobile, tablet, and desktop |

A few demo accounts are pre-seeded so you can explore the app immediately:
- `aarav@demo.com` / `demo123`
- `priya@demo.com` / `demo123`
- `rohan@demo.com` / `demo123`
- `sneha@demo.com` / `demo123`

---

## 🗂️ Project Structure

```
pulsefeed/
├── index.html     ← Page structure (feed, explore, profile, modals)
├── style.css       ← All styling (dark theme, layout, animations)
├── script.js       ← All logic (auth, posts, likes, comments, follows)
└── README.md       ← This file
```

---

## 🚀 How to Run Locally

1. Clone or download this repository
2. Open `index.html` in any modern browser
3. No server or installation needed — it's 100% frontend

```bash
git clone https://github.com/YOUR-USERNAME/pulsefeed.git
cd pulsefeed
open index.html
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Styling | CSS Grid, Flexbox, CSS Variables |
| Storage | Browser `localStorage` (simulates a database) |
| Fonts | Google Fonts — Inter + Syne |
| Hosting | GitHub Pages |

---

## 📌 Notes

- All data (users, posts, comments, follows) is stored in `localStorage` — no backend server required
- In a production app, `localStorage` would be replaced with API calls to a **Django** or **Express.js** backend with a real database (PostgreSQL/MongoDB) for users, posts, comments, and followers
- Passwords are stored in plain text in localStorage — in production, always use hashed passwords via a backend

---

## 👨‍💻 Author

**Prasanth MK**
Roll No: 25AD126
Department of Artificial Intelligence and Data Science
KPR Institute of Engineering and Technology
