# Vercel Deployment Guide

## Quick Setup (5 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration

### Step 3: Add Environment Variables
In Vercel Dashboard → Your Project → Settings → Environment Variables:

**Variable 1:**
- Name: `GOOGLE_SHEET_ID`
- Value: `1IzRN7J-0XDJbGQGFmom-7RutxOtgcwVM0oo6d4z5dWc`
- Environment: Production, Preview, Development

**Variable 2:**
- Name: `GOOGLE_CREDENTIALS`
- Value: Paste the entire content of your `credentials.json` file
  - Open `credentials.json` locally
  - Copy ALL the JSON content
  - Paste it as a single-line string in Vercel
  - Make sure it's valid JSON (starts with `{` and ends with `}`)
- Environment: Production, Preview, Development

### Step 4: Deploy
- Click "Deploy" or push to GitHub (auto-deploys)
- Wait for build to complete
- Your dashboard will be live!

## Project Structure
```
dashboard/
├── api/
│   └── data.js          # Serverless function (auto-detected by Vercel)
├── client/
│   ├── src/             # React app source
│   ├── public/          # Public assets
│   └── package.json     # React dependencies
├── vercel.json          # Vercel configuration
└── package.json         # Root dependencies
```

## How It Works
- **Frontend**: React app built from `client/` directory
- **Backend**: Serverless function at `/api/data`
- **Routing**: All routes serve React app, `/api/*` goes to serverless functions

## Troubleshooting

### Build Fails with "No entrypoint found"
**Error:** `No entrypoint found in output directory: "client/build"`

**Solution:** This happens when Vercel tries to detect the project type. The current `vercel.json` uses `@vercel/static-build` which should fix this. If you still see this error:

1. **Check Vercel Project Settings:**
   - Go to Vercel Dashboard → Your Project → Settings → General
   - Under "Build & Development Settings":
     - Framework Preset: Should be **"Other"** or **"Vite"** (not "Create React App")
     - Root Directory: Leave empty (or set to `/`)
     - Build Command: Leave empty (handled by `vercel.json`)
     - Output Directory: Leave empty (handled by `vercel.json`)
     - Install Command: Leave empty (handled by `vercel.json`)

2. **Verify `client/package.json` has `vercel-build` script:**
   ```json
   "scripts": {
     "vercel-build": "npm run build"
   }
   ```

3. **If still failing, try this alternative `vercel.json`:**
   ```json
   {
     "version": 2,
     "buildCommand": "cd client && npm install && npm run build",
     "outputDirectory": "client/build",
     "installCommand": "npm install && cd client && npm install",
     "framework": null,
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "/api/$1"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### 404 Error
- Check `vercel.json` routes configuration
- Ensure `client/package.json` has `"vercel-build": "npm run build"`
- Verify `index.html` exists in `client/build/` after build

### API Returns Error
- Check `GOOGLE_CREDENTIALS` format in Vercel
- Verify service account email has access to Google Sheet
- Check Vercel function logs for detailed errors

### JSON Parse Error
- Make sure `GOOGLE_CREDENTIALS` is valid JSON
- Remove any extra quotes or formatting
- Check Vercel function logs for parsing errors

## Environment Variables Format

**GOOGLE_CREDENTIALS** should look like this (all on one line):
```json
{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@....iam.gserviceaccount.com",...}
```

## Support
- Check Vercel function logs: Dashboard → Functions → `/api/data` → Logs
- Check build logs: Dashboard → Deployments → Click deployment → Build Logs

