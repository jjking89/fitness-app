// ===== Core: state, helpers, profile interview, navigation, editing, backup =====
const KEY = 'fitness-v2', VERSION = 1;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// Interview questions: [key, question, input type, options]
const QUESTIONS = [
  ['height', 'What is your current height in cm?', 'number'],
  ['weight', 'What is your current weight in kg?', 'number'],
  ['goal', 'What is your main fitness goal?', 'select', ['Lose fat', 'Build muscle', 'Get stronger', 'Recomposition', 'General fitness']],
  ['experience', 'How much strength-training experience do you have?', 'select', ['New to it', 'Under 1 year', '1–3 years', '3+ years']],
  ['days', 'Which days can you train?', 'days'],
  ['branch', 'Which Anytime Fitness branch do you attend? (town and street)', 'text'],
  ['equipLike', 'Any equipment, machines or exercises you like?', 'textarea'],
  ['equipAvoid', 'Any equipment, machines or movements you want to avoid?', 'textarea'],
  ['foodLike', 'Foods you like, or your diet style?', 'textarea'],
  ['foodAvoid', 'Foods you avoid or dislike?', 'textarea'],
  ['allergies', 'Any food allergies or intolerances?', 'textarea'],
  ['budget', 'Rough weekly food budget? (£)', 'number'],
  ['prepTime', 'Time you can spend preparing a typical meal? (minutes)', 'number'],
  ['kcal', 'Do you already use a daily calorie target? (kcal)', 'number'],
  ['protein', 'Do you already use a daily protein target? (g)', 'number'],
  ['fibre', 'Do you already use a daily fibre target? (g)', 'number'],
  ['clinician', 'Any current guidance from a doctor, physio or other clinician that affects training? (You can add dated notes in Health later.)', 'textarea'],
];
const EXTRA = [['session', 'Session length, rests included (min)'], ['carbs', 'Carbs target (g/day)'], ['fat', 'Fat target (g/day)'], ['waterGoal', 'Water goal (ml/day)'], ['stepGoal', 'Step goal (per day)']];

const uid = () => Date.now() + Math.random();
const blank = () => ({
  v: VERSION, profile: {session: 60}, iv: 0,
  weights: [], body: [], meals: [], favs: [], water: [], steps: [], sleep: [], workouts: [], routines: [], reviews: [],
  gyms: [], gymId: null, prefs: {}, rest: {}, week: {days: {}}, active: null, timer: null, records: {},
  mealPlan: {slots: {}, ticks: {}}, pending: null, coach: {history: [], tdee: null},
  health: {notes: [], appts: [], symptoms: [], doses: [], med: {enabled: false, name: '', dose: '', start: ''}, constraints: {avoid: '', hr: '', intensity: ''}},
  settings: {autoRest: true, sound: true, vibrate: true, reminder: false, speechConsent: false, autoTargets: null, weighDay: 'Mon'},
});
let S;
function load() { try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch { S = blank(); } migrate(); }
function migrate() { // only adds missing structure; never removes saved data
  const b = blank();
  for (const k in b) if (S[k] === undefined) S[k] = b[k];
  S.health = Object.assign(b.health, S.health);
  S.settings = Object.assign(b.settings, S.settings);
  if (!S.gyms.length) {
    S.gyms = ['Anytime Fitness', 'Other gym', 'Home'].map(name => ({id: uid(), name, equipment: EQUIP.map(e => ({name: e, status: 'unconfirmed'})), listing: '', photos: [], confirmedAt: ''}));
    S.gymId = S.gyms[0].id;
  }
  if (S.profile.session == 45 && !S.profile.session60) S.profile.session = 60; S.profile.session60 = true; // 45 min lifting ≈ 60 min with rests
  S.v = VERSION;
}
function recomputeRecords() { // best lift derived from the set log, so corrections and deletions always update it
  const r = {};
  for (const w of S.workouts) {
    const kg = +w.kg, reps = +w.reps || 0;
    if (!w.exercise || !(kg > 0)) continue;
    const b = r[w.exercise];
    if (!b || kg > b.kg || (kg === b.kg && reps > b.reps)) r[w.exercise] = {kg, reps, date: w.date};
  }
  S.records = r;
}
function save() {
  recomputeRecords();
  try { localStorage.setItem(KEY, JSON.stringify(S)); return true; }
  catch { alert('Could not save on this device (private browsing or storage full). Export a backup now.'); return false; }
}

// ---------- helpers ----------
const today = () => new Date().toLocaleDateString('en-CA'); // local YYYY-MM-DD
const dayOffset = (n, from = today()) => { const d = new Date(from + 'T12:00'); d.setDate(d.getDate() + n); return d.toLocaleDateString('en-CA'); };
const ukDate = d => d ? new Date(d + 'T12:00').toLocaleDateString('en-GB', {weekday: 'short', day: 'numeric', month: 'short', year: d.slice(0, 4) === today().slice(0, 4) ? undefined : 'numeric'}) : 'undated';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const js = s => esc(JSON.stringify(s)); // safe literal inside onclick="..."
const P = () => S.profile;
const has = v => v !== undefined && v !== '' && v !== 'skip' && v !== 'not sure' && !(Array.isArray(v) && !v.length);
const sum = (arr, k) => arr.reduce((a, x) => a + (+x[k] || 0), 0);
const n1 = v => Math.round(v * 10) / 10;
const gb = v => n1(v).toLocaleString('en-GB');
const form = f => Object.fromEntries(new FormData(f));
const getList = path => path.split('.').reduce((o, k) => o[k], S);
const setList = (path, arr) => { const ks = path.split('.'), last = ks.pop(); ks.reduce((o, k) => o[k], S)[last] = arr; };
const todays = path => getList(path).filter(x => x.date === today());
const byDateDesc = (a, b) => (b.date || '') + (b.time || '') > (a.date || '') + (a.time || '') ? 1 : -1;
const add = (path, obj) => { getList(path).push({id: uid(), date: today(), ...obj}); save(); render(); };
function del(path, id) {
  if (!confirm('Delete this entry?')) return;
  if (path === 'workouts' && S.active) S.active.items.forEach(it => it.sets.forEach(s => { if (s.logId == id) { s.logId = null; s.done = false; } }));
  setList(path, getList(path).filter(x => x.id != id)); save(); render();
}
const items = (path, fmt, n = 20) => getList(path).slice().sort(byDateDesc).slice(0, n).map(x =>
  `<li><span>${fmt(x)}<br><span class="mute">${ukDate(x.date)}${x.time ? ' · ' + esc(x.time) : ''}</span></span><span style="white-space:nowrap"><button onclick="editEntry('${path}',${x.id})">Edit</button><button onclick="del('${path}',${x.id})" aria-label="Delete">✕</button></span></li>`).join('') || '<li class="mute">Nothing logged yet</li>';
function macroRow(label, have, target, unit) {
  const t = +target, u = unit ? ' ' + unit : '', pct = t ? Math.min(100, have / t * 100) : 0, over = t && have > t;
  const ring = unit === 'kcal' && t ? `<div class="ring${over ? ' over' : ''}" style="--p:${pct}" aria-hidden="true"><span>${Math.round(pct)}%</span></div>` : '';
  return `<div class="mt macro${ring ? ' has-ring' : ''}">${ring}<div class="macro-body"><div class="macro-head"><span class="macro-label">${label}</span><span style="text-align:right">${gb(have)}${u}${t ? ` / ${gb(t)}${u} · <b>${have <= t ? gb(t - have) + u + ' left' : gb(have - t) + u + ' over'}</b>` : ' <span class="mute">(no target)</span>'}</span></div>
    ${t ? `<div class="bar"><div style="width:${pct}%;${over ? 'background:var(--warn)' : ''}"></div></div>` : ''}</div></div>`;
}
function download(name, text, type = 'text/plain') { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], {type})); a.download = name; a.click(); }
async function copyText(t) { try { await navigator.clipboard.writeText(t); alert('Copied.'); } catch { prompt('Copy this text:', t); } }
const showAnswer = v => v === undefined || v === '' ? '<span class="mute">not answered</span>' : v === 'skip' ? '<span class="mute">skipped</span>' : v === 'not sure' ? '<span class="mute">not sure</span>' : esc(Array.isArray(v) ? v.join(', ') : v);

// ---------- interview (one question at a time; skip / not sure leave the field blank) ----------
let ivSingle = null, ivReturn = null; // key when editing a single answer; screen to return to afterwards
function ivInput(q) {
  const [k, , t, opts] = q, v = P()[k], val = has(v) ? v : '';
  if (t === 'select') return `<select id="ivv"><option value="">Choose…</option>${opts.map(o => `<option ${val === o ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
  if (t === 'days') return `<div class="grid3" id="ivv">${DAYS.map(d => `<label class="chk"><input type="checkbox" value="${d}" ${Array.isArray(val) && val.includes(d) ? 'checked' : ''}> ${d}</label>`).join('')}</div>`;
  if (t === 'textarea') return `<textarea id="ivv" rows="3">${esc(val)}</textarea>`;
  return `<input id="ivv" type="${t}" ${t === 'number' ? 'inputmode="decimal" step="any"' : ''} value="${esc(val)}">`;
}
function ivAnswer(mode) {
  const i = ivSingle ? QUESTIONS.findIndex(q => q[0] === ivSingle) : S.iv, [k, , t] = QUESTIONS[i];
  let v = mode;
  if (mode === 'save') {
    v = t === 'days' ? [...document.querySelectorAll('#ivv input:checked')].map(c => c.value) : document.getElementById('ivv').value.trim();
    if (t === 'number' && v !== '' && !(+v > 0)) return alert('Enter a positive number, or tap Skip.');
    if (v === '' || (Array.isArray(v) && !v.length)) v = 'skip';
  }
  P()[k] = v;
  if (k === 'branch') { S.gyms[0].name = has(v) ? 'Anytime Fitness – ' + v : 'Anytime Fitness'; P().branchConfirmed = false; }
  if (k === 'days') P().daysConfirmed = false;
  if (k === 'weight' && +v > 0 && !S.weights.some(w => w.date === today())) S.weights.push({id: uid(), date: today(), kg: v, source: 'Profile'});
  if (ivSingle) { ivSingle = null; save(); return go(ivReturn || 'Profile'); }
  S.iv = i + 1; if (S.iv >= QUESTIONS.length) P().done = true;
  save(); render();
}
function editAnswer(k, back = 'Profile') { ivSingle = k; ivReturn = back; go('Interview'); }

const screens = {};
// ---------- shared UI pieces (display only) ----------
const ic = d => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const IC = {plus: '<path d="M12 5v14M5 12h14"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  type: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>', lift: '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>', bowl: '<path d="M3 11h18a9 9 0 0 1-18 0zM8 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/>',
  moon: '<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>', apple: '<path d="M12 7c-4-2-8 1-7 6s4 8 7 7c3 1 6-2 7-7s-3-8-7-6zM12 7c0-2 1-4 3-4"/>', back: '<path d="M15 5l-7 7 7 7"/>', stats: '<path d="M5 20V11M12 20V4M19 20v-6"/>', swap: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>', clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>', bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>'};
const seg = (tabs, on) => `<div class="seg" role="tablist">${tabs.map(([l, act]) => `<button role="tab" class="${l === on ? 'on' : ''}" aria-selected="${l === on}" onclick="${act}">${l}</button>`).join('')}</div>`;
const act3 = list => `<div class="act3">${list.map(([l, icon, act]) => `<button class="sec" onclick="${act}">${ic(IC[icon])}<span>${l}</span></button>`).join('')}</div>`;
screens.Interview = () => {
  const i = ivSingle ? QUESTIONS.findIndex(q => q[0] === ivSingle) : S.iv;
  if (i >= QUESTIONS.length) return `<h1>All done</h1><div class="card"><p>Your profile is saved on this device. Change any single answer from Profile.</p><button onclick="go('Today')">Go to Today</button><button class="sec mt" onclick="go('Profile')">View profile</button></div>`;
  const q = QUESTIONS[i];
  return `<h1>${ivSingle ? 'Update answer' : 'Profile setup'}</h1><p class="mute">${ivSingle ? '' : `Question ${i + 1} of ${QUESTIONS.length} · 45-minute strength sessions at Anytime Fitness`}</p>
  <div class="card"><h2>${q[1]}</h2>${ivInput(q)}
    <button class="mt" onclick="ivAnswer('save')">${ivSingle ? 'Save' : 'Save & next'}</button>
    <div class="grid2 mt"><button class="sec" onclick="ivAnswer('skip')">Skip</button><button class="sec" onclick="ivAnswer('not sure')">Not sure</button></div>
    ${!ivSingle && i ? `<button class="link mt" onclick="S.iv--;save();render()">← Back</button>` : ''}
    ${ivSingle ? `<button class="link mt" onclick="ivSingle=null;go(ivReturn||'Profile')">Cancel</button>` : ''}</div>`;
};
screens.Profile = () => `<h1>Profile</h1><p class="mute">Tap an answer to change just that one.</p>
  <div class="card"><ul>${QUESTIONS.map(([k, q]) => `<li onclick="editAnswer('${k}')" style="cursor:pointer"><span>${q}<br><b>${showAnswer(P()[k])}</b></span><span class="mute">Edit</span></li>`).join('')}</ul></div>
  <div class="card"><h2>Optional targets</h2><p class="mute">Leave blank if you don't use them.</p>
    ${EXTRA.map(([k, l]) => `<label for="x_${k}">${l}</label><input id="x_${k}" type="number" inputmode="decimal" step="any" value="${esc(P()[k] ?? '')}" onchange="P()['${k}']=this.value;save()">`).join('')}</div>
  ${!P().done ? `<button onclick="go('Interview')">Continue setup</button>` : ''}`;

// ---------- generic edit for any logged entry ----------
let editing = null;
const EDIT_HIDE = ['id', 'session', 'gymId', 'photo', 'hours', 'draftId', 'itemSig', 'savedAt', 'est', 'items', 'source', 'reportId'];
function editEntry(path, id) { editing = {path, id, back: cur}; go('Edit'); }
screens.Edit = () => {
  const e = getList(editing.path).find(x => x.id == editing.id);
  if (!e) return '<p>Entry not found.</p>';
  const fields = Object.keys(e).filter(k => !EDIT_HIDE.includes(k) && (e[k] === null || typeof e[k] !== 'object'));
  return `<h1>Edit entry</h1><form class="card" onsubmit="event.preventDefault();saveEdit(this)">
    ${fields.map(k => `<label for="f_${k}">${esc(k)}</label>${String(e[k]).length > 60 ? `<textarea id="f_${k}" name="${esc(k)}" rows="4">${esc(e[k])}</textarea>` :
      `<input id="f_${k}" name="${esc(k)}" type="${k === 'date' ? 'date' : ['bed', 'wake', 'time'].includes(k) ? 'time' : /^-?\d+(\.\d+)?$/.test(e[k]) ? 'number' : 'text'}" step="any" value="${esc(e[k])}">`}`).join('')}
    <button class="mt">Save changes</button><button type="button" class="sec mt" onclick="go(editing.back)">Cancel</button></form>`;
};
function saveEdit(f) {
  const e = getList(editing.path).find(x => x.id == editing.id); Object.assign(e, form(f));
  if (editing.path === 'sleep' && e.bed && e.wake) e.hours = sleepHours(e.bed, e.wake);
  if (editing.path === 'workouts' && S.active) S.active.items.forEach(it => it.sets.forEach(s => { if (s.logId == e.id) { s.reps = e.reps; s.kg = e.kg; } }));
  save(); go(editing.back);
}

// ---------- backup / restore ----------
// Private health (clinician notes, symptoms, appointments, medication) is left out of backups unless ticked.
const LISTS = ['weights', 'body', 'meals', 'favs', 'water', 'steps', 'sleep', 'workouts', 'routines', 'reviews', 'health.notes', 'health.appts', 'health.symptoms', 'health.doses'];
const sig = x => JSON.stringify(Object.entries(x).filter(([k]) => k !== 'id').sort()); // same content = duplicate, even with a new id
function buildBackup(includeHealth) {
  const b = JSON.parse(JSON.stringify(S));
  b.exportedAt = new Date().toISOString();
  b.includesHealth = !!includeHealth;
  if (!includeHealth) { delete b.health; for (const k of ['clinician']) delete b.profile[k]; }
  return b;
}
screens.Backup = () => `<h1>Backup</h1>
  <div class="card"><h2>Export</h2><p class="mute">Saves a .json file you can keep in Files, iCloud Drive or OneDrive and restore on any device.</p>
    <label class="chk"><input type="checkbox" id="incHealth"> Include private health (clinician notes, symptoms, appointments, medication, clinician guidance answer)</label>
    <button class="mt" onclick="download('fitness-backup-'+today()+'.json',JSON.stringify(buildBackup(incHealth.checked),null,1),'application/json')">Export backup</button></div>
  <div class="card"><h2>Restore</h2><p class="mute">You'll see a preview first. Nothing changes until you confirm.</p><button class="sec" onclick="imp.click()">Choose backup file</button></div>`;
let pendingImport = null;
async function readImport(text) {
  let d;
  try { d = JSON.parse(text); if (!d || typeof d !== 'object' || !d.profile) throw 0; } catch { alert('Not a valid backup file.'); return; }
  const mine = S; S = d; migrate(); d = S; S = mine; // upgrade backup through the same path as stored data
  const rows = LISTS.filter(l => !l.startsWith('health.') || d.includesHealth !== false && getListFrom(d, l).length).map(l => {
    const cur = getList(l), ids = new Set(cur.map(x => String(x.id))), sigs = new Set(cur.map(sig)), inFile = getListFrom(d, l);
    return {l, total: inFile.length, fresh: inFile.filter(x => !ids.has(String(x.id)) && !sigs.has(sig(x)))};
  });
  pendingImport = {d, rows}; go('Import');
}
const getListFrom = (o, path) => path.split('.').reduce((x, k) => x?.[k], o) || [];
imp.onchange = async () => { const f = imp.files[0]; imp.value = ''; if (f) readImport(await f.text()); };
screens.Import = () => !pendingImport ? '<p>No import in progress.</p>' : `<h1>Import preview</h1>
  <div class="card"><p class="mute">Backup from ${esc(pendingImport.d.exportedAt?.slice(0, 10) || 'unknown date')} · private health ${pendingImport.d.includesHealth ? 'included' : 'not included'}</p>
  <ul>${pendingImport.rows.filter(r => r.total).map(r => `<li><span>${r.l.replace('health.', 'health: ')}</span><span>${r.total} in file · <b>${r.fresh.length} new</b> · ${r.total - r.fresh.length} duplicate</span></li>`).join('') || '<li class="mute">Backup has no entries.</li>'}</ul></div>
  <button onclick="applyImport('merge')">Merge: add ${pendingImport.rows.reduce((a, r) => a + r.fresh.length, 0)} new entries</button>
  <p class="mute">Keeps everything on this device. Duplicates are skipped. Your profile here is kept unless this device has none.</p>
  <button class="sec" onclick="applyImport('replace')">Replace this device's data with the backup</button>
  <p class="mute">If the backup has no private health section, the health records on this device are kept.</p>
  <button class="link" onclick="pendingImport=null;go('Backup')">Cancel</button>`;
function applyImport(mode) {
  const {d, rows} = pendingImport;
  if (mode === 'replace') {
    if (!confirm('Replace data on this device with the backup? Export a backup first if unsure.')) return;
    const keepHealth = S.health, keepClin = S.profile.clinician; S = d;
    if (!d.includesHealth) { S.health = keepHealth; if (keepClin !== undefined) S.profile.clinician = keepClin; }
  } else {
    rows.forEach(r => getList(r.l).push(...r.fresh));
    if (!P().done && d.profile.done) S.profile = Object.assign({}, d.profile, {clinician: P().clinician ?? d.profile.clinician});
    for (const g of d.gyms || []) if (!S.gyms.some(x => x.id == g.id)) S.gyms.push(g);
    if (d.includesHealth) { // fill blank medication / care-team fields from the backup, never overwrite what's here
      for (const k of ['name', 'dose', 'start']) if (!S.health.med[k]) S.health.med[k] = d.health.med[k];
      S.health.med.enabled ||= d.health.med.enabled;
      for (const k in d.health.constraints) if (!S.health.constraints[k]) S.health.constraints[k] = d.health.constraints[k];
    }
  }
  delete S.exportedAt; delete S.includesHealth;
  pendingImport = null; save(); go('Today'); alert('Import complete.');
}

// ---------- navigation ----------
const NAV_ICON = Object.fromEntries(Object.entries({
  Today: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  Training: '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  Food: '<path d="M7 3v8a2 2 0 0 0 2 2v8M7 3v5M11 3v8a2 2 0 0 1-2 2M17 21V3c-2 1-3 4-3 7s1 4 3 4"/>',
  Progress: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  Health: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>'
}).map(([k, d]) => [k, `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`]));
let cur = 'Today';
const TAB_OF = {Settings: 'Today', Coach: 'Today', Meal: 'Food', Gyms: 'Training', Generate: 'Training', Routine: 'Training', Planner: 'Training', Interview: 'Today', Profile: 'Health', Backup: 'Health', Import: 'Health',
  Meal: 'Food', MealPlan: 'Food', Shopping: 'Food', BodyImport: 'Progress', Review: 'Today', Clinician: 'Health', Device: 'Health'};
function go(s) { cur = s; if (typeof busyFor !== 'undefined') busyFor = null; render(); scrollTo(0, 0); }
function render() {
  coachTick(); autoReview();
  app.innerHTML = screens[cur]();
  const tab = cur === 'Edit' ? TAB_OF[editing?.back] || editing?.back : TAB_OF[cur] || cur;
  nav.innerHTML = ['Today', 'Food', 'Training', 'Progress', 'Health'].map(s => `<button class="${s === tab ? 'on' : ''}" onclick="go('${s}')"${s === tab ? ' aria-current="page"' : ''}>${NAV_ICON[s]}<span>${s === 'Today' ? 'Home' : s}</span>${s === 'Training' && S.active ? ' ●' : ''}</button>`).join('');
  tick();
}
function boot() { load(); save(); render(); setInterval(tick, 500); document.addEventListener('visibilitychange', () => { tick(); if (!document.hidden && ['Today', 'Training'].includes(cur)) render(); }); }
