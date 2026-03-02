# 🍳 Wasfa Backend

Wasfa (وصفة) is a robust, feature-rich backend API for a modern recipe management platform. Built with **TypeScript**, **Node.js**, and **Express**, it provides a scalable and secure foundation for users to discover, share, and manage recipes.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

---

## ✨ Key Features

-   **🔐 Secure Authentication**: 
    -   JWT-based authentication with cookie support.
    -   Password hashing using `bcryptjs`.
    -   Secure password reset flow via email (Brevo integration).
-   **📖 Recipe Management**:
    -   Full CRUD operations for recipes.
    -   Image uploads integrated with **Cloudinary**.
    -   Advanced filtering and search capabilities.
-   **💬 Social Interactions**:
    -   Commenting system for recipes.
    -   User activity tracking (likes, saves, etc.).
-   **👤 Profile Management**:
    -   Detailed user profiles with avatar management.
    -   Subscription state tracking.
-   **💳 Payments & Subscriptions**:
    -   Fully integrated with **Stripe**.
    -   Support for multiple pricing tiers (Basic, Pro).
    -   Webhook handling for asynchronous payment status updates.
-   **🛡️ Enterprise-Grade Security**:
    -   **Helmet**: Security headers.
    -   **XSS Sanitization**: Prevention of cross-site scripting.
    -   **Rate Limiting**: Protect against brute-force and DoS attacks.
    -   **HPP**: Protection against HTTP Parameter Pollution.
-   **📊 Analytics**:
    -   Basic statistics and activity tracking.

---

## 🚀 Tech Stack

-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Framework**: [Express.js (v5)](https://expressjs.com/)
-   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
-   **Validation**: [Zod](https://zod.dev/)
-   **File Handling**: [Multer](https://github.com/expressjs/multer) & [Cloudinary](https://cloudinary.com/)
-   **Email**: [Brevo](https://www.brevo.com/) (formerly Sendinblue)
-   **Payments**: [Stripe](https://stripe.com/)
-   **Security**: Helmet, Express-rate-limit, HPP, XSS-sanitizer

---

## 🛠️ Installation & Setup

### 1. Prerequisite
-   Make sure you have [Node.js](https://nodejs.org/) installed (v20+ recommended).
-   A running [MongoDB](https://www.mongodb.com/) instance.

### 2. Clone the Repository
```bash
git clone https://github.com/Mohamedbeko443/Wasfa-backend.git
cd Wasfa-backend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Variables
Create a `.env` file in the root directory and fill in the required values based on `.env.example`:
```bash
cp .env.example .env
```

### 5. Running the Application

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```

**Local Webhook Testing (Stripe):**
To test payments locally, use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Then update `STRIPE_WEBHOOK_SECRET` in your `.env` with the key provided by the CLI.

---

## 📂 Project Structure

```text
src/
├── config/       # Database and service configurations
├── controllers/  # Request handlers
├── middlewares/  # Custom Express middlewares (Auth, Logger, Error)
├── models/       # Mongoose schemas
├── routes/       # API endpoints
├── services/     # External service integrations
├── utils/        # Helper functions & constants
└── index.ts      # Application entry point
```

---

## 📜 API Endpoints (Brief)

| Route | Description |
| :--- | :--- |
| `/api/auth` | Login, Register, Logout |
| `/api/password` | Reset & Forgot Password |
| `/api/recipes` | Recipe CRUD & Interactions |
| `/api/profile` | User Profile Management |
| `/api/comments` | Recipe Comments |
| `/api/payments` | Stripe Subscriptions |
| `/api/users` | User Management (Admin) |

---

## ⚖️ License

Distributed under the ISC License. See `LICENSE` for more information.

---

Created with ❤️ by [MoMedhat10](https://github.com/MoMedhat10)
