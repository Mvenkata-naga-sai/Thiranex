# Thiranex Storefront Capstone

A modular, client-routed e-commerce product catalog built with vanilla ES modules.

## Features

- Modular architecture (`data`, `state`, `router`, `components`, `pages`)
- Client-side routing (`#/`, `#/product/:id`, `#/cart`)
- Product filtering and sorting
- Persistent cart with `localStorage`
- Performance-oriented assets:
  - lazy-loaded images
  - responsive `srcset`
  - optimized Unsplash image query params
  - lightweight dependency-free bundle

## Project Structure

```
ecommerce-catalog-capstone/
├─ index.html
├─ src/
│  ├─ main.js
│  ├─ router.js
│  ├─ components.js
│  ├─ pages.js
│  ├─ styles.css
│  ├─ data/products.js
│  └─ state/store.js
├─ vercel.json
├─ netlify.toml
└─ render.yaml
```

## Run Locally

Use any static server:

```bash
# from ecommerce-catalog-capstone
npx serve .
```

Open `http://localhost:3000`.

## Deploy

### Vercel

```bash
npx vercel --prod
```

### Netlify

```bash
npx netlify deploy --prod --dir .
```

### Render

Create a new **Static Site** and point it to this directory/repository. `render.yaml` is included for rewrite behavior.

### Author

Venkata Naga Sai  

