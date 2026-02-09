/**
 * Google Apps Script for City Doctor - ChatBot Campaign
 * Handles ChatBot Campaign leads only.
 * Same sheet structure supports: ChatBot Campaign, Whatsapp Request Back, Call Request Back
 */

// ============================================
// SHEET CONFIGURATION
// ============================================
const SHEET_NAME = "ChatBot";

// Sheet column headers (must match your Google Sheet)
const SHEET_HEADERS = [
  "Lead ID",
  "Date & Time",
  "Name",
  "Phone Number",
  "Symptoms",
  "Campaign Name",
  "Lead Status",
  "Conversion Sent",
  "gclid",
  "fbclid",
  "Remarks"
];

// Column indices (0-based for getRange)
const COL_LEAD_ID = 1;
const COL_DATE_TIME = 2;
const COL_NAME = 3;
const COL_PHONE = 4;
const COL_SYMPTOMS = 5;
const COL_CAMPAIGN_NAME = 6;
const COL_LEAD_STATUS = 7;
const COL_CONVERSION_SENT = 8;
const COL_GCLID = 9;
const COL_FBCLID = 10;
const COL_REMARKS = 11;

// Email recipients for notifications (update with your recipients)
// const SHEET_RECIPIENTS = "mohammedsinanchinnu07@gmail.com";
const SHEET_RECIPIENTS = "ahmedaljafar46@gmail.com";

// Sheet link (update with your actual Google Sheet link)
const SHEET_LINK = "https://docs.google.com/spreadsheets/d/1rE-v7vdI6l8VLpbpspzjENFAAD6_cbbuqL4_AOtkKts/edit?gid=0#gid=0";

// ============================================
// OFFLINE CONVERSION CONFIGURATION
// ============================================
// Not integrated - keep empty. Update when ready to integrate.
const GOOGLE_ADS_CUSTOMER_ID = "";
const GOOGLE_ADS_CONVERSION_ACTION = "";
const GOOGLE_ADS_DEVELOPER_TOKEN = "";
const GOOGLE_ADS_CLIENT_ID = "";
const GOOGLE_ADS_CLIENT_SECRET = "";
const GOOGLE_ADS_REFRESH_TOKEN = "";
const META_PIXEL_ID = "";
const META_ACCESS_TOKEN = "";

// ============================================
// ONCHANGE TRIGGER (Email on new row)
// ============================================
function sendEmailNotificationOnNewRow(e) {
  try {
    if (!e || !e.source) return;
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();

    if (sheetName === SHEET_NAME) {
      handleSheetChange(e, sheet);
    }
  } catch (error) {
    Logger.log("Error in sendEmailNotificationOnNewRow: " + error.toString());
  }
}

function handleSheetChange(e, sheet) {
  const lastRow = sheet.getLastRow();

  const properties = PropertiesService.getScriptProperties();
  const previousRowCount = Number(properties.getProperty("lastRowCount_" + SHEET_NAME)) || 0;

  if (lastRow > previousRowCount) {
    const message = `A new lead has been added. View it here: <a href="${SHEET_LINK}">City Doctor Leads</a>`;

    MailApp.sendEmail({
      to: SHEET_RECIPIENTS,
      subject: "City Doctor - New ChatBot Lead",
      htmlBody: message
    });
  }

  properties.setProperty("lastRowCount_" + SHEET_NAME, lastRow.toString());
}

// ============================================
// WEB APP ENDPOINT (Receives form submissions)
// ============================================
function doPost(e) {
  try {
    if (!e) {
      Logger.log("doPost error: event e is null");
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "No request data" })).setMimeType(ContentService.MimeType.JSON);
    }

    let data;
    const rawBody = (e.postData && e.postData.contents) ? e.postData.contents : null;
    if (rawBody) {
      try {
        data = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
      } catch (jsonError) {
        Logger.log("doPost JSON parse error: " + jsonError.toString());
        data = e.parameter || {};
      }
    } else if (e.parameter && Object.keys(e.parameter).length > 0) {
      data = e.parameter;
    } else {
      Logger.log("doPost: no postData.contents - postData type: " + (e.postData ? e.postData.type : "none"));
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "No request body" })).setMimeType(ContentService.MimeType.JSON);
    }

    Logger.log("Received data: " + JSON.stringify(data));

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // Ensure headers
    const currentLastColumn = sheet.getLastColumn();
    if (currentLastColumn < SHEET_HEADERS.length) {
      sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setValues([SHEET_HEADERS]);
      const headerRange = sheet.getRange(1, 1, 1, SHEET_HEADERS.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#006FAC");
      headerRange.setFontColor("#ffffff");
    } else {
      const currentHeaders = sheet.getRange(1, 1, 1, SHEET_HEADERS.length).getValues()[0];
      let headersMatch = true;
      for (let i = 0; i < SHEET_HEADERS.length; i++) {
        if (currentHeaders[i] !== SHEET_HEADERS[i]) {
          headersMatch = false;
          break;
        }
      }
      if (!headersMatch) {
        sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setValues([SHEET_HEADERS]);
        const headerRange = sheet.getRange(1, 1, 1, SHEET_HEADERS.length);
        headerRange.setFontWeight("bold");
        headerRange.setBackground("#006FAC");
        headerRange.setFontColor("#ffffff");
      }
    }

    const getValue = (value) => {
      if (value === null || value === undefined || value === "") return "-";
      const s = String(value).trim();
      return s === "" ? "-" : s;
    };

    const dateTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Dubai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    const leadId = (getValue(data.leadId) !== "-") ? getValue(data.leadId) : "LEAD-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7).toUpperCase();

    const rowData = [
      leadId,
      dateTime,
      getValue(data.name),
      getValue(data.phone),
      getValue(data.symptoms),
      getValue(data.campaignName) !== "-" ? getValue(data.campaignName) : "ChatBot Campaign",
      getValue(data.leadStatus) !== "-" ? getValue(data.leadStatus) : "New",
      "No",
      getValue(data.gclid),
      getValue(data.fbclid),
      getValue(data.remarks)
    ];

    // Duplicate check by phone
    const rawPhone = (data.phone != null) ? String(data.phone).trim().replace(/\s+/g, "") : "";
    const normPhone = rawPhone.replace(/\D/g, "");

    if (normPhone.length >= 9) {
      const lastRow = sheet.getLastRow();
      if (lastRow >= 2) {
        const phoneCol = sheet.getRange(2, COL_PHONE, lastRow, COL_PHONE).getValues();
        for (let i = 0; i < phoneCol.length; i++) {
          const rowPhoneRaw = (phoneCol[i][0] != null && phoneCol[i][0] !== "") ? String(phoneCol[i][0]).trim() : "";
          const rowPhone = rowPhoneRaw.replace(/\D/g, "");
          if (rowPhone.length >= 9 && rowPhone === normPhone) {
            Logger.log("Duplicate lead skipped (phone already in sheet)");
            const output = ContentService.createTextOutput(JSON.stringify({
              success: true,
              duplicate: true,
              message: "Your details have already been received. We'll be in touch shortly."
            }));
            output.setMimeType(ContentService.MimeType.JSON);
            return output;
          }
        }
      }
    }

    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, SHEET_HEADERS.length).setValues([rowData]);

    Logger.log("Data saved successfully at row: " + nextRow);

    // Email notification (sent from doPost so it always runs when a row is added via web)
    try {
      if (SHEET_RECIPIENTS && SHEET_RECIPIENTS.indexOf("@") > 0) {
        const emailMessage = `
          <h2>New ChatBot Lead - City Doctor</h2>
          <p>A new lead has been submitted through the chatbot.</p>
          <hr>
          <p><strong>Name:</strong> ${getValue(data.name)}</p>
          <p><strong>Phone:</strong> ${getValue(data.phone)}</p>
          <p><strong>Symptoms:</strong> ${getValue(data.symptoms)}</p>
          <p><strong>Campaign:</strong> ${getValue(data.campaignName) || "ChatBot Campaign"}</p>
          <p><strong>Date & Time:</strong> ${dateTime}</p>
          <hr>
          <p><a href="${SHEET_LINK}" style="background-color: #006FAC; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Google Sheet</a></p>
        `;
        const plainBody = "New ChatBot Lead - City Doctor\n\nName: " + getValue(data.name) + "\nPhone: " + getValue(data.phone) + "\nSymptoms: " + getValue(data.symptoms) + "\n\nView: " + SHEET_LINK;

        MailApp.sendEmail({
          to: SHEET_RECIPIENTS,
          subject: "City Doctor - New ChatBot Lead: " + getValue(data.name),
          htmlBody: emailMessage,
          body: plainBody
        });
        Logger.log("Email notification sent to: " + SHEET_RECIPIENTS);
      } else {
        Logger.log("Email skipped: SHEET_RECIPIENTS not set or invalid");
      }
    } catch (emailError) {
      Logger.log("Email notification failed: " + emailError.toString());
      Logger.log("Email error stack: " + (emailError.stack || ""));
    }

    const output = ContentService.createTextOutput(JSON.stringify({ success: true, message: "Data saved successfully" }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;

  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());

    const output = ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

function doOptions() {
  return ContentService.createTextOutput(JSON.stringify({})).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    message: "City Doctor ChatBot - Google Apps Script is running",
    timestamp: new Date()
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// SETUP FUNCTIONS
// ============================================

function createChangeTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const triggers = ScriptApp.getUserTriggers(ss);
  const triggerExists = triggers.some(trigger => trigger.getHandlerFunction() === "sendEmailNotificationOnNewRow");

  if (!triggerExists) {
    ScriptApp.newTrigger("sendEmailNotificationOnNewRow")
      .forSpreadsheet(ss)
      .onChange()
      .create();
    Logger.log("Change trigger created successfully");
  }
}

function initializeSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setValues([SHEET_HEADERS]);

    const headerRange = sheet.getRange(1, 1, 1, SHEET_HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#006FAC");
    headerRange.setFontColor("#ffffff");

    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 150);
    sheet.setColumnWidth(3, 120);
    sheet.setColumnWidth(4, 130);
    sheet.setColumnWidth(5, 250);
    sheet.setColumnWidth(6, 150);
    sheet.setColumnWidth(7, 100);
    sheet.setColumnWidth(8, 120);
    sheet.setColumnWidth(9, 200);
    sheet.setColumnWidth(10, 200);
    sheet.setColumnWidth(11, 200);

    Logger.log("Sheet initialized successfully");
  }
}

function createOnEditTrigger() {
  // onEdit works automatically as a simple trigger - no need to create programmatically
  Logger.log("onEdit trigger: The onEdit() function will work automatically as a simple trigger");
}

function setup() {
  initializeSheet();
  createChangeTrigger();
  createOnEditTrigger();
  Logger.log("Setup completed successfully");
}

// ============================================
// OFFLINE CONVERSION (onEdit - Lead Status to Qualified)
// ============================================
function onEdit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();

    if (sheetName !== SHEET_NAME) return;

    const range = e.range;
    const row = range.getRow();
    const col = range.getColumn();

    if (row === 1) return;
    if (col !== COL_LEAD_STATUS) return;

    const status = sheet.getRange(row, COL_LEAD_STATUS).getValue();
    const conversionSent = sheet.getRange(row, COL_CONVERSION_SENT).getValue();

    if (status === "Qualified" && conversionSent !== "Yes") {
      Logger.log("Lead Status changed to Qualified for row: " + row);
      sendOfflineConversion(row, sheet);
    }
  } catch (error) {
    Logger.log("Error in onEdit: " + error.toString());
  }
}

function sendOfflineConversion(row, sheet) {
  try {
    const leadId = sheet.getRange(row, COL_LEAD_ID).getValue();
    const gclid = sheet.getRange(row, COL_GCLID).getValue();
    const fbclid = sheet.getRange(row, COL_FBCLID).getValue();
    const timestamp = sheet.getRange(row, COL_DATE_TIME).getValue();
    const phone = sheet.getRange(row, COL_PHONE).getValue();

    Logger.log("Sending offline conversion for Lead ID: " + leadId);

    let googleSuccess = false;
    let metaSuccess = false;

    if (gclid && gclid !== "-" && gclid !== "" && String(gclid).trim() !== "") {
      googleSuccess = sendToGoogleAds(gclid, timestamp, phone, "", leadId);
    }

    if (fbclid && fbclid !== "-" && fbclid !== "" && String(fbclid).trim() !== "") {
      metaSuccess = sendToMeta(fbclid, timestamp, phone, "", leadId);
    }

    if (googleSuccess || metaSuccess) {
      sheet.getRange(row, COL_CONVERSION_SENT).setValue("Yes");
    }
  } catch (error) {
    Logger.log("Error sending offline conversion: " + error.toString());
  }
}

function sendToGoogleAds(gclid, conversionTime, phone, email, leadId) {
  try {
    if (!GOOGLE_ADS_CUSTOMER_ID || !GOOGLE_ADS_CONVERSION_ACTION || !GOOGLE_ADS_DEVELOPER_TOKEN) {
      Logger.log("Google Ads credentials not configured.");
      return false;
    }

    const accessToken = getGoogleAdsAccessToken();
    if (!accessToken) return false;

    const formattedTime = formatConversionTime(conversionTime);

    const payload = {
      "conversions": [{
        "gclid": gclid,
        "conversion_action": GOOGLE_ADS_CONVERSION_ACTION,
        "conversion_date_time": formattedTime,
        "conversion_value": 1.0,
        "currency_code": "AED"
      }],
      "partial_failure": true
    };

    if ((phone && phone !== "-") || (email && email !== "-")) {
      payload.conversions[0].user_identifiers = [];
      if (phone && phone !== "-") {
        payload.conversions[0].user_identifiers.push({
          "hashed_phone_number": hashSHA256(String(phone).replace(/\D/g, ""))
        });
      }
      if (email && email !== "-") {
        payload.conversions[0].user_identifiers.push({
          "hashed_email": hashSHA256(String(email).toLowerCase().trim())
        });
      }
    }

    const url = "https://googleads.googleapis.com/v16/customers/" + GOOGLE_ADS_CUSTOMER_ID + ":uploadClickConversions";
    const response = UrlFetchApp.fetch(url, {
      "method": "POST",
      "headers": {
        "Authorization": "Bearer " + accessToken,
        "Content-Type": "application/json",
        "developer-token": GOOGLE_ADS_DEVELOPER_TOKEN
      },
      "payload": JSON.stringify(payload)
    });

    const result = JSON.parse(response.getContentText());
    if (result.results && result.results.length > 0) {
      Logger.log("Google Ads conversion sent for Lead ID: " + leadId);
      return true;
    }
    return false;
  } catch (error) {
    Logger.log("Google Ads API error: " + error.toString());
    return false;
  }
}

function sendToMeta(fbclid, conversionTime, phone, email, leadId) {
  try {
    if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
      Logger.log("Meta credentials not configured.");
      return false;
    }

    const eventTime = Math.floor(new Date(conversionTime).getTime() / 1000);
    const userData = {};
    if (fbclid && fbclid !== "-") userData.fbc = fbclid;
    if (phone && phone !== "-") userData.ph = [hashSHA256(String(phone).replace(/\D/g, ""))];
    if (email && email !== "-") userData.em = [hashSHA256(String(email).toLowerCase().trim())];

    const payload = {
      "data": [{
        "event_name": "QualifiedLead",
        "event_time": eventTime,
        "action_source": "other",
        "user_data": userData
      }],
      "access_token": META_ACCESS_TOKEN
    };

    const url = "https://graph.facebook.com/v19.0/" + META_PIXEL_ID + "/events";
    const response = UrlFetchApp.fetch(url, {
      "method": "POST",
      "headers": { "Content-Type": "application/json" },
      "payload": JSON.stringify(payload)
    });

    const result = JSON.parse(response.getContentText());
    if (result.events_received && result.events_received > 0) {
      Logger.log("Meta conversion sent for Lead ID: " + leadId);
      return true;
    }
    return false;
  } catch (error) {
    Logger.log("Meta API error: " + error.toString());
    return false;
  }
}

function hashSHA256(input) {
  const rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(input),
    Utilities.Charset.UTF_8
  );
  return rawHash.map(function(byte) {
    return ("0" + (byte & 0xFF).toString(16)).slice(-2);
  }).join("");
}

function formatConversionTime(timestamp) {
  try {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const offset = -date.getTimezoneOffset();
    const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
    const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, "0");
    const offsetSign = offset >= 0 ? "+" : "-";
    return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds + offsetSign + offsetHours + ":" + offsetMinutes;
  } catch (error) {
    const now = new Date();
    return now.toISOString().replace("T", " ").substring(0, 19) + "+04:00";
  }
}

function getGoogleAdsAccessToken() {
  try {
    if (!GOOGLE_ADS_CLIENT_ID || !GOOGLE_ADS_CLIENT_SECRET || !GOOGLE_ADS_REFRESH_TOKEN) {
      Logger.log("Google Ads OAuth credentials not configured");
      return null;
    }

    const tokenUrl = "https://oauth2.googleapis.com/token";
    const payload = {
      "client_id": GOOGLE_ADS_CLIENT_ID,
      "client_secret": GOOGLE_ADS_CLIENT_SECRET,
      "refresh_token": GOOGLE_ADS_REFRESH_TOKEN,
      "grant_type": "refresh_token"
    };

    const response = UrlFetchApp.fetch(tokenUrl, {
      "method": "POST",
      "headers": { "Content-Type": "application/x-www-form-urlencoded" },
      "payload": Object.keys(payload).map(function(k) { return k + "=" + encodeURIComponent(payload[k]); }).join("&")
    });

    const result = JSON.parse(response.getContentText());
    return result.access_token || null;
  } catch (error) {
    Logger.log("Error getting Google Ads access token: " + error.toString());
    return null;
  }
}

function testDoPost() {
  const testData = {
    leadId: "TEST-" + Date.now(),
    name: "Test User",
    phone: "+971501234567",
    symptoms: "Fever and cough",
    campaignName: "ChatBot Campaign",
    leadStatus: "New",
    conversionSent: "",
    gclid: "",
    fbclid: "",
    remarks: ""
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData),
      type: "application/json"
    }
  };

  const result = doPost(mockEvent);
  Logger.log("Result: " + result.getContent());
}
