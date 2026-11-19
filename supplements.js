// ===== Supplements: simple list, tick when taken; taken servings count in the day's nutrition (dayTotals). =====
// Add by barcode (Open Food/Products/Beauty Facts → Claude web search → label photo), label photo (Claude), or typing.
TAB_OF.Supplements = 'Today';
const SUP_KEYS = ['kcal', 'protein', 'carbs', 'fat', 'fibre'];
const SUP_PICKS = [ // [name, serving, kcal, protein, carbs, fat, fibre]
  ['Psyllium husk', '1 scoop (6 g)', 20, 0, 1, 0, 5], ['Inulin', '5 g', 10, 0, 0, 0, 4.5], ['Whey protein', '30 g', 120, 24, 3, 1.5, 0],
  ['Creatine', '5 g', 0, 0, 0, 0, 0], ['Vitamin D', '1 tablet', 0, 0, 0, 0, 0], ['Omega-3', '2 capsules', 20, 0, 0, 2, 0],
  ['Magnesium', '1 tablet', 0, 0, 0, 0, 0], ['Multivitamin', '1 tablet', 0, 0, 0, 0, 0], ['Electrolytes', '1 sachet', 0, 0, 0, 0, 0], ['Pre-workout', '1 scoop', 5, 0, 0, 0, 0]];
let supDraft = null; // {name, brand, barcode, serving, per, src} shown on the "Is this right?" / Type form

function supInit() { S.supps ||= []; S.suppLog ||= []; }
const _supMigrate = migrate;
migrate = function () { _supMigrate(); supInit(); };

// Taken supplements add to the day's totals everywhere (Home/Food cards, fibre bar, weekly review, auto-targets). n stays meal count.
const _supDayTotals = dayTotals;
dayTotals = function (d = today()) {
  const t = _supDayTotals(d); supInit();
  for (const l of S.suppLog.filter(x => x.date === d)) {
    const s = S.supps.find(x => x.id == l.suppId); if (!s) continue;
    for (const k of SUP_KEYS) t[k] = n1(t[k] + (+s.per?.[k] || 0) * (+l.servings || 1));
  }
  return t;
};

const supTaken = id => S.suppLog.some(l => l.date === today() && l.suppId == id);
const supCaffeine = name => /pre-?workout|caffeine/i.test(name || '');
const supInfo = s => [s.serving, s.per.fibre ? gb(s.per.fibre) + ' g fibre' : '', s.per.protein ? gb(s.per.protein) + ' g protein' : '', s.per.kcal ? gb(s.per.kcal) + ' kcal' : ''].filter(Boolean).join(' · ');
function supToggle(id) {
  supInit();
  if (supTaken(id)) S.suppLog = S.suppLog.filter(l => !(l.date === today() && l.suppId == id));
  else S.suppLog.push({id: uid(), date: today(), suppId: id, servings: 1});
  save(); render();
}
const supActive = () => (S.supps || []).filter(s => !s.archived);
function supRemove(id) {
  const s = S.supps.find(x => x.id == id); if (!s || !confirm(`Remove ${s.name} from your list? Days you already took it still count.`)) return;
  s.archived = true; save(); render(); // kept so past totals don't change
}

screens.Supplements = () => {
  supInit();
  if (supDraft) return supForm();
  const taken = supActive().filter(s => supTaken(s.id)), tot = k => n1(taken.reduce((a, s) => a + (+s.per[k] || 0), 0));
  return `<div class="mhead"><button class="rnd" onclick="go('Today')" aria-label="Back">‹</button><h1 class="ttl">Supplements</h1><span></span></div>
  <div class="sup-acts"><button class="sec" onclick="supScan()"><b>▥</b>Scan barcode</button><button class="sec" onclick="supPhoto()"><b>📷</b>Photo label</button><button class="sec" onclick="supType()"><b>⌨</b>Type</button></div>
  <div class="card"><h2>Today</h2>${supActive().length ? `<ul class="sup-list">${supActive().map(s => `<li><button class="sup-tick ${supTaken(s.id) ? 'on' : ''}" onclick="supToggle(${js(s.id)})" aria-pressed="${supTaken(s.id)}" aria-label="Taken ${esc(s.name)}">✓</button>
    <span class="sup-txt"><b>${esc(s.name)}</b><br><span class="mute">${esc(supInfo(s))}</span>${supCaffeine(s.name) ? '<br><span class="sup-warn">Contains caffeine. With your heart care, check stimulants with your care team.</span>' : ''}</span>
    <button class="sup-x" onclick="supRemove(${js(s.id)})" aria-label="Remove ${esc(s.name)}">✕</button></li>`).join('')}</ul>` : '<p class="mute">No supplements yet. Scan, photo the label, or type one.</p>'}</div>
  <div class="card"><b>From supplements today:</b> Fibre +${gb(tot('fibre'))} g · Protein +${gb(tot('protein'))} g · ${gb(tot('kcal'))} kcal</div>`;
};

function supForm() {
  const d = supDraft, v = k => d.per?.[k] ?? '', num = (k, l) => `<label>${l}<input name="${k}" type="number" step="any" min="0" inputmode="decimal" value="${esc(v(k))}"></label>`;
  return `<div class="mhead"><button class="rnd" onclick="supDraft=null;render()" aria-label="Back">‹</button><h1 class="ttl">${d.src === 'typed' ? 'Add supplement' : 'Is this right?'}</h1><span></span></div>
  ${d.src === 'typed' ? `<div class="chips">${SUP_PICKS.map((p, i) => `<button type="button" class="chip" onclick="supPick(${i})">${esc(p[0])}</button>`).join('')}</div>` : `<p class="mute">Found via ${esc(d.src)}${d.barcode ? ' · ' + esc(d.barcode) : ''}. Correct anything that's off. Values are per serving.</p>`}
  <form class="card" onsubmit="event.preventDefault();supSave(this)">
    <label>Name<input name="name" required value="${esc(d.name)}"></label>
    <label>Serving<input name="serving" placeholder="e.g. 1 scoop (6 g)" value="${esc(d.serving)}"></label>
    <div class="grid2">${num('kcal', 'kcal')}${num('protein', 'Protein g')}${num('carbs', 'Carbs g')}${num('fat', 'Fat g')}${num('fibre', 'Fibre g')}</div>
    ${supCaffeine(d.name) ? '<div class="note">Contains caffeine. With your heart care, check stimulants with your care team.</div>' : ''}
    <button class="mt">Add supplement</button>
    ${d.src !== 'typed' ? '<button type="button" class="sec mt" onclick="supPhoto()">Not right? Photo the label</button>' : ''}</form>`;
}
function supType() { supDraft = {name: '', brand: '', barcode: '', serving: '', per: {}, src: 'typed'}; go('Supplements'); }
function supPick(i) { const p = SUP_PICKS[i]; supDraft = {...supDraft, name: p[0], serving: p[1], per: Object.fromEntries(SUP_KEYS.map((k, j) => [k, p[j + 2]]))}; render(); }
function supSave(f) {
  supInit(); const x = form(f), d = supDraft;
  const s = {id: uid(), name: x.name.trim(), brand: d.brand || '', barcode: d.barcode || '', serving: x.serving.trim(), per: Object.fromEntries(SUP_KEYS.map(k => [k, n1(+x[k] || 0)])), src: d.src};
  S.supps = S.supps.filter(o => !(s.barcode && o.barcode === s.barcode)); // re-photographed barcode replaces the old values
  S.supps.push(s); supDraft = null; save(); go('Supplements'); toastMsg(`Added ${s.name}. Tick it when taken.`);
}
// "brand | name | serving | kcal | protein | carbs | fat | fibre" → draft
function supParse(line, extra) {
  const x = (line || '').split('\n').find(l => l.includes('|'))?.split('|').map(v => v.trim());
  if (!x || x.length < 4) return null;
  return {brand: x[0], name: [x[0], x[1]].filter(Boolean).join(' ').trim() || 'Supplement', serving: x[2] || '', per: Object.fromEntries(SUP_KEYS.map((k, i) => [k, n1(parseFloat(x[i + 3]) || 0)])), ...extra};
}

// ---------- barcode ----------
function supScan() {
  scanBarcode(); // reuse barcode.js overlay, then reroute its results here
  const box = document.getElementById('scanbox'), f = box?.querySelector('form');
  if (f) f.setAttribute('onsubmit', 'event.preventDefault();closeScan();supCode(this.c.value.trim())');
  supHc = handleCode; handleCode = supCode;
  box?.querySelector('button.sec')?.addEventListener('click', supUnhook);
}
let supHc = null;
function supUnhook() { if (supHc) { handleCode = supHc; supHc = null; } }
async function supCode(code) {
  supUnhook(); supInit();
  if (!/^\d{6,14}$/.test(code)) return alert("That doesn't look like a barcode number.");
  const known = S.supps.find(s => s.barcode === code);
  if (known) { go('Supplements'); if (!supTaken(known.id)) supToggle(known.id); return toastMsg(`${known.name} is already added. Ticked as taken today.`); }
  toastMsg('Looking it up…');
  for (const host of ['world.openfoodfacts.org', 'world.openproductsfacts.org', 'world.openbeautyfacts.org']) {
    try {
      const j = await (await fetch(`https://${host}/api/v2/product/${code}.json?fields=product_name,brands,nutriments,serving_quantity,serving_size`)).json();
      if (j.status !== 1) continue;
      const p = j.product || {}, n = p.nutriments || {}, sq = +p.serving_quantity || 0, br = (p.brands || '').split(',')[0].trim();
      const val = k => n[k + '_serving'] != null ? +n[k + '_serving'] : n[k + '_100g'] != null && sq ? +n[k + '_100g'] * sq / 100 : 0;
      const pn = (p.product_name || '').trim();
      supDraft = {brand: br, name: (br && !pn.toLowerCase().includes(br.toLowerCase()) ? `${br} ${pn}` : pn || br).trim() || 'Product ' + code, barcode: code,
        serving: p.serving_size || (sq ? sq + ' g' : ''), per: {kcal: n1(val('energy-kcal')), protein: n1(val('proteins')), carbs: n1(val('carbohydrates')), fat: n1(val('fat')), fibre: n1(val('fiber'))}, src: host.split('.')[1].replace('open', 'Open ').replace('facts', ' Facts')};
      return go('Supplements');
    } catch {}
  }
  if (aiKey() && confirm('Not in the free databases. Look it up on the web with Claude (about 5p)?')) {
    toastMsg('Searching the web…');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {method: 'POST', headers: {'content-type': 'application/json', 'x-api-key': aiKey(), 'anthropic-version': '2026-10-21', 'anthropic-dangerous-direct-browser-access': 'true'},
        body: JSON.stringify({model: 'claude-sonnet-5-5', max_tokens: 2000, output_config: {effort: 'low'}, tools: [{type: 'web_search_20260209', name: 'web_search', max_uses: 3, user_location: {type: 'approximate', country: 'GB'}}],
          messages: [{role: 'user', content: `Identify the UK product with barcode ${code} (a supplement or food). Reply with ONE line only: brand | product name | serving size text | kcal per serving | protein g | carbs g | fat g | fibre g. Reply NOT FOUND if you cannot identify it confidently.`}]})});
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(res.status === 401 ? 'The API key was rejected. Check it in Settings.' : j.error?.message || `Error ${res.status}`);
      const text = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
      const d = !/NOT FOUND/i.test(text) && supParse(text, {barcode: code, src: 'web search (Claude)'});
      if (d) { supDraft = d; return go('Supplements'); }
    } catch (e) { alert(e.message); }
  }
  if (confirm("Couldn't identify this barcode. Photo the nutrition label instead?")) supPhoto(code); else supType();
}

// ---------- label photo ----------
let supPhotoCode = '';
const supPhotoIn = Object.assign(document.createElement('input'), {type: 'file', accept: 'image/*', hidden: true});
document.body.append(supPhotoIn);
function supPhoto(code) {
  if (!aiKey()) return alert('Reading a label needs a Claude key. Add one in Settings, or use Type.');
  supPhotoCode = typeof code === 'string' ? code : supDraft?.barcode || ''; supPhotoIn.click();
}
supPhotoIn.onchange = async () => {
  const f = supPhotoIn.files[0]; supPhotoIn.value = ''; if (!f) return;
  toastMsg('Reading the label…');
  try {
    const img = await shrinkImage(f, 1000);
    const reply = await claude('You read UK supplement and food labels. Reply with one line only, no other text.',
      [{role: 'user', content: [{type: 'image', source: {type: 'base64', media_type: 'image/jpeg', data: img.split(',')[1]}},
        {type: 'text', text: 'Give: brand | product name | serving size text | kcal per serving | protein g | carbs g | fat g | fibre g. Per serving (fibre is important). Use 0 if not shown.'}]}], 800, 'photo');
    const d = supParse(reply, {barcode: supPhotoCode, src: 'label photo (Claude)'});
    if (!d) throw new Error("Couldn't read the label. Try a closer, flatter photo, or Type it.");
    supDraft = d; go('Supplements');
  } catch (e) { alert(e.message); }
};

// ---------- entry points ----------
const _supToday = screens.Today;
screens.Today = () => {
  supInit(); const h = _supToday(), a = '<div class="sec-h"><h2>Diary</h2>', n = supActive().filter(s => supTaken(s.id)).length;
  const card = `<button class="card sup-entry" onclick="supDraft=null;go('Supplements')">💊 ${supActive().length ? `Supplements · ${n} of ${supActive().length} today` : 'Add supplements (fibre, protein, vitamins)'}<span aria-hidden="true">›</span></button>`;
  return h.replace(a, card + a);
};
if (screens.Menu) {
  const _supMenu = screens.Menu;
  screens.Menu = () => _supMenu().replace('<div class="card mgrp"><ul>', `<div class="card mgrp"><ul><li><button class="mrow" onclick="supDraft=null;go('Supplements')">Supplements<span aria-hidden="true">›</span></button></li>`);
}
