# Vercel Deployment Checklist

## ✅ Current Configuration

### vercel.json
- Uses `@vercel/static-build` builder
- Points to `client/package.json`
- Uses `distDir: "build"` (relative to client/)
- Routes configured for API and static files

### client/package.json
- Has `vercel-build` script: `"vercel-build": "npm run build"`
- Has `homepage: "/"` for correct asset paths

## 🔧 Vercel Dashboard Settings

**CRITICAL: Check these settings in Vercel Dashboard → Settings → General:**

1. **Framework Preset**: Must be **"Other"** (NOT "Create React App")
2. **Root Directory**: Leave **EMPTY**
3. **Build Command**: Leave **EMPTY** (handled by vercel.json)
4. **Output Directory**: Leave **EMPTY** (handled by vercel.json)
5. **Install Command**: Leave **EMPTY** (handled by vercel.json)

## 🚨 If Still Getting 404

### Step 1: Verify Build Completes
Check build logs for:
```
Creating an optimized production build...
Compiled successfully!
File sizes after gzip:
...
The build folder is ready to be deployed.
```

If you DON'T see "Compiled successfully", the build is failing.

### Step 2: Check Build Output
After build, verify these files exist:
- `client/build/index.html`
- `client/build/static/js/main.*.js`
- `client/build/static/css/main.*.css`

### Step 3: Try Alternative Configuration

If `builds` doesn't work, try this simpler `vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/build",
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

### Step 4: Check Runtime Logs
Go to: **Deployments → [Your Deployment] → Runtime Logs**
- Look for any errors when accessing the site
- Check if files are being served correctly

### Step 5: Test API Endpoint
Try accessing: `https://your-app.vercel.app/api/data`
- Should return JSON data or an error message
- If this works but root doesn't, it's a routing issue

## 📝 Debugging Commands

If you have Vercel CLI installed locally:
```bash
vercel --prod
```

This will show detailed build output and help identify issues.

## 🎯 Most Common Issues

1. **Framework Preset wrong**: Set to "Other"
2. **Build not completing**: Check for errors in build logs
3. **Output directory wrong**: Should be `client/build` (relative to repo root)
4. **Routes not working**: Verify `vercel.json` routes configuration

