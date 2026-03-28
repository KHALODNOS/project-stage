# 📚 WebNovel Reading Platform

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&logoColor=white)

## 📖 Description
A comprehensive, full-stack web application designed for novel enthusiasts. This platform allows users to discover, read, and engage   novels through a modern, high-performance interface. It features a sophisticated reading mode, real-time community engagement, and AI-driven features for an immersive literary experience.

---

## ✨ Features

- **🎯 Professional Reading Dashboard**: A multi-column, organized layout for quick access to latest updates, popular series, and completed works.
- **📖 Immersive Reading Mode**:
  - Customizable fonts (Amiri, Cairo, El Messiri, etc.).
  - Adjustable size, line height, and font weight.
  - Progress tracking with scroll-sync and bookmarking.
  - Light/Dark theme sensitivity.
- **🤖 AI Chatbot**: Integrated **Google Gemini AI** for character interaction and reader assistance.
- **💬 Real-time Messaging**: Instant communication between users powered by **Socket.io**.
- **🎥 TikTok-Style Discover**: A dedicated short-form content section for viral novel clips or highlights.
- **🌓 Dynamic Theming**: Seamless transition between professional dark mode and clean light mode.
- **🔍 Advanced Search**: Real-time filtering and multi-category novel lookup.
- **🛡️ Secure Auth**: JWT-based authentication with protected routes and role-based access.

---

## 🛠️ Technologies Used

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React / React Icons
- **State Management**: React Context API
- **Networking**: Axios / Custom useHttp Hook

### Backend
- **Environment**: Node.js / Express
- **Database**: MongoDB (Atlas)
- **Real-time**: Socket.io
- **AI**: Google Generative AI (@google/generative-ai)
- **Auth**: JWT / Bcrypt.js
- **Mail**: Nodemailer
- **File Storage**: Multer

---

## 📂 Project Structure

```bash
project-stage/
├── frontend/             # React + Vite + TypeScript Application
│   ├── src/
│   │   ├── components/   # Atomic UI elements and layouts
│   │   ├── pages/        # Main route viewing components
│   │   ├── store/        # Context and global state
│   │   └── utils/        # Helpers and constants
│   └── public/           # Static assets
└── backend/              # Node.js + Express Server
    ├── controller/       # Business logic for routes
    ├── models/           # Mongoose schemas (User, Novel, Chapter)
    ├── routes/           # API endpoint definitions
    ├── middleware/       # Auth & validation logic
    └── uploads/          # Local storage for images/files
```

---

## ⚙️ Environment Variables

### Backend (`/backend/.env`)
Create a `.env` file in the backend directory with:
```env
DATABASE_URI=your_mongodb_uri
ACCESS_JWT=your_secret_key
REFRESH_JWT=your_refresh_key
GEMINI_API_KEY=your_google_ai_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB account

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd project-stage
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup
```bash
cd ../backend
npm install
npm run dev
```

---

## 🧠 Challenges

- **Theme Consistency**: Transitioning from hardcoded colors to semantic Tailwind variables across a complex UI was a significant refactoring challenge.
- **RTL Support**: Harmonizing right-to-left Arabic typography with modern 12-column grid layouts while maintaining cross-browser compatibility.
- **Real-time Sync**: Coordinating Socket.io states between reading progress and global notifications.

---

## 🔮 Future Improvements

- **Mobile App**: Developing a React Native counterpart for offline reading.
- **Audio Novels**: Integrating Text-to-Speech (TTS) for accessibility.
- **Advanced Bookmarking**: Allow users to highlight specific sentences and share them on social media.
- **Translator Dashboard**: A dedicated workspace for translators with built-in AI help.

---

## 👤 Author
- Khalid moumine

## 📄 License
This project is licensed under the **ISC License**.
