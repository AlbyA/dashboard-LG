const { google } = require('googleapis');

async function getSheetData() {
  try {
    let auth;
    
    // Use environment variables for credentials
    const credentials = process.env.GOOGLE_CREDENTIALS;
    if (!credentials) {
      throw new Error('GOOGLE_CREDENTIALS environment variable not found.');
    }

    try {
      let keyFile;
      const trimmed = String(credentials).trim();
      
      // Try multiple parsing strategies
      try {
        keyFile = JSON.parse(trimmed);
      } catch (e1) {
        // Remove surrounding quotes if present
        let cleaned = trimmed;
        if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
            (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
          cleaned = cleaned.slice(1, -1);
        }
        cleaned = cleaned.replace(/\\"/g, '"').replace(/\\n/g, '\n');
        
        try {
          keyFile = JSON.parse(cleaned);
        } catch (e2) {
          // Try extracting JSON from string
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            keyFile = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error(`Could not parse credentials: ${e1.message}`);
          }
        }
      }

      // Validate required fields
      if (!keyFile || typeof keyFile !== 'object' || !keyFile.client_email || !keyFile.private_key) {
        throw new Error('Invalid credentials: missing client_email or private_key');
      }

      auth = new google.auth.GoogleAuth({
        credentials: keyFile,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
    } catch (parseError) {
      console.error('Error parsing GOOGLE_CREDENTIALS:', parseError.message);
      throw new Error(`Invalid GOOGLE_CREDENTIALS format: ${parseError.message}`);
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
