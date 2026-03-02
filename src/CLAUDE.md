# ReVolt Certificate Portal

## Project Purpose
A client-facing web app that displays two official documents:
1. **Waste Transfer Certificate (WTC)** — tracks solar panel custody during transport
2. **Certificate of Circularity (CoC)** — documents material recovery outcomes and carbon savings

Used in sales demos and sent to clients as shareable links.

## Brand
- Primary: #656096 (violet)
- Dark: #43435B (navy text)
- Accent: #78DDFC (cyan)
- Logo: SVG circle-of-dots icon (see RevoltIcon component in App.jsx)

## Stack
- React + Vite
- Recharts (donut chart)
- No backend — all mock data in App.jsx
- Deploy target: Vercel

## Key Files
- `src/App.jsx` — everything lives here (data + components)
- `public/` — place real logo assets here when ready

## Current Status
Mock data only. Next step: wire to real Electra intake data via API.