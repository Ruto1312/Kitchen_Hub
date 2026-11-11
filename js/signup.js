/* ============================================================
   WAITLIST, RESERVATIONS, QUICK POLL
   Sign-ups go to the same Google Sheet as tracking (GOOGLE_SHEET_URL
   in tracking.js), into the "Sign-ups" tab.
   ============================================================ */
var CITIES = ["Yangon", "Mandalay", "Naypyidaw", "Other"];
var POLL_OPTIONS = ["genuine", "price", "compare", "delivery", "receipt"];

function el(id){ return document.getElementById(id); }

/* Send a sign-up (waitlist or reservation) to the Google Sheet */
function sendSignup(data){
  var row = {
    event: "signup", type: data.type, name: data.name, phone: data.phone, email: data.email || "", age: data.age || "", address: data.address || "", city: data.city,
    want: data.want || "", items: data.items || "", total: (typeof data.total === "number") ? data.total : "",
    consent: true, lang: (typeof LANG !== "undefined") ? LANG : "", visitor: KH_VISITOR
  };
  if (GOOGLE_SHEET_URL) {
    try {
      fetch(GOOGLE_SHEET_URL, { method: "POST", mode: "no-cors", keepalive: true,
        headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(row) });
    } catch (e) {}
  } else if (window.console) console.log("[sign-up not sent: no GOOGLE_SHEET_URL]", row);
  if (GA_MEASUREMENT_ID && window.gtag) gtag("event", "generate_lead", { lead_source: data.type, currency: "USD", value: row.total || 0 });
}

/* Read and check a form: name, phone, city and consent are required.
   Email, age and address are checked only if the form has them (the waitlist form). */
function readForm(form){
  var f = form.elements, ok = true;
  var data = { name: f.name.value.trim(), phone: f.phone.value.trim(), city: f.city.value, want: f.want ? f.want.value : "" };
  if (f.email)   data.email   = f.email.value.trim();
  if (f.age)     data.age     = f.age.value.trim();
  if (f.address) data.address = f.address.value.trim();
  [f.name, f.phone, f.city].forEach(function(input){
    var bad = !input.value.trim() || (input === f.phone && input.value.replace(/[^0-9]/g, "").length < 6);
    input.classList.toggle("invalid", bad); if (bad) ok = false;
  });
  if (f.email) {
    var badEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim());
    f.email.classList.toggle("invalid", badEmail); if (badEmail) ok = false;
  }
  if (f.age) {
    var a = parseInt(f.age.value, 10);
    var badAge = isNaN(a) || a < 16 || a > 99;
    f.age.classList.toggle("invalid", badAge); if (badAge) ok = false;
  }
  if (f.address) {
    var badAddr = f.address.value.trim().length < 5;
    f.address.classList.toggle("invalid", badAddr); if (badAddr) ok = false;
  }
  f.consent.parentNode.classList.toggle("invalid", !f.consent.checked);
  if (!f.consent.checked) ok = false;
  form.querySelector(".form-err").hidden = ok;
  return ok ? data : null;
}

/* ----- Draw the parts that depend on the language ----- */
function fillSelects(){
  [].forEach.call(document.querySelectorAll(".city-select"), function(s){
    var v = s.value;
    s.innerHTML = '<option value="">' + t("city.choose") + '</option>' +
      CITIES.map(function(c){ return '<option value="' + c + '">' + t("city." + c) + '</option>'; }).join("");
    s.value = v;
  });
  [].forEach.call(document.querySelectorAll(".want-select"), function(s){
    var v = s.value;
    s.innerHTML = '<option value="">' + t("want.none") + '</option>' +
      baseProducts.map(function(b){ return '<option value="' + b.name + '">' + esc(nameOf(b)) + '</option>'; }).join("");
    s.value = v;
  });
}
function pollAnswer(){ try { return localStorage.getItem("kh_poll"); } catch (e) { return null; } }
function renderPoll(){
  var picked = pollAnswer();
  el("poll-opts").innerHTML = POLL_OPTIONS.map(function(o){
    return '<button type="button" class="popt' + (picked === o ? ' picked' : '') + '" data-poll="' + o + '"' + (picked ? ' disabled' : '') + '>' + t("opt." + o) + '</button>';
  }).join("");
  el("poll-thanks").hidden = !picked;
}
function renderDeck(){ fillSelects(); renderPoll(); }

/* ----- Quick poll ----- */
el("poll-opts").addEventListener("click", function(e){
  var b = e.target.closest("[data-poll]"); if (!b || pollAnswer()) return;
  var answer = b.getAttribute("data-poll");
  try { localStorage.setItem("kh_poll", answer); } catch (err) {}
  track("feedback", { product: TEXT.en["opt." + answer], ga: { name: "poll_answer", params: { answer: answer } } });
  renderPoll();
});

/* ----- Waitlist form ----- */
el("wl").addEventListener("submit", function(e){
  e.preventDefault();
  var data = readForm(this); if (!data) return;
  data.type = "waitlist";
  sendSignup(data);
  this.reset();
  [].forEach.call(this.querySelectorAll("label"), function(l){ l.hidden = true; });
  this.querySelector(".two").hidden = true;
  this.querySelector('[type="submit"]').hidden = true;
  this.querySelector(".join-ok").hidden = false;
});
