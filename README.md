# Demo Shop Analytics

A tiny static coffee-gear shop ("Slow Pour") I built to get hands-on with **Google Tag Manager + GA4 ecommerce tracking**. Plain HTML/CSS/JS, no framework, hosted on GitHub Pages.

The shop is fake, the tracking is real: every key step of the buying journey is pushed to the `dataLayer` using Google's official GA4 ecommerce format, picked up by GTM and sent to a GA4 property.

**Live site:** https://jadhaidar2007.github.io/demo-shop-analytics/ *(placeholder: update if the repo name differs)*

## How it works

```
page JS  →  dataLayer.push({ event, ecommerce })  →  GTM custom-event trigger  →  GA4 Event tag  →  GA4
```

- All tracking code lives in one file, [`js/tracking.js`](js/tracking.js). Pages call `Track.viewItem()`, `Track.purchase()` etc.
- `ecommerce` is cleared (`{ ecommerce: null }`) before every push so items never leak between events.
- The `purchase` event fires once per order (a flag in `sessionStorage` stops refreshes from double counting).
- No names or emails from the checkout form ever touch the dataLayer.
- Add `?debug=1` to any URL to log every push in the browser console.

## Tracked events

| Event | When it fires | Key parameters |
|---|---|---|
| `view_item` | Product page loads | `currency`, `value`, `items[]` |
| `add_to_cart` | "Add to cart" clicked | `currency`, `value`, `items[]` (with `quantity`) |
| `begin_checkout` | Checkout page loads with a non-empty cart | `currency`, `value`, `items[]` |
| `purchase` | Thank-you page loads after an order | `transaction_id`, `currency`, `value`, `items[]` |

Every item carries `item_id`, `item_name`, `item_category`, `price`, `quantity`. Currency is `EUR`.

## Funnel

![GA4 funnel exploration: view_item → add_to_cart → begin_checkout → purchase](docs/funnel.png)

*(Replace with your screenshot: `docs/funnel.png`.)*

## Insights & what I'd improve

> Fill the `[ ]` brackets with your real numbers from the exploration before publishing.

- **Biggest drop-off was [step A → step B] ([X]% lost).** On a real shop I'd test that step first, for example shipping costs shown earlier or fewer checkout fields.
- **The data is my own test traffic ([N] sessions)**, so it proves the tracking works rather than how real users behave. Next I'd run it with real visitors or compare against a public sample dataset.
- **I'd add consent and raw-data access:** a cookie banner with Google Consent Mode (needed for GDPR), plus the GA4 → BigQuery export so I can query raw events with SQL instead of only using the GA4 UI.

## Run it locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Files

```
index.html               home, product grid
product-dripper.html     product pages (3)
product-grinder.html
product-kettle.html
cart.html                cart
checkout.html            fake checkout form
thank-you.html           order confirmation, fires purchase
css/style.css
js/products.js           the catalogue
js/cart.js               localStorage cart
js/tracking.js           all dataLayer pushes
js/shop.js               page logic
img/                     SVG product illustrations
```

## Setting up your own copy

1. Create a GTM web container and replace `GTM-XXXXXXX` in every `.html` file with your container ID:
   ```bash
   sed -i 's/GTM-XXXXXXX/GTM-YOURID/g' *.html        # Linux
   sed -i '' 's/GTM-XXXXXXX/GTM-YOURID/g' *.html     # macOS
   ```
2. In GTM, add a Google tag (your GA4 `G-` ID), one custom-event trigger per event above, and one GA4 Event tag per trigger with *Send Ecommerce data → Data Layer* ticked.
3. Publish the container and the site.
