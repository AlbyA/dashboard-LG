# Lead Management Dashboard (React/JavaScript)

A live, interactive dashboard built with React and Node.js that visualizes lead management data from Google Sheets with real-time updates, comprehensive analytics, and beautiful visualizations.

## Features

### 📊 Key Performance Indicators (KPIs)
- **Total Leads with Fit Score**: Count of all leads that have a Fit Score assigned
- **Invited Leads**: Number of leads with Connection Status "Ready to send" or "Sent"
- **Accepted Leads**: Number of leads with Connection Status "ACCEPTED"

### 📈 Visualizations

1. **Connection Status Analysis**
   - Daily trend line chart showing connection status over time
   - Pie chart showing overall distribution of connection statuses

2. **Email Status Analysis**
   - Bar chart comparing email statuses across different email types
   - Interactive pie charts for each email status type

3. **Fit Score Analysis**
   - Statistical summary (Average, Min, Max, Median, Std Dev)
   - Histogram showing distribution of Fit Scores
   - Box plot for detailed distribution analysis

4. **Additional Insights**
   - Top 10 Current Employers
   - Top 10 Locations

### 🔍 Interactive Filters
- **Date Range**: Filter data by Date Generated
- **Connection Status**: Filter by specific connection status
- **Fit Score Range**: Filter by Fit Score range

### ⚡ Live Updates
- Automatic data refresh every 60 seconds
- Manual refresh button for instant updates
- Real-time connection to Google Sheets

## Prerequisites

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- Google Cloud Project with Google Sheets API enabled
- Access to the Google Sheet

## Setup Instructions

### Step 1: Install Dependencies

Install both backend and frontend dependencies:

```bash
npm run install-all
```

Or install them separately:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 2: Set Up Google Sheets API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create a Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the service account details and create
   - Click on the created service account
   - Go to "Keys" tab > "Add Key" > "Create new key"
   - Choose JSON format and download
5. Rename the downloaded JSON file to `credentials.json`
6. Place `credentials.json` in the project root directory (same level as `server.js`)
7. **Important**: Share your Google Sheet with the service account email:
   - Open the downloaded `credentials.json` file
   - Find the `client_email` field (e.g., `your-service-account@project-id.iam.gserviceaccount.com`)
   - Open your Google Sheet
   - Click "Share" and add the service account email with "Viewer" permissions

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```env
GOOGLE_SHEET_ID=1IzRN7J-0XDJbGQGFmom-7RutxOtgcwVM0oo6d4z5dWc
PORT=5000
```

Or the app will use the default Sheet ID from the URL.

### Step 4: Run the Dashboard

#### Option 1: Run Both Server and Client Together (Recommended)

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- React frontend on `http://localhost:3000`

The dashboard will open automatically in your browser.

#### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## Project Structure

```
dashboard/
├── server.js                 # Express backend server
├── package.json              # Backend dependencies
├── credentials.json          # Google Sheets API credentials (not in repo)
├── .env                      # Environment variables (not in repo)
├── client/                   # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js           # Main App component
│   │   ├── App.css
│   │   ├── index.js         # React entry point
│   │   ├── index.css
│   │   └── components/      # React components
│   │       ├── KPICards.js
│   │       ├── ConnectionStatus.js
│   │       ├── EmailStatus.js
│   │       ├── FitScoreAnalysis.js
│   │       ├── Filters.js
│   │       └── AdditionalInsights.js
│   └── package.json         # Frontend dependencies
└── README.md
```

## Data Columns Expected

The dashboard expects the following columns in your Google Sheet:

- Name
- LinkedIN
- Email
- verification
- Email 2
- verification1
- Mobile Number
- Headline
- Title
- Current Employer
- Current Employer (Domain)
- List of previous worked companies
- Location
- Experience (Years)
- Employment_history
- **Fit Score** (numeric)
- Reason
- Message
- Auto Generated Message
- Date of invitation sent
- **Connection Status** (text)
- **Notification Email Sent (on accepting invitation)** (text)
- **Email Status 1** (text)
- **Email Status 2** (text)
- **Date Generated** (date)

## Troubleshooting

### Error: "credentials.json not found"
- Make sure you've downloaded the service account JSON key file
- Rename it to exactly `credentials.json`
- Place it in the same directory as `server.js` (project root)

### Error: "Permission denied" or "Access denied"
- Make sure you've shared the Google Sheet with the service account email
- The service account email can be found in `credentials.json` under `client_email`
- Grant at least "Viewer" permissions

### No data showing
- Verify the Google Sheet ID is correct in `.env` file
- Check that the sheet has data in the expected columns
- Ensure the service account has access to the sheet
- Check the browser console and server logs for errors

### Port already in use
- Change the PORT in `.env` file
- Or kill the process using the port:
  - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
  - Mac/Linux: `lsof -ti:5000 | xargs kill`

### Charts not displaying
- Check that the required columns exist in your Google Sheet
- Verify the data types are correct (dates, numbers, etc.)
- Some visualizations require data to be present
- Check browser console for JavaScript errors

## Building for Production

To create a production build:

```bash
npm run build
```

This creates an optimized production build in `client/build/`. You can serve it with any static file server or deploy it to services like:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Heroku

## Technologies Used

- **React**: Frontend UI library
- **Node.js/Express**: Backend server
- **Recharts**: Interactive chart library
- **Google APIs (googleapis)**: Google Sheets API integration
- **Axios**: HTTP client for API calls
- **date-fns**: Date manipulation library

## License

This project is open source and available for use and modification.

## Support

For issues or questions, please check:
1. Google Sheets API documentation
2. React documentation
3. Recharts documentation
