# Bridge the Gap - Complaint Resolution Platform

**Bridge the Gap** is a modern, full-stack web platform designed to streamline the resolution of commercial disputes between consumers and businesses. It provides a transparent, speed-focused interface for lodging complaints, verifying business entities, and managing dispute workflows.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌐 Live Demo

Check out the live application here:
👉 **[Launch Bridge the Gap](https://complainplatform.vercel.app/)**

## 🚀 Features

* **Role-Based Access Control (RBAC):** Distinct workflows for **Consumers**, **Businesses**, and **Admins**.
* **Secure Authentication:** Google OAuth 2.0 integration for seamless login, backed by JWT and secure sessions.
* **Complaint Management:**
    * Consumers can file detailed complaints with evidence.
    * Businesses can track and respond to complaints via a dedicated dashboard.
* **Verification System:**
    * Business entities undergo a verification process.
    * Admins review and approve business credentials to ensure platform trust.
* **Responsive Design:** Fully responsive UI built with React, Tailwind CSS, and Lucide Icons.

## 🛠️ Tech Stack

### Frontend (Client)
* **Framework:** [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Routing:** React Router DOM
* **HTTP Client:** Axios
* **Icons:** Lucide React

### Backend (Server)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (with Mongoose ODM)
* **Authentication:** Passport.js (Google Strategy) & JWT
* **File Storage:** Cloudinary (for evidence/document uploads)

---

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your `.env` files.

### Server (`server/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
COOKIE_KEY=your_session_cookie_secret
JWT_SECRET=your_jwt_secret_key

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL (for redirects after login)
# Development: http://localhost:5173
# Production: [https://your-frontend-domain.vercel.app](https://your-frontend-domain.vercel.app)
CLIENT_URL=http://localhost:5173

# Cloudinary (Optional - if image upload is enabled)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
### Client (`client/.env`)
```
# Backend API URL
# Development: http://localhost:5000
# Production: [https://your-backend-service.onrender.com](https://your-backend-service.onrender.com)
VITE_API_URL=http://localhost:5000
```
## 🏃‍♂️ Getting Started

Follow these steps to set up the project locally.

### Prerequisites
* Node.js (v16 or higher)
* npm or yarn
* MongoDB (Local or Atlas)

### 1. Clone the Repository
```
git clone [https://github.com/shubhi89/complainplatform.git](https://github.com/shubhi89/complainplatform.git)
cd complainplatform
```
### 2. Backend Setup
```
cd server
npm install
# Start in development mode (with hot-reload)
npm run dev
```
### 3. Frontend Setup
```
cd client
npm install
# Start the development server
npm run dev
```
## 📂 Project Structure
```
complainplatform/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (RoleRoute, etc.)
│   │   ├── context/        # Global state (AuthContext)
│   │   ├── pages/          # Application views (Login, Dashboards, etc.)
│   │   └── types/          # TypeScript interfaces
│   └── ...
│
├── server/                 # Express Backend
│   ├── src/
│   │   ├── config/         # DB, Passport, Cloudinary configs
│   │   ├── middleware/     # Auth and Role verification
│   │   ├── models/         # Mongoose Schemas (User, Complaint, BusinessProfile)
│   │   ├── routes/         # API Endpoints
│   │   └── server.ts       # Entry point
│   └── ...
└── README.md
```
## 🚀 Deployment
### Recommended Strategy

* **Frontend:** Deploy the `client` folder to **Vercel**.
    * Set `VITE_API_URL` in Vercel project settings to your backend URL.
* **Backend:** Deploy the `server` folder to **Render** (or Railway/Heroku).
    * Set all server environment variables (`MONGO_URI`, `CLIENT_URL`, etc.) in the Render dashboard.
 
## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
