const { google } = require('googleapis');

async function getSheetData() {
  try {
    let auth;
    
    // Use environment variables for credentials
    const credentials = process.env.GOOGLE_CREDENTIALS;
    if (credentials) {
      const keyFile = JSON.parse(credentials);
      auth = new google.auth.GoogleAuth({
        credentials: keyFile,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
    } else {
      throw new Error('GOOGLE_CREDENTIALS environment variable not found.');
    }

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.GOOGLE_SHEET_ID || '1IzRN7J-0XDJbGQGFmom-7RutxOtgcwVM0oo6d4z5dWc';

    // Get the first sheet's name
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
      range: `${sheetName}!A:Z`,
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
    throw error;
  }
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const data = await getSheetData();
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({
      error: error.message,
      details: error.toString()
    });
  }
};
