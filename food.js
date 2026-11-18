// ===== Food: meal drafts (speak / photo / type), estimates, favourites, meal planner, shopping list =====
// Typical UK values per 100 g/ml: [keywords, display name, family, [kcal, protein, carbs, fat, fibre], grams per unit, default grams, varies a lot?]
const FOODS = [
  [['egg', 'eggs'], 'Egg', 'egg', [143, 12.6, .7, 9.5, 0], 50, 50],
  [['toast', 'bread', 'slice of bread'], 'Toast', 'bread', [265, 9, 49, 3.2, 2.7], 36, 36],
  [['butter'], 'Butter', 'butter', [744, .6, .6, 82, 0], 7, 10],
  [['coffee', 'latte', 'americano'], 'Coffee', 'coffee', [2, .3, 0, 0, 0], 250, 250],
  [['tea'], 'Tea', 'tea', [1, 0, .2, 0, 0], 250, 250],
  [['milk'], 'Milk (semi-skimmed)', 'milk', [46, 3.4, 4.7, 1.7, 0], 200, 30],
  [['sugar'], 'Sugar', 'sugar', [400, 0, 100, 0, 0], 4, 4],
  [['chicken thigh', 'chicken thighs'], 'Chicken thigh', 'chicken', [209, 26, 0, 10.9, 0], 100, 150, true],
  [['chicken breast', 'chicken'], 'Chicken breast', 'chicken', [165, 31, 0, 3.6, 0], 150, 150, true],
  [['rice'], 'Rice (cooked)', 'rice', [130, 2.7, 28, .3, 0.4], 160, 180, true],
  [['pasta', 'spaghetti', 'penne'], 'Pasta (cooked)', 'pasta', [158, 5.8, 31, .9, 1.8], 180, 220, true],
  [['potato', 'potatoes', 'jacket potato'], 'Potato', 'potato', [77, 2, 17, .1, 1.8], 170, 200, true],
  [['chips', 'fries'], 'Chips', 'chips', [274, 3.4, 36, 13, 3], 150, 150, true],
  [['salmon'], 'Salmon', 'fish', [208, 20, 0, 13, 0], 120, 120, true],
  [['tuna'], 'Tuna (tinned)', 'fish', [116, 26, 0, 1, 0], 110, 110],
  [['beef mince', 'mince'], 'Beef mince', 'beef', [250, 26, 0, 17, 0], 125, 125, true],
  [['steak'], 'Steak', 'beef', [217, 26, 0, 12, 0], 200, 200, true],
  [['bacon', 'rasher'], 'Bacon', 'bacon', [270, 24, 0, 19, 0], 25, 50],
  [['sausage', 'sausages'], 'Sausage', 'sausage', [300, 12, 8, 24, 1], 57, 57],
  [['baked beans', 'beans'], 'Baked beans', 'beans', [81, 4.7, 13, .4, 3.7], 200, 200],
  [['porridge', 'oats'], 'Porridge oats (dry)', 'oats', [379, 13, 60, 7, 9], 40, 40],
  [['greek yoghurt', 'yoghurt', 'yogurt'], 'Greek yoghurt', 'yoghurt', [97, 9, 4, 5, 0], 150, 150],
  [['cheese', 'cheddar'], 'Cheddar', 'cheese', [416, 25, .1, 35, 0], 20, 30, true],
  [['banana'], 'Banana', 'banana', [89, 1.1, 23, .3, 1.4], 120, 120],
  [['apple'], 'Apple', 'apple', [52, .3, 14, .2, 1.8], 180, 180],
  [['berries', 'blueberries', 'strawberries'], 'Berries', 'berries', [45, .8, 10, .3, 2], 80, 80],
  [['salad', 'lettuce'], 'Salad', 'salad', [15, 1, 3, .2, 1.2], 80, 80],
  [['broccoli', 'vegetables', 'veg'], 'Vegetables', 'veg', [35, 2.5, 6, .4, 2.6], 80, 80],
  [['avocado'], 'Avocado', 'avocado', [160, 2, 9, 15, 6.7], 150, 75],
  [['peanut butter'], 'Peanut butter', 'pb', [588, 25, 20, 50, 6], 16, 16],
  [['olive oil', 'oil'], 'Oil', 'oil', [884, 0, 0, 100, 0], 14, 5],
  [['protein shake', 'whey', 'shake'], 'Protein shake (whey)', 'whey', [400, 80, 8, 6, 0], 30, 30],
  [['orange juice', 'juice'], 'Orange juice', 'juice', [45, .7, 10, .2, 0.2], 200, 200],
  [['wrap', 'tortilla'], 'Tortilla wrap', 'bread', [310, 8, 52, 7, 3], 60, 60],
  [['sandwich'], 'Sandwich (typical)', 'sandwich', [240, 11, 27, 9, 2.5], 180, 180, true],
  [['pizza'], 'Pizza', 'pizza', [266, 11, 33, 10, 2.3], 100, 300, true],
  [['curry'], 'Curry (typical)', 'curry', [140, 9, 7, 8, 1.5], 300, 300, true],
  [['soup'], 'Soup', 'soup', [45, 2, 6, 1.5, 1], 300, 300],
  [['sauce', 'ketchup', 'mayo', 'mayonnaise'], 'Sauce', 'sauce', [150, 1, 15, 9, 0.5], 15, 15],
];
const KW = FOODS.flatMap(f => f[0].map(k => [k, f])).sort((a, b) => b[0].length - a[0].length);
const NUMW = {a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, half: .5, 'a half': .5, quarter: .25, 'a quarter': .25, 'a third': 1 / 3, third: 1 / 3, 'two thirds': 2 / 3, 'three quarters': .75, 'a couple of': 2, couple: 2};
const METRIC = {g: 1, gram: 1, grams: 1, kg: 1000, ml: 1, l: 1000, litre: 1000, litres: 1000, pint: 568, pints: 568, tbsp: 15, tablespoon: 15, tablespoons: 15, tsp: 5, teaspoon: 5, teaspoons: 5};
const UNITW = 'slices?|pieces?|cups?|mugs?|glass(?:es)?|scoops?|rashers?|bowls?|cans?|tins?|handfuls?|portions?|servings?|fillets?|splash';
const lookupFood = txt => { const t = ' ' + txt.toLowerCase() + ' '; return KW.find(([k]) => new RegExp(`\\b${k}\\b`).test(t))?.[1]; };
const fracOf = w => /%/.test(w) ? parseFloat(w) / 100 : NUMW[w] ?? (parseFloat(w) || 1);

function parseFood(txt) {
  let t = txt.toLowerCase().trim().replace(/^(?:i |then |and |also |plus |some |a bit of |had |ate )+/, '').replace(/^(?:the|my|some)\s+/, '');
  const numRe = new RegExp(`^(\\d+(?:\\.\\d+)?|${Object.keys(NUMW).sort((a, b) => b.length - a.length).join('|')})\\s*(?:of\\s+)?`);
  let n = null, unit = null, m = t.match(numRe);
  if (m) { n = isNaN(m[1]) ? NUMW[m[1]] : +m[1]; t = t.slice(m[0].length); }
  m = t.match(new RegExp(`^(${Object.keys(METRIC).join('|')}|${UNITW})\\b\\s*(?:of\\s+)?`));
  if (m) { unit = m[1]; t = t.slice(m[0].length); }
  t = t.replace(/^(?:the|my|some)\s+/, '').trim();
  if (!t) return null;
  const f = lookupFood(t), defG = f ? f[5] : 100, unitG = f ? f[4] : 100;
  let grams = defG;
  if (unit && METRIC[unit]) grams = (n ?? 1) * METRIC[unit];
  else if (unit === 'splash') grams = 30 * (n ?? 1);
  else if (unit) grams = (n ?? 1) * unitG;
  else if (n != null) grams = n < 1 ? n * defG : n * unitG;
  return f ? {id: uid(), name: f[1], fam: f[2], per100: f[3], grams: Math.round(grams), unitG, src: 'est', vary: !!f[6], qtyGiven: n != null || !!unit}
    : {id: uid(), name: t.replace(/^\w/, c => c.toUpperCase()), fam: '', per100: null, grams: Math.round(grams), unitG: 100, src: 'unknown', vary: false, qtyGiven: n != null || !!unit};
}
const findItem = (items, f) => f && (items.find(x => f.fam && x.fam === f.fam) || items.find(x => x.name.toLowerCase().includes(f.name.toLowerCase()) || f.name.toLowerCase().includes(x.name.toLowerCase())));
// Applies a description or a correction to the draft. Corrections change existing items rather than creating a new meal.
function applyText(d, text) {
  const t = text.toLowerCase().replace(/\b(?:for (?:breakfast|lunch|dinner|tea|supper)|this morning|today|tonight|earlier)\b/g, '')
    .replace(/^\s*(?:i(?:'ve| have)? (?:had|ate|eaten)|i just had)\s+/, '');
  for (let c of t.split(/,|;|\.|\band\b|\bplus\b/)) {
    c = c.trim().replace(/^(?:i |so |but |oh |um |then )+/, '').trim();
    if (!c) continue;
    let m;
    if ((m = c.match(/^(?:that|it|this|they|those)\s+(?:was|were|is|are)\s+(?:actually\s+)?(.+)/) || c.match(/^actually\s+(?:it was\s+)?(.+)/))) {
      const f = parseFood(m[1]); if (!f) continue;
      const tgt = findItem(d.items, f) || (d.items.length === 1 && d.items[0].src === 'unknown' ? d.items[0] : null);
      if (tgt) Object.assign(tgt, {...f, id: tgt.id, grams: f.qtyGiven ? f.grams : tgt.grams, qtyGiven: f.qtyGiven || tgt.qtyGiven, asked: tgt.asked}); else d.items.push(f);
    } else if ((m = c.match(/(?:only\s+)?(?:ate|had|finished|eaten)\s+(half|a half|a quarter|quarter|a third|two thirds|three quarters|\d+\s*%)\s+(?:of\s+)?(.+)/))) {
      const tgt = findItem(d.items, parseFood(m[2]));
      if (tgt) { tgt.grams = Math.round(tgt.grams * fracOf(m[1])); tgt.qtyGiven = tgt.asked = true; }
    } else if ((m = c.match(/(?:didn'?t|did not|never)\s+(?:eat|have|finish)\s+(?:the\s+|my\s+|any\s+)?(.+)/) || c.match(/^(?:no|remove|without)\s+(.+)/))) {
      const tgt = findItem(d.items, parseFood(m[1])); if (tgt) d.items = d.items.filter(x => x !== tgt);
    } else {
      for (const part of c.split(/\bwith\b/)) {
        const f = parseFood(part); if (!f) continue;
        const tgt = f.fam && findItem(d.items, f);
        if (tgt) { if (f.qtyGiven) { tgt.grams = f.grams; tgt.qtyGiven = true; } } else d.items.push(f);
      }
    }
  }
}
// Lines pasted from Claude Desktop (or anywhere): "name | grams | kcal | protein | carbs | fat | fibre", or free text with numbers.
function parsePasted(text) {
  const out = [];
  for (const line of text.split('\n').map(l => l.replace(/^[-*•\d.)\s]+/, '').trim()).filter(Boolean)) {
    let name, g, k, p, c, f, fb;
    if (line.includes('|')) { const x = line.split('|').map(s => s.trim()); if (/^name$/i.test(x[0]) || /^-+$/.test(x[0])) continue; [name, g, k, p, c, f, fb] = [x[0], ...x.slice(1).map(parseFloat)]; }
    else {
      name = line.split(/[:–—(-]|\d/)[0].trim();
      g = parseFloat(line.match(/(\d+(?:\.\d+)?)\s*(?:g|ml)\b(?!\s*(?:protein|carb|fat))/i)?.[1]);
      k = parseFloat(line.match(/(\d+(?:\.\d+)?)\s*kcal/i)?.[1]);
      const val = w => parseFloat(line.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*g\\s*${w}|${w}\\w*[:\\s]+(\\d+(?:\\.\\d+)?)`, 'i'))?.slice(1).find(Boolean));
      p = val('protein'); c = val('carb'); f = val('fat'); fb = val('fib');
    }
    if (!name || isNaN(k)) continue;
    const grams = g > 0 ? g : 100, per = v => n1((+v || 0) / grams * 100);
    out.push({id: uid(), name, fam: lookupFood(name)?.[2] || '', per100: [per(k), per(p), per(c), per(f), per(fb)], grams, unitG: grams, src: 'paste', vary: false, qtyGiven: true, asked: true});
  }
  return out;
}
const itemMacros = x => [0, 1, 2, 3, 4].map(i => (x.per100?.[i] || 0) * x.grams / 100); // old items have no fibre: counts as 0
const draftTotals = items => items.reduce((t, x) => itemMacros(x).map((v, i) => t[i] + v), [0, 0, 0, 0, 0]);

// ---------- draft lifecycle ----------
const newDraft = () => ({id: uid(), items: [], photos: [], text: '', name: '', askedOil: false, voice: false});
function openMeal(mode) {
  S.draft ||= newDraft(); save(); go('Meal');
  if (mode === 'photo') photoIn.click(); // iOS offers Take Photo or Photo Library
  if (mode === 'speak') speak();
  if (mode === 'type') document.getElementById('mealText')?.focus();
}
async function shrinkImage(f, max = 480) {
  const img = new Image(); img.src = URL.createObjectURL(f); await img.decode();
  const sc = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
  c.width = img.width * sc; c.height = img.height * sc; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(img.src);
  return c.toDataURL('image/jpeg', .6); // ponytail: thumbnails live in localStorage (~20–40 KB each); move to IndexedDB if storage fills
}
photoIn.onchange = async () => {
  const f = photoIn.files[0]; photoIn.value = ''; if (!f) return;
  try { S.draft ||= newDraft(); S.draft.photos.push(await shrinkImage(f)); save(); go('Meal'); }
  catch { alert('Could not read that image. Try another, or describe the meal instead.'); }
};
function applyMealText() {
  const ta = document.getElementById('mealText'), t = ta.value.trim(); if (!t) return ta.focus();
  const before = S.draft.items.length; applyText(S.draft, t);
  if (!S.draft.items.length && !before) return alert("I couldn't find any foods in that. Try e.g. \"two eggs and toast\".");
  S.draft.text = ''; save(); render();
}
function applyPaste() {
  const its = parsePasted(document.getElementById('pasteText').value);
  if (!its.length) return alert('No items with calories found. Use one item per line: name | grams | kcal | protein | carbs | fat | fibre');
  S.draft.items.push(...its); save(); render();
}
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function speak() {
  const ta = document.getElementById('mealText'), msg = document.getElementById('speakMsg');
  if (!SR || !window.isSecureContext) {
    ta.focus();
    msg.innerHTML = 'Direct speech recognition isn\'t available on this connection. <b>Tap the 🎤 on your keyboard</b> to dictate, then tap “Make draft”.';
    return;
  }
  if (!S.settings.speechConsent) {
    if (!confirm("Speak meal uses your browser's built-in speech recognition. Safari sends audio to Apple; Chrome sends it to Google; Edge sends it to Microsoft. Audio is never sent to this app or anyone else. Continue?")) { ta.focus(); return; }
    S.settings.speechConsent = true; save();
  }
  const r = new SR(); r.lang = 'en-GB'; r.interimResults = false;
  msg.textContent = 'Listening… say what you ate.';
  r.onresult = e => { ta.value = (ta.value + ' ' + e.results[0][0].transcript).trim(); S.draft.text = ta.value; S.draft.voice = true; save(); msg.textContent = 'Got it. Check the text, then tap “Make draft”.'; };
  r.onerror = e => {
    msg.innerHTML = /not-allowed|service-not-allowed/.test(e.error)
      ? 'Microphone or speech permission was denied. You can allow it in Settings, or <b>tap the 🎤 on your keyboard</b> to dictate instead.'
      : `Speech didn't work (${esc(e.error)}). Tap the 🎤 on your keyboard to dictate instead.`;
    ta.focus();
  };
  try { r.start(); } catch (e) { r.onerror({error: e.message || 'start failed'}); }
}
function questions(d) {
  const q = [];
  d.items.forEach(x => { if (x.src === 'unknown') q.push(`<p>I couldn't estimate <b>${esc(x.name)}</b>. Rename it, enter packet values, or remove it.</p>`); });
  d.items.forEach(x => {
    if (x.vary && !x.qtyGiven && !x.asked && q.length < 3) q.push(`<p>How much <b>${esc(x.name.toLowerCase())}</b>? This changes the estimate a lot.</p>
      <div class="grid3">${[['Small', .6], ['Medium', 1], ['Large', 1.5]].map(([l, k]) => `<button class="sec" onclick="portion(${x.id},${k})">${l} (${Math.round(x.grams * k)} g)</button>`).join('')}</div>`);
  });
  if (d.photos.length && d.items.length && !d.askedOil && q.length < 3) q.push(`<p>Any cooking oil, butter or sauce?</p><div class="grid2">
    <button class="sec" onclick="oil(0)">None</button><button class="sec" onclick="oil(5)">1 tsp oil</button><button class="sec" onclick="oil(14)">1 tbsp oil</button><button class="sec" onclick="oil('sauce')">Add a sauce</button></div>`);
  return q;
}
const dItem = id => S.draft.items.find(x => x.id == id);
function portion(id, k) { const x = dItem(id); x.grams = Math.round(x.grams * k); x.asked = true; save(); render(); }
function oil(v) { S.draft.askedOil = true; if (v === 'sauce') S.draft.items.push(parseFood('sauce')); else if (v) S.draft.items.push({...parseFood('oil'), grams: v, qtyGiven: true}); save(); render(); }
function itemSet(id, k, v) {
  const x = dItem(id);
  if (k === 'name') { x.name = v; if (x.src !== 'packet') { const f = parseFood(v); if (f?.per100) Object.assign(x, {per100: f.per100, fam: f.fam, src: 'est', vary: f.vary}); } }
  if (k === 'grams') { x.grams = Math.max(0, +v || 0); x.qtyGiven = x.asked = true; }
  save(); render();
}
let packetFor = null;
function savePacket(id, f) {
  const d = form(f), x = dItem(id), base = +d.base || 100;
  x.per100 = ['kcal', 'p', 'c', 'f', 'fb'].map(k => n1((+d[k] || 0) / base * 100)); x.src = 'packet'; x.asked = true; packetFor = null; save(); render();
}
let saving = false;
function confirmMeal() {
  const d = S.draft; if (!d || saving) return;
  if (!d.items.length) return alert('Add at least one food first.');
  if (S.meals.some(m => m.draftId === d.id)) { S.draft = null; save(); return go('Food'); } // retry after a successful save
  const sigv = d.items.map(x => x.name + ':' + x.grams).join('|');
  const recent = S.meals.find(m => m.itemSig === sigv && m.date === today() && Date.now() - (m.savedAt || 0) < 15 * 60e3);
  if (recent && !confirm(`An identical meal was saved at ${new Date(recent.savedAt).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})}. Save it again?`)) return;
  saving = true;
  const [k, p, c, f, fb] = draftTotals(d.items), est = d.items.some(x => x.src !== 'packet');
  S.meals.push({id: uid(), date: today(), name: d.name || d.items.map(x => x.name).join(', '), portion: d.items.map(x => `${x.grams} g ${x.name}`).join(', '),
    kcal: Math.round(k), protein: n1(p), carbs: n1(c), fat: n1(f), fibre: n1(fb), slot: d.slot || '', est, items: d.items, photo: d.photos[0] || '', draftId: d.id, itemSig: sigv, savedAt: Date.now()});
  S.draft = null; save(); saving = false; go('Food');
}

screens.Meal = () => {
  const d = S.draft;
  if (!d) return `<h1>Meal</h1><div class="card"><p>No draft open.</p><button onclick="openMeal('type')">Start a meal</button></div>`;
  const [k, p, c, f, fb] = draftTotals(d.items), q = questions(d), unknown = d.items.filter(x => x.src === 'unknown').length, est = d.items.some(x => x.src !== 'packet');
  const rec = recentMeals(6).filter(m => !d.slot || slotOf(m) === d.slot).slice(0, 4);
  return `<h1>${d.slot ? 'Log ' + d.slot.toLowerCase() : 'Log food'}</h1><p class="mute">Nothing is saved until you tap Confirm.</p>
  ${!d.items.length ? `<div class="grid3"><button onclick="photoIn.click()">📷<br>Take photo</button><button onclick="speak()">🎤<br>Speak</button><button onclick="document.getElementById('mealText').focus()">⌨️<br>Type</button></div>
  ${rec.length ? `<div class="card mt"><h2>Recent</h2><ul>${rec.map(m => `<li><span>${esc(m.name)}<br><span class="mute">${gb(m.kcal)} kcal</span></span><button onclick="S.draft=null;repeatMeal({...${esc(js(pick(m, MEAL_KEYS)))},slot:${esc(js(d.slot || slotOf(m)))}});go('Today')">+ Add</button></li>`).join('')}</ul></div>` : ''}` : ''}
  ${d.photos.map((ph, i) => `<img src="${ph}" alt="Meal photo ${i + 1}" style="width:100%;border-radius:12px;margin-bottom:8px">`).join('')}
  ${d.photos.length ? (aiKey() ? `<button class="mt" ${estBusy ? 'disabled' : ''} onclick="estimatePhoto()">${estBusy ? 'Estimating…' : '✨ Estimate this photo with Claude'}</button><p class="mute">Asks before sending. You can edit every item before saving.</p>` : `<div class="note">The photo stays on this device. Describe the meal below, paste an estimate from Claude Desktop, or add a Claude API key in Settings for one-tap estimates.</div>`) : ''}
  <label>Meal</label><select onchange="S.draft.slot=this.value;save();render()">${['', ...MEAL_SLOTS.map(x => x[0])].map(s => `<option value="${s}" ${(d.slot || '') === s ? 'selected' : ''}>${s || 'By time of day'}</option>`).join('')}</select>
  <div class="card"><label for="mealText">${d.items.length ? 'Add or correct (e.g. “that was chicken thigh, I only ate half the rice”)' : 'What did you eat?'}</label>
    <textarea id="mealText" rows="3" placeholder="I had two eggs, two slices of toast with butter and a coffee with milk" oninput="S.draft.text=this.value;save()">${esc(d.text)}</textarea>
    <p id="speakMsg" class="mute"></p>
    <button class="mt" onclick="applyMealText()">${d.items.length ? 'Update draft' : 'Make draft'}</button>
    <div class="grid2 mt"><button class="sec" onclick="speak()">🎤 Speak</button><button class="sec" onclick="photoIn.click()">📷 Add photo</button></div></div>
  ${q.length ? `<div class="card"><h2>Quick questions</h2>${q.join('')}</div>` : ''}
  ${d.items.length ? `<div class="card"><h2>Items</h2><ul>${d.items.map(x => { const [ik, ip, ic, iff, ifb] = itemMacros(x); return `<li style="display:block">
      <div class="row" style="align-items:center"><input value="${esc(x.name)}" onchange="itemSet(${x.id},'name',this.value)" aria-label="Food name" style="flex:3"><button class="link" style="flex:0 0 auto;width:auto" onclick="S.draft.items=S.draft.items.filter(i=>i.id!=${x.id});save();render()" aria-label="Remove ${esc(x.name)}">✕</button></div>
      <div class="row mt" style="align-items:center"><input type="number" inputmode="decimal" value="${x.grams}" onchange="itemSet(${x.id},'grams',this.value)" aria-label="Amount in grams" style="flex:1"><span style="flex:0 0 auto">g/ml</span>
        <button class="sec" style="flex:0 0 auto;width:auto" onclick="itemSet(${x.id},'grams',${x.grams / 2})">½</button><button class="sec" style="flex:0 0 auto;width:auto" onclick="itemSet(${x.id},'grams',${x.grams * 2})">×2</button></div>
      <div class="mute mt">${x.per100 ? `${Math.round(ik)} kcal · P ${n1(ip)} g · C ${n1(ic)} g · F ${n1(iff)} g · Fibre ${n1(ifb)} g` : 'No values yet'}
        <span class="tag ${x.src === 'unknown' ? 'warn' : ''}">${{est: 'estimate', paste: 'pasted estimate', packet: 'packet values', unknown: 'unknown'}[x.src]}</span>
        <button class="link" style="width:auto" onclick="packetFor=packetFor===${x.id}?null:${x.id};render()">Enter packet values</button></div>
      ${packetFor === x.id ? `<form class="mt" onsubmit="event.preventDefault();savePacket(${x.id},this)"><label>Values per</label><input name="base" type="number" inputmode="decimal" value="100" aria-label="Per grams"> <span class="mute">g/ml (as on the packet)</span>
        <div class="grid2 mt"><input name="kcal" type="number" inputmode="decimal" step="any" placeholder="kcal" required><input name="p" type="number" inputmode="decimal" step="any" placeholder="Protein g"><input name="c" type="number" inputmode="decimal" step="any" placeholder="Carbs g"><input name="f" type="number" inputmode="decimal" step="any" placeholder="Fat g"><input name="fb" type="number" inputmode="decimal" step="any" placeholder="Fibre g"></div>
        <button class="mt">Use packet values</button></form>` : ''}</li>`; }).join('')}</ul>
    <button class="sec mt" onclick="S.draft.items.push({id:uid(),name:'New item',fam:'',per100:null,grams:100,unitG:100,src:'unknown',vary:false,qtyGiven:true});save();render()">+ Add item manually</button></div>
  <div class="card"><h2>${est ? 'Estimated total' : 'Total'}</h2><div class="grid2"><div><span class="big">${Math.round(k)}</span> kcal</div><div class="mute">Protein ${n1(p)} g<br>Carbs ${n1(c)} g · Fat ${n1(f)} g<br>Fibre ${n1(fb)} g</div></div>
    ${est ? `<div class="note"><b>Estimate.</b> Based on typical UK values${d.items.some(x => x.src === 'paste') ? ' and a pasted estimate' : ''}. Real values can differ by 20–30%. Use packet values for accuracy.${unknown ? ` Excludes ${unknown} item(s) with no values.` : ''}</div>` : ''}
    <label for="mealNm">Meal name (optional)</label><input id="mealNm" value="${esc(d.name)}" placeholder="${esc(d.items.map(x => x.name).join(', '))}" onchange="S.draft.name=this.value;save()">
    <button class="mt" onclick="confirmMeal()">${est ? 'Confirm estimate & save' : 'Confirm & save'}</button></div>` : ''}
  <div class="card"><h2>Paste an estimate</h2><p class="mute">Photo analysis isn't built into this app. To use Claude Desktop: open a chat, attach the photo yourself (it's then processed by Anthropic under your Claude account), and paste this prompt:</p>
    <pre>${esc(CLAUDE_PROMPT)}</pre><button class="sec" onclick="copyText(CLAUDE_PROMPT)">Copy prompt</button>
    <textarea id="pasteText" rows="4" class="mt" placeholder="Chicken thigh | 150 | 314 | 39 | 0 | 16"></textarea><button class="sec mt" onclick="applyPaste()">Add pasted items to draft</button></div>
  <button class="link" onclick="if(confirm('Discard this draft?')){S.draft=null;save();go('Food')}">Discard draft</button>`;
};
const CLAUDE_PROMPT = 'Estimate the foods in this meal photo. Reply with one item per line, no other text, as: name | grams | kcal | protein g | carbs g | fat g | fibre g. Include cooking oil or sauce if visible, and say if unsure.';

// ---------- favourites & repeats ----------
const MEAL_KEYS = ['name', 'portion', 'kcal', 'protein', 'carbs', 'fat', 'fibre', 'est', 'slot'];
const pick = (o, ks) => Object.fromEntries(ks.map(k => [k, o[k] ?? '']));
const mealInfo = m => [m.portion, `${m.kcal || 0} kcal`, `P ${m.protein || 0} g`, `C ${m.carbs || 0} g`, `F ${m.fat || 0} g`, `Fibre ${m.fibre || 0} g`].filter(Boolean).map(esc).join(' · ');
const repeatMeal = m => { S.meals.push({id: uid(), date: today(), ...pick(m, MEAL_KEYS), savedAt: Date.now()}); save(); render(); };
function favMeal(id) { const m = S.meals.find(x => x.id == id); if (S.favs.some(f => f.name === m.name)) return alert('Already a favourite.'); S.favs.push({id: uid(), date: today(), ...pick(m, MEAL_KEYS)}); save(); render(); }
const mealActions = () => `${MEAL_SLOTS.map(sl => mealSlotCard(sl, S.meals.filter(m => m.date === today() && slotOf(m) === sl[0]))).join('')}
  ${S.draft ? `<button class="sec mt" onclick="go('Meal')">Continue draft (${S.draft.items.length} item${S.draft.items.length === 1 ? '' : 's'})</button>` : ''}`;
function dayTotals(d = today()) { const m = S.meals.filter(x => x.date === d); return {kcal: sum(m, 'kcal'), protein: sum(m, 'protein'), carbs: sum(m, 'carbs'), fat: sum(m, 'fat'), fibre: sum(m, 'fibre'), water: sum(S.water.filter(x => x.date === d), 'ml'), n: m.length}; }

screens.Food = () => {
  const t = dayTotals();
  return `<h1 class="xl">Food</h1>${seg([['Diary', "go('Food')"], ['Meal Planner', "go('MealPlan')"], ['Groceries', "go('Shopping')"]], 'Diary')}
  ${has(P().allergies) ? `<div class="note"><b>Allergies:</b> ${esc(P().allergies)}</div>` : ''}
  ${mealActions()}${quickFood()}
  ${macroCard(t)}<div class="card"><h2>Today</h2>${macroRow('Calories', t.kcal, P().kcal, 'kcal')}${macroRow('Protein', t.protein, P().protein, 'g')}${macroRow('Carbs', t.carbs, P().carbs, 'g')}${macroRow('Fat', t.fat, P().fat, 'g')}${macroRow('Fibre', t.fibre, P().fibre, 'g')}${macroRow('Water', t.water, P().waterGoal, 'ml')}
    <div class="grid2 mt"><button class="sec" onclick="add('water',{ml:250})">+250 ml water</button><button class="sec" onclick="add('water',{ml:500})">+500 ml water</button></div></div>
  ${S.favs.length ? `<div class="card"><h2>Favourites</h2><ul>${S.favs.map(f => `<li><span>⭐ ${esc(f.name)}<br><span class="mute">${mealInfo(f)}</span></span><span style="white-space:nowrap"><button onclick="repeatMeal(${js(f)})">+ Add</button><button onclick="S.favs=S.favs.filter(x=>x.id!=${f.id});save();render()" aria-label="Remove favourite">✕</button></span></li>`).join('')}</ul></div>` : ''}
  
  <div class="card"><h2>Diary</h2><ul>${S.meals.slice().sort(byDateDesc).slice(0, 25).map(m => `<li><span>${m.photo ? `<img class="thumb" src="${m.photo}" alt=""> ` : ''}${esc(m.name)}${m.est ? '<span class="tag">estimate</span>' : ''}<br><span class="mute">${mealInfo(m)}<br>${ukDate(m.date)}</span></span>
    <span style="white-space:nowrap"><button onclick="repeatMeal(${js(pick(m, MEAL_KEYS))})" aria-label="Repeat today">↻</button><button onclick="favMeal(${m.id})" aria-label="Add to favourites">☆</button><button onclick="editEntry('meals',${m.id})">Edit</button><button onclick="del('meals',${m.id})" aria-label="Delete">✕</button></span></li>`).join('') || '<li class="mute">Nothing logged yet</li>'}</ul></div>
  <div class="card"><h2>Water log</h2><ul>${items('water', w => w.ml + ' ml', 8)}</ul></div>`;
};

// ---------- meal planner ----------
// Generic recipes, per serving. contains = allergen tags. ing = [name, qty, unit] per serving.
const RECIPES = [
  {id: 'r1', name: 'Porridge with banana & berries', meal: 'Breakfast', prep: 5, cost: .6, n: [380, 13, 66, 7, 7], contains: ['gluten', 'dairy'], ing: [['Porridge oats', 50, 'g'], ['Semi-skimmed milk', 250, 'ml'], ['Banana', 1, ''], ['Frozen berries', 60, 'g']]},
  {id: 'r2', name: 'Greek yoghurt, oats & honey', meal: 'Breakfast', prep: 3, cost: .9, n: [340, 22, 45, 8, 4], contains: ['dairy', 'gluten'], ing: [['Greek yoghurt', 200, 'g'], ['Porridge oats', 30, 'g'], ['Honey', 10, 'g']]},
  {id: 'r3', name: 'Scrambled eggs on toast', meal: 'Breakfast', prep: 10, cost: .8, n: [420, 24, 32, 21, 5], contains: ['egg', 'gluten', 'dairy'], ing: [['Eggs', 3, ''], ['Wholemeal bread', 2, 'slices'], ['Butter', 5, 'g']]},
  {id: 'r4', name: 'Peanut butter banana toast', meal: 'Breakfast', prep: 5, cost: .5, n: [410, 15, 52, 16, 7], contains: ['nuts', 'gluten'], ing: [['Wholemeal bread', 2, 'slices'], ['Peanut butter', 20, 'g'], ['Banana', 1, '']]},
  {id: 'r5', name: 'Chicken & salad wrap', meal: 'Lunch', prep: 10, cost: 1.8, n: [450, 38, 40, 14, 5], contains: ['gluten'], ing: [['Chicken breast', 120, 'g'], ['Tortilla wraps', 1, ''], ['Salad leaves', 40, 'g'], ['Tomatoes', 1, '']]},
  {id: 'r6', name: 'Tuna jacket potato', meal: 'Lunch', prep: 15, cost: 1.3, n: [430, 34, 55, 6, 7], contains: ['fish', 'egg'], ing: [['Baking potatoes', 1, ''], ['Tinned tuna', 1, 'tin'], ['Light mayonnaise', 15, 'g'], ['Sweetcorn', 50, 'g']]},
  {id: 'r7', name: 'Lentil & vegetable soup with bread', meal: 'Lunch', prep: 25, cost: .9, n: [420, 20, 68, 6, 12], contains: ['gluten'], veg: true, ing: [['Red lentils', 60, 'g'], ['Carrots', 1, ''], ['Onions', .5, ''], ['Vegetable stock cube', .5, ''], ['Wholemeal bread', 1, 'slices']]},
  {id: 'r8', name: 'Egg fried rice with peas', meal: 'Lunch', prep: 15, cost: .8, n: [480, 20, 70, 13, 6], contains: ['egg', 'soy'], veg: true, ing: [['Microwave rice', 125, 'g'], ['Eggs', 2, ''], ['Frozen peas', 80, 'g'], ['Soy sauce', 10, 'ml']]},
  {id: 'r9', name: 'Chicken, rice & broccoli', meal: 'Dinner', prep: 25, cost: 2, n: [560, 45, 65, 10, 4], contains: [], ing: [['Chicken breast', 150, 'g'], ['Rice', 75, 'g'], ['Broccoli', 100, 'g'], ['Olive oil', 5, 'ml']]},
  {id: 'r10', name: 'Salmon, potatoes & green beans', meal: 'Dinner', prep: 25, cost: 3, n: [580, 34, 45, 27, 7], contains: ['fish'], ing: [['Salmon fillets', 1, ''], ['New potatoes', 200, 'g'], ['Green beans', 100, 'g']]},
  {id: 'r11', name: 'Beef mince chilli with rice', meal: 'Dinner', prep: 35, cost: 2.1, n: [620, 40, 72, 17, 11], contains: [], ing: [['Lean beef mince', 125, 'g'], ['Kidney beans', 100, 'g'], ['Chopped tomatoes', 200, 'g'], ['Rice', 75, 'g'], ['Onions', .5, '']]},
  {id: 'r12', name: 'Chickpea & spinach curry with rice', meal: 'Dinner', prep: 30, cost: 1.2, n: [560, 20, 85, 14, 14], contains: [], veg: true, ing: [['Chickpeas', 1, 'tin'], ['Spinach', 80, 'g'], ['Chopped tomatoes', 200, 'g'], ['Curry paste', 20, 'g'], ['Rice', 75, 'g']]},
  {id: 'r13', name: 'Turkey meatball pasta', meal: 'Dinner', prep: 30, cost: 2.2, n: [610, 42, 70, 15, 6], contains: ['gluten'], ing: [['Turkey mince', 125, 'g'], ['Pasta', 80, 'g'], ['Passata', 200, 'g']]},
  {id: 'r14', name: 'Tofu stir-fry with noodles', meal: 'Dinner', prep: 20, cost: 1.8, n: [540, 26, 70, 16, 7], contains: ['soy', 'gluten'], veg: true, ing: [['Tofu', 150, 'g'], ['Stir-fry vegetables', 200, 'g'], ['Egg-free noodles', 75, 'g'], ['Soy sauce', 15, 'ml']]},
];
const ALLERGENS = {nuts: ['nut', 'peanut', 'almond', 'cashew', 'hazelnut'], dairy: ['dairy', 'milk', 'lactose', 'cheese', 'yoghurt'], egg: ['egg'], gluten: ['gluten', 'wheat', 'coeliac', 'celiac'], fish: ['fish', 'salmon', 'tuna', 'seafood', 'shellfish', 'prawn'], soy: ['soy', 'soya', 'tofu']};
function allergyTags() {
  const words = terms(P().allergies), tags = new Set(), unmatched = [];
  for (const w of words) { const t = Object.keys(ALLERGENS).filter(k => ALLERGENS[k].some(a => w.includes(a))); t.forEach(x => tags.add(x)); if (!t.length && !/^(none|no|n\/a)$/.test(w)) unmatched.push(w); }
  return {tags, unmatched};
}
function recipeOk(r) {
  const {tags} = allergyTags(), like = String(P().foodLike || '').toLowerCase(), txt = (r.name + ' ' + r.ing.map(i => i[0]).join(' ')).toLowerCase();
  if (r.contains.some(c => tags.has(c))) return false;
  if (terms(P().foodAvoid).some(w => txt.includes(w))) return false;
  if (/vegan/.test(like) && (!r.veg || r.contains.some(c => ['dairy', 'egg'].includes(c)))) return false;
  if (/vegetarian/.test(like) && !r.veg && r.meal !== 'Breakfast') return false;
  if (+P().prepTime > 0 && r.prep > +P().prepTime) return false;
  return true;
}
const recipeLike = r => terms(P().foodLike).some(w => r.name.toLowerCase().includes(w)) ? 0 : 1;
const recipe = id => RECIPES.find(r => r.id === id);
function generateMealPlan() {
  const slots = {}, budget = +P().budget || 0;
  for (const meal of ['Breakfast', 'Lunch', 'Dinner']) {
    let pool = RECIPES.filter(r => r.meal === meal && recipeOk(r)).sort((a, b) => recipeLike(a) - recipeLike(b) || b.n[4] - a.n[4] || a.cost - b.cost);
    if (budget) pool = pool.filter(r => r.cost * 7 * 3 <= budget * 1.5 || r === pool[0]);
    DAYS.forEach((d, i) => { if (pool.length) slots[`${d}|${meal}`] = {r: pool[i % Math.min(pool.length, 3)].id, s: S.mealPlan.slots[`${d}|${meal}`]?.s || 1}; });
  }
  S.pending = {kind: 'meals', slots, at: today()}; save(); go('MealPlan');
}
const planCost = slots => Object.values(slots).reduce((t, x) => t + (recipe(x.r)?.cost || 0) * x.s, 0);
function planDay(slots, d) { return ['Breakfast', 'Lunch', 'Dinner'].map(m => slots[`${d}|${m}`]).filter(Boolean).reduce((t, x) => recipe(x.r).n.map((v, i) => t[i] + v * x.s), [0, 0, 0, 0, 0]); }
screens.MealPlan = () => {
  const pend = S.pending?.kind === 'meals', slots = pend ? S.pending.slots : S.mealPlan.slots, {unmatched} = allergyTags();
  return `<h1 class="xl">Food</h1>${seg([['Diary', "go('Food')"], ['Meal Planner', "go('MealPlan')"], ['Groceries', "go('Shopping')"]], 'Meal Planner')}<h2>${pend ? 'Review meal plan' : 'Weekly meals'}</h2>
  ${!pend ? act3([[Object.keys(slots).length ? 'New plan' : 'Create plan', 'plus', 'generateMealPlan()'], ['Groceries', 'edit', "go('Shopping')"], ['Diary', 'more', "go('Food')"]]) : ''}
  <div class="card mt"><p class="mute">Using: likes ${has(P().foodLike) ? esc(P().foodLike) : '—'} · avoid ${has(P().foodAvoid) ? esc(P().foodAvoid) : '—'} · allergies ${has(P().allergies) ? esc(P().allergies) : '—'} · budget ${+P().budget ? '£' + P().budget + '/week' : '—'} · prep ${+P().prepTime ? '≤' + P().prepTime + ' min' : '—'}</p>
    ${unmatched.length ? `<div class="note">I couldn't match “${unmatched.map(esc).join('”, “')}” to recipe allergen tags. Check every ingredient yourself.</div>` : ''}
    <div class="note">Recipe allergen tags are generic. Always check packet labels.</div>
    <p>Estimated cost: <b>£${planCost(slots).toFixed(2)}</b>${+P().budget ? ` of £${P().budget}` : ''} per week (rough UK supermarket prices)</p>
    ${!pend ? `<button class="sec" onclick="generateMealPlan()">${Object.keys(slots).length ? 'Suggest a new plan' : 'Suggest a plan'}</button>` : ''}</div>
  ${DAYS.map(d => { const [k, p, , , fb] = planDay(slots, d); return `<div class="card"><h2>${d}</h2>
    ${['Breakfast', 'Lunch', 'Dinner'].map(m => { const key = `${d}|${m}`, x = slots[key]; return `<label>${m}</label><div class="row" style="align-items:center">
      <select style="flex:3" onchange="setSlot('${key}','r',this.value)"><option value="">—</option>${RECIPES.filter(r => r.meal === m).map(r => `<option value="${r.id}" ${x?.r === r.id ? 'selected' : ''} ${recipeOk(r) ? '' : 'disabled'}>${esc(r.name)} (${r.n[4]} g fibre)${recipeOk(r) ? '' : ' (excluded)'}</option>`).join('')}</select>
      <input style="flex:1" type="number" inputmode="decimal" step="0.5" min="0" value="${x?.s ?? 1}" onchange="setSlot('${key}','s',+this.value)" aria-label="Servings">
      ${!pend && x ? `<button class="sec" style="flex:0 0 auto;width:auto" onclick="logPlanned('${key}')">Log</button>` : ''}</div>`; }).join('')}
    <p class="mute">${Math.round(k)} kcal${+P().kcal ? ' of ' + P().kcal : ''} · ${Math.round(p)} g protein${+P().protein ? ' of ' + P().protein : ''} · ${Math.round(fb)} g fibre${+P().fibre ? ' of ' + P().fibre : ''}</p></div>`; }).join('')}
  ${pend ? `<button onclick="S.mealPlan.slots=S.pending.slots;S.pending=null;save();render()">Apply this plan</button><button class="sec mt" onclick="S.pending=null;save();render()">Discard suggestion</button>` : ''}`;
};
function setSlot(key, k, v) {
  const slots = S.pending?.kind === 'meals' ? S.pending.slots : S.mealPlan.slots;
  if (k === 'r' && !v) delete slots[key]; else { slots[key] ||= {r: '', s: 1}; slots[key][k] = v; }
  save(); render();
}
function logPlanned(key) {
  const x = S.mealPlan.slots[key], r = recipe(x.r);
  if (!confirm(`Log ${x.s} × ${r.name} (≈${Math.round(r.n[0] * x.s)} kcal, estimate) for today?`)) return;
  S.meals.push({id: uid(), date: today(), name: r.name, portion: `${x.s} serving${x.s === 1 ? '' : 's'}`, kcal: Math.round(r.n[0] * x.s), protein: n1(r.n[1] * x.s), carbs: n1(r.n[2] * x.s), fat: n1(r.n[3] * x.s), fibre: n1(r.n[4] * x.s), est: true, savedAt: Date.now()});
  save(); go('Food');
}
function shoppingList() {
  const out = {};
  for (const x of Object.values(S.mealPlan.slots)) { const r = recipe(x.r); if (!r) continue; for (const [n, q, u] of r.ing) { const k = n + '|' + u; out[k] = n1((out[k] || 0) + q * x.s); } }
  return Object.entries(out).sort().map(([k, q]) => { const [n, u] = k.split('|'); return {k, n, q, u}; });
}
screens.Shopping = () => {
  const list = shoppingList(), t = S.mealPlan.ticks;
  return `<h1 class="xl">Food</h1>${seg([['Diary', "go('Food')"], ['Meal Planner', "go('MealPlan')"], ['Groceries', "go('Shopping')"]], 'Groceries')}<h2>Shopping list</h2>
  <div class="card mt">${list.length ? `<p class="mute">Updates automatically when you change servings in the meal plan.</p>${list.map(i => `<label class="chk"><input type="checkbox" ${t[i.k] != null ? 'checked' : ''} onchange="tickItem(${js(i.k)},${i.q},this.checked)"> <span style="${t[i.k] != null ? 'text-decoration:line-through;opacity:.6' : ''}">${esc(i.n)} — ${gb(i.q)}${i.u ? ' ' + esc(i.u) : ''}</span>${t[i.k] != null && t[i.k] !== i.q ? `<span class="tag warn">was ${gb(t[i.k])} when ticked</span>` : ''}</label>`).join('')}
    <button class="sec mt" onclick="S.mealPlan.ticks={};save();render()">Untick all</button>` : '<p class="mute">Plan some meals first.</p>'}</div>`;
};
function tickItem(k, q, on) { if (on) S.mealPlan.ticks[k] = q; else delete S.mealPlan.ticks[k]; save(); render(); }

// ---------- what this device supports ----------
screens.Device = () => {
  const rows = [
    ['Secure connection (HTTPS or localhost)', window.isSecureContext, 'Needed for direct speech recognition and camera streaming. Over plain Wi-Fi http these are blocked; photo picker and keyboard dictation still work.'],
    ['Speech recognition API', !!SR, 'If missing, use the 🎤 on the keyboard.'],
    ['Usable for Speak meal right now', !!SR && window.isSecureContext, ''],
    ['Photo picker / camera via file input', true, 'On iPhone this offers Take Photo or Photo Library.'],
    ['Vibration', !!navigator.vibrate, 'Not supported on iPhone Safari.'],
    ['Web Audio (end-of-rest sound)', !!(window.AudioContext || window.webkitAudioContext), ''],
    ['Installed to Home Screen', matchMedia('(display-mode: standalone)').matches || !!navigator.standalone, ''],
    ['Local storage working', (() => { try { localStorage.setItem('_t', '1'); localStorage.removeItem('_t'); return true; } catch { return false; } })(), ''],
  ];
  return `<h1>This device</h1><button class="sec" onclick="go('Health')">← Health</button>
  <div class="card mt"><ul>${rows.map(([l, ok, n]) => `<li style="display:block"><b>${ok ? '✅' : '❌'} ${l}</b>${n ? `<br><span class="mute">${n}</span>` : ''}</li>`).join('')}</ul>
  <p class="mute">${esc(navigator.userAgent)}</p>
  <button class="sec" onclick="navigator.storage?.persist?.().then(ok=>alert(ok?'Browser agreed to keep this data.':'Browser did not grant persistent storage. Keep regular backups.'))">Ask browser to keep my data</button></div>`;
};
function logMeal(slot) { S.draft ||= newDraft(); S.draft.slot = slot; save(); go('Meal'); }
