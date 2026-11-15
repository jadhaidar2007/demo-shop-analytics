// Tiny cart kept in localStorage. Nothing fancy.
// A "line" is just { id, qty }.

const CART_KEY = 'slowpour_cart';

const euro = (n) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: CURRENCY }).format(n);

const Cart = {
  read() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  write(lines) {
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
    Cart.updateBadge();
  },

  add(id, qty) {
    const lines = Cart.read();
    const found = lines.find((l) => l.id === id);
    if (found) found.qty += qty;
    else lines.push({ id, qty });
    Cart.write(lines);
  },

  setQty(id, qty) {
    let lines = Cart.read();
    lines.forEach((l) => {
      if (l.id === id) l.qty = qty;
    });
    lines = lines.filter((l) => l.qty > 0);
    Cart.write(lines);
  },

  clear() {
    Cart.write([]);
  },

  // lines joined with product data: [{ product, qty }]
  detailed() {
    return Cart.read()
      .map((l) => ({ product: PRODUCTS[l.id], qty: l.qty }))
      .filter((l) => l.product);
  },

  total() {
    return Cart.detailed().reduce((sum, l) => sum + l.product.price * l.qty, 0);
  },

  count() {
    return Cart.read().reduce((n, l) => n + l.qty, 0);
  },

  updateBadge() {
    const el = document.getElementById('cart-count');
    if (el) el.textContent = Cart.count();
  }
};
