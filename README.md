# ICafe - Modern Cafe Management & POS System ☕

ICafe is a full-stack, modern web application built with **Next.js 15**, **React**, **Tailwind CSS**, and **Firebase**. It provides a complete digital ecosystem for a cafe, featuring a beautifully designed customer-facing website, a robust Admin Dashboard, and a fast Point-of-Sale (POS) system.

## 🌟 Key Features

1. **Customer Portal (`localhost:3000`)**
   - **Interactive Menu**: Browse cafe offerings with high-quality images and categories.
   - **Table Reservations**: Customers can book tables in advance.
   - **Authentication**: Sign up/in via Email or Google (Firebase Auth).

2. **Admin Dashboard (`admin.localhost:3000`)**
   - **Order Management**: Monitor live incoming online reservations and POS orders.
   - **Menu Management**: Add, edit, or delete items from the menu.
   - **Staff Secure Login**: PIN-based authentication designed for fast staff access.

3. **Point of Sale (POS) (`pos.localhost:3000`)**
   - **Fast Checkout Interface**: Designed for high-speed order processing at the cashier desk.
   - **Live Table Status**: Automatically updates table availability when dine-in orders are placed.
   - **Receipt Printing**: Optimized for 80mm thermal receipt printers with a professional invoice layout.
   - **Session Security**: Strict tab-level security requiring PIN entry per session.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or newer recommended)
- **Firebase Project**: You must have a Firebase project with Authentication (Email/Password & Google) and Firestore Database enabled.

### 2. Environment Setup
Create a `.env.local` file in the root directory and add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

### 3. Installation
Run the following command to install all dependencies:
```bash
npm install
```

### 4. Running the App
To start the development server, run:
```bash
npm run dev
```

### 5. Seeding Initial Data (Admin PIN)
To access the Admin/POS panels, you need a staff PIN. You can run the seed script to create a default Admin user:
```bash
npx ts-node scripts/seed-staff.ts
```
*(Default PIN created is usually `123456`, check the script for details).*

---

## 💻 How to Use the App

Because ICafe uses **subdomain routing** for security and clean separation of concerns, you must access different parts of the app using specific URLs:

### 🛍️ Customer Site
Open your browser and navigate to:
**👉 http://localhost:3000**
- Browse the menu, create a customer account, and book a table.

### 🛡️ Admin Panel
Open your browser and navigate to:
**👉 http://admin.localhost:3000**
- Login using your 6-digit staff PIN.
- Manage menu items, view incoming orders, and complete reservations.

### 🏪 POS System
Open your browser and navigate to:
**👉 http://pos.localhost:3000**
- Login using your 6-digit staff PIN (or use the "POS" button from the Admin Dashboard).
- Add items to the cart, select a table (or Takeaway), choose a payment method (Cash/Card/QRIS), and click **Print & Complete**.
- A thermal-receipt style print dialog will automatically appear!

---

## 🛠️ Technology Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend/Database**: Firebase (Firestore)
- **Authentication**: Firebase Auth (for Customers) + Custom Edge Cookies (for Staff)


