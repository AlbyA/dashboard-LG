# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Node.js
- Download from https://nodejs.org/ (v14 or higher)
- Verify installation: `node --version` and `npm --version`

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Set Up Google Sheets API
1. Go to https://console.cloud.google.com/
2. Create/select a project
3. Enable "Google Sheets API"
4. Create Service Account → Download JSON key
5. Rename to `credentials.json` → Place in project root
6. Share your Google Sheet with the service account email (from credentials.json)

### 4. Create .env File
Create `.env` in project root:
```
GOOGLE_SHEET_ID=1IzRN7J-0XDJbGQGFmom-7RutxOtgcwVM0oo6d4z5dWc
PORT=5000
```

### 5. Run the Dashboard
```bash
npm run dev
```

Dashboard opens at: http://localhost:3000

## 📁 Project Structure
- `server.js` - Backend API server
- `client/` - React frontend
- `credentials.json` - Google API credentials (you create this)
- `.env` - Environment variables (you create this)

## ✅ That's It!
Your dashboard is now running and will automatically refresh data every 60 seconds.

