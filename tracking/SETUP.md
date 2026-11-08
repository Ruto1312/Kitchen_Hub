# Tracking visitors and product interest

The website can record what visitors do in two places. Use one or both.

| | Google Sheet | Google Analytics 4 |
|---|---|---|
| Best for | Showing your professor exact numbers and a row for every action | Visitor reports: countries, devices, where visitors came from |
| Shows | Page views, unique visitors, brand panels opened, details viewed, add-to-cart, orders, language | Users, sessions, countries, devices, add-to-cart and purchase events |
| Setup | About 10 minutes | About 5 minutes; data appears after up to 24 hours |

Nothing personal is recorded. No names, phone numbers or addresses are sent. Each browser gets a random ID (for example `v-k3j9x2ab`) only so that unique visitors can be counted.

---

## Part 1: Google Sheet (recommended)

1. Go to **sheets.google.com** and create a blank spreadsheet. Name it "Kitchen Haven tracking".
2. Click **Extensions > Apps Script**.
3. Delete the code already there. Open `tracking/google-apps-script.gs` from this folder, copy all of it, and paste it in. Click **Save** (the disk icon).
4. In the menu at the top that says `doPost`, choose **setup**, then click **Run**.
   - Google asks for permission the first time. Click **Review permissions**, choose your account, then **Advanced > Go to project (unsafe) > Allow**. "Unsafe" only means Google hasn't reviewed your own script.
   - Go back to the spreadsheet. It now has a **Summary** tab and an **Events** tab.
5. Back in Apps Script, click **Deploy > New deployment**.
   - Click the gear icon next to "Select type" and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.
6. Open `js/tracking.js` and paste the URL between the quotes:
   ```js
   var GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfy.../exec";
   ```
7. Open the website, click around and add something to the cart. New rows appear in **Events** within a few seconds, and **Summary** updates by itself.

**Changed the script later?** Use **Deploy > Manage deployments > edit (pencil) > Version: New version > Deploy**. The URL stays the same.

**Before you present:** your own test clicks are counted too. Delete the test rows in **Events** (keep row 1, the headers) right before you share the site.

**Want a chart?** In **Summary**, select a table (for example "Page views per day"), then **Insert > Chart**.

---

## Part 2: Google Analytics 4 (optional)

1. Go to **analytics.google.com** and click **Start measuring**.
2. Create an account and a property (name: Kitchen Haven, time zone: yours, currency: USD).
3. Choose **Web** as the platform. Enter your GitHub Pages address (for example `yourname.github.io/kitchen-haven`).
4. Copy the **Measurement ID**. It looks like `G-AB12CD34EF`.
5. Paste it into `js/tracking.js`:
   ```js
   var GA_MEASUREMENT_ID = "G-AB12CD34EF";
   ```
6. Upload the site to GitHub Pages again.

Where to look in Google Analytics:
- **Reports > Realtime**: people on the site right now. This is the quickest way to check it works.
- **Reports > Engagement > Events**: counts of `add_to_cart`, `view_item`, `purchase` and more.
- **Reports > User attributes / Tech**: countries and devices.

Google Analytics only works on the published site (GitHub Pages), not when you open `index.html` straight from your computer. The Google Sheet works in both cases.

---

## What gets recorded

| Event | When |
|---|---|
| `page_view` | Someone opens the website |
| `view_brands` | Someone clicks a category to compare brands |
| `view_details` | Someone opens a product's details window |
| `add_to_cart` | Someone clicks Add / Add to cart |
| `order_placed` | Someone finishes the demo checkout (products and total only) |
| `switch_language` | Someone switches between English and Burmese |
