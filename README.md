# INA Trading Website

[![Frontend Deploy](https://github.com/your-repo/INA-Trading-Web/actions/workflows/frontend-deploy.yml/badge.svg)](https://github.com/your-repo/INA-Trading-Web/actions/workflows/frontend-deploy.yml)
[![Backend Deploy](https://github.com/your-repo/INA-Trading-Web/actions/workflows/backend-deploy.yml/badge.svg)](https://github.com/your-repo/INA-Trading-Web/actions/workflows/backend-deploy.yml)

A modern web application for INA Trading, providing a platform for managing and showcasing trading information, news, and administrative functions.

## 🌟 Features

- **Admin Dashboard**: Comprehensive admin interface for content management
- **News Management**: Create, edit, and publish trading-related news
- **Place Management**: Manage and showcase trading locations
- **Modern UI**: Built with Material-UI and Tailwind CSS for a beautiful user experience
- **Responsive Design**: Fully responsive across all devices
- **Real-time Updates**: Firebase integration for real-time data management
- **Secure Authentication**: Protected admin routes and secure user management

## 🛠 Tech Stack

### Frontend
- React.js
- Material-UI
- Tailwind CSS
- Firebase SDK
- Framer Motion (for animations)
- React Router DOM
- TinyMCE (rich text editor)
- React Toastify
- Recharts (for data visualization)

### Backend
- Node.js
- Firebase Admin SDK
- Cloud Functions
- Cloud Storage

### Infrastructure
- Firebase Hosting
- GitHub Actions (CI/CD)
- Custom deployment scripts

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase CLI

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-repo/INA-Trading-Web.git
cd INA-Trading-Web
```

2. Install dependencies
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables
```bash
# Frontend
cp frontend/.env.example frontend/.env.local
# Populate Firebase, Google Maps and INAPAS settings

# Backend
cp backend/.env.example backend/.env
# Provide Firebase service account credentials and CORS settings
```

4. Start development servers
```bash
# Frontend
npm start

# Backend
npm run dev
```

## 📦 Deployment

The project uses GitHub Actions for automated deployments:
- Frontend is automatically deployed to Firebase Hosting
- Backend is deployed to the production server
- Custom PHP deployment scripts handle specific deployment tasks

## 🔒 Security

- Firebase Authentication for secure user management
- Protected admin routes
- CORS configuration for API security
- Secrets are sourced from environment variables (never commit keys or service accounts)
- Firebase Admin credentials loaded at runtime via JSON/base64 environment input

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential. All rights reserved by INA Trading.

## 📧 Contact

For any inquiries, please reach out to the development team or visit [https://admin.inatrading.co.id/](https://admin.inatrading.co.id/) 
