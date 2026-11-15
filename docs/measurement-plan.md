# Measurement plan: Demo Shop Analytics

Plan for what the shop tracks, how, and which questions the data should answer.

| | |
|---|---|
| Site | https://jadhaidar2007.github.io/demo-shop-analytics/ |
| GA4 property | Demo Shop Analytics (web stream `Demo Shop Web`, `G-F0FQCC7MPM`) |
| GTM container | Demo Shop (`GTM-58JN5ND9`), export in [`gtm/demo-shop-container.json`](../gtm/demo-shop-container.json) |
| Currency | EUR |
| Data source | My own test traffic. Nothing here describes real users. |

## 1. Business question

Where do visitors drop out between looking at a product and buying it, and which step is worth fixing first?

## 2. Events

| Event | Fires when | Fired from | Why it matters |
|---|---|---|---|
| `view_item` | A product page loads | `Track.viewItem()` | Top of the funnel: product interest |
| `add_to_cart` | "Add to cart" is clicked | `Track.addToCart()` | Purchase intent |
| `begin_checkout` | Checkout page loads with a non-empty cart | `Track.beginCheckout()` | Commitment to buy |
| `purchase` | Thank-you page loads after an order (once per order) | `Track.purchase()` | Conversion and revenue |

All pushes live in [`js/tracking.js`](../js/tracking.js) and follow the [GA4 ecommerce spec](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce). `{ ecommerce: null }` is pushed before every event to clear stale items.

## 3. Parameters

| Parameter | Level | Events | Example | Notes |
|---|---|---|---|---|
| `currency` | event | all four | `EUR` | Required for revenue |
| `value` | event | all four | `118` | Sum of `price × quantity`, rounded to cents |
| `transaction_id` | event | `purchase` | `SP-MWFF7J0072` | Unique per order, used by GA4 to de-duplicate |
| `items[].item_id` | item | all four | `SP-002` | |
| `items[].item_name` | item | all four | `Hand Coffee Grinder` | |
| `items[].item_category` | item | all four | `Grinding` | |
| `items[].price` | item | all four | `59` | Unit price |
| `items[].quantity` | item | all four | `2` | |

Deliberately not collected: names, emails or addresses from the checkout form.

## 4. GTM setup

**Tags**

| Tag name | Type | Fires on |
|---|---|---|
| `Google tag - GA4` | Google tag (`G-F0FQCC7MPM`) | Initialization - All Pages |
| `GA4 - view_item` | GA4 Event, event name `view_item` | `CE - view_item` |
| `GA4 - add_to_cart` | GA4 Event, event name `add_to_cart` | `CE - add_to_cart` |
| `GA4 - begin_checkout` | GA4 Event, event name `begin_checkout` | `CE - begin_checkout` |
| `GA4 - purchase` | GA4 Event, event name `purchase` | `CE - purchase` |

All four event tags have **Send Ecommerce data → Data Layer** ticked, so `ecommerce.*` is read straight from the dataLayer without hand-built variables.

**Triggers**

| Trigger name | Type | Condition |
|---|---|---|
| `CE - view_item` | Custom Event | Event equals `view_item` |
| `CE - add_to_cart` | Custom Event | Event equals `add_to_cart` |
| `CE - begin_checkout` | Custom Event | Event equals `begin_checkout` |
| `CE - purchase` | Custom Event | Event equals `purchase` |

## 5. KPIs

| KPI | Definition | Where to read it |
|---|---|---|
| Product view → add-to-cart rate | users with `add_to_cart` ÷ users with `view_item` | Funnel exploration, step 1 → 2 |
| Cart → checkout rate | users with `begin_checkout` ÷ users with `add_to_cart` | Funnel step 2 → 3 |
| Checkout → purchase rate | users with `purchase` ÷ users with `begin_checkout` | Funnel step 3 → 4 |
| Overall conversion | users with `purchase` ÷ users with `view_item` | Funnel overall completion |
| Revenue | sum of `purchase.value` | Monetization → Ecommerce purchases |
| Average order value | revenue ÷ purchases | Monetization → Ecommerce purchases |
| Top products | items purchased by `item_name` | Ecommerce purchases, item view |

## 6. QA checklist

- [ ] GTM Preview: each of the four events appears and its `GA4 - …` tag fires once
- [ ] Data Layer tab: `ecommerce.items` has the expected product, price and quantity
- [ ] DebugView: `purchase` shows `transaction_id`, `value`, `currency = EUR` and items
- [ ] Refreshing the thank-you page does **not** send a second `purchase`
- [ ] Funnel exploration shows all four steps with plausible counts

## 7. Known limits

- Traffic is synthetic, so rates show the plumbing works, not how real users behave.
- No consent banner yet. A real EU site would need Consent Mode before loading the tag.
- Only the four required events are tracked. `view_item_list`, `select_item` and `remove_from_cart` are not.
