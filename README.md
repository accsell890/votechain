# VoteChain India 🇮🇳

**Secure. Transparent. Tamper-Proof Voting powered by Blockchain.**

VoteChain India is a mobile-first prototype of a blockchain-based voting system designed for India. It demonstrates a government-grade voting experience with multi-layer authentication, identity verification and a simulated blockchain ledger.

> Developed by **GOVIND SANJAY**

## ✨ Features

- 📱 **Mobile OTP Login** — Primary authentication via mobile number + OTP (demo OTP: `123456`)
- 📧 **Email OTP Verification** — Optional secondary verification layer
- 🦊 **MetaMask Wallet Integration** — Optional Web3 wallet connection for transparency
- 🪪 **ID Verification (KYC)** — Upload Voter ID / Aadhaar with simulated AI verification
- 🗳️ **Blockchain Voting Simulation** — Vote records with transaction hash, block number & timestamp
- 🔍 **Blockchain Explorer** — View a live ledger of recent votes
- 📊 **Live Results & Countdown** — Real-time results dashboard with election countdown
- 🎨 **Indian Government Theme** — Saffron, white, green & blue palette

## 🛠️ Tech Stack

- React 18 + Vite 5 + TypeScript
- Tailwind CSS + shadcn/ui
- React Router, TanStack Query
- Web3 (window.ethereum / EIP-1193)

## 🚀 Run Locally

```bash
npm install
npm run dev
```

Open <http://localhost:8080>.

### Build for production

```bash
npm run build
npm run preview
```

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in optional API endpoints:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL for mobile OTP API (optional — falls back to demo `123456`) |
| `VITE_EMAIL_API` | Base URL for email OTP API (optional — falls back to demo `123456`) |

## ☁️ Deploy to Vercel

1. Push this repo to GitHub.
2. Visit <https://vercel.com/new> and import the repo.
3. Framework preset: **Vite**. Build command: `npm run build`. Output: `dist`.
4. Add environment variables (optional) in the Vercel dashboard.
5. Click **Deploy**.

SPA routing is handled automatically by Vercel for Vite projects.

## 📁 Project Structure

```
votechain-india/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   ├── hooks/
│   └── store/
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

## ⚠️ Disclaimer

This is a **prototype** for demonstration purposes only. No real blockchain transactions occur — all blockchain activity is simulated client-side.

---

Developed by **GOVIND SANJAY**