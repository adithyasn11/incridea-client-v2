# Incridea Client v2

Incridea Client v2 is the frontend application powering **Incridea**, the annual techno-cultural fest organized by NMAM Institute of Technology.  
This repository contains the client-side codebase built with **React**, **TypeScript**, and **Tailwind CSS**, designed to deliver a modern, responsive, and interactive user experience for event browsing, registrations, and participant engagement.

---

## 🚀 Features

- **React + TypeScript** for scalable and type-safe frontend development
- **Tailwind CSS** for rapid UI styling and responsive design
- **React Router** for seamless navigation across pages
- **Axios** integration for API communication with the backend
- **Reusable components** for consistent UI/UX
- Environment configuration via `.env` file
- Ready-to-deploy setup with **Vercel/VPS**

---

## 📂 Project Structure
incridea-client-v2/

├── public/                # Static assets (images, icons, etc.)

├── src/                   # Application source code  
│   ├── components/        # Reusable UI components  
│   ├── pages/             # Page-level components  
│   ├── hooks/             # Custom React hooks  
│   ├── utils/             # Helper functions  
│   ├── App.tsx            # Root component  
│   └── index.tsx          # Entry point  

├── .env.example           # Example environment variables  

├── package.json           # Dependencies and scripts  

├── tsconfig.json          # TypeScript configuration  

└── README.md              # Project documentation  

---

## ⚙️ Tech Stack

- **Language:** TypeScript
- **Framework:** React
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **API Communication:** Axios
- **Deployment:** Vercel / VPS

---

## 🔧 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Incridea-NMAMIT/incridea-client-v2.git
   cd incridea-client-v2
2. **Install Dependencies**
   ```bash
   npm install
3. **Configure environment variables**
    - Copy .env.example to .env
4. **Start development server**
   ```bash
   npm run dev

**📡 Integration**

The client communicates with the Incridea Server v2 backend via RESTful APIs to:

Fetch event details

Handle user registrations

Manage participant dashboards

Provide admin interfaces (if enabled)

**🛠 Scripts**

npm run dev – Start development server

npm run build – Build production-ready files

npm run preview – Preview production build locally

npm run lint – Run ESLint checks


**📜 License**

This project is licensed under the MIT License.
You are free to use, modify, and distribute this software in compliance with the license terms.
