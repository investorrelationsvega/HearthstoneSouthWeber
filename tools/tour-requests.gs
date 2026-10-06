/**
 * Hearthstone of South Weber: tour request inbox.
 *
 * Runs inside a Google Sheet (Extensions > Apps Script). Each request from the
 * website's "Schedule a tour" form becomes a row in the "Tour requests" tab,
 * and an email alert goes to NOTIFY_EMAIL.
 *
 * Setup: paste this file, set NOTIFY_EMAIL, then Deploy > New deployment >
 * Web app, Execute as "Me", Who has access "Anyone". Put the web app URL in
 * FORM_ENDPOINT in index.html.
 */

const NOTIFY_EMAIL = 'CHANGE-ME@hearthstonesouthweber.com';
const SHEET_NAME = 'Tour requests';
const HEADERS = ['Received', 'Status', 'Name', 'Phone', 'Email', 'Type of care', 'Message', 'Notes'];
const STATUSES = ['New', 'Contacted', 'Tour scheduled', 'Toured', 'Moved in', 'Not a fit'];

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Bots fill the hidden "website" field; people never see it.
  if (p.website) return json_({ ok: true });

  const name = oneLine_(p.name, 120);
  const phone = oneLine_(p.phone, 40);
  const email = oneLine_(p.email, 160);
  const care = oneLine_(p.care, 60);
  const message = String(p.message || '').trim().slice(0, 3000);
  if (!name || !phone) return json_({ ok: false, error: 'Name and phone are required.' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getSheet_().appendRow([new Date(), 'New', safe_(name), safe_(phone), safe_(email), safe_(care), safe_(message), '']);
  } finally {
    lock.releaseLock();
  }

  const mail = {
    to: NOTIFY_EMAIL,
    subject: 'New tour request: ' + name,
    body: [
      'A family asked to schedule a tour on hearthstonesouthweber.com.',
      '',
      'Name: ' + name,
      'Phone: ' + phone,
      'Email: ' + (email || '(not given)'),
      'Type of care: ' + (care || '(not given)'),
      '',
      'Message:',
      message || '(none)',
      '',
      'All requests: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    ].join('\n'),
  };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) mail.replyTo = email;
  MailApp.sendEmail(mail);

  return json_({ ok: true });
}

// Run once from the editor to create the tab and check permissions.
function setup() {
  getSheet_();
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME, 0);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.getRange('A:A').setNumberFormat('mmm d, yyyy h:mm am/pm');
    sheet.getRange('B2:B').setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build()
    );
    sheet.setColumnWidth(7, 360);
  }
  return sheet;
}

function oneLine_(value, max) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

// Stop text that starts with = + - @ from being treated as a spreadsheet formula.
function safe_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
