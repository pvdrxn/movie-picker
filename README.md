# Movie Picker - Full-Stack Architecture

## 🚀 Overview
The Movie Picker is a cross-platform mobile application built using **React Native** and **Expo** for the frontend, with a **Node.js** backend and **PostgreSQL** database.

## 📁 Project Structure

### `frontend/` (React Native + Expo)
- **`src/components/`**: Reusable UI elements (buttons, inputs, cards).
- **`src/screens/`**: Individual application pages (Home, Movie Details, Search).
- **`src/navigation/`**: Configuration for React Navigation (Stack, Tab, Drawer).
- **`src/services/`**: API client logic and external service integrations.
- **`src/hooks/`**: Custom React hooks for shared logic.
- **`src/context/`**: Global state management (e.g., Auth, User Preferences).
- **`assets/`**: Static images, fonts, and icons.

### `backend/` (Node.js + Express)
- **`src/controllers/`**: Handles incoming HTTP requests and returns responses.
- **`src/routes/`**: Defines the API endpoints.
- **`src/models/`**: Data layer for interacting with PostgreSQL.
- **`src/middleware/`**: Functions for authentication, logging, and error handling.
- **`src/config/`**: Database connection and environment variables.
- **`src/utils/`**: Helper functions and common constants.

## 🛠 Technology Explanations

### **React Native & Expo**
React Native allows us to write mobile apps using JavaScript that render as native UI components on Android and iOS. **Expo** is a framework built on top of React Native that simplifies development by handling the Android emulator, camera access, notifications, and build processes without needing to touch native Java or Swift code.

### **Node.js & Express**
Node.js is a runtime that executes JavaScript on the server. We use Express (a minimalist web framework) to build a RESTful API that the mobile app will communicate with to fetch movie data.

### **PostgreSQL**
A powerful, open-source relational database. It ensures data integrity and allows us to perform complex queries (e.g., filtering movies by genre and rating simultaneously).
