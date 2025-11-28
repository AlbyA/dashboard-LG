const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Google Sheets API
async function getSheetData() {
  try {
    // Check if credentials file exists
    const credentialsPath = path.join(__dirname, 'credentials.json');
    if (!fs.existsSync(credentialsPath)) {
      throw new Error('credentials.json not found. Please set up Google Sheets API credentials.');
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.GOOGLE_SHEET_ID || '1IzRN7J-0XDJbGQGFmom-7RutxOtgcwVM0oo6d4z5dWc';

    // First, get the sheet metadata to find the first sheet name
    let sheetName = 'Sheet1';
    try {
      const metadata = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });
      if (metadata.data.sheets && metadata.data.sheets.length > 0) {
        sheetName = metadata.data.sheets[0].properties.title;
      }
    } catch (err) {
      console.warn('Could not get sheet metadata, using default "Sheet1"');
    }

    // Get the data from the first sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:Z`, // Get all columns
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    // Convert to array of objects
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    return data;
  } catch (error) {
    console.error('Error fetching sheet data:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

// API endpoint to get all data
app.get('/api/data', async (req, res) => {
  try {
    const data = await getSheetData();
    res.json(data);
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ 
      error: error.message,
      details: error.toString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

