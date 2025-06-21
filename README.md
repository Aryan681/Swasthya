

# 🩺 Swasthya – Offline-First Health Triage PWA

**Swasthya** is a modern, offline-first Progressive Web App (PWA) designed to provide AI-powered medical triage and clinic locator services, even in low-connectivity environments. Built with React, Vite, Express, and robust PWA technology, Swasthya empowers users to get instant health guidance and find nearby clinics in Haiti.

---

## 🚀 Features

### 🌐 Progressive Web App (PWA)
- **Installable** on any device (desktop/mobile).
- **Offline-first:** Works seamlessly without internet. Submissions and assets are cached for offline use.
- **Service Worker:** Automatic updates and background sync using Workbox.
- **Manifest:** Custom icons, teal theme, and home screen support.

### 🏥 AI Symptom Triage
- **Multilingual:** Supports English and Haitian Creole.
- **Voice Input:** Users can describe symptoms by typing or using speech recognition.
- **AI Assessment:** Uses advanced AI (Cloudflare AI + HuggingFace) to analyze symptoms and provide:
  - Suspected condition
  - Medical urgency (Low/Medium/High)
  - Recommended action
- **Translation fallback:** If translation services are unavailable, users are prompted to enter symptoms in English.

### 📡 Offline Submission & Sync
- **Smart Detection:** App detects online/offline status and shows a banner.
- **Offline Storage:** Symptom submissions are saved locally when offline.
- **Sync Button:** When back online, users can sync pending submissions with one click.
- **Result Display:** Synced results are shown in the same format as live results.
- **Exponential Backoff:** Automatic retry for failed syncs.

### 🗺️ Clinic Locator
- **Interactive Map:** Find hospitals, clinics, and pharmacies in Haiti.
- **User Location:** Detects and marks your current location.
- **Nearby Facilities:** Shows distance, contact info, and services for each facility.
- **Directions & Emergency Contacts:** Quick access to call or get directions.

### 🛡️ Secure & Modern Backend
- **Express.js API:** Handles triage requests, translation, and caching.
- **Redis Caching:** Fast response for repeated queries.
- **MongoDB:** (If enabled) for persistent storage.
- **CORS & Proxy:** Secure cross-origin requests.

### 💡 Developer Experience
- **Vite + React:** Fast HMR, modern JS, and Tailwind CSS for rapid UI development.
- **ESLint & Prettier:** Code quality enforced.
- **Easy Customization:** Modular structure for adding new features.

---

## 📲 How It Works

1. **Describe your symptoms** (type or speak).
2. **Get instant AI triage** (even offline, if previously cached).
3. **If offline:** Your submission is saved and you’re notified.
4. **When back online:** Click “Sync Now” to send pending requests and see results.
5. **Find clinics:** Use the map to locate and contact nearby health facilities.

---

## 🛠️ Project Structure

```
swasthya-app/
  ├── backend/         # Express API, controllers, models, routes
  └── client/          # React PWA frontend
      ├── public/
      │   └── manifest.json  # PWA manifest
      ├── src/
      │   ├── components/    # Navbar, ConnectionBanner, SyncButton, etc.
      │   ├── pages/         # HomePage, TriagePage, MapPage, AboutPage
      │   ├── utils/         # OfflineManager, useCache
      │   └── assets/        # Images, icons
      ├── App.jsx
      ├── main.jsx
      └── vite.config.js
```

---

## ⚡ Quick Start

### 1. **Backend**
```bash
cd swasthya-app/backend
npm install
# Set up your .env file with required API keys (see backend/controllers/triageController.js for details)
npm start
```

### 2. **Frontend**
```bash
cd swasthya-app/client
npm install
npm run dev
# For PWA/Service Worker test:
npm run build
npm run preview
```

---

## 🖼️ Screenshots

> _Add screenshots of the triage form, map, and offline banner here for extra appeal!_

---

## ✨ Notable Technologies

- React 19, Vite, Tailwind CSS
- Express.js, MongoDB, Redis
- Leaflet.js (interactive maps)
- Cloudflare AI, HuggingFace, MyMemory Translation
- Workbox (offline caching), vite-plugin-pwa

---

## 📝 License

MIT

---

## 🙏 Acknowledgements

- OpenStreetMap & Leaflet for mapping
- Cloudflare, HuggingFace, and MyMemory for AI and translation APIs
- All contributors and the open-source community

---

**Swasthya – Empowering health, everywhere.**