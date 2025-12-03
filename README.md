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

See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for detailed deployment instructions.

### Quick Deploy Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
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

4. **Deploy**
   - Click "Deploy" or push to GitHub (auto-deploys)

## Project Structure

```
dashboard/
├── api/
│   └── data.js              # Vercel serverless function
├── client/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── utils/           # Utility functions
│   │   └── App.js           # Main app component
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── vercel.json              # Vercel configuration
└── package.json             # Root dependencies
```

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

## License

MIT
