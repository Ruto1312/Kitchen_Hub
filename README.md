# Kitchen Haven Appliances

School-project demo store for kitchen appliances. Plain HTML, CSS and JavaScript, with no build step.

## Folder structure

```
index.html          page structure and text (About, FAQ, Contact, Brands)
css/styles.css      all colours, layout and design
js/products.js      PRODUCT DATA: names, prices, specs, brands, currency
js/i18n.js          ALL TEXT in English and Burmese (မြန်မာ), incl. Burmese product names
js/app.js           logic: categories, round brand picker, search, cart, checkout
js/tracking.js      VISITOR TRACKING settings (Google Sheet URL, Google Analytics ID)
tracking/           Google Sheet script + step-by-step SETUP.md
images/             product photos and hero.jpg (the top banner)
```

## How to edit

| I want to...                          | Edit this file          |
|---------------------------------------|-------------------------|
| Change a price, spec or description   | `js/products.js`        |
| Add or remove a brand for a category  | `js/products.js` (`categoryBrandMap`, 2 to 4 brands) |
| Give one brand its own photo          | `js/products.js` (`brandImages`)      |
| Change a brand's price multiplier     | `js/products.js` (`brandPrices`)      |
| Change the currency symbol            | `js/products.js` (`CURRENCY`)         |
| Replace a product photo               | `images/<product-id>.jpg` (same name) |
| Change the banner photo               | `images/hero.jpg`       |
| Change colours (blue, green, etc.)    | top of `css/styles.css` (`:root`)     |
| Edit any wording (English or Burmese) | `js/i18n.js` (`TEXT`)  |
| Burmese product name, description, specs | `js/i18n.js` (`PRODUCT_MY`) |

Final price of a product = base price x brand multiplier.

## Track visitors and add-to-cart

See `tracking/SETUP.md`. In short: paste the Google Sheet web app URL and/or your Google Analytics ID into `js/tracking.js`.

## Run it locally

Just double-click `index.html`.

## Publish on GitHub Pages

1. Upload everything in this folder to the repository root (`index.html` must be at the top level).
2. Repository **Settings > Pages > Deploy from a branch > main / root**.
3. The site goes live at `https://<username>.github.io/<repo-name>/`.

## Note

Checkout is a demo. No payment is taken and orders are not sent anywhere.
The cart is saved in the visitor's browser (localStorage).
