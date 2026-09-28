# Victors Holdings — site photos

Every photo on the website is in this folder. **To replace a photo, save your new
photo here with exactly the same name** (delete the old one). `.jpg`, `.jpeg`,
`.png` and `.webp` all work. Rebuild / restart the site after adding files.

## Page photos

| File name | Where it appears | Best shape / size |
|---|---|---|
| `home-hero` | Homepage — big image at the top | Landscape, ~1920 × 1440 |
| `campaign-red-common-bricks-hero` | Campaign page `/red-common-bricks` — top image | Landscape, ~1920 × 1440 |
| `about` | About page banner | Wide landscape, ~1920 × 1080 |

## Product photos — up to 5 per product

Name them `product-<slug>-1` to `product-<slug>-5`:

- **`-1` is the main photo.** It's used on the product card and shown first on the product page.
- **`-2` to `-5` are extra angles.** They appear as clickable thumbnails under the main photo.
  Only the numbers that exist are shown, so 3 photos is fine.
- Photos of Red Common Bricks also appear as a photo strip on the campaign page when there are 2 or more.

| Product | File names |
|---|---|
| Red Common Bricks | `product-red-common-bricks-1` … `-5` |
| Pavers & Paving | `product-pavers-1` … `-5` |
| Sand | `product-sand-1` … `-5` |
| Quarry Products | `product-quarry-products-1` … `-5` |
| Cement & Other Materials | `product-cement-and-materials-1` … `-5` |

Suggested angles: close-up of the product · stacked/stockpiled in the yard ·
loaded on the delivery truck · delivered on a customer's site · finished job using it.

Best size: landscape, ~1600 × 1200. Keep files under ~800 KB.

## Logo

| File | Used for |
|---|---|
| `logo.jpeg` | Original logo (kept for reference) |
| `logo-horizontal.png` | Header and footer (trimmed, side-by-side, transparent) |
| `logo-stacked.png` | Trimmed original layout, transparent — for social/print use |

The browser-tab icon is `src/app/icon.png` (the building mark).

## Naming rules

- Lowercase, words separated by hyphens. One file per name (don't keep both `about.jpg` and `about.jpeg`).
- The product slug is the last part of the product's web address, e.g. `/products/pavers` → `product-pavers-1`.
- If a photo is missing, the site shows a brick/stone texture instead, so nothing breaks.

## Stock photos

Some photos are temporary openly licensed images, credited on the `/credits` page.
When you replace one with your own, delete its line in `src/lib/image-credits.ts`.
