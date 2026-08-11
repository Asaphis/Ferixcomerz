# Ferixcomerz

A complete e-commerce platform with web and mobile applications.

## Overview

Ferixcomerz is a comprehensive e-commerce solution consisting of:

- **e-commerce**: Web-based frontend and backend with admin panel
- **user_app**: Flutter mobile application for customers
- **admin_app**: Flutter mobile application for administrators

## Structure

```
Ferixcomerz/
├── e-commerce/          # Web application and backend
│   ├── Admin-Panel/    # Next.js admin dashboard
│   ├── Backend/        # NestJS backend API
│   └── User-UI/        # React frontend
├── user_app/           # Flutter customer mobile app
└── admin_app/          # Flutter admin mobile app
```

## Getting Started

### Prerequisites

- Node.js (for web applications)
- Flutter SDK (for mobile applications)
- Database (PostgreSQL recommended)

### Installation

#### Web Application (e-commerce)

```bash
cd e-commerce/Backend
npm install
cp .env.example .env
# Configure your environment variables
npm run start:dev

cd ../User-UI
npm install
npm run dev

cd ../Admin-Panel
npm install
npm run dev
```

#### Mobile Applications

```bash
# User App
cd user_app
flutter pub get
flutter run

# Admin App
cd admin_app
flutter pub get
flutter run
```

## Features

- Multi-platform support (Web, Android, iOS)
- User authentication and authorization
- Product management
- Order processing
- Payment integration
- Admin dashboard
- Mobile apps for both users and admins

## License

Copyright © 2026 Ferixcomerz. All rights reserved.
