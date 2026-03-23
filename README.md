# 🥤 Pepsi Max Prisjeger – Ålesund

Automatically finds the lowest prices for **Pepsi Max** across grocery stores in **Ålesund, Norway** using the [Kassalapp API](https://kassal.app/api).

## 🌐 Live Dashboard

👉 **[View the price dashboard](https://himmelfisk.github.io/pepsimax/)**

Prices are updated daily at 07:00 Norwegian time via GitHub Actions.

## 🏪 Stores Covered

Kiwi · Rema 1000 · Spar · Coop (Obs, Extra, Prix, Mega) · Meny · Europris · Bunnpris · Joker and more

## 🔧 How It Works

1. **GitHub Actions** runs `scripts/fetch-prices.js` daily
2. The script queries the Kassalapp API for Pepsi Max products and stores in Ålesund
3. Results are saved to `docs/data.json`
4. **GitHub Pages** serves a static HTML dashboard that reads `data.json`

## 🚀 Setup

1. **Add your Kassalapp API key as a repository secret:**
   - Go to **Settings → Secrets and variables → Actions**
   - Create a secret named `KASSAL_API_KEY`
   - Paste your API key (get one free at [kassal.app/api](https://kassal.app/api))

2. **Enable GitHub Pages:**
   - Go to **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: `main`, folder: `/docs`
   - Click **Save**

3. **Trigger the first run:**
   - Go to **Actions → Update Pepsi Max Prices**
   - Click **Run workflow**

## 📝 License

MIT
