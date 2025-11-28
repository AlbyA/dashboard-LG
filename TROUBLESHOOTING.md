# Troubleshooting Guide

## Common 500 Error Issues

### 1. Check if credentials.json exists
Make sure `credentials.json` is in the project root (same folder as `server.js`).

**To verify:**
```bash
# In project root
dir credentials.json
```

### 2. Check if Google Sheet is shared
- Open `credentials.json`
- Find the `client_email` field (looks like: `xxx@xxx.iam.gserviceaccount.com`)
- Open your Google Sheet
- Click "Share" button
- Add the service account email with **Viewer** permission
- Make sure to click "Send" or "Share"

### 3. Check Google Sheet ID
- Open your Google Sheet
- The URL looks like: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
- Copy the `SHEET_ID` part
- Update `.env` file: `GOOGLE_SHEET_ID=your_sheet_id_here`

### 4. Check if Google Sheets API is enabled
- Go to https://console.cloud.google.com/
- Select your project
- Go to "APIs & Services" > "Library"
- Search for "Google Sheets API"
- Make sure it's **Enabled**

### 5. Check server logs
Look at the terminal where `npm run dev` is running. You should see error messages there.

### 6. Test the API directly
Open in browser: `http://localhost:5000/api/data`

You should see either:
- JSON data (success!)
- Error message with details

## Quick Fixes

### Restart the server:
1. Stop the current server (Ctrl+C in the terminal)
2. Run again: `npm run dev`

### Verify credentials.json format:
The file should look like:
```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "...@....iam.gserviceaccount.com",
  ...
}
```

### Check file permissions:
Make sure `credentials.json` is readable (not locked or in use by another program).

