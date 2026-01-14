# Caffiend

Caffiend is a comprehensive coffee consumption tracker built with React and Firebase. Monitor your daily caffeine intake, visualize your history, and stay on top of your habits with a secure, cloud-synced account.

## Features

- **User Authentication**: Secure Sign Up, Login, and Password Reset powered by Firebase Auth.
- **Consumption Tracking**: Log every cup of coffee with details.
- **Stats Dashboard**: View your total caffeine intake, daily averages, and more.
- **History Log**: A visual timeline of your coffee consumption.
- **Cloud Sync**: All data is stored in Firestore, so you can access it from any device.
- **Responsive Design**: Beautiful dashboard that works on phone, tablet, and desktop.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Styling**: Vanilla CSS (w/ custom design system)

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create a `.env` file in the root directory with your Firebase config keys:
    ```env
    VITE_FIREBASE_APIKEY=your_key
    VITE_FIREBASE_AUTHDOMAIN=your_domain
    VITE_FIREBASE_PROJECTID=your_id
    VITE_FIREBASE_STORAGEBUCKET=your_bucket
    VITE_FIREBASE_MESSAGINGSENDERID=your_sender
    VITE_FIREBASE_APPID=your_appid
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build
    ```