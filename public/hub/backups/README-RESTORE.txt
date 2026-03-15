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
Pour restaurer l’ancienne page Centre IA :
  Copy-Item backups\pm-hub-ai.html.backup-ai-refactor pm-hub-ai.html -Force
