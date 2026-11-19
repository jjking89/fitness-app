// ===== Supplements: a simple list of common supplements with a scroll wheel for the amount =====
// What you take counts towards the day's totals (fibre, protein, calories) everywhere: Home, Food, weekly review, targets.
// Data: S.svMine = your list (keys), S.svLog = [{id, date, k, amt}] (one entry per supplement per day).
const SV_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" class="sv-ico"><rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="M12 6.6 15.6 12.3"/></svg>';
// per = nutrients per one unit (per g, per tablet …); typical UK product values
const SV_LIB = [
  {k: 'fibre', name: 'Soluble fibre', unit: 'g', step: 1, max: 30, def: 5, per: {fibre: 0.9, kcal: 2}},
  {k: 'psyllium', name: 'Psyllium husk', unit: 'g', step: 1, max: 30, def: 6, per: {fibre: 0.8, kcal: 2, carbs: 0.1}},
  {k: 'inulin', name: 'Inulin', unit: 'g', step: 1, max: 20, def: 5, per: {fibre: 0.9, kcal: 2}},
  {k: 'd3', name: 'Vitamin D3', unit: 'tablet', step: 1, max: 4, def: 1},
  {k: 'creatine', name: 'Creatine', unit: 'g', step: 1, max: 20, def: 5},
  {k: 'omega', name: 'Omega-3', unit: 'capsule', step: 1, max: 6, def: 2, per: {kcal: 10, fat: 1}},
  {k: 'whey', name: 'Whey protein', unit: 'g', step: 5, max: 90, def: 30, per: {protein: 0.8, kcal: 4, carbs: 0.08, fat: 0.05}},
  {k: 'mag', name: 'Magnesium', unit: 'tablet', step: 1, max: 4, def: 1},
  {k: 'multi', name: 'Multivitamin', unit: 'tablet', step: 1, max: 2, def: 1},
  {k: 'elec', name: 'Electrolytes', unit: 'sachet', step: 1, max: 4, def: 1, per: {kcal: 10}},
  {k: 'b12', name: 'Vitamin B12', unit: 'tablet', step: 1, max: 2, def: 1},
  {k: 'zinc', name: 'Zinc', unit: 'tablet', step: 1, max: 2, def: 1},
  {k: 'iron', name: 'Iron', unit: 'tablet', step: 1, max: 2, def: 1},
  {k: 'collagen', name: 'Collagen', unit: 'g', step: 1, max: 20, def: 10, per: {protein: 0.9, kcal: 3.6}},
];
const SV_KEYS = ['kcal', 'protein', 'carbs', 'fat', 'fibre'];
const svLib = k => SV_LIB.find(s => s.k === k);
const svInit = () => { S.svMine ||= ['fibre', 'psyllium', 'd3', 'creatine', 'omega']; S.svLog ||= []; };
const svAmt = (s, v) => `${v} ${s.unit}${v !== 1 && s.unit !== 'g' ? 's' : ''}`;
const svGot = (k, d = today()) => S.svLog?.find(l => l.k === k && l.date === d);
function svDayTotals(d) { const t = {}; for (const l of (S.svLog || []).filter(l => l.date === d)) { const s = svLib(l.k); for (const n of SV_KEYS) t[n] = (t[n] || 0) + (s?.per?.[n] || 0) * l.amt; } return t; }
const svHint = (s, v) => s.per?.fibre ? `≈ ${n1(s.per.fibre * v)} g fibre` : s.per?.protein ? `≈ ${Math.round(s.per.protein * v)} g protein` : svAmt(s, v);

// supplements count in the day's totals everywhere
const _svDayTotals = dayTotals;
dayTotals = function (d = today()) { const t = _svDayTotals(d), x = svDayTotals(d); for (const n of SV_KEYS) t[n] = n1((t[n] || 0) + (x[n] || 0)); return t; };

let svPick = null, svVal = 0, svEdit = false;
function svSave(k, v) { svInit(); S.svLog = S.svLog.filter(l => !(l.k === k && l.date === today())); if (v > 0) S.svLog.push({id: uid(), date: today(), k, amt: v}); svPick = null; save(); render(); }
screens.Supplements = () => { svInit(); const tot = svDayTotals(today()), taken = S.svMine.filter(k => svGot(k)).length;
  return `<div class="sec-h"><h1 class="xl">Supplements</h1><button class="pill" onclick="svEdit=!svEdit;render()">${svEdit ? 'Done' : 'Edit'}</button></div>
  <div class="card sv-sum"><div><span class="big">${n1(tot.fibre || 0)}</span> g<div class="mute">fibre</div></div><div><span class="big">${Math.round(tot.protein || 0)}</span> g<div class="mute">protein</div></div><div><span class="big">${taken}/${S.svMine.length}</span><div class="mute">taken today</div></div></div>
  <div class="card">${S.svMine.length ? `<ul class="sv-list">${S.svMine.map(k => { const s = svLib(k); if (!s) return ''; const g = svGot(k);
    return `<li><span class="sv-badge ${g ? 'on' : ''}">${SV_ICON}</span><span class="sv-n"><b>${s.name}</b><br><span class="mute">${g ? svAmt(s, g.amt) + ' today' + (s.per?.fibre || s.per?.protein ? ' · ' + svHint(s, g.amt) : '') : 'Not taken'}</span></span>
      ${svEdit ? `<button class="rnd sv-del" onclick="S.svMine=S.svMine.filter(x=>x!=='${k}');save();render()" aria-label="Remove ${s.name}">✕</button>` : `<button class="sv-amt ${g ? 'on' : ''}" onclick="svPick='${k}';svVal=${g ? g.amt : s.def};render()">${g ? svAmt(s, g.amt) : '+ Add'}</button>`}</li>`; }).join('')}</ul>` : '<p class="mute">Your list is empty. Tap Edit to add supplements.</p>'}</div>
  ${svEdit ? `<h3>Add to your list</h3><div class="chips">${SV_LIB.filter(s => !S.svMine.includes(s.k)).map(s => `<button class="chip" onclick="S.svMine.push('${s.k}');save();render()">+ ${s.name}</button>`).join('') || '<span class="mute">All added</span>'}</div><p class="mute">Removing one from your list keeps the days you've already taken it.</p>` : '<p class="mute center">Tap an amount to change it. Counts towards your daily fibre and protein.</p>'}
  ${svPick ? svSheet() : ''}`; };
function svSheet() { const s = svLib(svPick), vals = []; for (let v = 0; v <= s.max; v += s.step) vals.push(v);
  return `<div class="sv-back" onclick="if(event.target===this){svPick=null;render()}"><div class="sv-sheet">
    <div class="sec-h"><b>${s.name}</b><button class="link" style="width:auto" onclick="svPick=null;render()">Cancel</button></div>
    <div class="sv-wheel" id="svWheel" onscroll="svSnap(this)">${['', '', ...vals, '', ''].map(v => `<div class="sv-opt ${v === svVal ? 'on' : ''}">${v === '' ? '' : svAmt(s, v)}</div>`).join('')}</div>
    <p class="mute center" id="svHint">${svHint(s, svVal)}</p>
    <div class="grid2"><button class="sec" onclick="svSave(svPick,0)">Not taken</button><button onclick="svSave(svPick,svVal);toastMsg('Saved')">Save</button></div></div></div>`; }
function svSnap(el) { clearTimeout(svSnap.t); svSnap.t = setTimeout(() => { const s = svLib(svPick); if (!s) return; const i = Math.round(el.scrollTop / 44); svVal = Math.min(s.max, i * s.step); el.querySelectorAll('.sv-opt').forEach((o, j) => o.classList.toggle('on', j === i + 2)); const h = document.getElementById('svHint'); if (h) h.textContent = svHint(s, svVal); }, 80); }
const _svRender = render;
render = function () { _svRender(); const w = document.getElementById('svWheel'); if (w && svPick) { const s = svLib(svPick); w.scrollTop = Math.round(svVal / s.step) * 44; } };
TAB_OF.Supplements = 'Today';

// Home card and Menu row
const _svToday = screens.Today;
screens.Today = () => { svInit(); const h = _svToday(), a = '<div class="sec-h"><h2>Diary</h2>', taken = S.svMine.filter(k => svGot(k)).length, f = n1(svDayTotals(today()).fibre || 0);
  return h.replace(a, `<button class="card sv-home" onclick="go('Supplements')"><span class="sv-badge ${taken ? 'on' : ''}">${SV_ICON}</span><span style="flex:1;text-align:left"><b>Supplements</b><br><span class="mute">${taken} of ${S.svMine.length} today${f ? ` · ${f} g fibre` : ''}</span></span><span class="mute">›</span></button>` + a); };
if (screens.Menu) { const _svMenu = screens.Menu; screens.Menu = () => { const h = _svMenu(), i = h.indexOf('<li'); return i < 0 ? h : h.slice(0, i) + `<li style="cursor:pointer" onclick="go('Supplements')"><span style="display:flex;align-items:center;gap:10px"><span class="sv-badge sm">${SV_ICON}</span>Supplements</span><span class="mute">›</span></li>` + h.slice(i); }; }
