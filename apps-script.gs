// Paste this entire file into your Google Sheet:
//   Extensions → Apps Script → replace any existing code → Save
//
// Then deploy:
//   Deploy → New deployment → Web app
//   Execute as: Me
//   Who has access: Anyone
//   → Deploy → copy the Web app URL → paste into script.js as APPS_SCRIPT_URL
//
// IMPORTANT: use the URL that starts with https://script.google.com/macros/s/...
// NOT the one with /a/macros/riverside.fm/ — that one requires workspace auth.

function doPost(e) {
  const sheet = SpreadsheetApp.openById('14zsyxp5nFh9pU3e_d3gfasXTVgdfgjJ_Pfj032bXJwY').getSheets()[0];

  // Read headers from row 1, strip trailing * used for visual required markers, then map by name.
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(header => e.parameter[header.replace(/\*$/, '').trim()] || '');
  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Visit the /exec URL directly in a browser to confirm the script is reachable.
function doGet() {
  return ContentService.createTextOutput('Apps Script is live.');
}
