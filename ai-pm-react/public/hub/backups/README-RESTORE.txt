RESTAURATION DE L'ANCIENNE VERSION
===================================

Pour revenir à l'ancienne version (avant les améliorations SaaS premium) :

1. Copier pmhub-theme.css.backup vers themes/pmhub-theme.css
2. Copier pm-hub.html.backup vers pm-hub.html

Exemple (PowerShell, depuis public/hub) :
  Copy-Item backups\pmhub-theme.css.backup themes\pmhub-theme.css -Force
  Copy-Item backups\pm-hub.html.backup pm-hub.html -Force

Ces sauvegardes ont été créées le 14 mars 2025.

--- Backup v2 (style SaaS analytics) ---
Fichiers : pmhub-theme.css.backup-v2, pm-hub.html.backup-v2
Pour restaurer cette version :
  Copy-Item backups\pmhub-theme.css.backup-v2 themes\pmhub-theme.css -Force
  Copy-Item backups\pm-hub.html.backup-v2 pm-hub.html -Force

--- Backup Centre IA (refonte UX Human first / AI optional) ---
Fichier : pm-hub-ai.html.backup-ai-refactor
Pour restaurer l'ancienne page Centre IA :
  Copy-Item backups\pm-hub-ai.html.backup-ai-refactor pm-hub-ai.html -Force

--- Backup plateforme PMO (avant dashboards / Portfolio / Budget / COMEX) ---
Dossier : backups/pmhub-platform-backup/
Contient : pmhub-nav-context.js, pmhub-data.js, themes/pmhub-theme.css, pm-hub.html, pm-hub-ai.html, pm-hub-raid.html, pm-hub-gantt.html, pm-hub-resources.html, pm-hub-report.html, pm-hub-settings.html, pm-hub-transverse.html, pm-hub-project.html, pm-hub-templates.html, pm-hub-kanban.html, pm-hub-wizard.html, index.html
Pour restaurer (depuis public/hub) :
  Copy-Item backups\pmhub-platform-backup\pmhub-nav-context.js . -Force
  Copy-Item backups\pmhub-platform-backup\pmhub-data.js . -Force
  Copy-Item backups\pmhub-platform-backup\themes\pmhub-theme.css themes\ -Force
  Puis copier les fichiers HTML depuis backups\pmhub-platform-backup\ vers . (pm-hub.html, pm-hub-ai.html, etc.).
  Optionnel : supprimer pm-hub-portfolio.html, pm-hub-executive.html, pm-hub-budget.html, pm-hub-governance.html, pm-hub-knowledge.html et pmhub-sidebar.js si vous revenez à l’ancienne structure.
