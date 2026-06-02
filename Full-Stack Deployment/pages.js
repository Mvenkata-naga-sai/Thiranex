import { products } from "./data/products.js";
import { addToCart, removeFromCart, setQty, store } from "./state/store.js";
import { appShell, renderProductCard, wireProductCardActions } from "./components.js";
import { navigate } from "./router.js";

const cartCount = () => Object.values(store.cart).reduce((a, b) => a + b, 0);
const cartTotal = () => Object.entries(store.cart).reduce((sum, [id, qty]) => {
  const p = products.find((x) => x.id === id);
  return p ? sum + p.price * qty : sum;
}, 0);

function filteredProducts() {
  let items = products.slice();
  if (store.filters.category !== "All") {
    items = items.filter((p) => p.category === store.filters.category);
  }
  if (store.filters.sort === "price-asc") items.sort((a, b) => a.price - b.price);
  if (store.filters.sort === "price-desc") items.sort((a, b) => b.price - a.price);
  if (store.filters.sort === "rating") items.sort((a, b) => b.rating - a.rating);
  return items;
}

function filtersPanel() {
  const categories = ["All", ...new Set(products.map((p) => p.category))];
  return `
    <aside class="filters card">
      <fieldset>
        <legend>Category</legend>
        ${categories.map((c) => `
          <label>
            <input type="radio" name="category" value="${c}" ${store.filters.category === c ? "checked" : ""} />
            ${c}
          </label>
        `).join("")}
      </fieldset>
      <fieldset>
        <legend>Sort</legend>
        <label><input type="radio" name="sort" value="featured" ${store.filters.sort === "featured" ? "checked" : ""} /> Featured</label>
        <label><input type="radio" name="sort" value="rating" ${store.filters.sort === "rating" ? "checked" : ""} /> Top rating</label>
        <label><input type="radio" name="sort" value="price-asc" ${store.filters.sort === "price-asc" ? "checked" : ""} /> Price: low to high</label>
        <label><input type="radio" name="sort" value="price-desc" ${store.filters.sort === "price-desc" ? "checked" : ""} /> Price: high to low</label>
      </fieldset>
    </aside>
  `;
}

export function renderCatalog(root) {
  const items = filteredProducts();
  const productMarkup = items.length
    ? `<section class="products">${items.map(renderProductCard).join("")}</section>`
    : `<p class="card empty">No products match current filters.</p>`;
  root.innerHTML = appShell(
    `<div class="layout">${filtersPanel()}<section>${productMarkup}</section></div>`,
    cartCount()
  );

  root.querySelectorAll("input[name='category']").forEach((el) => {
    el.addEventListener("change", () => {
      store.filters.category = el.value;
      renderCatalog(root);
    });
  });
  root.querySelectorAll("input[name='sort']").forEach((el) => {
    el.addEventListener("change", () => {
      store.filters.sort = el.value;
      renderCatalog(root);
    });
  });
  wireProductCardActions(root, (id) => {
    addToCart(id);
    renderCatalog(root);
  });
}

export function renderProduct(root, { id }) {
  const p = products.find((x) => x.id === id);
  if (!p) return renderNotFound(root);
  root.innerHTML = appShell(`
    <section class="card">
      <div class="row">
        <button class="btn btn-muted" id="backBtn">Back</button>
        <span class="pill-ok">${p.stock > 0 ? "In stock" : "Sold out"}</span>
      </div>
      <div class="layout" style="grid-template-columns:1fr 1fr;margin-top:1rem;">
        <img src="${p.image}" alt="${p.name}" style="width:100%;max-height:420px;object-fit:cover;border-radius:12px;" />
        <div>
          <p class="meta">${p.category} · ⭐ ${p.rating}</p>
          <h1>${p.name}</h1>
          <p>Built for this capstone storefront with practical UX and asset-optimized rendering.</p>
          <p class="price">$${p.price}</p>
          <button class="btn btn-primary" id="addBtn">Add to cart</button>
        </div>
      </div>
    </section>`, cartCount());
  root.querySelector("#backBtn").addEventListener("click", () => history.back());
  root.querySelector("#addBtn").addEventListener("click", () => {
    addToCart(id);
    renderProduct(root, { id });
  });
}

export function renderCart(root) {
  const rows = Object.entries(store.cart).map(([id, qty]) => ({ p: products.find((x) => x.id === id), qty })).filter((x) => x.p);
  root.innerHTML = appShell(`
    <section class="card">
      <div class="row">
        <h1 style="margin:0;">Your Cart</h1>
        <button class="btn btn-muted" id="continueBtn">Continue shopping</button>
      </div>
      ${rows.length ? `<div class="list">${rows.map(({ p, qty }) => `
        <article class="item">
          <img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" />
          <div>
            <div><strong>${p.name}</strong></div>
            <div class="meta">$${p.price} each</div>
          </div>
          <div class="row">
            <input type="number" min="1" value="${qty}" data-qty="${p.id}" style="width:64px;padding:.35rem;" />
            <button class="btn btn-muted" data-remove="${p.id}">Remove</button>
          </div>
        </article>`).join("")}</div>` : `<p class="empty">Your cart is empty.</p>`}
      <hr style="border:0;border-top:1px solid var(--line);margin:1rem 0;" />
      <div class="row">
        <strong>Total: $${cartTotal().toFixed(2)}</strong>
        <button class="btn btn-primary" ${rows.length ? "" : "disabled"}>Checkout</button>
      </div>
    </section>`, cartCount());

  root.querySelector("#continueBtn").addEventListener("click", () => navigate("/"));
  root.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromCart(btn.dataset.remove);
      renderCart(root);
    });
  });
  root.querySelectorAll("[data-qty]").forEach((input) => {
    input.addEventListener("change", () => {
      setQty(input.dataset.qty, Number(input.value));
      renderCart(root);
    });
  });
}

export function renderNotFound(root) {
  root.innerHTML = appShell(`
    <section class="card">
      <h1>404</h1>
      <p class="empty">The route you requested does not exist.</p>
      <button class="btn btn-primary" id="homeBtn">Go home</button>
    </section>`, cartCount());
  root.querySelector("#homeBtn").addEventListener("click", () => navigate("/"));
}
