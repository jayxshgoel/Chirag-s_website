// Google Apps Script - Trishakti Contact Form Backend
// 1. Go to https://script.google.com/
// 2. Create a new project and paste this code
// 3. Update the SHEET_NAME and ADMIN_EMAIL below
// 4. Click "Deploy" > "New deployment" > Select "Web app"
// 5. Access: "Anyone"
// 6. Copy the Web App URL and paste it into js/app.js

const SHEET_NAME = "Inquiries"; // Creates this sheet automatically if missing
const ADMIN_EMAIL = "chiragpatnaik@gmail.com"; // Get notified here!

function doPost(e) {
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = doc.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = doc.insertSheet(SHEET_NAME);
      // Setup headers
      sheet.appendRow(["Timestamp", "Date", "Name", "Company", "Email", "Phone", "Interest", "Message"]);
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#e0e0e0");
      sheet.setFrozenRows(1);
    }

    // Extract POST data sent from our website forms
    const data = e.parameter;
    
    // 1. Log to the Spreadsheet
    sheet.appendRow([
      new Date(), // True backend timestamp
      data.Date || "", // Formatting localized from frontend
      data.Name || "",
      data.Company || "",
      data.Email || "",
      data.Phone || "",
      data.Interest || "",
      data.Message || ""
    ]);

    // 2. Send an Email Alert
    const emailSubject = `New Demo Request: ${data.Name} (${data.Interest})`;
    const emailBody = `
      You have received a new contact inquiry from the Trishakti website:
      
      Name: ${data.Name}
      Company: ${data.Company || "N/A"}
      Email: ${data.Email}
      Phone: ${data.Phone || "N/A"}
      Interested In: ${data.Interest}
      
      Message:
      ${data.Message || "No message provided."}
      
      --
      Sent via Trishakti Immersive Realty Website
    `;
    
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: emailSubject,
      body: emailBody,
      replyTo: data.Email // Allows hitting "Reply" to directly email the customer
    });

    // We must return a successful success response.
    // The browser javascript fetch uses 'no-cors' so it doesn't read this directly,
    // but the engine requires it anyway.
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "data": JSON.stringify(data) }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Support GET requests just so deployment can be casually tested in browser
function doGet(e) {
  return ContentService.createTextOutput("Trishakti Backend is Active!");
}
