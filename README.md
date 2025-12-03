# Lead Management Dashboard

Interactive dashboard for visualizing and analyzing lead data from Google Sheets.

## Features

- 📊 **Real-time Data**: Live updates from Google Sheets
- 📈 **KPIs**: Total Leads, Invited Leads, Accepted Leads
- 📅 **Date Filtering**: Daily, Weekly, Monthly, or All Dates
- 📧 **Email Status Analysis**: Track email campaign performance
- 🎯 **Fit Score Analysis**: Statistical analysis of lead quality
- 📥 **PDF Reports**: Download comprehensive reports with charts
- 🎨 **Modern UI**: Clean, responsive design

## Quick Start (Local Development)

1. **Install Dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **Set Up Google Sheets API**
   - Create a service account in Google Cloud Console
   - Download credentials as `credentials.json`
   - Place it in the root directory
   - Share your Google Sheet with the service account email

3. **Configure Environment Variables**
   Create `.env` file in root:
   ```
   GOOGLE_SHEET_ID=your_sheet_id_here
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Vercel Deployment

### Quick Deploy Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Add Environment Variables**
   In Vercel Dashboard → Settings → Environment Variables:
   - `GOOGLE_SHEET_ID`: Your Google Sheet ID
   - `GOOGLE_CREDENTIALS`: Full content of `credentials.json` (as JSON string)

4. **Configure Project Settings**
   In Vercel Dashboard → Settings → General:
   - **Framework Preset**: Set to **"Other"**
   - **Root Directory**: Leave empty
   - **Build Command**: Leave empty (handled by `vercel.json`)
   - **Output Directory**: Leave empty (handled by `vercel.json`)
   - **Install Command**: Leave empty (handled by `vercel.json`)

5. **Deploy**
   - Click "Deploy" or push to GitHub (auto-deploys)
   - Build will automatically copy `index.html` and static files to root

## Project Structure

```
dashboard/
├── api/
│   └── data.js              # Vercel serverless function
├── client/
│   ├── src/                 # React app source
│   ├── public/              # Public assets
│   └── package.json         # Frontend dependencies
├── copy-build-to-root.js    # Script to copy build to root
├── vercel.json              # Vercel configuration
├── index.html               # Generated during build (in root)
├── static/                  # Generated during build (in root)
└── package.json             # Root dependencies
```

## How Vercel Deployment Works

1. **Build Process**:
   - Installs dependencies (root + client)
   - Builds React app in `client/build/`
   - Copies build files to root (`index.html`, `static/`, etc.)
   - Serves from root directory

2. **Routing**:
   - `/api/*` → Serverless functions in `api/` directory
   - `/*` → Serves `index.html` (React Router handles routing)
   - Static assets served from `/static/`

## Environment Variables

### Local Development
- `GOOGLE_SHEET_ID`: Google Sheet ID
- `credentials.json`: Service account credentials file

### Vercel Production
- `GOOGLE_SHEET_ID`: Google Sheet ID
- `GOOGLE_CREDENTIALS`: Service account credentials (JSON string)

## Technologies Used

- **Frontend**: React, Recharts, React DatePicker
- **Backend**: Node.js, Express (local) / Vercel Serverless Functions (production)
- **Charts**: Recharts
- **PDF Export**: jsPDF, html2canvas
- **Google Sheets**: Google Sheets API v4

## Troubleshooting

See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) and [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md) for detailed troubleshooting.

## License

MIT
