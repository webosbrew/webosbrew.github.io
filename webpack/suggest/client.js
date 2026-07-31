// Runs in the browser, dev server only. The inject plugin adds a script tag for
// this file, and the middleware serves it. Never bundled, so keep it plain.
(function () {
  'use strict';

  const ENDPOINT = '/__suggest';
  const CONTEXT_CHARS = 120;
  const STORE = 'sg-pending';
  const DRAFT = 'sg-draft';
  const SETTLE_MS = 300;

  // One bar, fixed to the bottom, on every device. It never chases the selection, so
  // the system menu that hugs selected text on a phone cannot cover it.
  // ?sg-mode=touch or ?sg-mode=pointer forces the panel width, to check the other one.
  const forced = new URLSearchParams(location.search).get('sg-mode');
  const coarse = forced ? forced === 'touch' : window.matchMedia('(pointer: coarse)').matches;

  const css = `
.sg-bar, .sg-panel {
  position: fixed;
  z-index: 2147483000;
  font: 13px/1.4 system-ui, sans-serif;
  color: #f1f1f4;
}
.sg-bar {
  left: 50%;
  bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  display: flex;
  gap: 10px;
  align-items: center;
  max-width: calc(100vw - 20px);
  transform: translateX(-50%);
  padding: 6px 6px 6px 12px;
  border: 1px solid #3a3a40;
  border-radius: 999px;
  background: #1c1c1fee;
  backdrop-filter: blur(6px);
  box-shadow: 0 4px 18px rgba(0, 0, 0, .5);
}
.sg-bar[hidden] { display: none; }
.sg-target {
  max-width: 44vw;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #b9b9c0;
}
.sg-target.sg-page { font-style: italic; }
.sg-go {
  min-height: 32px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: #cf0652;
  color: #fff;
  font: inherit;
  white-space: nowrap;
  cursor: pointer;
}
.sg-status {
  display: flex;
  gap: 6px;
  align-items: center;
  padding-right: 2px;
  border-right: 1px solid #3a3a40;
  padding-left: 2px;
  margin-right: 2px;
  white-space: nowrap;
}
.sg-status[hidden] { display: none; }
.sg-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e0a800;
  animation: sg-pulse 1s ease-in-out infinite;
}
.sg-status.sg-done .sg-dot { background: #3fb950; animation: none; }
@keyframes sg-pulse { 50% { opacity: .25; } }
.sg-panel {
  left: 50%;
  bottom: calc(56px + env(safe-area-inset-bottom, 0px));
  width: min(380px, calc(100vw - 20px));
  transform: translateX(-50%);
  padding: 12px;
  border: 1px solid #444;
  border-radius: 10px;
  background: #1c1c1f;
  box-shadow: 0 8px 28px rgba(0, 0, 0, .6);
}
.sg-panel.sg-wide { width: calc(100vw - 16px); }
.sg-quote {
  max-height: 62px;
  overflow: auto;
  margin: 0 0 8px;
  padding-left: 8px;
  border-left: 3px solid #cf0652;
  color: #b9b9c0;
  font-size: 12px;
}
.sg-quote.sg-page { border-left-color: #6c6c78; font-style: italic; }
.sg-panel textarea {
  width: 100%;
  min-height: 84px;
  padding: 7px;
  border: 1px solid #555;
  border-radius: 6px;
  background: #232327;
  color: inherit;
  font: inherit;
  resize: vertical;
}
.sg-wide textarea { min-height: 96px; font-size: 16px; }
.sg-row {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  margin-top: 8px;
}
.sg-row button {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid #555;
  border-radius: 6px;
  background: #2c2c31;
  color: inherit;
  font-size: 13px;
  cursor: pointer;
}
.sg-wide .sg-row button { min-height: 38px; padding: 0 16px; }
.sg-row .sg-submit { border-color: #cf0652; background: #cf0652; color: #fff; }
.sg-row button:disabled { opacity: .5; cursor: default; }
`;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  let bar = null;
  let statusEl = null;
  let targetEl = null;
  let panel = null;
  // The selection when it last settled, or null, meaning the comment is about the page.
  let snapshot = null;
  let settleTimer = 0;
  let doneTimer = 0;

  // Applying a suggestion edits a source file, which reloads the page. Keep the count
  // in session storage so the indicator survives that reload.
  let pending = Number(sessionStorage.getItem(STORE) || 0);

  function setPending(count) {
    pending = count;
    if (count > 0) {
      sessionStorage.setItem(STORE, String(count));
    } else {
      sessionStorage.removeItem(STORE);
    }
    renderStatus();
  }

  function remove(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  /**
   * Fire on the first touch, not on the click that may follow it. While the system
   * selection menu is up, the tap that dismisses it often never becomes a click, so a
   * click handler alone drops the first tap. Guard against running twice when both
   * events do arrive.
   */
  function onActivate(el, fn) {
    let firing = false;
    const run = (e) => {
      if (firing) return;
      firing = true;
      setTimeout(() => (firing = false), 500);
      e.preventDefault();
      e.stopPropagation();
      fn();
    };
    el.addEventListener('pointerdown', run);
    el.addEventListener('click', run);
  }

  /**
   * Hold the dev server off while a comment is being written. Applying a suggestion
   * edits a source file, and the reload that follows would take the half typed comment
   * with it. webpack-dev-server reads these two switches out of location.search every
   * time it wants to reload, not once at startup, so flipping them here is enough.
   */
  function pauseReload(paused) {
    const url = new URL(location.href);
    if (paused) {
      url.searchParams.set('webpack-dev-server-hot', 'false');
      url.searchParams.set('webpack-dev-server-live-reload', 'false');
    } else {
      url.searchParams.delete('webpack-dev-server-hot');
      url.searchParams.delete('webpack-dev-server-live-reload');
    }
    history.replaceState(null, '', url);
  }

  /** Belt and braces. A reload from anywhere else must not eat the text either. */
  function saveDraft(payload, comment) {
    sessionStorage.setItem(DRAFT, JSON.stringify({payload, comment}));
  }

  function takeDraft() {
    const raw = sessionStorage.getItem(DRAFT);
    sessionStorage.removeItem(DRAFT);
    if (!raw) return null;
    try {
      const d = JSON.parse(raw);
      return d.payload && d.payload.page === location.pathname ? d : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * iOS does not shrink the layout viewport for the on-screen keyboard, so a panel
   * pinned near the bottom sits behind it. visualViewport reports the space the keyboard
   * takes, so lift the panel and the bar by that much.
   */
  function fitToKeyboard() {
    const vv = window.visualViewport;
    if (!vv) return;
    const covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    if (bar) bar.style.bottom = (covered + 10) + 'px';
    if (panel) {
      panel.style.bottom = (covered + 56) + 'px';
      panel.style.maxHeight = Math.max(160, vv.height - 80) + 'px';
      panel.style.overflow = 'auto';
    }
  }

  /** Text around the selection, so the comment can be placed in the source. */
  function contextOf(picked) {
    const root = document.querySelector('main') || document.body;
    const all = root.innerText || '';
    const at = all.indexOf(picked);
    if (at < 0) return {before: '', after: ''};
    return {
      before: all.slice(Math.max(0, at - CONTEXT_CHARS), at),
      after: all.slice(at + picked.length, at + picked.length + CONTEXT_CHARS)
    };
  }

  /** Nearest heading above the selection, to narrow the search in the source. */
  function headingOf(node) {
    const el = node.nodeType === 1 ? node : node.parentElement;
    const section = el && el.closest('section, article, main');
    let scan = el;
    while (scan && scan !== document.body) {
      let sib = scan.previousElementSibling;
      while (sib) {
        if (/^H[1-6]$/.test(sib.tagName)) {
          return {id: sib.id || (section && section.id) || '', text: sib.innerText.trim()};
        }
        sib = sib.previousElementSibling;
      }
      scan = scan.parentElement;
    }
    return {id: (section && section.id) || '', text: ''};
  }

  /**
   * Which part of the page the selection sits in. The sidebar lives inside <main>, so
   * containment alone does not tell you, and its text comes from _sidebar.md rather than
   * the page you are looking at.
   */
  function regionOf(node) {
    const el = node.nodeType === 1 ? node : node.parentElement;
    if (!el) return 'chrome';
    if (el.closest('aside.sidebar')) return 'sidebar';
    if (el.closest('#toc-nav')) return 'contents';
    if (el.closest('article')) return 'content';
    return 'chrome';
  }

  function take() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
    const text = sel.toString().trim();
    if (text.length < 2) return null;
    const range = sel.getRangeAt(0);
    const region = regionOf(range.commonAncestorContainer);
    const heading = headingOf(range.startContainer);
    const context = region === 'content' ? contextOf(sel.toString()) : {before: '', after: ''};
    return {
      page: location.pathname,
      region,
      selection: text,
      before: context.before,
      after: context.after,
      headingId: region === 'content' ? heading.id : '',
      headingText: region === 'content' ? heading.text : ''
    };
  }

  /** Payload for a comment with nothing selected. It is about the page itself. */
  function pagePayload() {
    return {
      page: location.pathname,
      selection: '',
      before: '',
      after: '',
      headingId: '',
      headingText: ''
    };
  }

  function renderStatus() {
    if (!statusEl) return;
    if (pending > 0) {
      statusEl.hidden = false;
      statusEl.className = 'sg-status';
      statusEl.innerHTML = '<span class="sg-dot"></span>';
      statusEl.appendChild(document.createTextNode(
        pending + ' waiting'));
      clearTimeout(doneTimer);
    } else if (statusEl.dataset.wasPending === '1') {
      statusEl.hidden = false;
      statusEl.className = 'sg-status sg-done';
      statusEl.innerHTML = '<span class="sg-dot"></span>';
      statusEl.appendChild(document.createTextNode('Applied'));
      clearTimeout(doneTimer);
      doneTimer = setTimeout(() => {
        statusEl.hidden = true;
        statusEl.dataset.wasPending = '0';
      }, 5000);
    } else {
      statusEl.hidden = true;
    }
    statusEl.dataset.wasPending = pending > 0 ? '1' : statusEl.dataset.wasPending;
  }

  function renderTarget() {
    if (!targetEl) return;
    if (snapshot) {
      const where = snapshot.region === 'content' ? '' :
        snapshot.region === 'sidebar' ? 'Sidebar: ' :
          snapshot.region === 'contents' ? 'On this page: ' : 'Chrome: ';
      targetEl.className = 'sg-target';
      targetEl.textContent = where + snapshot.selection;
      targetEl.title = where + snapshot.selection;
    } else {
      targetEl.className = 'sg-target sg-page';
      targetEl.textContent = 'This page';
      targetEl.title = location.pathname;
    }
  }

  function buildBar() {
    bar = document.createElement('div');
    bar.className = 'sg-bar';
    bar.innerHTML =
      '<span class="sg-status" hidden></span>' +
      '<span class="sg-target"></span>' +
      '<button type="button" class="sg-go">Suggest edit</button>';
    document.body.appendChild(bar);
    statusEl = bar.querySelector('.sg-status');
    targetEl = bar.querySelector('.sg-target');
    onActivate(bar.querySelector('.sg-go'), () => openPanel());
    renderTarget();
    renderStatus();
  }

  function closePanel() {
    if (panel) {
      pauseReload(false);
      sessionStorage.removeItem(DRAFT);
    }
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', fitToKeyboard);
      window.visualViewport.removeEventListener('scroll', fitToKeyboard);
    }
    remove(panel);
    panel = null;
    if (bar) {
      bar.hidden = false;
      bar.style.bottom = '';
    }
  }

  function openPanel(prefill, restored) {
    const held = restored || snapshot || pagePayload();
    remove(panel);
    pauseReload(true);
    if (bar) bar.hidden = true;

    panel = document.createElement('div');
    panel.className = 'sg-panel' + (coarse ? ' sg-wide' : '');
    panel.innerHTML =
      '<blockquote class="sg-quote"></blockquote>' +
      '<textarea placeholder="What should change here?"></textarea>' +
      '<div class="sg-row">' +
      '<button type="button" class="sg-cancel">Cancel</button>' +
      '<button type="button" class="sg-submit">Submit</button>' +
      '</div>';
    const quote = panel.querySelector('.sg-quote');
    if (held.selection) {
      quote.textContent = held.selection;
    } else {
      quote.className = 'sg-quote sg-page';
      quote.textContent = 'About this page, nothing selected.';
    }
    document.body.appendChild(panel);

    // Drop the selection so the system menu goes away behind the panel.
    const sel = window.getSelection();
    if (sel && coarse) sel.removeAllRanges();

    fitToKeyboard();
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', fitToKeyboard);
      window.visualViewport.addEventListener('scroll', fitToKeyboard);
    }

    const area = panel.querySelector('textarea');
    const submit = panel.querySelector('.sg-submit');
    if (prefill) area.value = prefill;
    // Focus after layout, or the keyboard opens against the old geometry.
    setTimeout(() => area.focus(), coarse ? 120 : 0);

    area.addEventListener('input', () => saveDraft(held, area.value));

    const send = async function () {
      const comment = area.value.trim();
      if (!comment) return area.focus();
      submit.disabled = true;
      submit.textContent = 'Saving';
      held.comment = comment;
      try {
        const resp = await fetch(ENDPOINT + '/save', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(held)
        });
        if (!resp.ok) throw new Error(await resp.text());
        closePanel();
        snapshot = null;
        renderTarget();
        setPending(pending + 1);
        poll();
      } catch (err) {
        submit.disabled = false;
        submit.textContent = 'Submit';
        area.setAttribute('placeholder', 'Save failed: ' + err.message);
      }
    };

    onActivate(panel.querySelector('.sg-cancel'), closePanel);
    onActivate(submit, send);

    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePanel();
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
    });
  }

  let polling = false;

  async function poll() {
    if (polling) return;
    polling = true;
    while (pending > 0) {
      await new Promise(r => setTimeout(r, 1500));
      try {
        const resp = await fetch(ENDPOINT + '/status');
        const data = await resp.json();
        if (data.open < pending) setPending(data.open);
      } catch (e) {
        break;
      }
    }
    polling = false;
  }

  document.addEventListener('selectionchange', function () {
    if (panel) return;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(function () {
      snapshot = take();
      renderTarget();
    }, SETTLE_MS);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel) closePanel();
  });

  buildBar();

  // A reload got past the pause, or came from somewhere else. Put the text back.
  const draft = takeDraft();
  if (draft) {
    openPanel(draft.comment, draft.payload);
  }

  // Resume after the reload that applying a suggestion causes.
  if (pending > 0) {
    statusEl.dataset.wasPending = '1';
    renderStatus();
    poll();
  }

  console.info('[suggest] bar pinned at the bottom. Select text first, or comment on the page.');
})();
