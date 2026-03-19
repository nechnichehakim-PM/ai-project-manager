# AI Project Manager — Premium Dashboard

Dark tech / AI command center dashboard for project managers.  
Inspired by Linear, Vercel, Stripe, OpenAI.

## How to run

Open **index.html** in a modern browser (Chrome, Edge, Firefox).  
For best experience, use a local server (e.g. Live Server in VS Code, or `npx serve .`).

## Structure

- **index.html** — Single-page app: sidebar, top bar, main views
- **styles.css** — Design system (colors, typography, glassmorphism, components)
- **app.js** — View switching, AI panel toggle, WBS expand, health gauge

## Views

- **Dashboard** — Progress, budget, risks, tasks, health score (circular gauge), AI recommendations, team workload
- **Projects** — Project creation wizard (CTA)
- **WBS Builder** — Hierarchical tree (Initialization, Planning, Execution, Monitoring, Closure)
- **Planning** — Gantt preview with bars and critical path
- **Risks** — Heatmap matrix (Probability vs Impact) + risk cards
- **Budget** — Allocated / Consumed / Forecast with animated bars
- **Resources** — Placeholder
- **Reports** — Placeholder
- **AI Assistant** — Link to floating panel
- **Settings** — Placeholder

## AI panel

Click the **◆** button in the top bar to open the floating AI assistant panel (Generate WBS, Analyze risks, Suggest planning, Meeting summaries, Reports).

## Design tokens

- Background: `#0B0F19` · Surface: `#121826` · Card: `#1B2233`
- Primary: `#4F8CFF` · AI: `#00E5A8` · Warning: `#FFB020` · Danger: `#FF4D6D`
- Fonts: Space Grotesk (headings), Inter (body), JetBrains Mono (data)
