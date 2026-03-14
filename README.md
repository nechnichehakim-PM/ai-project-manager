# AI Project Manager — React + Tailwind

Premium AI-powered project management dashboard built with **React**, **Vite**, and **Tailwind CSS**.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Structure

- **`src/components/layout`** — `AppLayout`, `Sidebar`, `TopBar`
- **`src/components/ui`** — `GlassCard`, `PageHeader`, `ProgressBar`
- **`src/components/dashboard`** — `StatCard`, `HealthGauge`, `HealthScores`, `AIRecommendations`, `TeamWorkload`, `TaskCompletionByPhase`
- **`src/components/wbs`** — `WBSTree` (expand/collapse)
- **`src/components/planning`** — `GanttPreview` (bars, critical path, milestone)
- **`src/components/risks`** — `RiskMatrix` (5×5), `RiskCards`
- **`src/components/budget`** — `BudgetCards`
- **`src/components/ai`** — `AIFloatingPanel`
- **`src/views`** — One view per section (Dashboard, Projects, WBS, Planning, Risks, Budget, Resources, Reports, AI Assistant, Settings)

Design tokens (colors, fonts) match the reference in `ai-pm/`: bg `#0B0F19`, surface `#121826`, card `#1B2233`, primary `#4F8CFF`, AI `#00E5A8`, etc.
