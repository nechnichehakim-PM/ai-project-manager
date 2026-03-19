(function () {
  'use strict';

  const views = document.querySelectorAll('.view');
  const navItems = document.querySelectorAll('.sidebar-item[data-view]');
  const aiPanel = document.getElementById('aiPanel');
  const openAiBtn = document.getElementById('openAiPanel');
  const openAiBtn2 = document.getElementById('openAiPanel2');
  const closeAiBtn = document.getElementById('closeAiPanel');

  function setView(viewId) {
    views.forEach(function (v) {
      v.classList.toggle('active', v.id === 'view-' + viewId);
    });
    navItems.forEach(function (n) {
      n.classList.remove('active');
      n.classList.remove('ai-item');
      if (n.dataset.view === viewId) {
        n.classList.add('active');
        if (viewId === 'ai-assistant') n.classList.add('ai-item');
      }
    });
  }

  navItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      setView(item.dataset.view);
    });
  });

  function openAiPanelFn() {
    if (aiPanel) aiPanel.classList.add('open');
  }

  function closeAiPanelFn() {
    if (aiPanel) aiPanel.classList.remove('open');
  }

  if (openAiBtn) openAiBtn.addEventListener('click', openAiPanelFn);
  if (openAiBtn2) openAiBtn2.addEventListener('click', openAiPanelFn);
  if (closeAiBtn) closeAiBtn.addEventListener('click', closeAiPanelFn);

  aiPanel && aiPanel.addEventListener('click', function (e) {
    if (e.target === aiPanel) closeAiPanelFn();
  });

  // WBS expand/collapse
  document.querySelectorAll('.wbs-node').forEach(function (node) {
    var toggle = node.querySelector('.wbs-toggle');
    if (!toggle || !toggle.textContent.trim()) return;
    node.addEventListener('click', function () {
      node.classList.toggle('expanded');
    });
  });

  // Health gauge animation on first view
  var gaugeFill = document.querySelector('.health-gauge-fill');
  if (gaugeFill) {
    var circumference = 2 * Math.PI * 42;
    var pct = 0.82;
    gaugeFill.setAttribute('stroke-dasharray', circumference);
    gaugeFill.setAttribute('stroke-dashoffset', circumference * (1 - pct));
  }
})();
