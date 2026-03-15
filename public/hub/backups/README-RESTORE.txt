RESTAURATION DE L'ANCIENNE VERSION
===================================

Pour revenir à l'ancienne version (avant les améliorations SaaS premium) :

1. Copier pmhub-theme.css.backup vers themes/pmhub-theme.css
2. Copier pm-hub.html.backup vers pm-hub.html

Exemple (PowerShell, depuis public/hub) :
  Copy-Item backups\pmhub-theme.css.backup themes\pmhub-theme.css -Force
  Copy-Item backups\pm-hub.html.backup pm-hub.html -Force

Ces sauvegardes ont été créées le 14 mars 2025.
