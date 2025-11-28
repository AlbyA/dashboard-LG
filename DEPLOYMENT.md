# Vercel Deployment Guide

## Setup Instructions

### 1. Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

1. **GOOGLE_SHEET_ID**: Your Google Sheet ID
   - Example: `1IzRN7J-0XDJbGQGFmom-7RutxOtgcwVM0oo6d4z5dWc`

2. **GOOGLE_CREDENTIALS**: Your Google Service Account credentials as JSON string
   - Copy the entire contents of your `credentials.json` file
   - Paste it as a single-line JSON string (or use Vercel's environment variable editor)

### 2. Deploy to Vercel

1. Push your code to GitHub/GitLab/Bitbucket
2. Import the project in Vercel
3. Vercel will automatically detect the configuration from `vercel.json`
4. Make sure to add the environment variables in Vercel dashboard

### 3. Project Structure

The deployment expects:
- React app in `client/` directory
- API serverless functions in `api/` directory
- `vercel.json` configuration file in root

### 4. Build Settings

Vercel will automatically:
- Install dependencies: `npm install && cd client && npm install`
- Build: `cd client && npm run build`
- Output: `client/build`

### 5. Troubleshooting

**If build fails:**
- Check that all dependencies are listed in `package.json` and `client/package.json`
- Ensure Node.js version is compatible (Vercel uses Node 18.x by default)

**If API doesn't work:**
- Verify `GOOGLE_CREDENTIALS` environment variable is set correctly
- Check that the service account email has access to the Google Sheet
- Verify `GOOGLE_SHEET_ID` is correct

**If frontend can't connect to API:**
- The API endpoint should be `/api/data` (relative path works in Vercel)
- Check browser console for CORS errors

