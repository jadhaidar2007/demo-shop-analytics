// All analytics lives in this one file.
// Pages never call dataLayer.push directly, they call Track.something().
//
// Format follows Google's GA4 ecommerce spec:
// https://developers.google.com/analytics/devguides/collection/ga4/ecommerce

window.dataLayer = window.dataLayer || [];

// open the page with ?debug=1 to see every push in the browser console
const TRACK_DEBUG = /[?&]debug=1/.test(location.search);

function pushEcommerce(eventName, ecommerce) {
  // GA4 docs: clear the previous ecommerce object first,
  // otherwise old items can leak into the next event.
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event: eventName, ecommerce: ecommerce });
  if (TRACK_DEBUG) console.log('[dataLayer]', eventName, ecommerce);
}

function toItem(product, qty) {
  return {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category,
    price: product.price,
    quantity: qty
  };
}

function sumValue(lines) {
  // round to cents so we never send 119.00000000000001
  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  return Math.round(total * 100) / 100;
}

const Track = {
  viewItem(product) {
    pushEcommerce('view_item', {
      currency: CURRENCY,
      value: product.price,
      items: [toItem(product, 1)]
    });
  },

  addToCart(product, qty) {
    pushEcommerce('add_to_cart', {
      currency: CURRENCY,
      value: Math.round(product.price * qty * 100) / 100,
      items: [toItem(product, qty)]
    });
  },

  // lines = [{ product, qty }]
  beginCheckout(lines) {
    pushEcommerce('begin_checkout', {
      currency: CURRENCY,
      value: sumValue(lines),
      items: lines.map((l) => toItem(l.product, l.qty))
    });
  },

  purchase(transactionId, lines) {
    pushEcommerce('purchase', {
      transaction_id: transactionId,
      currency: CURRENCY,
      value: sumValue(lines),
      items: lines.map((l) => toItem(l.product, l.qty))
    });
  }
};
