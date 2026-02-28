# Tools, Third-Party Libraries & Frameworks

This document outlines all the tools, third-party libraries, and frameworks used in the Dugtong project.

---

## 1. Mobile App (app-project)

### Framework & Language
- **Framework**: Expo SDK 54
- **Runtime**: React Native 0.81.5
- **Language**: TypeScript 5.9.2
- **UI Framework**: Expo Router 6 (file-based routing)

### Core Dependencies

| Category | Library | Purpose |
|----------|---------|---------|
| Navigation | expo-router, @react-navigation/native, @react-navigation/stack, @react-navigation/bottom-tabs | File-based routing and navigation |
| UI Components | @expo/vector-icons, lucide-react-native | Icons |
| Animations | react-native-reanimated 4.1.6 | Smooth animations |
| Gestures | react-native-gesture-handler | Touch gestures |
| Charts | react-native-chart-kit | Data visualization |
| Graphics | react-native-svg | SVG rendering |

### Storage & Security

| Library | Purpose |
|---------|---------|
| expo-secure-store | Secure token storage |
| @react-native-async-storage/async-storage | General local storage |

### Media & System

| Library | Purpose |
|---------|---------|
| expo-file-system | File operations |
| expo-print | PDF generation |
| expo-speech | Text-to-speech |
| expo-image | Image handling |
| expo-haptics | Haptic feedback |
| expo-linear-gradient | Gradient backgrounds |

### Networking

| Library | Purpose |
|---------|---------|
| @react-native-community/netinfo | Network status detection |

### Forms & Validation

| Library | Purpose |
|---------|---------|
| zod | Schema validation |

### Development

| Tool | Purpose |
|------|---------|
| TypeScript | Type safety |
| ESLint | Code linting |
| babel-plugin-module-resolver | Path aliases |

---

## 2. Backend API (dugtong-nextjs)

### Framework & Language
- **Framework**: Next.js 16.1.6
- **Language**: TypeScript 5
- **Runtime**: React 19.2.3

### Core Dependencies

| Category | Library | Purpose |
|----------|---------|---------|
| Database | @libsql/client | Turso SQLite database client |
| Authentication | jsonwebtoken, bcryptjs | JWT tokens & password hashing |
| Validation | zod | Schema validation |
| Fetch | node-fetch | HTTP requests |

### Styling

| Library | Purpose |
|---------|---------|
| Tailwind CSS 4 | Utility-first CSS framework |
| @tailwindcss/postcss | PostCSS integration for Tailwind |

### Development

| Tool | Purpose |
|------|---------|
| TypeScript | Type safety |
| ESLint | Code linting |
| eslint-config-next | Next.js specific linting |

---

## 3. Summary Table

### Mobile App (Expo/React Native)
```
expo ~54.0.33
react-native 0.81.5
react 19.1.0
expo-router ~6.0.23
react-native-reanimated ^4.1.6
react-native-gesture-handler ~2.28.0
react-native-svg 15.12.1
react-native-chart-kit ^6.12.0
lucide-react-native ^0.563.0
@expo/vector-icons ^15.0.3
expo-secure-store ^15.0.8
@react-native-async-storage/async-storage ^2.2.0
zod ^3.24.2
typescript ~5.9.2
```

### Backend (Next.js)
```
next 16.1.6
react 19.2.3
@libsql/client ^0.15.15
jsonwebtoken ^9.0.2
bcryptjs ^2.4.3
zod ^4.1.5
tailwindcss ^4
typescript ^5
```

---

## 4. Architecture Overview

### Mobile App Architecture
- **Pattern**: File-based routing with Expo Router
- **State Management**: React Context API
- **API Layer**: Custom apiClient using native fetch
- **Authentication**: JWT tokens stored in SecureStore

### Backend Architecture
- **Pattern**: Next.js App Router (API Routes)
- **Database**: Turso (libSQL) - SQLite in the cloud
- **Authentication**: Custom JWT-based auth with bcrypt password hashing
- **Validation**: Zod schemas for request/response validation

---

## 5. Build & Development Commands

### Mobile App
```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run lint       # Run ESLint
```

### Backend
```bash
npm run dev        # Start Next.js development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```
