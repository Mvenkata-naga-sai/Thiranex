const routes = [];

export function registerRoute(pattern, handler) {
  routes.push({ pattern, handler });
}

function split(path) {
  return path.replace(/^#?\/?/, "").split("/").filter(Boolean);
}

function matchRoute(urlPath, patternPath) {
  const a = split(urlPath);
  const b = split(patternPath);
  if (a.length !== b.length) return null;
  const params = {};
  for (let i = 0; i < b.length; i += 1) {
    if (b[i].startsWith(":")) params[b[i].slice(1)] = a[i];
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

export function currentPath() {
  return location.hash.replace(/^#/, "") || "/";
}

export function navigate(path) {
  location.hash = path;
}

export function resolveRoute(root) {
  const path = currentPath();
  for (const route of routes) {
    const params = matchRoute(path, route.pattern);
    if (params) return route.handler({ root, params, path });
  }
  const fallback = routes.find((r) => r.pattern === "*");
  if (fallback) return fallback.handler({ root, params: {}, path });
}
