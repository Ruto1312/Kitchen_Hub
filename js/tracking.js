/* ============================================================
   VISITOR & INTEREST TRACKING
   Paste your two settings below (see tracking/SETUP.md).
   Leave a setting empty ("") to switch that part off.
   ============================================================ */

/* 1. Google Sheet: the Web app URL from Apps Script (ends in /exec) */
var GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbz4PCRZnIs_CjzeQoB8_7kodzfsJ3LaCwrbwlrSQLnwVcPDstMcQTB3IrADRXQKNnru/exec";

/* 2. Google Analytics 4: your Measurement ID, looks like "G-XXXXXXXXXX" */
var GA_MEASUREMENT_ID = "";

/* ------------------------------------------------------------
   No need to edit below this line.
   Nothing personal is sent: no names, phones or addresses.
   Each browser gets a random anonymous ID so we can count
   unique visitors.
   ------------------------------------------------------------ */
var KH_VISITOR = (function(){
  var id;
  try { id = localStorage.getItem("kh_vid"); } catch (e) {}
  if (!id) {
    id = "v-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    try { localStorage.setItem("kh_vid", id); } catch (e) {}
  }
  return id;
})();
function khDevice(){ var w = window.innerWidth; return w < 700 ? "phone" : w < 1024 ? "tablet" : "desktop"; }

/* Load Google Analytics only if an ID is set */
if (GA_MEASUREMENT_ID) {
  var gs = document.createElement("script");
  gs.async = true; gs.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_MEASUREMENT_ID);
  document.head.appendChild(gs);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);
}

/* GA4 item format */
function gaItem(p, qty){
  return { item_id: p.id, item_name: p.name, item_brand: p.brand, item_category: p.name, price: p.price, quantity: qty || 1 };
}

/* track("add_to_cart", {category, brand, product, price, ga:{...}}) */
function track(event, data){
  data = data || {};
  var row = {
    event: event,
    category: data.category || "",
    brand: data.brand || "",
    product: data.product || "",
    price: (typeof data.price === "number") ? data.price : "",
    lang: (typeof LANG !== "undefined") ? LANG : "",
    visitor: KH_VISITOR,
    device: khDevice(),
    page: location.hostname || "local file"
  };
  if (GOOGLE_SHEET_URL) {
    try {
      // text/plain + no-cors = no permission pop-ups, works from GitHub Pages
      fetch(GOOGLE_SHEET_URL, { method: "POST", mode: "no-cors", keepalive: true,
        headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(row) });
    } catch (e) {}
  }
  if (GA_MEASUREMENT_ID && window.gtag && data.ga) gtag("event", data.ga.name, data.ga.params);
  if (!GOOGLE_SHEET_URL && !GA_MEASUREMENT_ID && window.console) console.log("[tracking off]", event, row);
}
