/**
 * Kitchen Hub - visitor & interest tracker for Google Sheets
 *
 * How to use (full steps in SETUP.md):
 *  1. Make a new Google Sheet > Extensions > Apps Script.
 *  2. Delete everything there and paste this whole file. Save.
 *  3. Choose "setup" in the function menu at the top and press Run once.
 *     This makes two tabs: "Events" (one row per action) and "Summary".
 *  4. Deploy > New deployment > Web app
 *       Execute as: Me      Who has access: Anyone
 *     Copy the Web app URL into js/tracking.js (GOOGLE_SHEET_URL).
 */

var HEADERS = ["Time", "Event", "Category", "Brand", "Product", "Price ($)",
               "Language", "Visitor ID", "Device", "Website"];
var ALLOWED = ["page_view", "view_brands", "view_details", "add_to_cart",
               "order_placed", "switch_language", "switch_currency", "feedback"];
var SIGNUP_HEADERS = ["Time", "Type", "Name", "Phone / Viber / Telegram", "City",
                      "Wants next", "Reserved items", "Total ($)", "Language", "Visitor ID", "Email", "Age", "Address"];

/* Receives one event from the website and adds it as a row */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.event === "signup") return saveSignup(d);
    if (ALLOWED.indexOf(d.event) < 0) return ContentService.createTextOutput("ignored");
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Events");
    sheet.appendRow([
      new Date(), d.event, clean(d.category), clean(d.brand), clean(d.product),
      typeof d.price === "number" ? d.price : "",
      clean(d.lang), clean(d.visitor), clean(d.device), clean(d.page)
    ]);
    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error");
  } finally {
    lock.releaseLock();
  }
}

/* Waitlist and reservation sign-ups go to their own tab (only with consent) */
function saveSignup(d) {
  if (d.consent !== true || ["waitlist", "reservation"].indexOf(d.type) < 0) return ContentService.createTextOutput("ignored");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Sign-ups") || makeSignupSheet(ss);
  // Older sheets only have columns A-J: add the new headers once
  if (sheet.getRange(1, 11).getValue() !== "Email") {
    sheet.getRange(1, 11, 1, 3).setValues([["Email", "Age", "Address"]])
      .setFontWeight("bold").setBackground("#C8643B").setFontColor("#ffffff");
    sheet.setColumnWidth(11, 220); sheet.setColumnWidth(13, 300);
  }
  sheet.appendRow([
    new Date(), d.type, clean(d.name), clean(d.phone), clean(d.city), clean(d.want), clean(d.items),
    typeof d.total === "number" ? d.total : "", clean(d.lang), clean(d.visitor),
    clean(d.email), clean(d.age), clean(d.address)
  ]);
  return ContentService.createTextOutput("ok");
}
}
function makeSignupSheet(ss) {
  var sh = ss.insertSheet("Sign-ups");
  sh.appendRow(SIGNUP_HEADERS);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, SIGNUP_HEADERS.length).setFontWeight("bold").setBackground("#C8643B").setFontColor("#ffffff");
  sh.getRange("A:A").setNumberFormat("yyyy-mm-dd hh:mm");
  sh.getRange("D:D").setNumberFormat("@");
  sh.setColumnWidth(1, 140); sh.setColumnWidth(3, 160); sh.setColumnWidth(4, 170); sh.setColumnWidth(7, 260);
  return sh;
}

/* GET requests:
   ...?action=rate  -> the website reads the USD to MMK rate from the Settings tab
   (no action)      -> a check that the tracker is running */
function doGet(e) {
  if (e && e.parameter && e.parameter.action === "rate") {
    var st = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
    var rate = st ? Number(st.getRange("B2").getValue()) : NaN;
    return ContentService.createTextOutput(JSON.stringify({ rate: rate > 0 ? rate : null }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput("Kitchen Hub tracker is running.");
}

/* Keep text short and stop anything being treated as a formula */
function clean(v) {
  v = String(v == null ? "" : v).slice(0, 200);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

/* Run once: creates the Events and Summary tabs */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var ev = ss.getSheetByName("Events") || ss.insertSheet("Events");
  if (ev.getLastRow() === 0) ev.appendRow(HEADERS);
  ev.setFrozenRows(1);
  ev.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#1F5145").setFontColor("#ffffff");
  ev.getRange("A:A").setNumberFormat("yyyy-mm-dd hh:mm");
  ev.setColumnWidth(1, 140); ev.setColumnWidth(5, 220);

  if (!ss.getSheetByName("Sign-ups")) makeSignupSheet(ss);

  // Settings tab: the exchange rate the website uses for MMK prices
  if (!ss.getSheetByName("Settings")) {
    var st = ss.insertSheet("Settings");
    st.getRange("A1:B3").setValues([
      ["Setting", "Value"],
      ["USD to MMK rate (1 USD = ? Ks)", 4500],
      ["Change B2 and the website uses the new rate the next time a page is opened.", ""]
    ]);
    st.getRange("A1:B1").setFontWeight("bold").setBackground("#1F5145").setFontColor("#ffffff");
    st.getRange("B2").setFontWeight("bold").setBackground("#FBF1EA");
    st.setColumnWidth(1, 520); st.setColumnWidth(2, 120);
  }

  var sm = ss.getSheetByName("Summary") || ss.insertSheet("Summary", 0);
  sm.clear();
  var E = "Events!";
  var rows = [
    ["Kitchen Hub - live summary", ""],
    ["Updates automatically as people use the website.", ""],
    ["", ""],
    ["WEBSITE VIEWERS", ""],
    ["Page views (every visit)", '=COUNTIF(' + E + 'B2:B,"page_view")'],
    ["Unique visitors (different browsers)", '=IFERROR(COUNTUNIQUE(FILTER(' + E + 'H2:H,' + E + 'B2:B="page_view")),0)'],
    ["Visitors today", '=IFERROR(COUNTUNIQUE(FILTER(' + E + 'H2:H,' + E + 'B2:B="page_view",INT(' + E + 'A2:A)=TODAY())),0)'],
    ["", ""],
    ["INTEREST IN PRODUCTS", ""],
    ["Brand panels opened", '=COUNTIF(' + E + 'B2:B,"view_brands")'],
    ["Product details viewed", '=COUNTIF(' + E + 'B2:B,"view_details")'],
    ["Add-to-cart clicks", '=COUNTIF(' + E + 'B2:B,"add_to_cart")'],
    ["Visitors who added something to cart", '=IFERROR(COUNTUNIQUE(FILTER(' + E + 'H2:H,' + E + 'B2:B="add_to_cart")),0)'],
    ["Interest rate (added to cart ÷ unique visitors)", '=IF(B6=0,0,B13/B6)'],
    ["Reservations (orders reserved)", '=COUNTIF(\'Sign-ups\'!B2:B,"reservation")'],
    ["Visitors using Burmese", '=IFERROR(COUNTUNIQUE(FILTER(' + E + 'H2:H,' + E + 'G2:G="my")),0)'],
    ["", ""],
    ["WAITLIST (MVP VALIDATION)", ""],
    ["Waitlist sign-ups", '=COUNTIF(\'Sign-ups\'!B2:B,"waitlist")'],
    ["Total sign-ups (waitlist + reservations)", '=COUNTA(\'Sign-ups\'!B2:B)'],
    ["Different people (unique phone numbers)", '=IFERROR(COUNTUNIQUE(\'Sign-ups\'!D2:D),0)'],
    ["Sign-up rate (sign-ups ÷ unique visitors)", '=IF(B6=0,0,B20/B6)'],
    ["Poll answers", '=COUNTIF(' + E + 'B2:B,"feedback")']
  ];
  sm.getRange(1, 1, rows.length, 2).setValues(rows);
  sm.getRange("B14").setNumberFormat("0.0%");
  sm.getRange("B22").setNumberFormat("0.0%");
  sm.getRange("A1").setFontSize(16).setFontWeight("bold");
  sm.getRange("A2").setFontColor("#66706B");
  ["A4", "A9", "A18"].forEach(function (c) { sm.getRange(c).setFontWeight("bold").setFontColor("#C8643B"); });
  sm.getRange("B5:B23").setFontWeight("bold").setHorizontalAlignment("center");
  sm.setColumnWidth(1, 340); sm.setColumnWidth(2, 110);

  // Tables
  sm.getRange("D4").setValue("MOST ADDED TO CART").setFontWeight("bold").setFontColor("#C8643B");
  sm.getRange("D5").setFormula('=IFERROR(QUERY(Events!A1:J,"select E, count(B) where B = \'add_to_cart\' group by E order by count(B) desc label E \'Product\', count(B) \'Times added\'",1),"No data yet")');
  sm.getRange("G4").setValue("MOST VIEWED CATEGORIES").setFontWeight("bold").setFontColor("#C8643B");
  sm.getRange("G5").setFormula('=IFERROR(QUERY(Events!A1:J,"select C, count(B) where B = \'view_brands\' group by C order by count(B) desc label C \'Category\', count(B) \'Times opened\'",1),"No data yet")');
  sm.getRange("J4").setValue("PAGE VIEWS PER DAY").setFontWeight("bold").setFontColor("#C8643B");
  sm.getRange("J5").setFormula('=IFERROR(QUERY(Events!A1:J,"select toDate(A), count(B) where B = \'page_view\' group by toDate(A) order by toDate(A) label toDate(A) \'Day\', count(B) \'Page views\'",1),"No data yet")');
  sm.getRange("M4").setValue("DEVICES").setFontWeight("bold").setFontColor("#C8643B");
  sm.getRange("M5").setFormula('=IFERROR(QUERY(Events!A1:J,"select I, count(B) where B = \'page_view\' group by I label I \'Device\', count(B) \'Page views\'",1),"No data yet")');
  sm.getRange("P4").setValue("WHAT MATTERS MOST (POLL)").setFontWeight("bold").setFontColor("#C8643B");
  sm.getRange("P5").setFormula('=IFERROR(QUERY(Events!A1:J,"select E, count(B) where B = \'feedback\' group by E order by count(B) desc label E \'Answer\', count(B) \'Votes\'",1),"No data yet")');
  sm.getRange("S4").setValue("SIGN-UPS BY CITY").setFontWeight("bold").setFontColor("#C8643B");
  sm.getRange("S5").setFormula('=IFERROR(QUERY(\'Sign-ups\'!A1:J,"select E, count(B) where B is not null group by E order by count(B) desc label E \'City\', count(B) \'Sign-ups\'",1),"No data yet")');
  sm.getRange("V4").setValue("MOST WANTED NEXT").setFontWeight("bold").setFontColor("#C8643B");
  sm.getRange("V5").setFormula('=IFERROR(QUERY(\'Sign-ups\'!A1:J,"select F, count(B) where F <> \'\' group by F order by count(B) desc label F \'Appliance\', count(B) \'People\'",1),"No data yet")');
  ["P5:Q5", "S5:T5", "V5:W5"].forEach(function (r) { sm.getRange(r).setFontWeight("bold"); });
  sm.setColumnWidth(4, 230); sm.setColumnWidth(16, 180); sm.setColumnWidth(22, 160); sm.setColumnWidth(7, 160); sm.setColumnWidth(10, 110);
  ["D5:E5", "G5:H5", "J5:K5", "M5:N5"].forEach(function (r) { sm.getRange(r).setFontWeight("bold"); });
  sm.setFrozenRows(0);
  ss.setActiveSheet(sm);
}
