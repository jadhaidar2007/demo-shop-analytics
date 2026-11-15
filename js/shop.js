// Page logic. Each page sets <body data-page="..."> and we branch on that.

const ORDER_KEY = 'slowpour_last_order';

const $ = (sel) => document.querySelector(sel);

document.addEventListener('DOMContentLoaded', () => {
  Cart.updateBadge();

  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'product') initProduct();
  if (page === 'cart') initCart();
  if (page === 'checkout') initCheckout();
  if (page === 'thanks') initThanks();
});

/* ---------- home ---------- */

function initHome() {
  $('#product-grid').innerHTML = Object.values(PRODUCTS)
    .map(
      (p) => `
      <a class="card" href="${p.url}">
        <img src="${p.img}" alt="${p.name}" width="400" height="400">
        <div class="body">
          <p class="eyebrow">${p.category}</p>
          <h3>${p.name}</h3>
          <p class="price">${euro(p.price)}</p>
        </div>
      </a>`
    )
    .join('');
}

/* ---------- product page ---------- */

function initProduct() {
  const product = PRODUCTS[document.body.dataset.productId];
  if (!product) return;

  document.title = product.name + ' · Slow Pour';
  $('#p-img').src = product.img;
  $('#p-img').alt = product.name;
  $('#p-cat').textContent = product.category;
  $('#p-name').textContent = product.name;
  $('#p-price').textContent = euro(product.price);
  $('#p-desc').textContent = product.blurb;
  $('#p-specs').innerHTML = product.specs.map((s) => `<li>${s}</li>`).join('');

  // GA4: view_item
  Track.viewItem(product);

  $('#add-btn').addEventListener('click', () => {
    const qty = Math.min(9, Math.max(1, parseInt($('#qty').value, 10) || 1));
    Cart.add(product.id, qty);

    // GA4: add_to_cart
    Track.addToCart(product, qty);

    $('#added-msg').hidden = false;
  });
}

/* ---------- cart ---------- */

function initCart() {
  drawCart();

  $('#cart-root').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    const line = Cart.read().find((l) => l.id === id);
    if (!line) return;

    if (btn.dataset.action === 'inc') Cart.setQty(id, Math.min(9, line.qty + 1));
    if (btn.dataset.action === 'dec') Cart.setQty(id, line.qty - 1);
    if (btn.dataset.action === 'remove') Cart.setQty(id, 0);
    drawCart();
  });
}

function drawCart() {
  const lines = Cart.detailed();
  const root = $('#cart-root');

  if (!lines.length) {
    root.innerHTML = `
      <p class="empty">Your cart is empty.</p>
      <a class="btn" href="index.html">Browse the gear</a>`;
    return;
  }

  root.innerHTML = `
    <div class="lines">
      ${lines
        .map(
          ({ product: p, qty }) => `
        <div class="line">
          <img src="${p.img}" alt="" width="72" height="72">
          <div class="line-info">
            <a href="${p.url}"><strong>${p.name}</strong></a>
            <span class="price">${euro(p.price)}</span>
          </div>
          <div class="qty-ctl">
            <button data-action="dec" data-id="${p.id}" aria-label="One less">−</button>
            <span>${qty}</span>
            <button data-action="inc" data-id="${p.id}" aria-label="One more">+</button>
          </div>
          <div class="line-total">${euro(p.price * qty)}</div>
          <button class="link-btn" data-action="remove" data-id="${p.id}">Remove</button>
        </div>`
        )
        .join('')}
    </div>
    <div class="cart-footer">
      <p>Total <strong>${euro(Cart.total())}</strong></p>
      <a class="btn" href="checkout.html">Go to checkout</a>
    </div>`;
}

/* ---------- checkout ---------- */

function initCheckout() {
  const lines = Cart.detailed();

  // nothing to check out? back to the cart
  if (!lines.length) {
    location.replace('cart.html');
    return;
  }

  $('#summary').innerHTML =
    lines
      .map(
        ({ product: p, qty }) =>
          `<li><span>${qty} × ${p.name}</span><span>${euro(p.price * qty)}</span></li>`
      )
      .join('') + `<li class="sum-total"><span>Total</span><span>${euro(Cart.total())}</span></li>`;

  // GA4: begin_checkout
  Track.beginCheckout(lines);

  $('#checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();

    // not a real order, just something unique for transaction_id
    const orderId = 'SP-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10);

    // keep the order for the thank-you page. We store ids + qty only, no form data,
    // because we don't want names or emails anywhere near analytics.
    sessionStorage.setItem(
      ORDER_KEY,
      JSON.stringify({ id: orderId, lines: Cart.read(), tracked: false })
    );
    Cart.clear();
    location.href = 'thank-you.html';
  });
}

/* ---------- thank you ---------- */

function initThanks() {
  const raw = sessionStorage.getItem(ORDER_KEY);
  const root = $('#thanks-root');

  if (!raw) {
    root.innerHTML = `
      <h1>Nothing to see here</h1>
      <p>There's no recent order in this browser session.</p>
      <a class="btn" href="index.html">Back to the shop</a>`;
    return;
  }

  const order = JSON.parse(raw);
  const lines = order.lines
    .map((l) => ({ product: PRODUCTS[l.id], qty: l.qty }))
    .filter((l) => l.product);

  root.innerHTML = `
    <p class="eyebrow">Order ${order.id}</p>
    <h1>Thanks for your (fake) order!</h1>
    <p>No coffee gear is on its way, but a purchase event is.</p>
    <ul class="summary">
      ${lines
        .map(
          ({ product: p, qty }) =>
            `<li><span>${qty} × ${p.name}</span><span>${euro(p.price * qty)}</span></li>`
        )
        .join('')}
    </ul>
    <a class="btn" href="index.html">Keep browsing</a>`;

  // GA4: purchase. The flag stops a page refresh from counting the same order twice.
  if (!order.tracked) {
    Track.purchase(order.id, lines);
    order.tracked = true;
    sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
  }
}
