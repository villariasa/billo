# <img src="icons/document-text.svg" width="28" height="28" align="center" /> Zynqelo

<p align="center">
  <img src="./public/zynqelo.png" alt="Zynqelo Logo" width="280" />
</p>

<p align="center">
  <strong>The modern, privacy-first invoice and thermal receipt generator running 100% in your browser.</strong><br>
  No accounts. No server backend. No subscriptions. Zero data tracking.
</p>

<p align="center">
  <a href="https://villariasa.github.io/zynqelo/"><img src="https://img.shields.io/badge/Live_Demo-villariasa.github.io%2Fzynqelo-blue?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Demo" /></a>
  <a href="https://github.com/villariasa/zynqelo/stargazers"><img src="https://img.shields.io/github/stars/villariasa/zynqelo?style=for-the-badge&logo=github&color=gold" alt="GitHub Stars" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License: MIT" /></a>
  <a href="https://svelte.dev/"><img src="https://img.shields.io/badge/Svelte_5-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="Svelte 5" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" /></a>
</p>

---

> [!TIP]
> **Love Zynqelo? Please star the repository on GitHub! It helps more developers, freelancers, and small business owners discover this free tool.**

---

## <img src="icons/sparkles.svg" width="22" height="22" align="center" /> Why Zynqelo?

Most invoice platforms require user logins, collect your client records into remote databases, lock features behind paid monthly tiers, or brand your documents with intrusive watermarks.

**Zynqelo is built differently:** A **pure client-side static web application**. Every byte of your invoice data, receipt numbers, and line items stays strictly inside your device's browser memory.

| Feature | Zynqelo | Traditional Cloud Invoicers |
| :--- | :---: | :---: |
| **Account Required** | **None** | Yes (Email, Password, SSO) |
| **Monthly Pricing** | **100% Free Forever** | $15 – $60 / month |
| **Data Privacy** | **Zero Server Storage** | Stored on remote corporate clouds |
| **58mm / 80mm Thermal POS Receipts** | **Native Support** | None or expensive addon |
| **On-Device OCR Receipt Cloner** | **Built-In (Tesseract.js)** | Paid enterprise only |
| **Offline Draft Persistence** | **Yes (`localStorage`)** | Requires constant internet |
| **Instant High-Res PDF Export** | **Pixel-Perfect** | Watermarked / Export limits |

---

## <img src="icons/bolt.svg" width="22" height="22" align="center" /> Standout Features

- <img src="icons/receipt-percent.svg" width="16" height="16" align="center" /> **Native Thermal POS Receipt Engine**: Effortlessly design and print 58mm and 80mm cashier receipts with monospace typography, dividers, Cashier ID, Transaction #, TIN, custom fill-in lines, QR codes, and cashier footers.
- <img src="icons/document-text.svg" width="16" height="16" align="center" /> **Full Document Size Range**: Generate standard invoices for A4, A5, A6, US Letter, Half Letter, and Legal.
- <img src="icons/window.svg" width="16" height="16" align="center" /> **Real-Time Paper Canvas**: Live preview mirrors real-world paper proportions and calculates totals dynamically as you type.
- <img src="icons/magnifying-glass.svg" width="16" height="16" align="center" /> **On-Device Vision & OCR Scanner**: Snap or upload a photo of any receipt — Zynqelo parses the structure entirely client-side using WebAssembly and autofills line items.
- <img src="icons/currency-dollar.svg" width="16" height="16" align="center" /> **Global Currencies & Tax Engine**: Supports USD ($), EUR (€), GBP (£), PHP (₱), and custom currencies with customizable flat or percentage-based tax and discounts.
- <img src="icons/swatch.svg" width="16" height="16" align="center" /> **Brand Customization**: Upload company logos, choose signature typography (Inter, Typewriter, Georgia, Arial, Times New Roman), and toggle custom signature lines.
- <img src="icons/archive-box.svg" width="16" height="16" align="center" /> **Automatic Local Drafts**: Automatic background saving to your local browser storage so accidental reloads never lose your work.
- <img src="icons/printer.svg" width="16" height="16" align="center" /> **One-Click PDF Export & Clean Hardware Print**: Download vector-crisp `invoice-<number>.pdf` or print directly via `Ctrl + P`.

---

## <img src="icons/globe-alt.svg" width="22" height="22" align="center" /> Live Demo

Launch Zynqelo in your browser right now:
**[Launch Zynqelo Live App](https://villariasa.github.io/zynqelo/)**

---

## <img src="icons/wrench-screwdriver.svg" width="22" height="22" align="center" /> Modern Tech Stack

- **Framework**: [Svelte 5](https://svelte.dev/) (modern runes reactivity system)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styles**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Icons**: [Lucide Svelte](https://lucide.dev/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas-pro](https://github.com/niklasvh/html2canvas)
- **Computer Vision / OCR**: [Tesseract.js](https://tesseract.projectnaptha.com/)
- **UI Toasts**: [svelte-sonner](https://svelte-sonner.vercel.app/)

---

## <img src="icons/command-line.svg" width="22" height="22" align="center" /> Quick Start & Local Setup

```bash
# Clone the repository
git clone https://github.com/villariasa/zynqelo.git

# Enter the project directory
cd zynqelo

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## <img src="icons/cube.svg" width="22" height="22" align="center" /> Deployment

Zynqelo is 100% static with zero backend requirements.

### One-Command GitHub Pages Deployment:
```bash
npm run deploy
```

---

## <img src="icons/user-group.svg" width="22" height="22" align="center" /> Contributing & Community

Feedback, feature requests, and pull requests are welcomed!

1. Fork the Project (`https://github.com/villariasa/zynqelo/fork`)
2. Create your Feature Branch (`git checkout -b feature/NewFeature`)
3. Commit your Changes (`git commit -m 'feat: Add NewFeature'`)
4. Push to the Branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## <img src="icons/document-text.svg" width="22" height="22" align="center" /> License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

<p align="center">
  Crafted with care by <a href="https://github.com/villariasa">villariasa</a><br>
  <strong>Don't forget to star Zynqelo on GitHub if you enjoy using it!</strong>
</p>
