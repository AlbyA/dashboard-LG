# Vercel Deployment Guide

## Setup Instructions

### 1. Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

1. **GOOGLE_SHEET_ID**: Your Google Sheet ID
   - Example: `1IzRN7J-0XDJbGQGFmom-7RutxOtgcwVM0oo6d4z5dWc`

2. **GOOGLE_CREDENTIALS**: Your Google Service Account credentials as JSON string
   - Open your `credentials.json` file
   - Copy the entire JSON content
   - In Vercel, paste it as a single-line JSON string
   - Make sure to escape quotes properly or use Vercel's environment variable editor

### 2. Vercel Project Settings

In Vercel Dashboard → Project Settings → Build & Development Settings:

- **Framework Preset**: Other
- **Root Directory**: Leave empty (uses root)
- **Build Command**: `cd client && npm install && npm run build` (or leave empty to use vercel.json)
- **Output Directory**: `client/build`
- **Install Command**: `npm install && cd client && npm install` (or leave empty to use vercel.json)

### 3. Deploy to Vercel

1. Push your code to GitHub/GitLab/Bitbucket
2. Import the project in Vercel
3. Vercel will automatically use `vercel.json` configuration
4. **IMPORTANT**: Add the environment variables BEFORE deploying

### 4. Project Structure

The deployment expects:
- React app in `client/` directory
- API serverless functions in `api/` directory  
- `vercel.json` configuration file in root

### 5. Build Process

Vercel will:
1. Run `npm install` in root (installs backend dependencies)
2. Run `cd client && npm install` (installs frontend dependencies)
3. Run `cd client && npm run build` (builds React app)
4. Output: `client/build` directory

### 6. Troubleshooting

**If build fails with "exited with 1":**
- Check Vercel build logs for specific error
- Ensure all dependencies are in `package.json` and `client/package.json`
- Try setting Node.js version to 18.x in Vercel settings
- Make sure `vercel.json` has correct paths

**If build fails with "exited with 127":**
- This means command not found
- Check that `vercel.json` buildCommand is correct
- Try using absolute paths or ensure commands are available

**If API doesn't work:**
- Verify `GOOGLE_CREDENTIALS` environment variable is set correctly (must be valid JSON)
- Check that the service account email has access to the Google Sheet
- Verify `GOOGLE_SHEET_ID` is correct
- Check Vercel function logs for API errors

**If frontend can't connect to API:**
- The API endpoint should be `/api/data` (relative path works in Vercel)
- Check browser console for CORS errors
- Verify the `api/data.js` file exists in the root `api/` directory

