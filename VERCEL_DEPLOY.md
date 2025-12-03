# Vercel Deployment Guide

## ✅ Ready for Deployment!

The project is now configured to:
- Build React app in `client/build/`
- Copy `index.html` and static files to **root directory**
- Serve everything from root (Vercel-friendly)

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
4. Vercel will use `vercel.json` configuration

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
  - Copy ALL the JSON content (should start with `{` and end with `}`)
  - Paste it as a single-line string in Vercel
  - Make sure it's valid JSON
- Environment: Production, Preview, Development

### Step 4: Configure Project Settings
**CRITICAL:** In Vercel Dashboard → Your Project → Settings → General:

Under **"Build & Development Settings"**:
- **Framework Preset**: Set to **"Other"** ⚠️ (NOT "Create React App")
- **Root Directory**: Leave **EMPTY**
- **Build Command**: Leave **EMPTY** (handled by `vercel.json`)
- **Output Directory**: Leave **EMPTY** (handled by `vercel.json`)
- **Install Command**: Leave **EMPTY** (handled by `vercel.json`)

### Step 5: Deploy
- Click "Deploy" or push to GitHub (auto-deploys)
- Wait for build to complete
- Your dashboard will be live at `https://your-project.vercel.app`

## How It Works

### Build Process:
1. **Install Dependencies**: Root + Client dependencies
2. **Build React App**: Creates `client/build/` with all files
3. **Copy to Root**: `copy-build-to-root.js` copies:
   - `index.html` → root
   - `static/` → root
   - `asset-manifest.json` → root
4. **Deploy**: Vercel serves from root directory

### File Structure After Build:
```
dashboard/
├── api/
│   └── data.js              # Serverless function
├── client/
│   └── build/               # Build output (source)
├── index.html               # ✅ In root (copied from client/build/)
├── static/                  # ✅ In root (copied from client/build/)
│   ├── css/
│   └── js/
├── asset-manifest.json       # ✅ In root
└── vercel.json              # Configuration
```

### Routing:
- `/api/*` → Serverless functions in `api/` directory
- `/*` → Serves `index.html` (React Router handles client-side routing)
- `/static/*` → Static assets (JS, CSS, images)

## Troubleshooting

### Build Fails with "No entrypoint found"
**Solution**: Set Framework Preset to **"Other"** in Vercel project settings

### 404 Error on Root URL
**Check**:
1. Build logs show "Compiled successfully"
2. Build logs show "Build files copied to root successfully!"
3. `index.html` exists in root after build
4. Framework Preset is set to "Other"

### Static Assets Return 404
**Check**:
1. `static/` folder exists in root after build
2. Routes in `vercel.json` are correct
3. Check browser Network tab for actual 404 URLs

### API Returns Error
**Check**:
1. `GOOGLE_CREDENTIALS` format in Vercel (must be valid JSON)
2. Service account email has access to Google Sheet
3. Check Vercel function logs: Dashboard → Functions → `/api/data` → Logs

### Build Logs Show Warnings Only
**Check**: Scroll to the end of build logs. You should see:
```
Creating an optimized production build...
Compiled successfully!
...
✅ Build files copied to root successfully!
```

If you don't see "Compiled successfully", the React build is failing.

## Environment Variables Format

**GOOGLE_CREDENTIALS** should look like this (all on one line):
```json
{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@....iam.gserviceaccount.com",...}
```

**Important**: 
- Must be valid JSON
- Can be multi-line or single-line
- Should start with `{` and end with `}`
- No extra quotes around the JSON

## Support

- **Build Logs**: Dashboard → Deployments → Click deployment → Build Logs
- **Function Logs**: Dashboard → Functions → `/api/data` → Logs
- **Runtime Logs**: Dashboard → Deployments → Click deployment → Runtime Logs

## Verification Checklist

After deployment, verify:
- ✅ Root URL (`https://your-app.vercel.app`) loads the dashboard
- ✅ API endpoint (`https://your-app.vercel.app/api/data`) returns JSON data
- ✅ Static assets load (check browser Network tab)
- ✅ React Router works (navigate to different routes)
- ✅ Charts and visualizations render correctly
