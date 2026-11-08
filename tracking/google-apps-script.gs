/**
 * Kitchen Haven - visitor & interest tracker for Google Sheets
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
               "order_placed", "switch_language"];

/* Receives one event from the website and adds it as a row */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
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

/* Open the Web app URL in a browser to check it is running */
function doGet() {
  return ContentService.createTextOutput("Kitchen Haven tracker is running.");
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

  var sm = ss.getSheetByName("Summary") || ss.insertSheet("Summary", 0);
  sm.clear();
  var E = "Events!";
  var rows = [
    ["Kitchen Haven - live summary", ""],
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
    ["Orders placed (demo checkout)", '=COUNTIF(' + E + 'B2:B,"order_placed")'],
    ["Visitors using Burmese", '=IFERROR(COUNTUNIQUE(FILTER(' + E + 'H2:H,' + E + 'G2:G="my")),0)']
  ];
  sm.getRange(1, 1, rows.length, 2).setValues(rows);
  sm.getRange("B14").setNumberFormat("0.0%");
  sm.getRange("A1").setFontSize(16).setFontWeight("bold");
  sm.getRange("A2").setFontColor("#66706B");
  ["A4", "A9"].forEach(function (c) { sm.getRange(c).setFontWeight("bold").setFontColor("#C8643B"); });
  sm.getRange("B5:B16").setFontWeight("bold").setHorizontalAlignment("center");
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
  sm.setColumnWidth(4, 230); sm.setColumnWidth(7, 160); sm.setColumnWidth(10, 110);
  ["D5:E5", "G5:H5", "J5:K5", "M5:N5"].forEach(function (r) { sm.getRange(r).setFontWeight("bold"); });
  sm.setFrozenRows(0);
  ss.setActiveSheet(sm);
}
