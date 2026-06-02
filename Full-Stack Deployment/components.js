import { navigate, currentPath } from "./router.js";

export function appShell(content, cartCount) {
  const path = currentPath();
  return `
    <div class="shell">
      <header class="topbar">
        <a class="brand" href="#/">Thiranex Storefront</a>
        <nav class="nav" aria-label="Main">
          <a class="${path === "/" ? "active" : ""}" href="#/">Catalog</a>
          <a class="${path === "/cart" ? "active" : ""}" href="#/cart">Cart <span class="badge">${cartCount}</span></a>
        </nav>
      </header>
      <main id="app-content">${content}</main>
      <footer class="footer">Optimized, route-driven capstone build.</footer>
    </div>
  `;
}

export function renderProductCard(p) {
  return `
    <article class="product">
      <img
        src="${p.image}"
        srcset="${p.image}&dpr=1 1x, ${p.image}&dpr=2 2x"
        sizes="(max-width: 680px) 100vw, 230px"
        loading="lazy"
        decoding="async"
        alt="${p.name}"
      />
      <div class="product-body">
        <div class="meta">${p.category} · ⭐ ${p.rating}</div>
        <h3>${p.name}</h3>
        <p class="price">$${p.price}</p>
        <div class="row">
          <button class="btn btn-primary" data-action="add" data-id="${p.id}">Add to cart</button>
          <button class="btn btn-muted" data-action="view" data-id="${p.id}">Details</button>
        </div>
      </div>
    </article>
  `;
}

export function wireProductCardActions(root, onAdd) {
  root.querySelectorAll("[data-action='add']").forEach((btn) => {
    btn.addEventListener("click", () => onAdd(btn.dataset.id));
  });
  root.querySelectorAll("[data-action='view']").forEach((btn) => {
    btn.addEventListener("click", () => navigate(`/product/${btn.dataset.id}`));
  });
}
