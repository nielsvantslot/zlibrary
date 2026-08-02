const SKILL_COLORS = [
  '--skill-forest', '--skill-oxblood', '--skill-navy', '--skill-mustard',
  '--skill-teal', '--skill-plum', '--skill-rust', '--skill-olive',
  '--skill-indigo', '--skill-slate',
];

const SKILL_ICONS = {
  Welding: 'icon-welding',
  Agriculture: 'icon-agriculture',
  Fishing: 'icon-fishing',
  Glassmaking: 'icon-glassmaking',
  Cooking: 'icon-cooking',
  Trapping: 'icon-trapping',
  Electrical: 'icon-electrical',
  Mechanics: 'icon-mechanics',
  Foraging: 'icon-foraging',
  Tailoring: 'icon-tailoring',
};

const state = {
  category: '',
  state: '',
  q: '',
  books: [],
};

const libraryEl = document.getElementById('library');
const shelfTemplate = document.getElementById('shelf-template');
const spineTemplate = document.getElementById('spine-template');
const indexCardTemplate = document.getElementById('index-card-template');
const popover = document.getElementById('popover');
const popoverTitle = document.getElementById('popover-title');
const popoverStates = document.getElementById('popover-states');
const popoverNote = document.getElementById('popover-note');
let debounceTimer = null;
let activePopoverBookId = null;
let toastTimer = null;

const toastEl = document.getElementById('toast');
function showToast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 4000);
}

const skillColorCache = new Map();
function colorVarForSkill(skill) {
  if (!skillColorCache.has(skill)) {
    skillColorCache.set(skill, SKILL_COLORS[skillColorCache.size % SKILL_COLORS.length]);
  }
  return `var(${skillColorCache.get(skill)})`;
}

function callNumberForSkill(skill) {
  const letters = skill.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);
  return letters || 'GEN';
}

async function fetchBooks() {
  const params = new URLSearchParams();
  if (state.category) params.set('category', state.category);
  if (state.state) params.set('state', state.state);
  if (state.q) params.set('q', state.q);

  const res = await fetch(`/api/books?${params.toString()}`);
  state.books = await res.json();
  render();
}

async function fetchStats() {
  const res = await fetch('/api/stats');
  const data = await res.json();
  renderStats(data);
}

function renderStats(data) {
  const totalsByCategory = Object.fromEntries(data.totals.map((t) => [t.category, t.count]));
  const shelvedByCategory = {};
  for (const row of data.byCategory) {
    if (row.state === 'shelved') shelvedByCategory[row.category] = row.count;
  }

  for (const cat of ['skill_book', 'recipe_magazine', 'vhs_tape']) {
    const total = totalsByCategory[cat] || 0;
    const shelved = shelvedByCategory[cat] || 0;
    const fraction = total ? shelved / total : 0;
    document.getElementById(`fill-${cat}`).style.transform = `scaleX(${fraction})`;
    document.getElementById(`count-${cat}`).textContent = `${shelved} / ${total} shelved`;
  }
}

function levelSort(a, b) {
  return (a.level || 0) - (b.level || 0);
}

function groupBooks(books) {
  const skillBooks = books.filter((b) => b.category === 'skill_book');
  const magazines = books.filter((b) => b.category === 'recipe_magazine');
  const vhsTapes = books.filter((b) => b.category === 'vhs_tape');

  const bySkill = new Map();
  for (const b of skillBooks) {
    const key = b.skill || 'Other';
    if (!bySkill.has(key)) bySkill.set(key, []);
    bySkill.get(key).push(b);
  }
  for (const list of bySkill.values()) list.sort(levelSort);

  const skillSections = [...bySkill.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  magazines.sort((a, b) => a.title.localeCompare(b.title));
  vhsTapes.sort((a, b) => a.title.localeCompare(b.title));

  return { skillSections, magazines, vhsTapes };
}

function makeShelf(skill, books) {
  const node = shelfTemplate.content.cloneNode(true);
  const shelved = books.filter((b) => b.state === 'shelved').length;

  node.querySelector('.shelf-callno').textContent = callNumberForSkill(skill);
  node.querySelector('.shelf-name').textContent = skill;
  node.querySelector('.shelf-progress').textContent = `${shelved}/${books.length}`;

  const row = node.querySelector('.spine-row');
  const color = colorVarForSkill(skill);
  for (const book of books) row.appendChild(makeSpine(book, color));

  return node;
}

function makeSpine(book, colorVar) {
  const node = spineTemplate.content.cloneNode(true);
  const spine = node.querySelector('.spine');
  const statusBtn = node.querySelector('.spine-status-btn');
  const noteTab = node.querySelector('.spine-note-tab');
  spine.style.setProperty('--spine-color', colorVar);
  spine.dataset.state = book.state;
  spine.dataset.id = book.id;
  if (book.note) spine.dataset.hasNote = 'true';

  const label = book.levelLabel ? `${book.title} — ${book.levelLabel}` : book.title;
  statusBtn.setAttribute('aria-label', `${label}, currently ${book.state}. Activate to change status.`);
  noteTab.setAttribute('aria-label', `Note for ${label}`);

  const shortTitle = shortSpineTitle(book.title);
  const titleEl = node.querySelector('.spine-title');
  titleEl.textContent = shortTitle;
  if (shortTitle.length > 22) titleEl.dataset.length = 'long';
  node.querySelector('.spine-tier').textContent = book.level ? `Vol. ${romanNumeral(book.level)}` : '';

  statusBtn.addEventListener('click', () => cycleStatus(book));
  noteTab.addEventListener('click', () => openPopover(spine, book));

  return node;
}

function romanNumeral(n) {
  const map = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return map[n - 1] || String(n);
}

function shortSpineTitle(title) {
  const quoted = title.match(/"([^"]+)"/);
  return quoted ? quoted[1] : title;
}

const TITLE_PREFIX_RE = /^(Magazine|VHS):\s*/;

function coverLines(effect) {
  const text = effect || '';
  const items = text.startsWith('Unlocks:')
    ? text.replace(/^Unlocks:\s*/, '').split(';').map((s) => s.trim()).filter(Boolean)
    : text.split(',').map((s) => s.trim()).filter(Boolean);
  const shown = items.slice(0, 3);
  const extra = items.length - shown.length;
  if (extra > 0) shown.push(`+${extra} more`);
  return shown;
}

function makeIndexCard(book, fallbackIcon = 'icon-general') {
  const node = indexCardTemplate.content.cloneNode(true);
  const card = node.querySelector('.index-card');
  card.dataset.state = book.state;
  card.dataset.id = book.id;
  card.style.setProperty('--card-color', book.skill ? colorVarForSkill(book.skill) : 'var(--walnut-light)');

  const title = book.title.replace(TITLE_PREFIX_RE, '');
  node.querySelector('.index-card-title').textContent = title;
  node.querySelector('.index-card-skill').textContent = book.skill || 'General';

  const iconId = (book.skill && SKILL_ICONS[book.skill]) || fallbackIcon;
  node.querySelector('.index-card-icon-use').setAttribute('href', `#${iconId}`);

  const linesEl = node.querySelector('.index-card-lines');
  for (const line of coverLines(book.effect)) {
    const li = document.createElement('li');
    li.textContent = line;
    linesEl.appendChild(li);
  }

  const noteBtn = node.querySelector('.card-note-toggle');
  if (book.note) noteBtn.dataset.hasNote = 'true';
  noteBtn.setAttribute('aria-label', `Note for ${title}`);
  noteBtn.title = 'Who has it / where is it?';
  noteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openPopover(noteBtn, book);
  });

  card.addEventListener('click', () => cycleStatus(book));

  return node;
}

function renderShelfSection(container, skill, books) {
  container.appendChild(makeShelf(skill, books));
}

function render() {
  libraryEl.innerHTML = '';

  if (!state.books.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No books match your search or filters.';
    libraryEl.appendChild(empty);
    return;
  }

  const { skillSections, magazines, vhsTapes } = groupBooks(state.books);

  if (!state.category || state.category === 'skill_book') {
    for (const [skill, books] of skillSections) {
      renderShelfSection(libraryEl, skill, books);
    }
  }

  if ((!state.category || state.category === 'recipe_magazine') && magazines.length) {
    const heading = document.createElement('h2');
    heading.className = 'section-heading';
    heading.textContent = 'Recipe Magazines — Periodicals';
    libraryEl.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'index-card-grid';
    for (const book of magazines) grid.appendChild(makeIndexCard(book));
    libraryEl.appendChild(grid);
  }

  if ((!state.category || state.category === 'vhs_tape') && vhsTapes.length) {
    const heading = document.createElement('h2');
    heading.className = 'section-heading';
    heading.textContent = 'VHS Tapes — Home Video Archive';
    libraryEl.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'index-card-grid';
    for (const book of vhsTapes) grid.appendChild(makeIndexCard(book, 'icon-vhs'));
    libraryEl.appendChild(grid);
  }
}

const STATE_CYCLE = ['missing', 'found', 'shelved'];

function cycleStatus(book) {
  const next = STATE_CYCLE[(STATE_CYCLE.indexOf(book.state) + 1) % STATE_CYCLE.length];
  updateStatus(book.id, { state: next });
}

function openPopover(anchorEl, book) {
  activePopoverBookId = book.id;
  const rect = anchorEl.getBoundingClientRect();
  popover.hidden = false;
  const popW = 220;
  let left = rect.left + rect.width / 2 - popW / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - popW - 8));

  // popover is position:fixed (viewport-relative), so no scrollY here — and
  // flip above the anchor when there isn't room below, so it never lands off-screen.
  const popoverHeight = popover.offsetHeight || 180;
  const spaceBelow = window.innerHeight - rect.bottom;
  const top = spaceBelow >= popoverHeight + 8
    ? rect.bottom + 8
    : Math.max(8, rect.top - popoverHeight - 8);

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;

  popoverTitle.textContent = book.title;
  popoverNote.value = book.note || '';
  [...popoverStates.children].forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.state === book.state);
  });
}

function closePopover() {
  popover.hidden = true;
  activePopoverBookId = null;
}

document.getElementById('popover-close').addEventListener('click', closePopover);

document.addEventListener('click', (e) => {
  if (!popover.hidden && !popover.contains(e.target) && !e.target.closest('.spine-note-tab') && !e.target.closest('.card-note-toggle')) {
    closePopover();
  }
});

popoverStates.addEventListener('click', (e) => {
  const btn = e.target.closest('.popover-state-btn');
  if (!btn || activePopoverBookId == null) return;
  updateStatus(activePopoverBookId, { state: btn.dataset.state });
  [...popoverStates.children].forEach((b) => b.classList.toggle('active', b === btn));
});

popoverNote.addEventListener('change', () => {
  if (activePopoverBookId == null) return;
  updateStatus(activePopoverBookId, { note: popoverNote.value });
});

async function updateStatus(id, patch) {
  let res;
  try {
    res = await fetch(`/api/books/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
  } catch {
    showToast("Couldn't reach the server — change not saved.");
    return;
  }
  if (!res.ok) {
    showToast("Couldn't save that change — try again.");
    return;
  }

  const updated = await res.json();
  const book = state.books.find((b) => b.id === updated.id);
  if (book) {
    if (patch.state !== undefined) book.state = updated.state;
    if (patch.note !== undefined) book.note = updated.note;
  }

  render();
  fetchStats();
}

document.getElementById('search').addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    state.q = e.target.value.trim();
    fetchBooks();
  }, 250);
});

document.getElementById('category-chips').addEventListener('click', (e) => {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  document.querySelectorAll('#category-chips .tab').forEach((c) => c.classList.remove('active'));
  btn.classList.add('active');
  state.category = btn.dataset.category;
  fetchBooks();
});

document.getElementById('state-chips').addEventListener('click', (e) => {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  document.querySelectorAll('#state-chips .tab').forEach((c) => c.classList.remove('active'));
  btn.classList.add('active');
  state.state = btn.dataset.state;
  fetchBooks();
});

fetchBooks();
fetchStats();

let liveRefreshTimer = null;
function scheduleLiveRefresh(updatedBook) {
  if (!popover.hidden && activePopoverBookId === updatedBook.id) {
    [...popoverStates.children].forEach((btn) => btn.classList.toggle('active', btn.dataset.state === updatedBook.state));
    popoverNote.value = updatedBook.note || '';
  }
  clearTimeout(liveRefreshTimer);
  liveRefreshTimer = setTimeout(() => {
    fetchBooks();
    fetchStats();
  }, 150);
}

function connectLiveUpdates() {
  const source = new EventSource('/api/events');
  source.addEventListener('book-updated', (e) => scheduleLiveRefresh(JSON.parse(e.data)));
  source.addEventListener('reload', () => window.location.reload());
  source.onerror = () => { source.close(); setTimeout(connectLiveUpdates, 2000); };
}

const POLL_INTERVAL_MS = 8000;
function pollForUpdates() {
  setInterval(() => {
    fetchBooks();
    fetchStats();
  }, POLL_INTERVAL_MS);
}

async function initLiveUpdates() {
  let live = false;
  try {
    const res = await fetch('/api/config');
    live = !!(await res.json()).live;
  } catch {
    // No /api/config (or it failed) — assume no persistent connection support and poll instead.
  }
  if (live) connectLiveUpdates();
  else pollForUpdates();
}
initLiveUpdates();
