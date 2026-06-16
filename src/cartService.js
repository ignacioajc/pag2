const CART_KEY = 'shop_cart_v1';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // ignore storage errors
  }
}

export function getCartItems() {
  return loadCart();
}

export function getCartCount() {
  return loadCart().reduce((total, item) => total + (item.qty || 1), 0);
}

export function addToCart(item) {
  const cart = loadCart();
  const existing = cart.find((entry) => entry.id === item.id);
  if (existing) {
    existing.qty = (existing.qty || 1) + (item.qty || 1);
  } else {
    cart.push({ ...item, qty: item.qty || 1 });
  }
  saveCart(cart);
  return cart;
}

export function changeCartQty(id, delta) {
  const cart = loadCart();
  const next = cart.map((entry) => {
    if (entry.id !== id) return entry;
    return { ...entry, qty: Math.max(1, (entry.qty || 1) + delta) };
  });
  saveCart(next);
  return next;
}

export function removeFromCart(id) {
  const cart = loadCart();
  const next = cart.filter((entry) => entry.id !== id);
  saveCart(next);
  return next;
}

export function clearCart() {
  saveCart([]);
  return [];
}
