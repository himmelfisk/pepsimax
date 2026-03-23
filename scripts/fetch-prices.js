/**
 * Pepsi Max Price Finder – Ålesund, Norway
 *
 * Fetches prices from the Kassalapp API and writes results to docs/data.json
 * for the GitHub Pages dashboard to consume.
 *
 * Run via GitHub Actions with KASSAL_API_KEY stored as a repository secret.
 */

const fs = require("fs");
const path = require("path");

const API_BASE = "https://kassal.app/api/v1";
const API_KEY = process.env.KASSAL_API_KEY;

if (!API_KEY) {
  console.error("❌ Missing KASSAL_API_KEY environment variable.");
  process.exit(1);
}

async function apiGet(endpoint, params = {}) {
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText} – ${await res.text()}`);
  }

  return res.json();
}

async function getStoresInAalesund() {
  const data = await apiGet("/physical-stores", {
    search: "Ålesund",
    size: 100,
  });
  return data.data ?? [];
}

async function searchPepsiMax() {
  const data = await apiGet("/products", {
    search: "Pepsi Max",
    size: 80,
  });
  return data.data ?? [];
}

function safePrice(val) {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

async function main() {
  console.log("🛒 Fetching Pepsi Max prices for Ålesund...\n");

  const [stores, products] = await Promise.all([
    getStoresInAalesund(),
    searchPepsiMax(),
  ]);

  console.log(`📍 Found ${stores.length} stores near Ålesund`);
  console.log(`🥤 Found ${products.length} Pepsi Max products\n`);

  const priceRows = [];

  for (const product of products) {
    const currentPrice = product.current_price;
    if (!currentPrice) continue;

    const price = safePrice(currentPrice.price);
    if (price <= 0) continue; // Skip entries with no valid price

    const unitPriceRaw = currentPrice.unit_price;
    const unitPrice = unitPriceRaw != null ? safePrice(unitPriceRaw) : null;

    priceRows.push({
      productName: product.name ?? "Unknown",
      brand: product.brand ?? "",
      image: product.image ?? null,
      store: currentPrice.store?.name ?? product.store?.name ?? "Unknown",
      storeGroup: currentPrice.store?.group ?? product.store?.group ?? "",
      price: price,
      unitPrice: unitPrice,
      unitPriceUnit: currentPrice.unit_price_quantity_unit ?? "stk",
    });
  }

  priceRows.sort((a, b) => a.price - b.price);

  const output = {
    lastUpdated: new Date().toISOString(),
    location: "Ålesund, Norway",
    totalStores: stores.length,
    totalProducts: priceRows.length,
    prices: priceRows,
    stores: stores.map((s) => ({
      id: s.id,
      name: s.name,
      group: s.group ?? "",
      address: s.address ?? "",
      position: s.position ?? null,
    })),
  };

  const docsDir = path.join(__dirname, "..", "docs");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const outPath = path.join(docsDir, "data.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");

  console.log(`✅ Wrote ${priceRows.length} price entries to ${outPath}`);
  if (priceRows.length > 0) {
    const cheapest = priceRows[0];
    console.log(`🏆 Cheapest: ${cheapest.productName} – ${cheapest.price.toFixed(2)} kr at ${cheapest.store}`);
  }
}

main().catch((err) => {
  console.error("💥 Error:", err.message);
  process.exit(1);
});
