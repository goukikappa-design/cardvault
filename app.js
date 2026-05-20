/* CardVault — app.js */

// ===== CONSTANTS =====
const LS_TCGS   = 'cv_tcgs';
const LS_CARDS  = 'cv_cards';
const LS_APIKEY = 'cv_gemini_key';
const LS_DARK   = 'cv_dark';

const TCG_PRESETS = [
  { name:'ポケモンカード',             maker:'Nintendo',     emoji:'🎴', color:'#FFD70022' },
  { name:'マジック: ザ・ギャザリング', maker:'Wizards',      emoji:'⚔️', color:'#8B451322' },
  { name:'ワンピースカード',           maker:'Bandai',       emoji:'🏴‍☠️', color:'#FF444422' },
  { name:'遊戯王',                    maker:'Konami',       emoji:'🐉', color:'#6A0DAD22' },
  { name:'ヴァイスシュヴァルツ',       maker:'Bushiroad',    emoji:'💫', color:'#FF69B422' },
  { name:'デュエル・マスターズ',       maker:'Takara Tomy',  emoji:'🌀', color:'#3B82F622' },
  { name:'バトルスピリッツ',           maker:'Bandai',       emoji:'⚡', color:'#EF444422' },
  { name:'Dragon Ball Super',         maker:'Bandai',       emoji:'🔴', color:'#FF6B0022' },
  { name:'Disney Lorcana',            maker:'Ravensburger', emoji:'✨', color:'#60A5FA22' },
];

// ===== STATE =====
let tcgs           = loadLS(LS_TCGS, []);
let allCards       = loadLS(LS_CARDS, []);
let currentTCGId   = null;
let currentFilter  = 'all';
let currentCardIdx = null;
let scannedResult  = null;
let mediaStream    = null;

// ===== LOCALSTORAGE =====
function loadLS(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}
function save() {
  localStorage.setItem(LS_TCGS,  JSON.stringify(tcgs));
  localStorage.setItem(LS_CARDS, JSON.stringify(allCards));
}

// ===== INIT =====
(function init() {
  // dark mode
  if (loadLS(LS_DARK, false)) {
    document.body.classList.add('dark');
    const t = document.getElementById('dark-toggle');
    if (t) t.checked = true;
  }
  // API key check
  const key = localStorage.getItem(LS_APIKEY);
  if (key || loadLS('cv_skipped', false)) {
    navTo('home');
    updateApiKeyStatus();
  }
  renderTCGList();
})();

// ===== PAGE NAV =====
const PAGE_ORDER = ['apikey','home','cards','detail','scan','stats','mypage','settings'];

function navTo(name) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => {
    p.classList.remove('active','slide-left','slide-right');
    p.classList.add('slide-right');
  });
  const target = document.getElementById('p-' + name);
  if (target) {
    target.classList.remove('slide-right');
    target.classList.add('active');
  }
  if (name === 'stats')  renderStats();
  if (name === 'mypage') renderMypage();
  if (name === 'scan')   initScan();
  if (name === 'settings') updateApiKeyStatus();
}

function navTab(el, name) {
  navTo(name);
}

// ===== API KEY =====
function onApiKeyInput() {
  const val = document.getElementById('apikey-input').value.trim();
  document.getElementById('apikey-btn').disabled = val.length < 10;
}

function saveApiKey() {
  const key = document.getElementById('apikey-input').value.trim();
  if (!key) return;
  localStorage.setItem(LS_APIKEY, key);
  localStorage.removeItem('cv_skipped');
  navTo('home');
  updateApiKeyStatus();
}

function skipApiKey() {
  localStorage.setItem('cv_skipped', 'true');
  navTo('home');
}

function openApiKeyEdit() {
  const current = localStorage.getItem(LS_APIKEY) || '';
  document.getElementById('apikey-edit-input').value = current;
  openOverlay('apikey-edit-overlay');
}

function saveApiKeyEdit() {
  const key = document.getElementById('apikey-edit-input').value.trim();
  if (key) {
    localStorage.setItem(LS_APIKEY, key);
    showToast('APIキーを保存しました');
  }
  closeOverlay('apikey-edit-overlay');
  updateApiKeyStatus();
}

function updateApiKeyStatus() {
  const el = document.getElementById('apikey-status');
  if (!el) return;
  const key = localStorage.getItem(LS_APIKEY);
  el.textContent = key ? '設定済み (AIza...'+key.slice(-4)+')' : '未設定';
}

// ===== HOME =====
function renderTCGList() {
  const list = document.getElementById('tcg-list');
  if (!list) return;
  if (tcgs.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:48px 16px;color:var(--text-tertiary);">
        <div style="font-size:48px;margin-bottom:12px;">🎴</div>
        <div style="font-size:15px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;">TCGがまだありません</div>
        <div style="font-size:13px;">下の「TCGを追加する」から始めましょう</div>
      </div>`;
    return;
  }
  list.innerHTML = tcgs.map(t => {
    const cards = allCards.filter(c => c.tcgId === t.id);
    const total = cards.reduce((s,c) => s + c.cnt, 0);
    return `
      <div class="tcg-row" onclick="goCards('${t.id}')">
        <div class="tcg-ico" style="background:${t.color}">${t.emoji}</div>
        <div class="tcg-info">
          <div class="tcg-nm">${t.name}</div>
          <div class="tcg-sm">${t.maker} · ${cards.length}種類</div>
        </div>
        <div class="tcg-right">
          <div class="tcg-ct">${total}枚</div>
          <i class="ti ti-chevron-right" style="color:var(--text-tertiary);font-size:16px;"></i>
        </div>
      </div>`;
  }).join('');
}

function homeSearch() {
  const q = document.getElementById('home-search').value.toLowerCase();
  document.querySelectorAll('.tcg-row').forEach(row => {
    const nm = row.querySelector('.tcg-nm');
    if (nm) row.style.display = nm.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

// ===== ADD TCG =====
function openOverlay(id) {
  if (id === 'add-tcg-overlay') renderPresetGrid();
  document.getElementById(id).classList.add('open');
}

function closeOverlay(id) {
  document.getElementById(id).classList.remove('open');
}

function overlayBgClick(e, id) {
  if (e.target === document.getElementById(id)) closeOverlay(id);
}

function renderPresetGrid() {
  const existing = tcgs.map(t => t.name);
  const available = TCG_PRESETS.filter(p => !existing.includes(p.name));
  const grid = document.getElementById('preset-grid');
  grid.innerHTML = available.length === 0
    ? `<div style="grid-column:1/-1;font-size:13px;color:var(--text-tertiary);padding:8px 0;">追加できるプリセットがありません</div>`
    : available.map(p => `
        <div class="preset-item" onclick="selectPreset(this,'${p.name}','${p.maker}','${p.emoji}','${p.color}')">
          <span class="preset-emoji">${p.emoji}</span>
          <div><div class="preset-name">${p.name}</div><div class="preset-maker">${p.maker}</div></div>
        </div>`).join('');
  document.getElementById('add-tcg-input').value = '';
  document.getElementById('add-tcg-btn').disabled = true;
  window._selectedPreset = null;
}

function selectPreset(el, name, maker, emoji, color) {
  document.querySelectorAll('.preset-item').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('add-tcg-input').value = '';
  window._selectedPreset = { name, maker, emoji, color };
  document.getElementById('add-tcg-btn').disabled = false;
}

function onAddTCGInput() {
  const val = document.getElementById('add-tcg-input').value.trim();
  document.querySelectorAll('.preset-item').forEach(p => p.classList.remove('selected'));
  if (val) {
    window._selectedPreset = { name: val, maker: 'カスタム', emoji: '🎴', color: '#88888822' };
    document.getElementById('add-tcg-btn').disabled = false;
  } else {
    window._selectedPreset = null;
    document.getElementById('add-tcg-btn').disabled = true;
  }
}

function doAddTCG() {
  const p = window._selectedPreset;
  if (!p) return;
  const id = 'tcg_' + Date.now();
  tcgs.push({ id, ...p });
  save();
  closeOverlay('add-tcg-overlay');
  renderTCGList();
  showToast(p.name + ' を追加しました');
}

// ===== CARDS =====
function goCards(tcgId) {
  if (tcgId) currentTCGId = tcgId;
  const tcg = tcgs.find(t => t.id === currentTCGId);
  document.getElementById('cards-title').textContent = tcg ? tcg.name : 'カード一覧';
  document.getElementById('card-search').value = '';
  currentFilter = 'all';
  resetChips();
  updateStatsRow();
  renderCardGrid();
  navTo('cards');
}

function getFiltered() {
  const q = document.getElementById('card-search').value.toLowerCase();
  return allCards.filter(c => {
    if (c.tcgId !== currentTCGId) return false;
    if (q && !c.name.toLowerCase().includes(q) && !(c.set||'').toLowerCase().includes(q)) return false;
    if (currentFilter === 'all')  return true;
    if (currentFilter === 'dupe') return c.cnt > 1;
    return c.r === currentFilter;
  });
}

function renderCardGrid() {
  const cards = getFiltered();
  const grid = document.getElementById('card-grid');
  if (cards.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;padding:40px 0;text-align:center;color:var(--text-tertiary);font-size:14px;">カードがありません</div>`;
    return;
  }
  grid.innerHTML = cards.map(c => {
    const imgContent = c.img
      ? `<img src="${c.img}" alt="${c.name}" />`
      : `<span class="card-art-emoji">${c.art || '🎴'}</span>`;
    return `
      <div class="card-tile" onclick="goDetail('${c.id}')">
        ${c.cnt > 1 ? `<div class="cnt-badge">×${c.cnt}</div>` : ''}
        <div class="card-art" style="background:${c.bg||'#88888822'}">
          <div class="r-badge r-${c.r||'C'}">${c.r||'C'}</div>
          ${imgContent}
        </div>
        <div class="card-foot">
          <div class="card-name">${c.name}</div>
          <div class="card-sub">${c.set||''} ${c.num ? '· '+c.num : ''}</div>
        </div>
      </div>`;
  }).join('');
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
  const total = cards.reduce((s,c) => s + c.cnt, 0);
  document.getElementById('s-total').textContent = total + '枚';
  document.getElementById('s-kinds').textContent = cards.length + '種類';
}

// ===== DETAIL =====
function goDetail(cardId) {
  const idx = allCards.findIndex(c => c.id === cardId);
  if (idx < 0) return;
  currentCardIdx = idx;
  const c = allCards[idx];
  document.getElementById('d-title').textContent    = c.name;
  const artEl = document.getElementById('d-art');
  if (c.img) {
    artEl.innerHTML = `<img src="${c.img}" alt="${c.name}" />`;
    artEl.style.background = '';
  } else {
    artEl.textContent = c.art || '🎴';
    artEl.style.background = c.bg || '#88888822';
  }
  document.getElementById('d-name').textContent      = c.name;
  document.getElementById('d-set-label').textContent = (c.set||'') + (c.num ? ' · ' + c.num : '');
  document.getElementById('d-qty').textContent       = c.cnt;
  document.getElementById('d-rarity').textContent   = c.r || '';
  document.getElementById('d-type').textContent     = c.type || '';
  document.getElementById('d-setname').textContent  = c.set || '';
  document.getElementById('d-num').textContent      = c.num || '';
  document.getElementById('d-date').textContent     = c.date || '';
  navTo('detail');
}

function changeQty(delta) {
  if (currentCardIdx === null) return;
  allCards[currentCardIdx].cnt = Math.max(0, allCards[currentCardIdx].cnt + delta);
  document.getElementById('d-qty').textContent = allCards[currentCardIdx].cnt;
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

// ===== SCAN =====
function initScan() {
  const apiKey = localStorage.getItem(LS_APIKEY);
  const noKey  = document.getElementById('scan-no-key');
  const camera = document.getElementById('scan-camera-wrap');
  const actions = document.getElementById('scan-actions');

  resetScan();

  if (!apiKey) {
    noKey.classList.remove('hidden');
    camera.style.display = 'none';
    actions.classList.add('hidden');
    return;
  }
  noKey.classList.add('hidden');
  camera.style.display = '';
  actions.classList.remove('hidden');

  // populate TCG select
  const sel = document.getElementById('scan-tcg-select');
  sel.innerHTML = tcgs.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  if (currentTCGId) sel.value = currentTCGId;

  // start camera
  startCamera();
}

async function startCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    document.getElementById('scan-video').srcObject = mediaStream;
  } catch(e) {
    showToast('カメラを起動できませんでした');
  }
}

function stopScan() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
  }
}

function resetScan() {
  scannedResult = null;
  ['scan-analyzing','scan-result','scan-error'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById('scan-actions').classList.remove('hidden');
}

async function captureAndAnalyze() {
  const video  = document.getElementById('scan-video');
  const canvas = document.getElementById('scan-canvas');
  canvas.width  = video.videoWidth  || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
  await analyzeImage(base64);
}

async function analyzeFromFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async ev => {
    const base64 = ev.target.result.split(',')[1];
    await analyzeImage(base64);
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

async function analyzeImage(base64) {
  const apiKey = localStorage.getItem(LS_APIKEY);
  if (!apiKey) { showToast('APIキーが設定されていません'); return; }

  const tcgSel = document.getElementById('scan-tcg-select');
  const tcgName = tcgSel.options[tcgSel.selectedIndex]?.text || 'TCGカード';

  document.getElementById('scan-actions').classList.add('hidden');
  const analyzing = document.getElementById('scan-analyzing');
  analyzing.classList.remove('hidden');

  const texts = ['画像を解析中...', 'カード名を認識中...', 'レアリティを確認中...'];
  let ti = 0;
  const textInterval = setInterval(() => {
    document.getElementById('scan-analyzing-text').textContent = texts[ti++ % texts.length];
  }, 800);

  const prompt = `この画像は${tcgName}のカードです。以下の情報をJSON形式のみで返してください。余計な文章は不要です。
{
  "name": "カード名（日本語）",
  "set": "セット名・拡張パック名",
  "num": "カード番号（例: 006/064）",
  "r": "レアリティ（SR/SA/RR/UR/R/U/C のどれか）",
  "type": "タイプ・属性（例: 炎、水、ドラゴン族など）",
  "art": "カードのイメージに合う絵文字1文字"
}
画像からカードが読み取れない場合は {"error": "読み取れませんでした"} を返してください。`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: prompt },
            { inline_data: { mime_type: 'image/jpeg', data: base64 } }
          ]}]
        })
      }
    );
    const data = await res.json();
    clearInterval(textInterval);
    analyzing.classList.add('hidden');

    // APIエラーチェック
    if (data.error) throw new Error('APIエラー: ' + (data.error.message || data.error.status));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) throw new Error('AIから応答がありませんでした');

    // JSON部分を抽出（```json ... ``` や { ... } 形式に対応）
    let jsonStr = text;
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    } else {
      const braceMatch = text.match(/\{[\s\S]*\}/);
      if (braceMatch) jsonStr = braceMatch[0];
    }

    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch(pe) {
      throw new Error('解析結果を読み取れませんでした。もう一度試してください');
    }
    if (result.error) throw new Error(result.error);

    result.tcgId = tcgSel.value;
    result.img   = 'data:image/jpeg;base64,' + base64;
    scannedResult = result;
    showScanResult(result);

  } catch(err) {
    clearInterval(textInterval);
    analyzing.classList.add('hidden');
    document.getElementById('scan-error-text').textContent = '❌ ' + (err.message || '解析に失敗しました');
    document.getElementById('scan-error').classList.remove('hidden');
    document.getElementById('scan-actions').classList.remove('hidden');
  }
}

function showScanResult(r) {
  const rows = [
    ['カード名', r.name || '不明'],
    ['セット',   r.set  || '不明'],
    ['番号',     r.num  || '不明'],
    ['レアリティ', r.r  || '不明'],
    ['タイプ',   r.type || '不明'],
  ];
  document.getElementById('scan-result-body').innerHTML = rows.map(([k,v]) =>
    `<div class="scan-result-row"><span class="scan-result-key">${k}</span><span class="scan-result-val">${v}</span></div>`
  ).join('');
  document.getElementById('scan-result').classList.remove('hidden');

  // prepare edit form
  const fields = [
    { key:'name',  label:'カード名',    val: r.name  || '' },
    { key:'set',   label:'セット名',    val: r.set   || '' },
    { key:'num',   label:'カード番号',  val: r.num   || '' },
    { key:'r',     label:'レアリティ',  val: r.r     || '' },
    { key:'type',  label:'タイプ',      val: r.type  || '' },
  ];
  document.getElementById('edit-form').innerHTML = fields.map(f => `
    <div class="edit-field">
      <div class="edit-label">${f.label}</div>
      <input class="edit-input" id="ef-${f.key}" type="text" value="${f.val}" />
    </div>`).join('');
}

function saveEditResult() {
  if (!scannedResult) return;
  ['name','set','num','r','type'].forEach(k => {
    const el = document.getElementById('ef-' + k);
    if (el) scannedResult[k] = el.value.trim();
  });
  closeOverlay('edit-result-overlay');
  showScanResult(scannedResult);
}

function addScannedCard() {
  if (!scannedResult) return;
  const COLORS = { SR:'#FF6B3522', SA:'#FFB34722', RR:'#94A3B822', UR:'#b0c4de22', R:'#3B82F622', U:'#88888822', C:'#88888822' };
  const newCard = {
    id:    'c_' + Date.now(),
    tcgId: scannedResult.tcgId || currentTCGId,
    name:  scannedResult.name  || '不明',
    set:   scannedResult.set   || '',
    num:   scannedResult.num   || '',
    r:     scannedResult.r     || 'C',
    type:  scannedResult.type  || '',
    art:   scannedResult.art   || '🎴',
    bg:    COLORS[scannedResult.r] || '#88888822',
    img:   scannedResult.img   || null,
    cnt:   1,
    date:  new Date().toLocaleDateString('ja-JP', { year:'numeric', month:'long', day:'numeric' }),
  };

  // merge if same name+set already exists
  const existing = allCards.find(c => c.tcgId === newCard.tcgId && c.name === newCard.name && c.set === newCard.set);
  if (existing) {
    existing.cnt++;
    showToast(newCard.name + ' の枚数を増やしました（' + existing.cnt + '枚）');
  } else {
    allCards.push(newCard);
    showToast(newCard.name + ' を追加しました');
  }
  save();
  resetScan();
  currentTCGId = newCard.tcgId;
  goCards();
}

// ===== STATS =====
function renderStats() {
  const el = document.getElementById('stats-content');
  const total     = allCards.reduce((s,c) => s + c.cnt, 0);
  const kinds     = allCards.length;
  const tcgCount  = tcgs.length;

  const rarityCounts = {};
  allCards.forEach(c => { rarityCounts[c.r||'C'] = (rarityCounts[c.r||'C'] || 0) + c.cnt; });
  const rarityOrder = ['SR','SA','RR','UR','R','U','C'];
  const rarityColors = { SR:'#FFD700', SA:'#FFB347', RR:'#C0C0C0', UR:'#b0c4de', R:'#378ADD', U:'#aaa', C:'#888' };
  const maxRarity = Math.max(...Object.values(rarityCounts), 1);

  const rarityBars = rarityOrder.filter(r => rarityCounts[r]).map(r => `
    <div class="rarity-bar-row">
      <div class="rarity-bar-label">${r}</div>
      <div class="rarity-bar-track">
        <div class="rarity-bar-fill" style="width:${(rarityCounts[r]/maxRarity*100).toFixed(1)}%;background:${rarityColors[r]};"></div>
      </div>
      <div class="rarity-bar-count">${rarityCounts[r]}</div>
    </div>`).join('');

  const tcgBreakdown = tcgs.map(t => {
    const cnt = allCards.filter(c => c.tcgId === t.id).reduce((s,c) => s + c.cnt, 0);
    return `
      <div class="tcg-breakdown-row">
        <span class="tcg-breakdown-emoji">${t.emoji}</span>
        <span class="tcg-breakdown-name">${t.name}</span>
        <span class="tcg-breakdown-count">${cnt}枚</span>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="section-label">全体</div>
    <div class="stats-summary">
      <div class="stats-big-box"><div class="stats-big-lbl">総枚数</div><div class="stats-big-val">${total}</div></div>
      <div class="stats-big-box"><div class="stats-big-lbl">種類</div><div class="stats-big-val">${kinds}</div></div>
      <div class="stats-big-box"><div class="stats-big-lbl">TCG数</div><div class="stats-big-val">${tcgCount}</div></div>
      <div class="stats-big-box"><div class="stats-big-lbl">SR以上</div><div class="stats-big-val">${(rarityCounts['SR']||0)+(rarityCounts['SA']||0)}</div></div>
    </div>
    <div class="section-label">レアリティ内訳</div>
    <div class="rarity-bars">${rarityBars || '<div style="font-size:13px;color:var(--text-tertiary);">データがありません</div>'}</div>
    <div class="section-label">TCG別枚数</div>
    <div class="tcg-breakdown">${tcgBreakdown || '<div style="padding:14px;font-size:13px;color:var(--text-tertiary);">TCGがありません</div>'}</div>
  `;
}

// ===== MYPAGE =====
function renderMypage() {
  const el = document.getElementById('mypage-content');
  const total  = allCards.reduce((s,c) => s + c.cnt, 0);
  const kinds  = allCards.length;
  const sr     = allCards.filter(c => c.r==='SR'||c.r==='SA').reduce((s,c)=>s+c.cnt,0);

  el.innerHTML = `
    <div class="mypage-header">
      <div class="mypage-avatar"><i class="ti ti-user"></i></div>
      <div class="mypage-name">コレクター</div>
      <div class="mypage-sub">CardVaultユーザー</div>
    </div>
    <div class="mypage-stats">
      <div class="mypage-stat"><div class="mypage-stat-val">${total}</div><div class="mypage-stat-lbl">総枚数</div></div>
      <div class="mypage-stat"><div class="mypage-stat-val">${kinds}</div><div class="mypage-stat-lbl">種類</div></div>
      <div class="mypage-stat"><div class="mypage-stat-val">${sr}</div><div class="mypage-stat-lbl">SR以上</div></div>
    </div>
    <div class="section-label">最近追加したカード</div>
    <div style="background:var(--bg-primary);border-radius:var(--radius-md);overflow:hidden;">
      ${allCards.slice(-5).reverse().map(c => `
        <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:0.5px solid var(--border-light);">
          <span style="font-size:24px;">${c.art||'🎴'}</span>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.name}</div>
            <div style="font-size:11px;color:var(--text-tertiary);">${c.set||''} · ${c.r||''}</div>
          </div>
          <div style="font-size:11px;color:var(--text-tertiary);">${c.date||''}</div>
        </div>`).join('') || '<div style="padding:16px;font-size:13px;color:var(--text-tertiary);text-align:center;">カードがありません</div>'}
    </div>
  `;
}

// ===== SETTINGS =====
function toggleDark() {
  const on = document.getElementById('dark-toggle').checked;
  document.body.classList.toggle('dark', on);
  localStorage.setItem(LS_DARK, on);
}

function exportData() {
  const data = { tcgs, cards: allCards, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'cardvault_backup.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('エクスポートしました');
}

function confirmReset() {
  document.getElementById('confirm-title').textContent = '全データをリセット';
  document.getElementById('confirm-msg').textContent   = 'すべてのTCGとカードデータが削除されます。この操作は取り消せません。';
  document.getElementById('confirm-ok-btn').onclick = () => {
    tcgs = []; allCards = [];
    localStorage.removeItem(LS_TCGS);
    localStorage.removeItem(LS_CARDS);
    closeOverlay('confirm-overlay');
    renderTCGList();
    navTo('home');
    showToast('リセットしました');
  };
  openOverlay('confirm-overlay');
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
