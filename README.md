# Billo 🧾⚡

<p align="center">
  <img src="./public/favicon.svg" alt="Billo Logo" width="80" height="80" />
</p>

<p align="center">
  <strong>The modern, privacy-first invoice and receipt generator that runs 100% in your browser.</strong><br>
  No accounts. No backend. No monthly fees. Zero data tracking.
</p>

<p align="center">
  <a href="https://villariasa.github.io/billo/"><img src="https://img.shields.io/badge/🚀_Live_Demo-villariasa.github.io%2Fbillo-blue?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Demo" /></a>
  <a href="https://github.com/villariasa/billo/stargazers"><img src="https://img.shields.io/github/stars/villariasa/billo?style=for-the-badge&logo=github&color=gold" alt="GitHub Stars" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License: MIT" /></a>
  <a href="https://svelte.dev/"><img src="https://img.shields.io/badge/Svelte_5-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="Svelte 5" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" /></a>
</p>

---

> [!TIP]
> **⭐ If you find Billo useful or inspiring, please give it a star on GitHub! It helps the project reach more creators, small business owners, and developers.**

---

## 🌟 Why Billo?

Most invoice generators require signups, store your customer records in proprietary databases, charge recurring subscriptions, or watermark your PDFs. 

**Billo is different:** It is built from the ground up as a **pure client-side static web application**. Every byte of your invoice and receipt data remains strictly inside your own browser.

| Feature | Billo | Traditional Invoice Apps |
| :--- | :---: | :---: |
| **Account Required** | ❌ **No** | ✅ Yes |
| **Monthly Subscription** | ❌ **Free Forever** | 💳 $10 - $50 / mo |
| **Data Privacy** | 🔒 **100% On-Device** | ☁️ Stored on remote servers |
| **58mm / 80mm Thermal POS Receipts** | ✅ **Native Support** | ❌ Rare / Extra Add-on |
| **AI / On-Device OCR Scanner** | ✅ **Included** | ❌ Paid Tier Only |
| **Offline / Local Drafts** | ✅ **Yes (localStorage)** | ❌ Cloud-dependent |
| **Instant PDF Export** | ✅ **Pixel-Perfect** | ⚠️ Watermarked / Limited |

---

## ✨ Key Features

- **📑 True-to-Proportion Live Preview**: Real-time interactive document canvas with accurate print dimensions as you type.
- **🧾 Thermal POS Receipt Mode**: Custom 58mm and 80mm receipt layouts with authentic monospace typography, dotted dividers, Cashier ID, Transaction #, TIN, custom fill-in lines, QR codes, and cashier footer notes.
- **📄 Standard Invoice Paper Sizes**: A4, A5, A6, Letter, Half Letter, and Legal.
- **🔍 On-Device OCR Receipt Cloner**: Upload a smartphone photo of an existing receipt and Billo extracts the data client-side using Tesseract.js to match the structure without uploading your image to any server.
- **💰 Multi-Currency & Calculations**: Support for PHP (₱), USD ($), EUR (€), GBP (£), with dynamic tax and discount calculations (flat rate or percentage).
- **🎨 Brand Customization**: Upload your company logo, choose custom typography (Inter, Typewriter, Georgia, Arial, Times New Roman), and customize line-item details.
- **💾 Automatic Draft Recovery**: Seamlessly stores your current document in `localStorage` so you never lose work on accidental refreshes.
- **🖨️ One-Click PDF Export & Clean Print**: Generates high-resolution `invoice-<number>.pdf` or clean hardware printer output via `Ctrl + P`.

---

## 🚀 Live Demo

Experience Billo right now in your browser:
👉 **[Launch Live App](https://villariasa.github.io/billo/)**

---

## 🛠️ Tech Stack

- **Framework**: [Svelte 5](https://svelte.dev/) (leveraging latest runes & reactivity)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Icons**: [Lucide Svelte](https://lucide.dev/)
- **Document Engine**: [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas-pro](https://github.com/niklasvh/html2canvas)
- **On-Device Vision / OCR**: [Tesseract.js](https://tesseract.projectnaptha.com/)
- **Notifications**: [svelte-sonner](https://svelte-sonner.vercel.app/)

---

## 💻 Quick Start & Local Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/villariasa/billo.git

# Enter project directory
cd billo

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Vite dev server with hot module replacement |
| `npm run build` | Compiles production-ready static assets into `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run check` | Runs Svelte and TypeScript type validation |

---

## 📦 Deployment

Billo is 100% static and zero-dependency at runtime. You can host it anywhere for free:

### Deploy to GitHub Pages (Automated)
This repository includes a ready-to-use GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Simply push to the `main` branch, and GitHub will build and publish your app automatically.

### Deploy to Vercel / Netlify
1. Connect your GitHub repository.
2. Build Command: `npm run build`
3. Output Directory: `dist`

---

## 🤝 Contributing

Contributions, feature suggestions, and bug reports are warmly welcome!

1. Fork the Project (`https://github.com/villariasa/billo/fork`)
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/villariasa">villariasa</a><br>
  <strong>Don't forget to ⭐ star the repository if you enjoyed using Billo!</strong>
</p>
