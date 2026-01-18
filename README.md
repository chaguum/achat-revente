# Dofus Trade Ledger

Single-user, desktop-first Angular app to track Dofus buy or craft operations through resale, with local IndexedDB storage and no backend.

## Stack

- Angular 21 (standalone components, signals, provideRouter)
- NgRx SignalStore
- Dexie (IndexedDB)
- PrimeNG + Tailwind CSS
- Chart.js
- SheetJS (xlsx)

## Run

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Fee policy and rounding

- Base HDV fee: 2%
- If priceModified is true: +1% (total 3%)
- Rounding strategy: `Math.floor(sellPrice * feeRate)` so fee is always an integer

## Import Excel (migration)

In Settings, use **Import Excel (.xlsx)**.

- Each sheet name becomes the server name.
- Expected columns (case-insensitive, spaces ignored):
  - `Date d'achat` -> boughtAt
  - `Item vendu ?` -> status (Oui => SOLD, Non => OPEN)
  - `Nom de l'item` -> itemName
  - `Prix Achat` -> buyPrice
  - `Prix Vente` -> sellPrice (only used when SOLD)
  - `Notes` -> comment
- For SOLD rows without a sale date in Excel, the app sets `soldAt = boughtAt`.
- No deduplication: each Excel row becomes one operation.

## Backup JSON

- **Export JSON** creates a full backup (operations + servers).
- **Import JSON** replaces the current DB (confirmation required).
- **Export CSV** is available for quick exports.

## GitHub Pages

The workflow at `.github/workflows/deploy.yml` builds the Angular app and deploys `dist/mon-projet-angular/browser` to GitHub Pages.

## Next steps

- [ ] Add your full server list in Settings
- [ ] Import the historical Excel file
- [ ] Review OPEN rows and add target sell prices when needed
- [ ] Push to GitHub and enable Pages in repository settings