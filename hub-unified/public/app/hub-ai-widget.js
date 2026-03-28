/**
 * Hub Unifie — Widget IA integrable dans chaque page
 * Usage: definir window.HUB_AI_PAGE = { ... } avant le chargement de ce script
 *
 * window.HUB_AI_PAGE = {
 *   pageId: 'delhub-contracts',
 *   title: 'IA Contrats',
 *   icon: '📋',
 *   buildContext: function() { return 'string context'; },
 *   predictions: function() { return 'prompt for predictions'; },
 *   importPrompt: 'Extract structured data from this document...',
 *   importHandler: function(jsonData) { // import into app },
 *   suggestions: ['Analyse mes contrats', 'Risques contractuels'],
 *   container: '#ai-widget'  // optional, default appends to .main
 * }
 */
(function() {
  'use strict';

  var CFG = window.HUB_AI_PAGE;
  console.log('[AIWidget] HUB_AI_PAGE =', CFG ? CFG.pageId : 'undefined');
  if (!CFG) return;

  var hasPM  = typeof PMHUB  !== 'undefined';
  var hasDel = typeof DELHUB !== 'undefined';

  // Determine which module has callAI — but always show widget
  function getAIModule() {
    if (hasPM && PMHUB.isAIEnabled && PMHUB.isAIEnabled()) return PMHUB;
    if (hasDel && DELHUB.isAIEnabled && DELHUB.isAIEnabled()) return DELHUB;
    // Fallback: check if callAI exists even without isAIEnabled
    if (hasPM && PMHUB.callAI) return PMHUB;
    if (hasDel && DELHUB.callAI) return DELHUB;
    return null;
  }

  var uploadedFiles = [];
  var isOpen = false;
  var isAnalyzing = false;

  // ── PDF text extraction ──
  function loadPdfJs(cb) {
    if (window.pdfjsLib) { cb(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = cb;
    document.head.appendChild(s);
  }

  async function extractText(file) {
    var name = file.name.toLowerCase();
    if (name.endsWith('.pdf')) {
      return new Promise(function(resolve) {
        loadPdfJs(async function() {
          try {
            var buf = await file.arrayBuffer();
            var pdf = await pdfjsLib.getDocument({ data: buf }).promise;
            var text = '';
            for (var i = 1; i <= pdf.numPages; i++) {
              var page = await pdf.getPage(i);
              var content = await page.getTextContent();
              text += content.items.map(function(it) { return it.str; }).join(' ') + '\n\n';
            }
            resolve(text.trim() || '[PDF sans texte extractible]');
          } catch(e) { resolve('[Erreur PDF: ' + e.message + ']'); }
        });
      });
    }
    if (name.match(/\.(txt|csv|json|md|xml|html|log)$/)) {
      return await file.text();
    }
    return '[Fichier ' + file.name + ' - type non supporte]';
  }

  function fmtSize(b) {
    if (b < 1024) return b + ' o';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' Ko';
    return (b / 1048576).toFixed(1) + ' Mo';
  }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  }

  // ── Inject CSS ──
  var style = document.createElement('style');
  style.textContent = [
    '.aiw{margin:24px 0;border:1px solid var(--primary);border-radius:var(--radius-lg);background:var(--surface);overflow:hidden;transition:var(--transition);box-shadow:0 0 20px rgba(var(--primary-rgb,99,102,241),0.1)}',
    '.aiw-header{display:flex;align-items:center;gap:10px;padding:14px 20px;cursor:pointer;user-select:none;transition:var(--transition)}',
    '.aiw-header:hover{background:rgba(var(--primary-rgb,99,102,241),0.04)}',
    '.aiw-icon{font-size:20px}',
    '.aiw-title{flex:1;font-family:var(--font-heading);font-size:14px;font-weight:700;color:var(--text)}',
    '.aiw-badge{font-family:var(--font-mono);font-size:9px;padding:3px 10px;border-radius:20px;background:rgba(var(--primary-rgb,99,102,241),0.12);color:var(--primary);font-weight:600;letter-spacing:0.05em}',
    '.aiw-chevron{width:10px;height:10px;border-right:2px solid var(--text-muted);border-bottom:2px solid var(--text-muted);transform:rotate(-45deg);transition:transform 0.2s}',
    '.aiw.open .aiw-chevron{transform:rotate(45deg)}',
    '.aiw-body{display:none;border-top:1px solid var(--border)}',
    '.aiw.open .aiw-body{display:block}',
    '.aiw-tabs{display:flex;gap:4px;padding:12px 20px;border-bottom:1px solid var(--border);flex-wrap:wrap}',
    '.aiw-tab{padding:6px 14px;border:1px solid var(--border);border-radius:20px;font-size:11px;color:var(--text-muted);cursor:pointer;transition:var(--transition);background:transparent;font-family:var(--font-body)}',
    '.aiw-tab:hover{border-color:var(--primary);color:var(--primary)}',
    '.aiw-tab.active{background:var(--primary);border-color:var(--primary);color:#0B0F19;font-weight:600}',
    '.aiw-panel{padding:16px 20px}',
    '.aiw-result{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;font-size:13px;line-height:1.7;color:var(--text);white-space:pre-wrap;word-break:break-word;max-height:400px;overflow-y:auto;margin-top:12px}',
    '.aiw-result::-webkit-scrollbar{width:4px}',
    '.aiw-result::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}',
    '.aiw-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}',
    '.aiw-btn{padding:8px 16px;border-radius:var(--radius-sm);font-size:12px;font-weight:600;cursor:pointer;transition:var(--transition);font-family:var(--font-body);display:flex;align-items:center;gap:6px}',
    '.aiw-btn-primary{background:var(--primary);color:#0B0F19;border:none}',
    '.aiw-btn-primary:hover{opacity:0.88}',
    '.aiw-btn-primary:disabled{opacity:0.4;cursor:not-allowed}',
    '.aiw-btn-secondary{background:transparent;color:var(--text-muted);border:1px solid var(--border)}',
    '.aiw-btn-secondary:hover{border-color:var(--primary);color:var(--primary)}',
    '.aiw-upload-zone{border:2px dashed var(--border);border-radius:var(--radius);padding:24px;text-align:center;cursor:pointer;transition:var(--transition);position:relative}',
    '.aiw-upload-zone:hover{border-color:var(--primary);background:rgba(var(--primary-rgb,99,102,241),0.03)}',
    '.aiw-upload-zone input{position:absolute;inset:0;opacity:0;cursor:pointer}',
    '.aiw-upload-icon{font-size:32px;margin-bottom:8px}',
    '.aiw-upload-text{font-size:13px;color:var(--text-muted)}',
    '.aiw-upload-hint{font-size:10px;color:var(--text-muted);margin-top:4px;font-family:var(--font-mono)}',
    '.aiw-files{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}',
    '.aiw-file-tag{display:flex;align-items:center;gap:6px;padding:5px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;font-size:11px}',
    '.aiw-file-rm{cursor:pointer;color:var(--text-muted);font-size:14px;transition:var(--transition)}',
    '.aiw-file-rm:hover{color:var(--danger)}',
    '.aiw-loading{display:flex;align-items:center;gap:8px;padding:12px 0;font-size:12px;color:var(--text-muted)}',
    '.aiw-dot{width:6px;height:6px;border-radius:50%;background:var(--primary);animation:aiwPulse 1s ease-in-out infinite}',
    '.aiw-dot:nth-child(2){animation-delay:0.2s}',
    '.aiw-dot:nth-child(3){animation-delay:0.4s}',
    '@keyframes aiwPulse{0%,100%{opacity:0.3}50%{opacity:1}}',
    '.aiw-import-preview{background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:var(--radius);padding:14px;margin-top:12px}',
    '.aiw-import-title{font-size:12px;font-weight:700;color:var(--success);margin-bottom:8px}',
    '.aiw-import-items{font-size:12px;color:var(--text);line-height:1.6}',
    '.aiw-sug{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}',
    '.aiw-sug-chip{padding:5px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:16px;font-size:11px;color:var(--text-soft);cursor:pointer;transition:var(--transition)}',
    '.aiw-sug-chip:hover{border-color:var(--primary);color:var(--primary)}'
  ].join('\n');
  document.head.appendChild(style);

  // ── Render Widget ──
  function createWidget() {
    var el = document.createElement('div');
    el.className = 'aiw' + (CFG.startOpen === false ? '' : ' open');
    el.id = 'aiWidget';

    var tabs = [
      { id: 'predict', icon: '\u{1F4C8}', label: 'Predictions' },
      { id: 'analyze', icon: '\u{1F50D}', label: 'Analyse' },
      { id: 'import',  icon: '\u{1F4E5}', label: 'Import Document' }
    ];

    el.innerHTML =
      '<div class="aiw-header" id="aiwToggle">' +
        '<span class="aiw-icon">' + (CFG.icon || '\u{1F916}') + '</span>' +
        '<span class="aiw-title">' + (CFG.title || 'Assistant IA') + '</span>' +
        '<span class="aiw-badge">IA</span>' +
        '<span class="aiw-chevron"></span>' +
      '</div>' +
      '<div class="aiw-body">' +
        '<div class="aiw-tabs" id="aiwTabs">' +
          tabs.map(function(t) {
            return '<button class="aiw-tab' + (t.id === 'predict' ? ' active' : '') + '" data-tab="' + t.id + '">' + t.icon + ' ' + t.label + '</button>';
          }).join('') +
        '</div>' +
        // Predictions panel
        '<div class="aiw-panel" id="aiwPredict">' +
          '<p style="font-size:12px;color:var(--text-muted);margin:0 0 10px">' +
            'Predictions basees sur vos donnees actuelles.' +
          '</p>' +
          '<button class="aiw-btn aiw-btn-primary" id="aiwPredictBtn">\u{1F4C8} Generer les predictions</button>' +
          (CFG.suggestions ? '<div class="aiw-sug" id="aiwSugs">' + CFG.suggestions.map(function(s) {
            return '<button class="aiw-sug-chip" data-q="' + s.replace(/"/g, '&quot;') + '">' + s + '</button>';
          }).join('') + '</div>' : '') +
          '<div id="aiwPredictResult"></div>' +
        '</div>' +
        // Analyze panel
        '<div class="aiw-panel" id="aiwAnalyze" style="display:none">' +
          '<p style="font-size:12px;color:var(--text-muted);margin:0 0 10px">' +
            'Posez une question sur vos donnees.' +
          '</p>' +
          '<div style="display:flex;gap:8px">' +
            '<input type="text" id="aiwQuestion" placeholder="Votre question..." style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text);font-size:13px;font-family:var(--font-body);outline:none">' +
            '<button class="aiw-btn aiw-btn-primary" id="aiwAskBtn">\u27A4</button>' +
          '</div>' +
          '<div id="aiwAnalyzeResult"></div>' +
        '</div>' +
        // Import panel
        '<div class="aiw-panel" id="aiwImport" style="display:none">' +
          '<div class="aiw-upload-zone" id="aiwDropZone">' +
            '<div class="aiw-upload-icon">\u{1F4C4}</div>' +
            '<div class="aiw-upload-text">Glissez un fichier ou cliquez pour importer</div>' +
            '<div class="aiw-upload-hint">PDF, TXT, CSV, JSON, DOCX \u2014 Max 10 Mo</div>' +
            '<input type="file" id="aiwFileInput" accept=".pdf,.txt,.csv,.json,.md,.xml,.docx,.doc" multiple>' +
          '</div>' +
          '<div class="aiw-files" id="aiwFiles"></div>' +
          '<div id="aiwImportActions" style="display:none">' +
            '<div class="aiw-actions">' +
              '<button class="aiw-btn aiw-btn-primary" id="aiwExtractBtn">\u{1F916} Extraire et analyser</button>' +
              '<button class="aiw-btn aiw-btn-secondary" id="aiwImportBtn" style="display:none">\u{1F4E5} Importer les donnees</button>' +
            '</div>' +
          '</div>' +
          '<div id="aiwImportResult"></div>' +
        '</div>' +
      '</div>';

    // Insert into page — at the BOTTOM of main content
    if (CFG.container) {
      var target = document.querySelector(CFG.container);
      if (target) { target.appendChild(el); console.log('[AIWidget] Inserted into', CFG.container); return el; }
    }
    var main = document.querySelector('.main') || document.querySelector('.main-col') || document.querySelector('main');
    if (main) {
      main.appendChild(el);
      console.log('[AIWidget] Inserted at bottom of', main.tagName + '.' + main.className);
    } else {
      // Fallback: append to body before </body>
      document.body.appendChild(el);
      console.log('[AIWidget] Fallback: appended to body');
    }
    return el;
  }

  // ── Tab switching ──
  function switchTab(tabId) {
    document.querySelectorAll('.aiw-tab').forEach(function(t) { t.classList.toggle('active', t.dataset.tab === tabId); });
    ['predict', 'analyze', 'import'].forEach(function(id) {
      var panel = document.getElementById('aiw' + id.charAt(0).toUpperCase() + id.slice(1));
      if (panel) panel.style.display = id === tabId ? '' : 'none';
    });
  }

  // ── Loading indicator ──
  function showLoading(containerId, msg) {
    var c = document.getElementById(containerId);
    if (c) c.innerHTML = '<div class="aiw-loading"><div class="aiw-dot"></div><div class="aiw-dot"></div><div class="aiw-dot"></div><span>' + (msg || 'Analyse en cours...') + '</span></div>';
  }

  function showResult(containerId, text, extra) {
    var c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = '<div class="aiw-result">' + escHtml(text) + '</div>' +
      '<div class="aiw-actions">' +
        '<button class="aiw-btn aiw-btn-secondary" onclick="navigator.clipboard.writeText(document.querySelector(\'#' + containerId + ' .aiw-result\').textContent)">Copier</button>' +
        (extra || '') +
      '</div>';
  }

  // ── Timeout helper ──
  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise(function(_, reject) {
        setTimeout(function() { reject(new Error('Timeout: l\'API n\'a pas repondu en ' + Math.round(ms/1000) + 's. Reessayez.')); }, ms);
      })
    ]);
  }

  var AI_TIMEOUT = 90000; // 90 secondes

  // ── Predictions ──
  async function runPredictions(customQ) {
    if (isAnalyzing) return;
    isAnalyzing = true;
    var btn = document.getElementById('aiwPredictBtn');
    if (btn) btn.disabled = true;
    showLoading('aiwPredictResult', 'Generation des predictions...');

    var context = CFG.buildContext ? CFG.buildContext() : '';
    var prompt = customQ || (CFG.predictions ? CFG.predictions() : 'Fais une analyse predictive complete basee sur les donnees fournies.');
    var system = 'Tu es un expert senior en analyse predictive, gestion de projet (PMP, PRINCE2), delivery, business et contrats. Reponds en francais, de facon structuree avec ## sections, **gras** pour les points cles, listes numerotees. Sois precis avec des chiffres et pourcentages.\n\n=== DONNEES ===\n' + context + '\n=== FIN ===';

    try {
      var mod = getAIModule();
      if (!mod) { showResult('aiwPredictResult', 'Cle API non configuree. Allez dans Parametres pour configurer votre cle OpenAI / Anthropic.'); return; }
      var result = await withTimeout(mod.callAI(system, prompt), AI_TIMEOUT);
      showResult('aiwPredictResult', result);
    } catch(e) {
      showResult('aiwPredictResult', 'Erreur: ' + e.message);
    } finally {
      isAnalyzing = false;
      if (btn) btn.disabled = false;
    }
  }

  // ── Free question ──
  async function askQuestion() {
    var input = document.getElementById('aiwQuestion');
    var q = input ? input.value.trim() : '';
    if (!q || isAnalyzing) return;
    isAnalyzing = true;
    var btn = document.getElementById('aiwAskBtn');
    if (btn) btn.disabled = true;
    showLoading('aiwAnalyzeResult', 'Analyse...');

    var context = CFG.buildContext ? CFG.buildContext() : '';
    var system = 'Tu es un expert senior. Reponds en francais, de facon structuree. Utilise les donnees fournies.\n\n=== DONNEES ===\n' + context + '\n=== FIN ===';

    try {
      var mod = getAIModule();
      if (!mod) { showResult('aiwAnalyzeResult', 'Cle API non configuree. Allez dans Parametres pour configurer votre cle OpenAI / Anthropic.'); return; }
      var result = await withTimeout(mod.callAI(system, q), AI_TIMEOUT);
      showResult('aiwAnalyzeResult', result);
    } catch(e) {
      showResult('aiwAnalyzeResult', 'Erreur: ' + e.message);
    } finally {
      isAnalyzing = false;
      if (btn) btn.disabled = false;
    }
  }

  // ── Extract from uploaded files ──
  var lastExtractedData = null;

  async function extractFromFiles() {
    if (!uploadedFiles.length || isAnalyzing) return;
    isAnalyzing = true;
    var btn = document.getElementById('aiwExtractBtn');
    if (btn) btn.disabled = true;
    showLoading('aiwImportResult', 'Extraction et analyse du document...');

    var fileTexts = uploadedFiles.map(function(f) {
      return '--- ' + f.name + ' (' + fmtSize(f.size) + ') ---\n' + f.text.substring(0, 20000);
    }).join('\n\n');

    console.log('[AIWidget] Fichiers a analyser:', uploadedFiles.length, '- Taille texte:', fileTexts.length);

    var context = CFG.buildContext ? CFG.buildContext() : '';
    var importPrompt = CFG.importPrompt || 'Analyse ce document et extrais toutes les donnees structurees pertinentes.';

    var system = 'Tu es un expert en extraction de donnees et analyse documentaire. Tu dois:\n' +
      '1. D\'ABORD, fournir une analyse textuelle detaillee du document (resume, points cles, risques, recommandations)\n' +
      '2. Extraire TOUTES les donnees structurees (noms, dates, montants, conditions, obligations, KPIs, seuils, penalites)\n' +
      '3. Fournir une analyse des risques et points d\'attention\n' +
      '4. A LA FIN UNIQUEMENT, apres ton analyse textuelle, genere un bloc JSON entre les balises [JSON_START] et [JSON_END] avec les donnees extractibles pour import\n\n' +
      'IMPORTANT: Tu DOIS ecrire une analyse textuelle AVANT le bloc JSON. Ne reponds JAMAIS uniquement avec du JSON.\n\n' +
      'Reponds en francais.\n\n' +
      '=== DONNEES EXISTANTES ===\n' + context + '\n=== FIN DONNEES ===\n\n' +
      '=== DOCUMENT A ANALYSER ===\n' + fileTexts + '\n=== FIN DOCUMENT ===';

    try {
      var mod = getAIModule();
      if (!mod) { showResult('aiwImportResult', 'Cle API non configuree. Allez dans Parametres pour configurer votre cle OpenAI / Anthropic.'); return; }
      console.log('[AIWidget] Appel API en cours... (timeout ' + Math.round(AI_TIMEOUT/1000) + 's)');
      var result = await withTimeout(mod.callAI(system, importPrompt), AI_TIMEOUT);
      console.log('[AIWidget] Reponse recue, longueur:', result.length);

      // Try to extract JSON block
      var jsonMatch = result.match(/\[JSON_START\]([\s\S]*?)\[JSON_END\]/);
      if (jsonMatch) {
        try {
          lastExtractedData = JSON.parse(jsonMatch[1].trim());
        } catch(e) {
          lastExtractedData = null;
        }
      }

      // Show result
      var cleanResult = result.replace(/\[JSON_START\][\s\S]*?\[JSON_END\]/, '').trim();

      // If response was only JSON with no text analysis, generate a summary
      if (!cleanResult && lastExtractedData) {
        var items = Array.isArray(lastExtractedData) ? lastExtractedData : [lastExtractedData];
        var summary = 'Analyse terminee — ' + items.length + ' element(s) extraits du document.\n\n';
        summary += 'Donnees detectees :\n';
        items.forEach(function(item, idx) {
          var keys = Object.keys(item);
          summary += '\n' + (idx + 1) + '. ';
          keys.slice(0, 6).forEach(function(k) {
            summary += k + ': ' + item[k] + '  |  ';
          });
          summary = summary.replace(/\s+\|\s+$/, '\n');
        });
        cleanResult = summary;
      } else if (!cleanResult && !lastExtractedData) {
        cleanResult = result || 'Aucune donnee extraite. Verifiez le format du document.';
      }

      showResult('aiwImportResult', cleanResult);

      // Show import button if we have data + handler
      if (lastExtractedData && CFG.importHandler) {
        var importBtn = document.getElementById('aiwImportBtn');
        if (importBtn) importBtn.style.display = '';

        // Show preview of importable data
        var preview = document.createElement('div');
        preview.className = 'aiw-import-preview';
        var previewJson = JSON.stringify(lastExtractedData, null, 2);
        preview.innerHTML = '<div class="aiw-import-title">\u2705 Donnees extractibles detectees — Cliquez "Importer" pour integrer</div>' +
          '<div class="aiw-import-items">' + escHtml(previewJson.substring(0, 800)) + (previewJson.length > 800 ? '\n...' : '') + '</div>';
        var resultContainer = document.getElementById('aiwImportResult');
        if (resultContainer) resultContainer.appendChild(preview);
      }
    } catch(e) {
      console.error('[AIWidget] Erreur extraction:', e);
      showResult('aiwImportResult', 'Erreur: ' + e.message);
    } finally {
      isAnalyzing = false;
      if (btn) btn.disabled = false;
    }
  }

  // ── Import data ──
  function importData() {
    if (!lastExtractedData || !CFG.importHandler) return;
    try {
      CFG.importHandler(lastExtractedData);
      var importBtn = document.getElementById('aiwImportBtn');
      if (importBtn) {
        importBtn.textContent = '\u2705 Importe !';
        importBtn.disabled = true;
        setTimeout(function() {
          importBtn.textContent = '\u{1F4E5} Importer les donnees';
          importBtn.disabled = false;
        }, 2000);
      }
      // Dispatch update events
      window.dispatchEvent(new CustomEvent('pmhub:update'));
      window.dispatchEvent(new CustomEvent('delhub:update'));
    } catch(e) {
      alert('Erreur import: ' + e.message);
    }
  }

  // ── File handling UI ──
  function updateFilesUI() {
    var container = document.getElementById('aiwFiles');
    var actions = document.getElementById('aiwImportActions');
    if (!container) return;
    if (!uploadedFiles.length) {
      container.innerHTML = '';
      if (actions) actions.style.display = 'none';
      return;
    }
    if (actions) actions.style.display = '';
    container.innerHTML = uploadedFiles.map(function(f, i) {
      return '<div class="aiw-file-tag">\u{1F4C4} ' + escHtml(f.name) + ' <span style="color:var(--text-muted);font-size:9px">' + fmtSize(f.size) + '</span><span class="aiw-file-rm" data-idx="' + i + '">\u00D7</span></div>';
    }).join('');
    container.querySelectorAll('.aiw-file-rm').forEach(function(el) {
      el.addEventListener('click', function() {
        uploadedFiles.splice(Number(el.dataset.idx), 1);
        updateFilesUI();
      });
    });
  }

  // ── Init ──
  function init() {
    var widget = createWidget();
    if (!widget) return;

    // Toggle
    document.getElementById('aiwToggle').addEventListener('click', function() {
      widget.classList.toggle('open');
    });

    // Tabs
    document.querySelectorAll('.aiw-tab').forEach(function(tab) {
      tab.addEventListener('click', function() { switchTab(tab.dataset.tab); });
    });

    // Predictions
    var predBtn = document.getElementById('aiwPredictBtn');
    if (predBtn) predBtn.addEventListener('click', function() { runPredictions(); });

    // Suggestions
    document.querySelectorAll('.aiw-sug-chip').forEach(function(chip) {
      chip.addEventListener('click', function() { runPredictions(chip.dataset.q); });
    });

    // Ask question
    var askBtn = document.getElementById('aiwAskBtn');
    if (askBtn) askBtn.addEventListener('click', askQuestion);
    var qInput = document.getElementById('aiwQuestion');
    if (qInput) qInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') askQuestion();
    });

    // File upload
    var fileInput = document.getElementById('aiwFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', async function() {
        var files = Array.from(fileInput.files);
        for (var i = 0; i < files.length; i++) {
          var text = await extractText(files[i]);
          uploadedFiles.push({ name: files[i].name, size: files[i].size, text: text });
        }
        fileInput.value = '';
        updateFilesUI();
      });
    }

    // Extract
    var extractBtn = document.getElementById('aiwExtractBtn');
    if (extractBtn) extractBtn.addEventListener('click', extractFromFiles);

    // Import
    var importBtnEl = document.getElementById('aiwImportBtn');
    if (importBtnEl) importBtnEl.addEventListener('click', importData);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
