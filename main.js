import { registerRoute, resolveRoute } from "./router.js";
import { renderCatalog, renderProduct, renderCart, renderNotFound } from "./pages.js";

const root = document.querySelector("#app");

registerRoute("/", ({ root: outlet }) => renderCatalog(outlet));
registerRoute("/product/:id", ({ root: outlet, params }) => renderProduct(outlet, params));
registerRoute("/cart", ({ root: outlet }) => renderCart(outlet));
registerRoute("*", ({ root: outlet }) => renderNotFound(outlet));

window.addEventListener("hashchange", () => resolveRoute(root));
window.addEventListener("DOMContentLoaded", () => resolveRoute(root));
