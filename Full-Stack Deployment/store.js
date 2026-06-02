const CART_KEY = "thiranex_cart_v1";

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));

export const store = {
  cart: loadCart(),
  filters: { category: "All", sort: "featured" }
};

export function addToCart(productId) {
  store.cart[productId] = (store.cart[productId] || 0) + 1;
  saveCart(store.cart);
}

export function removeFromCart(productId) {
  delete store.cart[productId];
  saveCart(store.cart);
}

export function setQty(productId, qty) {
  if (qty <= 0) delete store.cart[productId];
  else store.cart[productId] = qty;
  saveCart(store.cart);
}
