/* ===========================
   ASTRAI — Main JS (site-wide)
   =========================== */

/* Smooth scrolling for in-page anchors.
   - Only handles links that start with "#"
   - Ignores "#" / "#!" and elements marked .show-options or [data-no-smooth]
   - Works with fixed header thanks to CSS scroll-margin-top on targets
*/
(function smoothInPageAnchors() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach(a => {
    a.addEventListener('click', function (e) {
      if (this.classList.contains('show-options') || this.hasAttribute('data-no-smooth')) return;

      const href = this.getAttribute('href') || '';
      if (href === '#' || href === '#!' || href.trim().length <= 1) {
        e.preventDefault();
        return;
      }

      const id = href.slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

/* ===========================
   Homepage resource cards
   (safe no-op on pages without .resource-card)
   =========================== */
(function resourceCards() {
  const cards = document.querySelectorAll('.resource-card');
  if (!cards.length) return; // Not on a page with resource cards (e.g., Resource Hub) — exit early

  // Utilities
  const qs  = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // CSV parsing (supports quotes, escaped quotes, auto-detects comma vs semicolon)
  function parseCSV(text) {
    const firstLine = text.split(/\r?\n/)[0] || '';
    const delim = (firstLine.split(';').length > firstLine.split(',').length) ? ';' : ',';

    const rows = [];
    let row = [], field = '', i = 0, inQuotes = false;

    while (i < text.length) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; } // escaped quote
          inQuotes = false; i++; continue;
        }
        field += ch; i++; continue;
      } else {
        if (ch === '"') { inQuotes = true; i++; continue; }
        if (ch === delim) { row.push(field); field = ''; i++; continue; }
        if (ch === '\n')  { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
        if (ch === '\r')  { i++; continue; } // ignore CR
        field += ch; i++; continue;
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function clampRows(rows, maxDataRows) {
    if (!rows.length) return rows;
    return [rows[0], ...rows.slice(1, 1 + maxDataRows)]; // keep header + N rows
  }

  function clampCols(rows, maxCols) {
    if (!rows.length || !maxCols || maxCols <= 0) return rows;
    return rows.map(r => r.slice(0, maxCols));
  }

  function renderTable(rows) {
    const table = document.createElement('table');

    if (!rows.length) return table;

    const [header, ...rest] = rows;

    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    header.forEach(h => { const th = document.createElement('th'); th.textContent = h; trh.appendChild(th); });
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rest.forEach(r => {
      const tr = document.createElement('tr');
      r.forEach(c => { const td = document.createElement('td'); td.textContent = c; tr.appendChild(td); });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return table;
  }

  // Constants for homepage samples (kept small for layout stability)
  const MAX_ROWS = 5;    // show header + 5 rows
  const MAX_COLS = 12;   // first 12 columns (home cards are previews)

  cards.forEach(card => {
    const sampleBtn = card.querySelector('[data-action="toggle-sample"]');
    const docsBtn   = card.querySelector('[data-action="toggle-docs"]');
    const sampleBox = card.querySelector('.block-sample');
    const docsBox   = card.querySelector('.block-docs');

    // Toggle helpers
    function toggle(el, btn) {
      if (!el) return;
      el.open = !el.open;
      if (btn) btn.setAttribute('aria-expanded', String(el.open));
    }

    // SAMPLE: fetch on first open
    if (sampleBtn && sampleBox) {
      sampleBtn.addEventListener('click', () => {
        toggle(sampleBox, sampleBtn);

        if (sampleBox.open && !sampleBox.dataset.loaded) {
          const url = card.getAttribute('data-sample-url');
          const container = sampleBox.querySelector('.sample-table');
          if (!url) { container.textContent = 'Sample not available.'; return; }

          fetch(url)
            .then(r => r.ok ? r.text() : Promise.reject())
            .then(text => {
              let rows = parseCSV(text);
              if (!rows.length) { container.textContent = 'No data in sample.'; return; }

              // Clamp for homepage card previews
              rows = clampRows(rows, MAX_ROWS);
              rows = clampCols(rows, MAX_COLS);

              container.innerHTML = '';
              container.appendChild(renderTable(rows));
              sampleBox.dataset.loaded = '1';
            })
            .catch(() => { container.textContent = 'Could not load sample.'; });
        }
      });
    }

    // DOCS toggle
    if (docsBtn && docsBox) {
      docsBtn.addEventListener('click', () => toggle(docsBox, docsBtn));
    }
  });

  /* Hover/focus overlay helpers (cards)
     - Mobile/touch: "Show options" toggles overlay visibility
     - Clicking outside closes any open overlay
  */
  (function overlayHelpers() {
    const toggles = document.querySelectorAll('.resource-card .show-options');

    toggles.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const card = link.closest('.resource-card');
        const opened = card.classList.toggle('is-hovered');
        link.setAttribute('aria-expanded', String(opened));
      });
    });

    document.addEventListener('click', (e) => {
      const insideCard = e.target.closest('.resource-card');
      if (!insideCard) {
        document.querySelectorAll('.resource-card.is-hovered').forEach(c => c.classList.remove('is-hovered'));
        toggles.forEach(l => l.setAttribute('aria-expanded', 'false'));
      }
    });
  })();
})();

/* ===========================
   Mailto (simple obfuscation)
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
  const emailLink = document.getElementById('email-link');
  if (emailLink) {
    const user = 'info';
    const domain = 'koexai.com';
    emailLink.href = `mailto:${user}@${domain}`;
  }
});

/* ===========================
   Resource Hub (resources-page only)
   =========================== */
window.addEventListener('DOMContentLoaded', function () {
  (function () {
    /* ========= CSV preview: toolbar + column pager ========= */

    // Robust CSV parse with delimiter auto-detect (comma/semicolon) and quotes
    function parseCSV(text) {
      const firstLine = text.split(/\r?\n/)[0] || "";
      const delim = (firstLine.split(";").length > firstLine.split(",").length) ? ";" : ",";
      const rows = []; let row = [], field = '', i = 0, q = false;
      while (i < text.length) {
        const ch = text[i];
        if (q) {
          if (ch === '"') { if (text[i+1] === '"') { field+='"'; i+=2; continue; } q=false; i++; continue; }
          field += ch; i++; continue;
        } else {
          if (ch === '"') { q = true; i++; continue; }
          if (ch === delim) { row.push(field); field=''; i++; continue; }
          if (ch === '\n')  { row.push(field); rows.push(row); row=[]; field=''; i++; continue; }
          if (ch === '\r')  { i++; continue; }
          field += ch; i++; continue;
        }
      }
      if (field.length || row.length) { row.push(field); rows.push(row); }
      return rows;
    }

    function sliceCols(rows, start, count) {
      if (!rows.length) return rows;
      const end = count > 0 ? start + count : rows[0].length; // count==0 => all
      return rows.map(r => r.slice(start, end));
    }

    function makeTable(rows) {
      const table = document.createElement('table');
      if (!rows.length) return table;
      const [head, ...rest] = rows;

      const thead = document.createElement('thead');
      const trh = document.createElement('tr');
      head.forEach(h => { const th = document.createElement('th'); th.textContent = h; trh.appendChild(th); });
      thead.appendChild(trh);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      rest.forEach(r => {
        const tr = document.createElement('tr');
        r.forEach(c => { const td = document.createElement('td'); td.textContent = c; tr.appendChild(td); });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      return table;
    }

    function copyToClipboard(text, onOK, onFail) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onOK, onFail);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.top = '-9999px';
        document.body.appendChild(ta); ta.focus(); ta.select();
        try { document.execCommand('copy') ? onOK() : onFail(); }
        catch(_) { onFail(); }
        document.body.removeChild(ta);
      }
    }

    document.querySelectorAll('.table-scroll[data-sample-url]').forEach(el => {
      const url = el.getAttribute('data-sample-url');
      const pageSizeAttr = Number(el.getAttribute('data-max-cols'));
      const pageSize = Number.isFinite(pageSizeAttr) && pageSizeAttr >= 0 ? pageSizeAttr : 20; // 0 => all

      fetch(url)
        .then(r => r.ok ? r.text() : Promise.reject())
        .then(text => {
          const rows = parseCSV(text);
          const limitedRows = rows.length ? [rows[0], ...rows.slice(1, 6)] : rows; // header + 5 rows
          const totalCols = limitedRows.length ? limitedRows[0].length : 0;
          let startCol = 0;

          // Top toolbar: actions (left) + status (right)
          const topBar = document.createElement('div');
          topBar.className = 'preview-toolbar';

          const topLeft = document.createElement('div');
          topLeft.className = 'group';

          const download = document.createElement('a');
          download.className = 'btn-ghost';
          download.href = url; download.download = '';
          download.textContent = 'Download sample';

          const copyBtn = document.createElement('button');
          copyBtn.type = 'button';
          copyBtn.textContent = 'Copy header';

          topLeft.append(download, copyBtn);

          const topRight = document.createElement('div');
          topRight.className = 'group';
          const status = document.createElement('span');
          status.className = 'status';
          status.setAttribute('aria-live', 'polite');
          topRight.appendChild(status);

          // Bottom toolbar: navigation only (bottom-left)
          const bottomBar = document.createElement('div');
          bottomBar.className = 'preview-toolbar preview-toolbar--bottom';

          const bottomLeft = document.createElement('div');
          bottomLeft.className = 'group';
          const prev = document.createElement('button'); prev.type = 'button'; prev.textContent = '◀';
          const info = document.createElement('span'); info.className = 'range'; info.setAttribute('aria-live','polite');
          const next = document.createElement('button'); next.type = 'button'; next.textContent = '▶';
          bottomLeft.append(prev, info, next);
          bottomBar.appendChild(bottomLeft);

          // Insert bars around the table container
          el.parentNode.insertBefore(topBar, el);                // actions above
          topBar.append(topLeft, topRight);
          el.parentNode.insertBefore(bottomBar, el.nextSibling); // nav below

          function render() {
            const slice = sliceCols(limitedRows, startCol, pageSize);
            const viewStart = startCol + 1;
            const viewEnd = pageSize === 0 ? totalCols : Math.min(startCol + pageSize, totalCols);

            // Replace table
            el.textContent = '';
            el.appendChild(makeTable(slice));

            // Update bottom nav state
            info.textContent = `Columns ${viewStart}–${viewEnd} of ${totalCols}`;
            prev.disabled = (startCol === 0);
            next.disabled = (pageSize === 0 || viewEnd >= totalCols);
          }

          prev.addEventListener('click', () => {
            startCol = Math.max(0, startCol - (pageSize || totalCols));
            render();
          });
          next.addEventListener('click', () => {
            if (pageSize === 0) return;
            startCol = Math.min(totalCols - pageSize, startCol + pageSize);
            if (startCol < 0) startCol = 0;
            render();
          });

        copyBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (!limitedRows.length) return;

          const original = copyBtn.textContent;
          const header = limitedRows[0].join(','); // copy as comma-separated

          copyToClipboard(header,
            () => {
              copyBtn.textContent = 'Copied';
              copyBtn.classList.add('ok');
              status.textContent = 'Copied.';
              setTimeout(() => {
                copyBtn.textContent = original;
                copyBtn.classList.remove('ok');
                status.textContent = '';
              }, 1200);
            },
            () => {
              copyBtn.textContent = 'Copy failed';
              copyBtn.classList.add('ok');
              status.textContent = 'Copy failed.';
              setTimeout(() => {
                copyBtn.textContent = original;
                copyBtn.classList.remove('ok');
                status.textContent = '';
              }, 1500);
            }
          );
        });


          render();
        })
        .catch(() => { el.textContent = 'Could not load sample preview.'; });
    });

    /* ========= TOC: mobile “Jump to…” + scroll-spy highlight ========= */
    const toc = document.getElementById('toc');
    if (toc) {
      const links = Array.from(toc.querySelectorAll('a[href^="#"]'));

      // Build mobile select
      if (links.length) {
        const select = document.createElement('select');
        select.className = 'toc-select';
        const firstOpt = document.createElement('option');
        firstOpt.value = ''; firstOpt.textContent = 'Jump to…';
        select.appendChild(firstOpt);
        links.forEach(a => {
          const opt = document.createElement('option');
          opt.value = a.getAttribute('href');
          opt.textContent = a.textContent.trim();
          select.appendChild(opt);
        });
        const h2 = toc.querySelector('h2') || toc.firstChild;
        h2 && h2.insertAdjacentElement('afterend', select);
        select.addEventListener('change', () => { if (select.value) location.hash = select.value; });
      }

      // Scroll-spy (uses --header-h for accuracy)
      const targets = links
        .map(a => document.getElementById((a.getAttribute('href') || '').slice(1)))
        .filter(Boolean);

      const headerPx = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 88;
      const OFFSET = headerPx + 12;

      function setActive(el) {
        links.forEach(l => l.removeAttribute('aria-current'));
        const found = links.find(l => l.getAttribute('href') === `#${el.id}`);
        if (found) found.setAttribute('aria-current', 'true');
      }

      function updateOnScroll() {
        let best = null, bestDist = Infinity;
        for (const el of targets) {
          const top = el.getBoundingClientRect().top - OFFSET;
          const dist = Math.abs(top);
          if (top <= 0 && dist < bestDist) { best = el; bestDist = dist; }
        }
        if (!best) {
          for (const el of targets) {
            const top = el.getBoundingClientRect().top - OFFSET;
            if (top > 0) { best = el; break; }
          }
        }
        if (best) setActive(best);
      }

      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => { updateOnScroll(); ticking = false; });
          ticking = true;
        }
      }, { passive: true });

      window.addEventListener('resize', updateOnScroll);
      window.addEventListener('load', updateOnScroll);

      // Instant feedback on click
      links.forEach(a => a.addEventListener('click', () => {
        links.forEach(x => x.removeAttribute('aria-current'));
        a.setAttribute('aria-current', 'true');
      }));

      updateOnScroll();
    }

    // === Align the TOC panel with the first content heading (desktop only) ===
    /*
    if (document.body.classList.contains('resources-page')) {
      (function alignTocToFirstHeading() {
        const mq   = window.matchMedia('(max-width: 980px)'); // keep in sync with CSS
        const grid = document.querySelector('body.resources-page .page-grid');
        const toc  = document.querySelector('body.resources-page .toc-panel');
        // Prefer the Datasets h2; fall back to the first main h2
        const firstH2 =
          document.querySelector('#datasets > h2') ||
          document.querySelector('body.resources-page main h2');

        if (!grid || !toc || !firstH2) return;

        function apply() {
          // On mobile (single column) no offset
          if (mq.matches) {
            toc.style.marginTop = '0px';
            return;
          }
          // Compute how far down the first H2 sits inside the grid
          const gridTop  = grid.getBoundingClientRect().top + window.scrollY;
          const h2Top    = firstH2.getBoundingClientRect().top + window.scrollY;

          // Exact delta; small fudge (-2) helps account for subpixel rounding
          const delta = Math.max(0, Math.round(h2Top - gridTop - 2));
          toc.style.marginTop = `${delta}px`;
        }

        window.addEventListener('load', apply);
        window.addEventListener('resize', apply);
        apply();
      })();
    }
    */

    /* ========= FAIR checklist: dynamic chip text from data-status (A11Y-friendly) ========= */
    (function () {
      const LABEL = {
        available: 'Available',
        soon: 'Coming soon',
        external: 'External',
        missing: 'Not planned'
      };

      function applyFair(item) {
        const el = item.querySelector('.state');
        if (!el) return;
        const s = (item.getAttribute('data-status') || '').toLowerCase();
        const txt = LABEL[s] || s || 'Unknown';
        el.textContent = txt;
        el.setAttribute('aria-label', `Status: ${txt.toLowerCase()}`);
      }

      const items = document.querySelectorAll('.fair-item');
      items.forEach(applyFair);

      // Keep in sync if data-status changes later
      const mo = new MutationObserver(muts => {
        muts.forEach(m => {
          if (m.type === 'attributes' && m.attributeName === 'data-status') applyFair(m.target);
        });
      });
      items.forEach(el => mo.observe(el, { attributes: true }));
    })();

    /* ========= Publications: filter + dynamic chip text ========= */
    (function(){
      // Dynamic chip labels for publications
      const MAP = {
        'in-prep': 'In prep',
        'submitted': 'Submitted',
        'under-review': 'Under review',
        'accepted': 'Accepted',
        'published': 'Published',
        'preprint': 'Preprint',
        'wip': 'WIP',
        'planned': 'Planned'
      };
      document.querySelectorAll('.pub-item').forEach(item => {
        const chip = item.querySelector('.pub-state');
        if (!chip) return;
        const s = (item.getAttribute('data-status') || '').toLowerCase();
        const txt = MAP[s] || '—';
        chip.textContent = txt;
        chip.setAttribute('aria-label', `Status: ${txt.toLowerCase()}`);
      });

      // Category filter
      const bar = document.querySelector('.pub-filter');
      if (!bar) return;
      const buttons = Array.from(bar.querySelectorAll('button[data-filter]'));
      const items = Array.from(document.querySelectorAll('.pub-item'));
      function applyFilter(kind){
        items.forEach(it => {
          const k = it.getAttribute('data-kind');
          it.style.display = (kind === 'all' || k === kind) ? '' : 'none';
        });
      }
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.setAttribute('aria-pressed', 'false'));
          btn.setAttribute('aria-pressed', 'true');
          applyFilter(btn.getAttribute('data-filter'));
        });
      });
    })();

  /* ========= Source Code: dynamic chip text from data-status ========= */
    (function(){
      const MAP = {
        public: 'Public',
        private: 'Private',
        wip: 'Work in progress',
        frozen: 'Frozen',
        archived: 'Archived'
      };
      document.querySelectorAll('.repo').forEach(repo => {
        const chip = repo.querySelector('.repo-state');
        if (!chip) return;
        const s = (repo.getAttribute('data-status') || '').toLowerCase();
        const txt = MAP[s] || '—';
        chip.textContent = txt;
        chip.setAttribute('aria-label', `Repository status: ${txt.toLowerCase()}`);
      });
    })();
    /* ========= end ========= */

    /* ========= Licence & Citation: toolbar (Copy + Wrap) — robust ========= */
    (function(){
      function copyText(text){
        return new Promise((resolve, reject) => {
          // Prefer modern API when available AND in a secure context
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(resolve, reject);
          } else {
            // Fallback for HTTP/local files/older browsers
            try {
              const ta = document.createElement('textarea');
              ta.value = text;
              ta.setAttribute('readonly', '');
              ta.style.position = 'fixed';
              ta.style.top = '-9999px';
              document.body.appendChild(ta);
              ta.focus();
              ta.select();
              ta.setSelectionRange(0, ta.value.length);
              const ok = document.execCommand('copy');
              document.body.removeChild(ta);
              ok ? resolve() : reject(new Error('execCommand copy failed'));
            } catch (err) {
              reject(err);
            }
          }
        });
      }

      document.querySelectorAll('pre.cite').forEach(pre => {
        // Build toolbar
        const bar = document.createElement('div');
        bar.className = 'cite-toolbar';

        const left = document.createElement('div'); left.className = 'group';
        const btnCopy = document.createElement('button'); btnCopy.type='button'; btnCopy.textContent='Copy';
        const btnWrap = document.createElement('button'); btnWrap.type='button'; btnWrap.textContent='Wrap lines'; btnWrap.setAttribute('aria-pressed','false');
        left.append(btnCopy, btnWrap);

        const right = document.createElement('div'); right.className = 'group';
        const status = document.createElement('span'); status.className = 'status'; status.setAttribute('aria-live','polite');
        right.append(status);

        bar.append(left, right);
        pre.parentNode.insertBefore(bar, pre); // inject above the <pre>

        // Handlers
        btnCopy.addEventListener('click', (e) => {
          e.preventDefault();
          const original = btnCopy.textContent;
          copyText(pre.textContent)
            .then(() => {
              // Visual feedback on the button + message on the right
              btnCopy.textContent = 'Copied';
              btnCopy.classList.add('ok');
              status.textContent = 'Copied.';
              pre.classList.add('is-copied');

              setTimeout(() => {
                btnCopy.textContent = original;
                btnCopy.classList.remove('ok');
                status.textContent = '';
                pre.classList.remove('is-copied');
              }, 1200);
            })
            .catch(() => {
              btnCopy.textContent = 'Copy failed';
              btnCopy.classList.add('ok');
              status.textContent = 'Copy failed.';
              setTimeout(() => {
                btnCopy.textContent = original;
                btnCopy.classList.remove('ok');
                status.textContent = '';
              }, 1500);
            });
        });


        btnWrap.addEventListener('click', (e) => {
          e.preventDefault();
          const on = btnWrap.getAttribute('aria-pressed') !== 'true';
          btnWrap.setAttribute('aria-pressed', on ? 'true' : 'false');
          pre.classList.toggle('is-wrapped', on);
        });
      });
    })();
    /* ========= end ========= */

  })();
});

(function includePartials() {
  document.querySelectorAll('[data-include]').forEach(async (el) => {
    const url = el.getAttribute('data-include');
    try {
      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok) throw new Error(res.status);
      const html = await res.text();

      // Replace the placeholder with the partial’s nodes (no extra wrapper)
      const tmp = document.createElement('div');
      tmp.innerHTML = html.trim();
      const frag = document.createDocumentFragment();
      Array.from(tmp.childNodes).forEach(n => frag.appendChild(n));
      el.replaceWith(frag);
    } catch (e) {
      // Graceful fallback (optional)
      el.outerHTML = `
        <footer class="site-footer">
          <div class="container">
            <p>© 2025 DeepCosmoNet — Site by <a href="https://koexai.com" rel="external">Koexai srl</a></p>
          </div>
        </footer>`;
    }
  });
})();

