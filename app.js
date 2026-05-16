/* ===================================================
   CardVault — app.js
   =================================================== */

// ===== DATA =====

const TCG_PRESETS_ADD = [
  { name: 'デュエル・マスターズ', maker: 'Takara Tomy', emoji: '🌀', color: '#3B82F622' },
  { name: 'バトルスピリッツ',      maker: 'Bandai',       emoji: '⚡', color: '#EF444422' },
  { name: 'シャドウバース',        maker: 'Cygames',      emoji: '🃏', color: '#7C3AED22' },
  { name: 'Flesh and Blood',      maker: 'LSS',          emoji: '🗡️', color: '#92400E22' },
  { name: 'Dragon Ball Super',    maker: 'Bandai',       emoji: '🔴', color: '#FF6B0022' },
  { name: 'Disney Lorcana',       maker: 'Ravensburger', emoji: '✨', color: '#3B82F622' },
];

// ローカルストレージキー
const LS_TCGS  = 'cv_tcgs';
const LS_CARDS = 'cv_cards';

// デフォルトTCGデータ
const DEFAULT_TCGS = [
  { id: 'poke', name: 'ポケモンカード', maker: 'Nintendo',              emoji: '🎴', color: '#FFD70022' },
  { id: 'mtg',  name: 'マジック: ザ・ギャザリング', maker: 'Wizards',  emoji: '⚔️', color: '#8B451322' },
  { id: 'op',   name: 'ワンピースカード', maker: 'Bandai',             emoji: '🏴‍☠️', color: '#FF444422' },
  { id: 'ygo',  name: '遊戯王',          maker: 'Konami',              emoji: '🐉', color: '#6A0DAD22' },
  { id: 'ws',   name: 'ヴァイスシュヴァルツ', maker: 'Bushiroad',     emoji: '💫', color: '#FF69B422' },
];

// デフォルトカードデータ
const DEFAULT_CARDS = [
  { id:'c1',  tcgId:'poke', name:'リザードン ex',  set:'スカーレット',     num:'006/064', r:'SR', type:'炎',     art:'🔥', bg:'#FF6B3522', cnt:2, date:'2025年3月12日' },
  { id:'c2',  tcgId:'poke', name:'ピカチュウ ex',  set:'ポケモン151',      num:'025/165', r:'RR', type:'電気',   art:'⚡', bg:'#FFD70022', cnt:1, date:'2025年1月5日' },
  { id:'c3',  tcgId:'poke', name:'ルチャブル',     set:'151',              num:'056/165', r:'C',  type:'格闘',   art:'🥊', bg:'#E8404022', cnt:4, date:'2025年1月5日' },
  { id:'c4',  tcgId:'poke', name:'ミュウ ex',      set:'ポケモン151',      num:'151/165', r:'SR', type:'エスパー',art:'✨', bg:'#F9A8D422', cnt:1, date:'2024年12月20日' },
  { id:'c5',  tcgId:'poke', name:'ゲッコウガ',     set:'レイジングサーフ', num:'091/100', r:'R',  type:'水',     art:'💧', bg:'#3B82F622', cnt:3, date:'2025年2月14日' },
  { id:'c6',  tcgId:'poke', name:'カイリュー',     set:'ナイトワンダラー', num:'049/064', r:'RR', type:'ドラゴン',art:'🐲', bg:'#6366F122', cnt:2, date:'2025年4月1日' },
  { id:'c7',  tcgId:'poke', name:'メタグロス ex',  set:'クリムゾンヘイズ', num:'078/066', r:'SR', type:'鋼',     art:'🔩', bg:'#94A3B822', cnt:1, date:'2025年2月28日' },
  { id:'c8',  tcgId:'poke', name:'ニャオハ',       set:'スカーレット',     num:'001/064', r:'C',  type:'草',     art:'🌿', bg:'#22C55E22', cnt:5, date:'2025年3月12日' },
  { id:'c9',  tcgId:'poke', name:'テラパゴス ex',  set:'テラスタルフェス', num:'007/016', r:'RR', type:'ノーマル',art:'🔮', bg:'#A855F722', cnt:1, date:'2025年5月1日' },
  { id:'c10', tcgId:'poke', name:'アンフィーラス', set:'スノーハザード',   num:'062/100', r:'R',  type:'水',     art:'🐛', bg:'#2563EB22', cnt:2, date:'2025年1月18日' },
  { id:'c11', tcgId:'mtg',  name:'Black Lotus',    set:'Alpha',            num:'232/295', r:'R',  type:'アーティファクト', art:'🖤', bg:'#1a1a2e22', cnt:1, date:'2024年11月10日' },
  { id:'c12', tcgId:'mtg',  name:'Llanowar Elves', set:'M19',              num:'168/280', r:'C',  type:'クリーチャー', art:'🧝', bg:'#22C55E22', cnt:4, date:'2025年1月20日' },
  { id:'c13', tcgId:'op',   name:'モンキー・D・ルフィ', set:'OP01',       num:'OP01-060', r:'SR', type:'キャラ', art:'👒', bg:'#FF444422', cnt:2, date:'2025年2月5日' },
  { id:'c14', tcgId:'op',   name:'ゾロ',           set:'OP01',             num:'OP01-118', r:'R',  type:'キャラ', art:'⚔️', bg:'#22C55E22', cnt:3, date:'2025年2月5日' },
  { id:'c15', tcgId:'ygo',  name:'ブラック・マジシャン', set:'LEGEND OF BLUE EYES', num:'LOB-005', r:'SR', type:'魔法使い族', art:'🧙', bg:'#6A0DAD22', cnt:1, date:'2024年10月3日' },
  { id:'c16', tcgId:'ygo',  name:'青眼の白龍',    set:'LEGEND OF BLUE EYES', num:'LOB-001', r:'SR', type:'ドラゴン族', art:'🐉', bg:'#3B82F622', cnt:2, date:'2024年10月3日' },
  { id:'c17', tcgId:'ws',   name:'エミリア',       set:'Re:Zero',           num:'RZ/S55-001', r:'RR', type:'キャラ', art:'👸', bg:'#60A5FA22', cnt:1, date:'2025年3月22日' },
];

// ===== STATE =====
let tcgs        = loadLS(LS_TCGS,  DEFAULT_TCGS);
let allCards    = loadLS(LS_CARDS, DEFAULT_CARDS);
let currentTCGId    = null;
let currentFilter   = 'all';
let currentCardIdx  = null;
let selectedPreset  = null;

// ===== LOCALSTORAGE =====
function loadLS(key, def) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : JSON.parse(JSON.stringify(def));
  } catch { return JSON.parse(JSON.stringify(def)); }
}
function saveLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
function save() {
  saveLS(LS_TCGS,  tcgs);
  saveLS(LS_CARDS, allCards);
}

// ===== PAGE NAVIGATION =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active', 'slide-left', 'slide-right');
  });
  document.getElementById(id).classList.add('active');
}

function goHome() {
  renderTCGList();
  // slide previous pages back
  const pCards  = document.getElementById('p-cards');
  const pDetail = document.getElementById('p-detail');
  pCards.classList.remove('active', 'slide-left');
  pCards.classList.add('slide-right');
  pDetail.classList.remove('active', 'slide-left');
  pDetail.classList.add('slide-right');
  document.getElementById('p-home').classList.add('active');
  document.getElementById('p-home').classList.remove('slide-left', 'slide-right');
}

function goCards(tcgId) {
  if (tcgId !== undefined) currentTCGId = tcgId;
  currentFilter = 'all';
  document.getElementById('card-search').value = '';

  const tcg = tcgs.find(t => t.id === currentTCGId);
  document.getElementById('cards-title').textContent = tcg ? tcg.name : 'カード一覧';

  updateStatsRow();
  resetChips();
  renderCardGrid();

  document.getElementById('p-home').classList.remove('active');
  document.getElementById('p-home').classList.add('slide-left');
  document.getElementById('p-detail').classList.remove('active', 'slide-left');
  document.getElementById('p-detail').classList.add('slide-right');
  document.getElementById('p-cards').classList.remove('slide-right', 'slide-left');
  document.getElementById('p-cards').classList.add('active');
}

function goDetail(cardId) {
  const idx = allCards.findIndex(c => c.id === cardId);
  if (idx < 0) return;
  currentCardIdx = idx;
  const c = allCards[idx];

  document.getElementById('d-title').textContent     = c.name;
  document.getElementById('d-art').textContent        = c.art;
  document.getElementById('d-art').style.background   = c.bg;
  document.getElementById('d-name').textContent       = c.name;
  document.getElementById('d-set-label').textContent  = c.set + ' · ' + c.num;
  document.getElementById('d-qty').textContent        = c.cnt;
  document.getElementById('d-rarity').textContent     = c.r;
  document.getElementById('d-type').textContent       = c.type;
  document.getElementById('d-setname').textContent    = c.set;
  document.getElementById('d-num').textContent        = c.num;
  document.getElementById('d-date').textContent       = c.date;

  document.getElementById('p-cards').classList.remove('active');
  document.getElementById('p-cards').classList.add('slide-left');
  document.getElementById('p-detail').classList.remove('slide-right', 'slide-left');
  document.getElementById('p-detail').classList.add('active');
}

// ===== TCG LIST =====
function renderTCGList() {
  const list = document.getElementById('tcg-list');
  list.innerHTML = tcgs.map(t => {
    const cards = allCards.filter(c => c.tcgId === t.id);
    const total = cards.reduce((s, c) => s + c.cnt, 0);
    const kinds = cards.length;
    return `
      <div class="tcg-row" onclick="goCards('${t.id}')">
        <div class="tcg-ico" style="background:${t.color}">${t.emoji}</div>
        <div class="tcg-info">
          <div class="tcg-nm">${t.name}</div>
          <div class="tcg-sm">${t.maker} · ${kinds}種類</div>
        </div>
        <div class="tcg-right">
          <div class="tcg-ct">${total}枚</div>
          <i class="ti ti-chevron-right tcg-chevron"></i>
        </div>
      </div>`;
  }).join('');
}

function homeSearch() {
  const q = document.getElementById('home-search').value.toLowerCase();
  document.querySelectorAll('.tcg-row').forEach(row => {
    const name = row.querySelector('.tcg-nm').textContent.toLowerCase();
    row.style.display = name.includes(q) ? '' : 'none';
  });
}

// ===== CARD GRID =====
function getFilteredCards() {
  const q = document.getElementById('card-search').value.toLowerCase();
  return allCards.filter(c => {
    if (c.tcgId !== currentTCGId) return false;
    if (q && !c.name.toLowerCase().includes(q) && !c.set.toLowerCase().includes(q)) return false;
    if (currentFilter === 'all')  return true;
    if (currentFilter === 'dupe') return c.cnt > 1;
    return c.r === currentFilter;
  });
}

function renderCardGrid() {
  const filtered = getFilteredCards();
  const grid = document.getElementById('card-grid');

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;padding:40px 0;text-align:center;color:var(--text-tertiary);font-size:14px;">カードがありません</div>`;
    return;
  }

  grid.innerHTML = filtered.map(c => `
    <div class="card-tile" onclick="goDetail('${c.id}')">
      ${c.cnt > 1 ? `<div class="cnt-badge">×${c.cnt}</div>` : ''}
      <div class="card-art" style="background:${c.bg}">
        <div class="r-badge r-${c.r}">${c.r}</div>
        <span>${c.art}</span>
      </div>
      <div class="card-foot">
        <div class="card-name">${c.name}</div>
        <div class="card-sub">${c.set} · ${c.num}</div>
      </div>
    </div>
  `).join('');
}

function filterCards() { renderCardGrid(); }

function setChip(el, f) {
  document.querySelectorAll('#p-cards .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  currentFilter = f;
  renderCardGrid();
}

function resetChips() {
  const chips = document.querySelectorAll('#p-cards .chip');
  chips.forEach((c, i) => c.classList.toggle('active', i === 0));
  currentFilter = 'all';
}

function updateStatsRow() {
  const cards = allCards.filter(c => c.tcgId === currentTCGId);
  const total = cards.reduce((s, c) => s + c.cnt, 0);
  document.getElementById('s-total').textContent = total + '枚';
  document.getElementById('s-kinds').textContent = cards.length + '種類';
}

// ===== DETAIL: QTY =====
function changeQty(delta) {
  if (currentCardIdx === null) return;
  const c = allCards[currentCardIdx];
  c.cnt = Math.max(0, c.cnt + delta);
  document.getElementById('d-qty').textContent = c.cnt;
  save();
}

function deleteCard() {
  if (currentCardIdx === null) return;
  const name = allCards[currentCardIdx].name;
  allCards.splice(currentCardIdx, 1);
  currentCardIdx = null;
  save();
  goCards();
  showToast(name + ' を削除しました');
}

// ===== ADD TCG SHEET =====
function openAddSheet() {
  selectedPreset = null;
  document.getElementById('custom-input').value = '';
  document.getElementById('sheet-add-btn').disabled = true;
  renderPresetGrid();
  document.getElementById('add-overlay').classList.add('open');
}

function closeAddSheet() {
  document.getElementById('add-overlay').classList.remove('open');
  selectedPreset = null;
}

function overlayClick(e) {
  if (e.target === document.getElementById('add-overlay')) closeAddSheet();
}

function renderPresetGrid() {
  const existing = tcgs.map(t => t.name);
  const available = TCG_PRESETS_ADD.filter(p => !existing.includes(p.name));
  const grid = document.getElementById('preset-grid');

  if (available.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;font-size:13px;color:var(--text-tertiary);padding:8px 0;">追加できるプリセットがありません</div>`;
    return;
  }

  grid.innerHTML = available.map((p, i) => `
    <div class="preset-item" onclick="selectPreset(this,'${p.name}','${p.maker}','${p.emoji}','${p.color}')">
      <span class="preset-emoji">${p.emoji}</span>
      <div>
        <div class="preset-name">${p.name}</div>
        <div class="preset-maker">${p.maker}</div>
      </div>
    </div>
  `).join('');
}

function selectPreset(el, name, maker, emoji, color) {
  document.querySelectorAll('.preset-item').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('custom-input').value = '';
  selectedPreset = { name, maker, emoji, color };
  document.getElementById('sheet-add-btn').disabled = false;
}

function onCustomInput() {
  const val = document.getElementById('custom-input').value.trim();
  if (val) {
    document.querySelectorAll('.preset-item').forEach(p => p.classList.remove('selected'));
    selectedPreset = { name: val, maker: 'カスタム', emoji: '🎴', color: '#88888822' };
    document.getElementById('sheet-add-btn').disabled = false;
  } else if (!document.querySelector('.preset-item.selected')) {
    selectedPreset = null;
    document.getElementById('sheet-add-btn').disabled = true;
  }
}

function doAddTCG() {
  if (!selectedPreset) return;
  const newId = 'tcg_' + Date.now();
  tcgs.push({ id: newId, ...selectedPreset });
  save();
  closeAddSheet();
  renderTCGList();
  showToast(selectedPreset.name + ' を追加しました');
}

// ===== SCAN STUB =====
function openScanFromCards() {
  showToast('スキャン機能は近日公開予定です');
}

// ===== NAV =====
function setNav(el, tab) {
  document.querySelectorAll('#p-home .nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  if (tab === 'scan') showToast('スキャン機能は近日公開予定です');
}

// ===== TOAST =====
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

// ===== INIT =====
renderTCGList();
