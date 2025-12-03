# Fixing 404 NOT_FOUND Error on Vercel

## The Problem
You're getting a `404: NOT_FOUND` error when accessing your deployed app.

## Solution Steps

### Step 1: Check Vercel Project Settings

Go to **Vercel Dashboard → Your Project → Settings → General**

Under **"Build & Development Settings"**, make sure:

1. **Framework Preset**: Set to **"Other"** (NOT "Create React App" or auto-detected)
2. **Root Directory**: Leave **EMPTY** (don't set it to `/client`)
3. **Build Command**: Leave **EMPTY** (handled by `vercel.json`)
4. **Output Directory**: Leave **EMPTY** (handled by `vercel.json`)
5. **Install Command**: Leave **EMPTY** (handled by `vercel.json`)

### Step 2: Verify Build Output

After deployment, check the build logs:
1. Go to **Deployments** → Click on your latest deployment
2. Check **Build Logs**
3. Verify that it says: `Creating an optimized production build...` and `Compiled successfully`
4. Verify that files are being created in `client/build/`

### Step 3: Check File Structure

The build should create:
```
client/build/
  ├── index.html
  ├── static/
  │   ├── css/
  │   └── js/
  └── asset-manifest.json
```

### Step 4: Alternative Configuration (If Still Not Working)

If the above doesn't work, try this alternative `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*\\.(js|css|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|json|map))",
      "dest": "/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Step 5: Clear Build Cache

If still not working:
1. Go to **Settings → General**
2. Scroll to **"Build Cache"**
3. Click **"Clear Build Cache"**
4. Redeploy

### Step 6: Check Deployment URL

Make sure you're accessing the correct URL:
- Production: `https://your-project.vercel.app`
- Preview: `https://your-project-git-branch.vercel.app`

Don't use the deployment-specific URL if it's a preview deployment.

## Common Issues

### Issue: "No entrypoint found"
- **Cause**: Framework preset is wrong
- **Fix**: Set Framework Preset to "Other" in project settings

### Issue: 404 on all routes
- **Cause**: Rewrites not working or Output Directory wrong
- **Fix**: Check `vercel.json` and project settings Output Directory

### Issue: Static assets (JS/CSS) return 404
- **Cause**: Routes not configured correctly
- **Fix**: Ensure `/static/(.*)` route exists in `vercel.json`

## Still Not Working?

1. Check **Function Logs**: Dashboard → Functions → `/api/data` → Logs
2. Check **Build Logs**: Dashboard → Deployments → Click deployment → Build Logs
3. Check **Runtime Logs**: Dashboard → Deployments → Click deployment → Runtime Logs

Share the error messages from these logs for further debugging.

