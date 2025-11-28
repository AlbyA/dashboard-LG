# Vercel Deployment Guide

## Quick Setup

### 1. Environment Variables in Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables** and add:

1. **GOOGLE_SHEET_ID**: Your Google Sheet ID
   - Example: `1IzRN7J-0XDJbGQGFmom-7RutxOtgcwVM0oo6d4z5dWc`

2. **GOOGLE_CREDENTIALS**: Your Google Service Account credentials as JSON string
   - Open your `credentials.json` file
   - Copy the entire JSON content
   - In Vercel, paste it as a single-line JSON string
   - **Important**: Make sure all quotes are properly escaped or use Vercel's JSON editor

### 2. Vercel Project Settings

In **Vercel Dashboard → Project Settings → Build & Development Settings**:

- **Framework Preset**: Other (or leave empty)
- **Root Directory**: Leave empty (uses root)
- **Build Command**: Leave empty (uses `vercel.json`)
- **Output Directory**: `client/build` (or leave empty to use `vercel.json`)
- **Install Command**: Leave empty (uses `vercel.json`)

### 3. Deploy

1. Push your code to GitHub/GitLab/Bitbucket
2. Import the project in Vercel
3. Vercel will automatically use `vercel.json` configuration
4. **IMPORTANT**: Add environment variables BEFORE or DURING first deployment

## Project Structure

```
dashboard/
├── api/
│   └── data.js          # Serverless function for Google Sheets API
├── client/
│   ├── build/           # Built React app (generated)
│   ├── src/             # React source code
│   └── package.json
├── vercel.json          # Vercel configuration
└── package.json         # Root package.json
```

## How It Works

1. **Frontend**: React app built from `client/` directory
2. **Backend**: Serverless function at `/api/data` handles Google Sheets API calls
3. **Routing**: All routes except `/api/*` serve `index.html` (React Router support)

## Troubleshooting

### "Cannot GET /" Error

**Solution**: Make sure `vercel.json` has the rewrite rule:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Build Fails

- Check that `client/package.json` has `"homepage": "."`
- Verify all dependencies are in `package.json` files
- Check Vercel build logs for specific errors

### API Returns 500 Error

- Verify `GOOGLE_CREDENTIALS` environment variable is set correctly
- Check that the service account email has access to the Google Sheet
- Verify `GOOGLE_SHEET_ID` is correct
- Check Vercel function logs for detailed errors

### Frontend Can't Connect to API

- The API endpoint is `/api/data` (relative path works in Vercel)
- Check browser console for CORS errors
- Verify the `api/data.js` file exists in the root `api/` directory

### Environment Variables Not Working

- Make sure variables are set for the correct environment (Production, Preview, Development)
- Redeploy after adding/changing environment variables
- Check variable names match exactly (case-sensitive)

## Testing Locally

To test the Vercel setup locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev
```

This will simulate the Vercel environment locally.
