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
// Foods learned from Claude lookups (saved on this device) are checked first, then the built-in bank; longest phrase wins.
const lookupFood = txt => { const t = ' ' + txt.toLowerCase() + ' '; return (S.foods || []).find(f => t.includes(' ' + f[0][0] + ' ')) || KW.find(([k]) => new RegExp(`\\b${k}\\b`).test(t))?.[1]; };
const DISHES = /\b(rice|ackee|fish|cod|bun|mac|sweet) (?:and|&|n) (peas|saltfish|chips|cheese|sour)\b/g; // dish names that contain "and"
const fracOf = w => /%/.test(w) ? parseFloat(w) / 100 : NUMW[w] ?? (parseFloat(w) || 1);

function parseFood(txt) {
  let t = txt.toLowerCase().trim().replace(/^(?:i |then |and |also |plus |some |a bit of |had |ate )+/, '').replace(/^(?:the|my|some)\s+/, '');
  const numRe = new RegExp(`^(\\d+(?:\\.\\d+)?|(?:${Object.keys(NUMW).sort((a, b) => b.length - a.length).join('|')})(?![a-z]))\\s*(?:of\\s+)?`); // number words must be whole words ("a" not the start of "ackee")
  let n = null, unit = null, m = t.match(numRe);
  if (m) { n = isNaN(m[1]) ? NUMW[m[1]] : +m[1]; t = t.slice(m[0].length); }
  const tail = t.match(/\s+(\d+(?:\.\d+)?)\s*(g|grams?|ml|kg)$/); // trailing amount: "jerk chicken 250g"
  if (tail && n == null) { n = +tail[1]; unit = tail[2].startsWith('g') ? 'g' : tail[2]; t = t.slice(0, tail.index); }
  m = unit ? null : t.match(new RegExp(`^(${Object.keys(METRIC).join('|')}|${UNITW})\\b\\s*(?:of\\s+)?`));
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
  for (let c of t.replace(DISHES, '$1_and_$2').split(/,|;|\.|\band\b|\bplus\b/)) {
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
  S.draft ||= newDraft(); if (mode !== 'photo') S.draft.mode = mode; save(); go('Meal');
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
  catch { return alert('Could not read that image. Try another, or describe the meal instead.'); }
};
function applyMealText() {
  const ta = document.getElementById('mealText'), t = ta.value.trim(); if (!t) return ta.focus();
  if (S.draft.photos.length && !S.draft.items.length && aiKey()) { S.draft.text = t; save(); return estimatePhoto(); }
  const before = S.draft.items.length; applyText(S.draft, t);
  if (S.draft.items.some(x => x.src === 'unknown') && aiKey() && S.settings.photoAuto !== false) { S.draft.text = ''; save(); render(); return lookupUnknown(true); } // fill unknown foods straight away
  if (!S.draft.items.length && !before) return alert("I couldn't find any foods in that. Try e.g. \"two eggs and toast\".");
  S.draft.text = ''; save(); render();
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
  const unk = d.items.filter(x => x.src === 'unknown' || !x.per100);
  if (unk.length) return aiKey() ? lookupUnknown() : alert(`No calories for ${unk.map(x => x.name).join(', ')} yet. Add packet values, rename it, or remove it.`);
  if (S.meals.some(m => m.draftId === d.id)) { S.draft = null; save(); return go('Food'); } // retry after a successful save
  const sigv = d.items.map(x => x.name + ':' + x.grams).join('|');
  const recent = S.meals.find(m => m.itemSig === sigv && m.date === today() && Date.now() - (m.savedAt || 0) < 15 * 60e3);
  if (recent && !confirm(`An identical meal was saved at ${new Date(recent.savedAt).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})}. Save it again?`)) return;
  saving = true;
  const [k, p, c, f, fb] = draftTotals(d.items), est = d.items.some(x => x.src !== 'packet');
  S.meals.push({id: uid(), date: d.date || today(), name: d.name || d.items.map(x => x.name).join(', '), portion: d.items.map(x => `${x.grams} g ${x.name}`).join(', '),
    kcal: Math.round(k), protein: n1(p), carbs: n1(c), fat: n1(f), fibre: n1(fb), slot: d.slot || '', est, items: d.items, photo: d.photos[0] || '', draftId: d.id, itemSig: sigv, savedAt: Date.now()});
  S.draft = null; save(); saving = false; go('Food');
}

screens.Meal = () => {
  const d = S.draft;
  if (!d) return `<h1>Meal</h1><div class="card"><p>No draft open.</p><button onclick="openMeal('type')">Start a meal</button></div>`;
  const [k, p, c, f, fb] = draftTotals(d.items), q = questions(d), unknown = d.items.filter(x => x.src === 'unknown').length, est = d.items.some(x => x.src !== 'packet');
  const slot = d.slot || slotNow();
  const head = `<div class="mhead"><button class="rnd" onclick="if(!S.draft.items.length||confirm('Discard this meal?')){S.draft=null;quickAdd=false;save();go(mealBack)}" aria-label="Cancel">‹</button>
    <select class="ttl" aria-label="Change meal" onchange="S.draft.slot=this.value;save();render()">${MEAL_SLOTS.map(x => `<option ${slot === x[0] ? 'selected' : ''}>${x[0]}</option>`).join('')}</select><span></span></div>`;
  const input = (label) => `<div class="card"><label for="mealText">${label}</label>
    <textarea id="mealText" rows="3" placeholder="e.g. two eggs, toast with butter and a coffee" oninput="S.draft.text=this.value;save()">${esc(d.text)}</textarea>
    <p id="speakMsg" class="mute"></p><button class="mt" onclick="applyMealText()">${d.items.length ? 'Update' : 'Next'}</button></div>`;
  const more = `<button class="link" onclick="S.draft.items.push({id:uid(),name:'New item',fam:'',per100:null,grams:100,unitG:100,src:'unknown',vary:false,qtyGiven:true});save();render()">+ Add food manually</button>`;
  // Step 1: choose how to log
  if (!d.items.length && !d.photos.length && !d.mode) return head + mealStep1(slot) + more;
  // Step 2: describe it (typed, spoken or photo)
  if (!d.items.length) return `${head}
    ${d.photos.map((ph, i) => `<img src="${ph}" alt="Meal photo ${i + 1}" class="mphoto">`).join('')}
    ${d.photos.length && aiKey() ? (estBusy ? '<p class="center"><b>Working out your meal…</b></p>' : `<div class="card"><b>Where's it from?</b>
      <div class="chips">${['Home-cooked', "Nando's", 'Wagamama', 'Caribbean takeaway', 'Chinese takeaway', 'Indian takeaway', 'Fast food'].map(w => `<button class="chip" onclick="S.draft.where=${js(w)};estimatePhoto()">${esc(w)}</button>`).join('')}</div>
      <form class="row" onsubmit="event.preventDefault();S.draft.where=this.w.value.trim();estimatePhoto()"><input name="w" placeholder="Somewhere else? e.g. Pizza Express"><button style="flex:0 0 auto;width:auto">Go</button></form>
      <button class="link" onclick="S.draft.where='';estimatePhoto()">Not sure, just estimate</button></div><p class="mute center">or describe it:</p>`) : ''}
    ${input(d.mode === 'speak' ? 'Say what you ate' : 'What did you eat?')}
    <div class="grid3"><button class="sec" onclick="S.draft.mode='speak';render();speak()">🎤 Speak</button><button class="sec" onclick="photoIn.click()">📷 Photo</button><button class="sec" onclick="scanBarcode()">▥ Scan</button></div>${more}`;
  // Step 3: check and save
  return `${head}
  ${q.length ? `<div class="card"><h2>Quick questions</h2>${q.join('')}</div>` : ''}
  <div class="card"><ul>${d.items.map(x => { const [ik, ip, ic, iff, ifb] = itemMacros(x); return `<li style="display:block">
      <div class="row" style="align-items:center"><input value="${esc(x.name)}" onchange="itemSet(${x.id},'name',this.value)" aria-label="Food name" style="flex:3"><input type="number" inputmode="decimal" value="${x.grams}" onchange="itemSet(${x.id},'grams',this.value)" aria-label="Grams" style="flex:1.2"><span class="mute" style="flex:0 0 auto">g</span><button class="link" style="flex:0 0 auto;width:auto" onclick="S.draft.items=S.draft.items.filter(i=>i.id!=${x.id});save();render()" aria-label="Remove ${esc(x.name)}">✕</button></div>
      <div class="mute">${x.per100 ? `${Math.round(ik)} kcal · P ${n1(ip)} · C ${n1(ic)} · F ${n1(iff)} · Fibre ${n1(ifb)} g` : 'No values yet'} <span class="tag ${x.src === 'unknown' ? 'warn' : ''}">${{est: 'estimate', paste: 'estimate', packet: 'packet', unknown: 'unknown'}[x.src]}</span>
        <button class="link" style="width:auto;min-height:0;padding:4px" onclick="packetFor=packetFor===${x.id}?null:${x.id};render()">Packet values</button></div>
      ${packetFor === x.id ? `<form class="mt" onsubmit="event.preventDefault();savePacket(${x.id},this)"><div class="row" style="align-items:center"><span class="mute" style="flex:0 0 auto">Per</span><input name="base" type="number" inputmode="decimal" value="100" aria-label="Per grams"><span class="mute" style="flex:0 0 auto">g/ml</span></div>
        <div class="grid2 mt"><input name="kcal" type="number" inputmode="decimal" step="any" placeholder="kcal" required><input name="p" type="number" inputmode="decimal" step="any" placeholder="Protein g"><input name="c" type="number" inputmode="decimal" step="any" placeholder="Carbs g"><input name="f" type="number" inputmode="decimal" step="any" placeholder="Fat g"><input name="fb" type="number" inputmode="decimal" step="any" placeholder="Fibre g"></div>
        <button class="mt">Use packet values</button></form>` : ''}</li>`; }).join('')}</ul></div>
  <div class="card"><div class="sec-h"><div><span class="big">${Math.round(k)}</span> kcal${est ? ' <span class="tag">estimate</span>' : ''}</div><div class="mute" style="text-align:right">P ${n1(p)} · C ${n1(c)} · F ${n1(f)} g<br>Fibre ${n1(fb)} g</div></div>
    ${unknown ? `<p class="mute">${unknown} item(s) have no values yet: rename them or add packet values.</p>${aiKey() ? `<button class="sec" ${estBusy ? 'disabled' : ''} onclick="lookupUnknown()">${estBusy ? 'Looking up…' : '✨ Look up with Claude'}</button>` : ''}` : ''}
    <button class="mt" onclick="confirmMeal()">Save ${d.slot ? d.slot.toLowerCase() : 'meal'}</button></div>
  <details class="card more"><summary>Add another food</summary>${input('e.g. “that was chicken thigh, I only ate half the rice”').replace(/^<div class="card">|<\/div>$/g, '')}
    <div class="grid3 mt"><button class="sec" onclick="speak()">🎤 Speak</button><button class="sec" onclick="photoIn.click()">📷 Photo</button><button class="sec" onclick="scanBarcode()">▥ Scan</button></div>
    <label for="mealNm">Meal name (optional)</label><input id="mealNm" value="${esc(d.name)}" placeholder="${esc(d.items.map(x => x.name).join(', '))}" onchange="S.draft.name=this.value;save()"></details>
  ${more}`;
};
const CLAUDE_PROMPT = 'Estimate the foods in this meal photo. Reply with one item per line, no other text, as: name | grams | kcal | protein g | carbs g | fat g | fibre g. Include cooking oil or sauce if visible, and say if unsure.';

// ---------- favourites & repeats ----------
const MEAL_KEYS = ['name', 'portion', 'kcal', 'protein', 'carbs', 'fat', 'fibre', 'est', 'slot'];
const pick = (o, ks) => Object.fromEntries(ks.map(k => [k, o[k] ?? '']));
const mealInfo = m => [m.portion, `${m.kcal || 0} kcal`, `P ${m.protein || 0} g`, `C ${m.carbs || 0} g`, `F ${m.fat || 0} g`, `Fibre ${m.fibre || 0} g`].filter(Boolean).map(esc).join(' · ');
const repeatMeal = m => { S.meals.push({id: uid(), date: today(), ...pick(m, MEAL_KEYS), savedAt: Date.now()}); save(); render(); };
function favMeal(id) { const m = S.meals.find(x => x.id == id); if (S.favs.some(f => f.name === m.name)) return alert('Already a favourite.'); S.favs.push({id: uid(), date: today(), ...pick(m, MEAL_KEYS)}); save(); render(); }
let foodDay = null; const fDay = () => foodDay || today();
const dayNav = () => `<div class="daynav"><button class="link" onclick="foodDay=dayOffset(-1,fDay());render()" aria-label="Previous day">‹</button><b>${fDay() === today() ? 'Today' : ukDate(fDay())}</b><button class="link" ${fDay() === today() ? 'disabled' : ''} onclick="foodDay=dayOffset(1,fDay());if(foodDay>=today())foodDay=null;render()" aria-label="Next day">›</button></div>`;
const mealActions = () => `${dayNav()}${fDay() === today() ? '' : dayRecap(fDay())}${MEAL_SLOTS.map(sl => mealSlotCard(sl, S.meals.filter(m => m.date === fDay() && slotOf(m) === sl[0]), true)).join('')}${completeBtn(fDay())}
  ${S.draft?.items.length ? `<button class="sec mt" onclick="go('Meal')">Continue draft (${S.draft.items.length} item${S.draft.items.length === 1 ? '' : 's'})</button>` : ''}`;
function dayTotals(d = today()) { const m = S.meals.filter(x => x.date === d); return {kcal: sum(m, 'kcal'), protein: sum(m, 'protein'), carbs: sum(m, 'carbs'), fat: sum(m, 'fat'), fibre: sum(m, 'fibre'), water: sum(S.water.filter(x => x.date === d), 'ml'), n: m.length}; }

screens.Food = () => {
  const t = dayTotals();
  return `<h1 class="xl">Food</h1>${seg([['Diary', "go('Food')"], ['Meal Planner', "go('MealPlan')"], ['Groceries', "go('Shopping')"]], 'Diary')}
  ${has(P().allergies) ? `<div class="note"><b>Allergies:</b> ${esc(P().allergies)}</div>` : ''}
  ${macroCard(t)}${mealActions()}${fiQuickFood()}
  ${S.favs.length ? `<div class="card"><h2>Favourites</h2><ul>${S.favs.map(f => `<li class="fi-row" onclick="openFoodInfo('past',${js(f)})"><span>⭐ ${esc(f.name)}<br><span class="mute">${mealInfo(f)}</span></span><span style="white-space:nowrap" onclick="event.stopPropagation()"><button class="fi-amt" onclick="openFoodInfo('past',${js(f)})">1 serving</button><button onclick="repeatMeal(${js(f)})">+ Add</button><button onclick="S.favs=S.favs.filter(x=>x.id!=${f.id});save();render()" aria-label="Remove favourite">✕</button></span></li>`).join('')}</ul></div>` : ''}
  
  <details class="card more"><summary>Water log</summary><ul>${items('water', w => w.ml + ' ml', 8)}</ul></details>`;
};

// ---------- meal planner: cook once, eat twice ----------
// Recipes are stored per serving (n, ing); every planned recipe is cooked as a 2-serving batch and the second serving is the next day's leftover.
// contains = allergen tags. ing = [name, qty, unit] per serving. Slots: {r: recipe id, f: portion factor, lo: leftover?}.
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
  {id: 'r15', name: 'Special fried rice with prawns, chicken & egg', meal: 'Dinner', prep: 20, cost: 2.4, n: [610, 42, 72, 15, 5], contains: ['egg', 'fish', 'soy'], ing: [['Rice', 75, 'g'], ['Chicken breast', 80, 'g'], ['King prawns', 60, 'g'], ['Eggs', 1, ''], ['Frozen peas', 60, 'g'], ['Spring onions', 2, ''], ['Soy sauce', 15, 'ml'], ['Vegetable oil', 5, 'ml']]},
  {id: 'r16', name: 'Jerk chicken with rice and peas', meal: 'Dinner', prep: 40, cost: 2.2, n: [650, 45, 75, 16, 8], contains: [], ing: [['Chicken thighs (boneless)', 150, 'g'], ['Jerk seasoning', 15, 'g'], ['Rice', 70, 'g'], ['Kidney beans', 60, 'g'], ['Light coconut milk', 60, 'ml'], ['Spring onions', 1, '']]},
  {id: 'r17', name: 'Curry chicken with rice', meal: 'Dinner', prep: 45, cost: 2, n: [630, 44, 70, 16, 5], contains: [], ing: [['Chicken thighs (boneless)', 150, 'g'], ['Caribbean curry powder', 10, 'g'], ['Potatoes', 100, 'g'], ['Onions', .5, ''], ['Rice', 70, 'g'], ['Vegetable oil', 5, 'ml']]},
  {id: 'r18', name: 'Turkey chilli with rice', meal: 'Dinner', prep: 35, cost: 1.9, n: [580, 44, 70, 10, 12], contains: [], ing: [['Turkey mince (5% fat)', 125, 'g'], ['Kidney beans', 100, 'g'], ['Chopped tomatoes', 200, 'g'], ['Peppers', .5, ''], ['Onions', .5, ''], ['Rice', 70, 'g']]},
  {id: 'r19', name: 'Salmon noodle stir-fry', meal: 'Dinner', prep: 20, cost: 3.2, n: [620, 36, 62, 23, 6], contains: ['fish', 'gluten', 'soy'], ing: [['Salmon fillets', 1, ''], ['Egg-free noodles', 75, 'g'], ['Stir-fry vegetables', 200, 'g'], ['Soy sauce', 15, 'ml'], ['Ginger', 5, 'g']]},
  {id: 'r20', name: 'Chicken fajita bowl', meal: 'Lunch', prep: 25, cost: 2.1, n: [580, 45, 65, 13, 9], contains: ['dairy'], ing: [['Chicken breast', 130, 'g'], ['Peppers', 1, ''], ['Onions', .5, ''], ['Fajita seasoning', 10, 'g'], ['Rice', 60, 'g'], ['Black beans', 60, 'g'], ['Low-fat soured cream', 30, 'g']]},
  {id: 'r21', name: 'Lentil dhal with rice', meal: 'Lunch', prep: 30, cost: .9, n: [560, 24, 92, 9, 14], contains: [], veg: true, ing: [['Red lentils', 80, 'g'], ['Chopped tomatoes', 100, 'g'], ['Onions', .5, ''], ['Garlic', 1, 'clove'], ['Curry powder', 5, 'g'], ['Spinach', 50, 'g'], ['Rice', 60, 'g']]},
  {id: 'r22', name: 'Overnight oats with berries', meal: 'Breakfast', prep: 5, cost: .8, n: [390, 20, 55, 9, 8], contains: ['dairy', 'gluten'], ing: [['Porridge oats', 50, 'g'], ['Greek yoghurt (0%)', 100, 'g'], ['Semi-skimmed milk', 100, 'ml'], ['Frozen berries', 80, 'g'], ['Chia seeds', 5, 'g']]},
  {id: 'r23', name: 'Greek yoghurt bowl with fruit & seeds', meal: 'Breakfast', prep: 3, cost: 1, n: [330, 25, 35, 10, 6], contains: ['dairy'], ing: [['Greek yoghurt (0%)', 200, 'g'], ['Banana', .5, ''], ['Frozen berries', 60, 'g'], ['Mixed seeds', 10, 'g'], ['Honey', 5, 'g']]},
  {id: 'r24', name: 'Egg & veg omelette wrap', meal: 'Breakfast', prep: 10, cost: .9, n: [420, 26, 30, 21, 5], contains: ['egg', 'gluten', 'dairy'], ing: [['Eggs', 2, ''], ['Tortilla wraps', 1, ''], ['Spinach', 30, 'g'], ['Peppers', .25, ''], ['Reduced-fat cheddar', 15, 'g']]},
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
const planRecipes = () => [...RECIPES, ...(S.myRecipes || [])];
const recipe = id => planRecipes().find(r => r.id === id);
const PLAN_WIN = {Breakfast: [250, 450], Lunch: [500, 700], Dinner: [500, 700]};
// portion factor that brings one serving into its calorie window; 0 = can't fit sensibly
function planFit(r) {
  const [lo, hi] = PLAN_WIN[r.meal] || [0, 1e9], k = r.n[0];
  if (k >= lo && k <= hi) return 1;
  const f = (k < lo ? Math.ceil : Math.floor)((k < lo ? lo : hi) / k * 20) / 20; // round towards the inside of the window
  return f < .6 || f > 1.6 ? 0 : f;
}
const planF = x => x?.f ?? x?.s ?? 1; // old plans stored servings as s
const planN = (r, f) => r.n.map(v => v * f); // per serving at portion factor
const planMon = () => dayOffset(-((new Date(today() + 'T12:00').getDay() + 6) % 7));
function generateMealPlan() {
  const slots = {}, budget = +P().budget || 0;
  for (const meal of ['Breakfast', 'Lunch', 'Dinner']) {
    let pool = planRecipes().filter(r => r.meal === meal && recipeOk(r) && planFit(r)).sort((a, b) => recipeLike(a) - recipeLike(b) || b.n[4] - a.n[4] || a.cost - b.cost);
    if (budget) pool = pool.filter(r => (r.cost || 0) * 7 * 3 <= budget * 1.5 || r === pool[0]);
    // cook on Mon, Wed, Fri, Sun; the day after is the leftover
    DAYS.forEach((d, i) => { if (pool.length) { const r = pool[Math.floor(i / 2) % Math.min(pool.length, 4)]; slots[`${d}|${meal}`] = {r: r.id, f: planFit(r), lo: i % 2 === 1}; } });
  }
  S.pending = {kind: 'meals', slots, at: today()}; save(); go('MealPlan');
}
const planCost = slots => Object.values(slots).reduce((t, x) => t + (x.lo ? 0 : (recipe(x.r)?.cost || 0) * 2 * planF(x)), 0);
function planDay(slots, d) { return ['Breakfast', 'Lunch', 'Dinner'].map(m => slots[`${d}|${m}`]).filter(x => x && recipe(x.r)).reduce((t, x) => planN(recipe(x.r), planF(x)).map((v, i) => t[i] + v), [0, 0, 0, 0, 0]); }
const planMacros = n => `${Math.round(n[0])} kcal · P ${Math.round(n[1])} · C ${Math.round(n[2])} · F ${Math.round(n[3])} · Fibre ${Math.round(n[4])} g`;
function planCard(key, x, pend) {
  const [d, m] = key.split('|'), r = recipe(x.r); if (!r) return '';
  const f = planF(x), prev = DAYS[DAYS.indexOf(d) - 1];
  return `<div class="plan-meal${x.lo ? ' lo' : ''}"><div class="plan-top"><b>${esc(r.name)}</b>${x.lo ? '<span class="tag">Leftover</span>' : ''}</div>
    <div class="mute">${x.lo ? `Second serving from ${prev ? esc(prev) : 'the batch'}` : 'Makes 2 servings · cook once, eat twice'}${f !== 1 ? ` · portion ×${f}` : ''}</div>
    <div class="plan-n">${planMacros(planN(r, f))} <span class="mute">per serving</span></div>
    ${x.lo ? '' : `<details class="plan-ing"><summary>Ingredients for 2 servings${r.prep ? ` · ${r.prep} min` : ''}</summary><ul>${r.ing.map(([n, q, u]) => `<li><span>${esc(n)}</span><span class="mute">${gb(n1(q * 2 * f))}${u ? ' ' + esc(u) : ''}</span></li>`).join('')}</ul>
      ${r.method?.length ? `<ol class="plan-method">${r.method.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}</details>`}
    ${pend ? '' : `<button class="sec plan-add" onclick="planAdd(${js(key)})">${x.lo ? 'Add leftover' : 'Add to food tracker'}</button>`}</div>`;
}
let planIdeas = [], planBusy = false;
screens.MealPlan = () => {
  const pend = S.pending?.kind === 'meals', slots = pend ? S.pending.slots : S.mealPlan.slots, {unmatched} = allergyTags();
  return `<h1 class="xl">Food</h1>${seg([['Diary', "go('Food')"], ['Meal Planner', "go('MealPlan')"], ['Groceries', "go('Shopping')"]], 'Meal Planner')}<h2>${pend ? 'Review meal plan' : 'Weekly meals'}</h2>
  ${!pend ? act3([[Object.keys(slots).length ? 'New plan' : 'Create plan', 'plus', 'generateMealPlan()'], ['Groceries', 'edit', "go('Shopping')"], ['Diary', 'more', "go('Food')"]]) : ''}
  <div class="card mt"><p class="mute">Cook once, eat twice: each recipe makes 2 servings, the second is the next day's leftover. Per serving: breakfast 250–450 kcal, lunch and dinner 500–700 kcal.</p>
    <p class="mute">Using: likes ${has(P().foodLike) ? esc(P().foodLike) : '—'} · avoid ${has(P().foodAvoid) ? esc(P().foodAvoid) : '—'} · allergies ${has(P().allergies) ? esc(P().allergies) : '—'} · budget ${+P().budget ? '£' + P().budget + '/week' : '—'} · prep ${+P().prepTime ? '≤' + P().prepTime + ' min' : '—'}</p>
    ${unmatched.length ? `<div class="note">I couldn't match “${unmatched.map(esc).join('”, “')}” to recipe allergen tags. Check every ingredient yourself.</div>` : ''}
    <div class="note">Recipe allergen tags are generic. Always check packet labels.</div>
    <p>Estimated cost: <b>£${planCost(slots).toFixed(2)}</b>${+P().budget ? ` of £${P().budget}` : ''} per week (rough UK supermarket prices)</p>
    ${!pend ? `<button class="sec" onclick="generateMealPlan()">${Object.keys(slots).length ? 'Suggest a new plan' : 'Suggest a plan'}</button>` : ''}
    ${aiKey() && !pend ? `<button class="sec mt" ${planBusy ? 'disabled' : ''} onclick="planAskIdeas()">${planBusy ? 'Asking Claude…' : '✨ New recipe ideas'}</button>` : ''}</div>
  ${planIdeas.map((r, i) => `<div class="card plan-idea"><span class="tag">${esc(r.meal)}</span>${planCard('Idea|' + r.meal, {r: r.id, f: 1}, true)}
    <div class="grid2 mt"><button onclick="planKeep(${i})">Keep</button><button class="sec" onclick="planIdeas.splice(${i},1);render()">Skip</button></div></div>`).join('')}
  ${DAYS.map(d => { const [k, p, , , fb] = planDay(slots, d); return `<div class="card"><h2>${d}</h2>
    ${['Breakfast', 'Lunch', 'Dinner'].map(m => { const key = `${d}|${m}`, x = slots[key]; return `<label>${m}</label>
      <select onchange="setSlot('${key}','r',this.value)"><option value="">—</option>${planRecipes().filter(r => r.meal === m).map(r => { const ok = recipeOk(r) && planFit(r); return `<option value="${esc(r.id)}" ${x?.r === r.id ? 'selected' : ''} ${ok ? '' : 'disabled'}>${esc(r.name)}${ok ? '' : ' (excluded)'}</option>`; }).join('')}</select>
      ${x ? planCard(key, x, pend) : ''}`; }).join('')}
    <p class="mute">${Math.round(k)} kcal${+P().kcal ? ' of ' + P().kcal : ''} · ${Math.round(p)} g protein${+P().protein ? ' of ' + P().protein : ''} · ${Math.round(fb)} g fibre${+P().fibre ? ' of ' + P().fibre : ''}</p></div>`; }).join('')}
  ${pend ? `<button onclick="S.mealPlan.slots=S.pending.slots;S.pending=null;save();render()">Apply this plan</button><button class="sec mt" onclick="S.pending=null;save();render()">Discard suggestion</button>` : ''}`;
};
// picking a recipe by hand cooks it that day; the next day's same meal becomes its leftover if empty
function setSlot(key, k, v) {
  const slots = S.pending?.kind === 'meals' ? S.pending.slots : S.mealPlan.slots;
  if (k === 'r' && !v) delete slots[key];
  else if (k === 'r') {
    const r = recipe(v), [d, m] = key.split('|'), nd = DAYS[DAYS.indexOf(d) + 1];
    slots[key] = {r: v, f: planFit(r) || 1, lo: false};
    if (nd && !slots[`${nd}|${m}`]) slots[`${nd}|${m}`] = {r: v, f: slots[key].f, lo: true};
  } else { slots[key] ||= {r: '', f: 1}; slots[key][k] = v; }
  save(); render();
}
function planAdd(key) { // logs 1 serving, only when tapped
  const x = S.mealPlan.slots[key], r = recipe(x?.r); if (!r) return;
  const [d, m] = key.split('|'), f = planF(x), n = planN(r, f), pd = dayOffset(DAYS.indexOf(d), planMon());
  S.meals.push({id: uid(), date: pd >= planMon() && pd <= dayOffset(6, planMon()) ? pd : today(), name: r.name + (x.lo ? ' (leftover)' : ''), portion: `1 serving${f !== 1 ? ` (×${f})` : ''}`,
    kcal: Math.round(n[0]), protein: n1(n[1]), carbs: n1(n[2]), fat: n1(n[3]), fibre: n1(n[4]), slot: m, est: true, savedAt: Date.now()});
  save(); render(); toastMsg('Added to ' + m);
}
async function planAskIdeas() {
  if (planBusy || !confirm('Send your food likes and allergies to Claude?')) return;
  const T = P(), sys = 'You write realistic UK home recipes. Reply with a strict JSON array only, no other text.';
  const ask = `Give 3 recipes (mix of breakfast, lunch, dinner) as a JSON array of {"name","meal":"Breakfast|Lunch|Dinner","servings":2,"perServing":{"kcal","protein","carbs","fat","fibre"},"ingredients":[[name, qty, unit]],"method":[steps]}. Ingredients are for the 2-serving batch. Per-serving kcal: breakfast 250-450, lunch and dinner 500-700. Favour high fibre. Likes: ${T.foodLike || 'none given'}. Avoid: ${T.foodAvoid || 'none'}. Allergies (must exclude): ${T.allergies || 'none'}.`;
  planBusy = true; render();
  try {
    const txt = await claude(sys, [{role: 'user', content: ask}]), arr = JSON.parse(txt.match(/\[[\s\S]*\]/)?.[0] || '[]');
    planIdeas = arr.filter(r => r?.name && PLAN_WIN[r.meal] && r.perServing).map(r => {
      const s = r.perServing, ing = (r.ingredients || []).map(([n, q, u]) => [String(n), n1((+q || 0) / 2), String(u || '')]), txt2 = (r.name + ' ' + ing.map(i => i[0]).join(' ')).toLowerCase();
      return {id: 'u' + uid(), name: String(r.name), meal: r.meal, prep: 30, cost: 0, n: ['kcal', 'protein', 'carbs', 'fat', 'fibre'].map(k => n1(+s[k] || 0)), contains: Object.keys(ALLERGENS).filter(k => ALLERGENS[k].some(a => txt2.includes(a))), ing, method: (r.method || []).map(String), mine: true};
    });
    if (!planIdeas.length) alert("Claude didn't return any usable recipes. Try again.");
  } catch (e) { alert(e.message || "Couldn't get recipe ideas."); }
  planBusy = false; render();
}
function planKeep(i) { const r = planIdeas.splice(i, 1)[0]; (S.myRecipes ||= []).push(r); save(); render(); toastMsg(`Kept ${r.name}`); }
function shoppingList() { // batch = 2 servings at the portion factor; leftover days add nothing
  const out = {};
  for (const x of Object.values(S.mealPlan.slots)) { const r = recipe(x.r); if (!r || x.lo) continue; for (const [n, q, u] of r.ing) { const k = n + '|' + u; out[k] = n1((out[k] || 0) + q * 2 * planF(x)); } }
  return Object.entries(out).sort().map(([k, q]) => { const [n, u] = k.split('|'); return {k, n, q, u}; });
}
screens.Shopping = () => {
  const list = shoppingList(), t = S.mealPlan.ticks;
  return `<h1 class="xl">Food</h1>${seg([['Diary', "go('Food')"], ['Meal Planner', "go('MealPlan')"], ['Groceries', "go('Shopping')"]], 'Groceries')}<h2>Shopping list</h2>
  <div class="card mt">${list.length ? `<p class="mute">Totals for each 2-serving batch. Leftover days add nothing.</p>${list.map(i => `<label class="chk"><input type="checkbox" ${t[i.k] != null ? 'checked' : ''} onchange="tickItem(${js(i.k)},${i.q},this.checked)"> <span style="${t[i.k] != null ? 'text-decoration:line-through;opacity:.6' : ''}">${esc(i.n)} — ${gb(i.q)}${i.u ? ' ' + esc(i.u) : ''}</span>${t[i.k] != null && t[i.k] !== i.q ? `<span class="tag warn">was ${gb(t[i.k])} when ticked</span>` : ''}</label>`).join('')}
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
function logMeal(slot) { mealBack = cur === 'Food' ? 'Food' : 'Today'; S.draft ||= newDraft(); S.draft.slot = slot; S.draft.date = cur === 'Food' ? fDay() : today(); save(); go('Meal'); }

// ---------- Log meal step 1: search, History / Favourites / My foods, quick add ----------
let mealBack = 'Food', mealTab = 'History', mealQ = '', quickAdd = false, srchT;
const slotNow = () => slotOf({savedAt: Date.now()});
const bankKcal = f => Math.round(f[3][0] * f[5] / 100);
let foodToItem = f => ({id: uid(), name: f[1], fam: f[2], per100: f[3], grams: f[5], unitG: f[4], src: 'est', vary: !!f[6], qtyGiven: true, asked: true});
// a food-bank / learned food as a ready-made meal entry at its default grams
const foodAsMeal = (name, per100, g) => { const v = i => (per100[i] || 0) * g / 100; return {name, portion: `${g} g ${name}`, kcal: Math.round(v(0)), protein: n1(v(1)), carbs: n1(v(2)), fat: n1(v(3)), fibre: n1(v(4)), est: true}; };
function addToSlot(m) { // instant log into the open meal, then back where the user came from
  const slot = S.draft?.slot || slotNow(), date = S.draft?.date || today();
  S.meals.push({id: uid(), date, ...pick(m, MEAL_KEYS), slot, savedAt: Date.now()}); S.draft = null; quickAdd = false; mealQ = ''; save(); go(mealBack); toastMsg('Added to ' + slot);
}
function addFoodToDraft(f) { S.draft.items.push(foodToItem(f)); mealQ = ''; save(); render(); }
function addUnknown(q, ai) { const it = parseFood(q) || {id: uid(), name: q, fam: '', per100: null, grams: 100, unitG: 100, src: 'unknown', vary: false, qtyGiven: true}; S.draft.items.push(it); mealQ = ''; save(); render(); if (ai && it.src === 'unknown') lookupUnknown(); }
// tap a row (not +) or its amount pill to open the nutrition sheet; + still adds at the shown amount
const rowH = (name, sub, onclick, info, amt) => `<li class="${info ? 'fi-row' : ''}"${info ? ` onclick="${info}"` : ''}><span>${esc(name)}<br><span class="mute">${esc(sub)}</span></span><span class="fi-acts">${info && amt ? `<button class="fi-amt" onclick="event.stopPropagation();${info}" aria-label="Change amount of ${esc(name)}">${esc(amt)}</button>` : ''}<button class="rnd plus" onclick="event.stopPropagation();${onclick}" aria-label="Add ${esc(name)}">+</button></span></li>`;
function foodHits(q) {
  q = q.toLowerCase().trim(); if (q.length < 2) return [];
  const hit = (...s) => s.flat().some(x => String(x).toLowerCase().includes(q)), seen = new Set(), out = [];
  const push = (name, sub, on, info, amt) => { if (!seen.has(name.toLowerCase())) { seen.add(name.toLowerCase()); out.push(rowH(name, sub, on, info, amt)); } };
  for (const m of recentMeals(200)) if (hit(m.name)) push(m.name, `${gb(m.kcal)} cal · past meal`, `addToSlot(${js(pick(m, MEAL_KEYS))})`, `openFoodInfo('past',${js(pick(m, MEAL_KEYS))})`, '1 serving');
  for (const f of [...(S.foods || []), ...FOODS]) if (hit(f[1], f[0])) push(f[1], `${bankKcal(f)} cal · ${f[5]} g`, `addFoodToDraft(${js(f)})`, `openFoodInfo('bank',${js(f)})`, f[5] + ' g');
  for (const [code, b] of Object.entries(S.barcodes || {})) if (b.per100 && hit(b.name)) { const g = b.serving || b.pack || 100; push(b.name, `${Math.round(b.per100[0] * g / 100)} cal · ${g} g`, `mealQ='';addProduct(${js(code)},${js(b)})`, `openFoodInfo('barcode',${js(code)})`, g + ' g'); }
  return out.slice(0, 30);
}
const searchHTML = q => { const r = foodHits(q); return q.trim().length < 2 ? '' : r.length ? `<div class="card"><ul>${r.join('')}</ul></div>`
  : `<div class="card"><p class="mute">Not found.</p>${aiKey() ? `<button class="sec" onclick="addUnknown(${js(q.trim())},true)">✨ Look it up with Claude</button>` : `<button class="sec" onclick="addUnknown(${js(q.trim())},false)">Add it manually</button>`}</div>`; };
function mealSearch(v) { mealQ = v; clearTimeout(srchT); srchT = setTimeout(() => { const el = document.getElementById('srchRes'); if (el) el.innerHTML = searchHTML(mealQ); }, 150); }
function mealList(slot) {
  if (mealTab === 'Favourites') return S.favs.map(f => rowH(f.name, `${gb(f.kcal)} cal${f.portion ? ', ' + f.portion : ''}`, `addToSlot(${js(pick(f, MEAL_KEYS))})`, `openFoodInfo('past',${js(pick(f, MEAL_KEYS))})`, '1 serving'));
  if (mealTab === 'My Foods') return [...(S.foods || []).map(f => rowH(f[1], `${bankKcal(f)} cal, ${f[5]} g`, `addToSlot(${js(foodAsMeal(f[1], f[3], f[5]))})`, `openFoodInfo('bank',${js(f)})`, f[5] + ' g')),
    ...Object.entries(S.barcodes || {}).filter(([, b]) => b.per100).map(([code, b]) => { const g = b.serving || b.pack || 100; return rowH(b.name, `${Math.round(b.per100[0] * g / 100)} cal, ${g} g`, `addToSlot(${js({...foodAsMeal(b.name, b.per100, g), est: false})})`, `openFoodInfo('barcode',${js(code)})`, g + ' g'); })];
  const r = recentMeals(40); return [...r.filter(m => slotOf(m) === slot), ...r.filter(m => slotOf(m) !== slot)].slice(0, 20).map(m => rowH(m.name, `${gb(m.kcal)} cal${m.portion ? ', ' + m.portion : ''}`, `addToSlot(${js(pick(m, MEAL_KEYS))})`, `openFoodInfo('past',${js(pick(m, MEAL_KEYS))})`, '1 serving'));
}
function quickAddSave(f) {
  const d = form(f), v = k => n1(+d[k] || 0);
  addToSlot({name: d.name.trim() || 'Quick add', portion: '', kcal: Math.round(+d.kcal), protein: v('p'), carbs: v('c'), fat: v('f'), fibre: v('fb'), est: false});
}
function quickAddFor(slot, date) { mealBack = cur === 'Food' ? 'Food' : 'Today'; S.draft = {...newDraft(), slot, date}; quickAdd = true; slotMenu = null; save(); go('Meal'); }
function mealStep1(slot) {
  const rows = mealList(slot);
  return `<input type="search" id="srch" class="mt" placeholder="Search foods, dishes, takeaways…" aria-label="Search foods" value="${esc(mealQ)}" oninput="mealSearch(this.value)" autocomplete="off">
  <div id="srchRes">${searchHTML(mealQ)}</div>
  ${quickAdd ? `<form class="card" onsubmit="event.preventDefault();quickAddSave(this)"><h2>Quick add</h2><input name="kcal" type="number" inputmode="decimal" min="1" placeholder="Calories (required)" required aria-label="Calories">
    <div class="grid2 mt"><input name="p" type="number" inputmode="decimal" step="any" placeholder="Protein g" aria-label="Protein g"><input name="c" type="number" inputmode="decimal" step="any" placeholder="Carbs g" aria-label="Carbs g"><input name="f" type="number" inputmode="decimal" step="any" placeholder="Fat g" aria-label="Fat g"><input name="fb" type="number" inputmode="decimal" step="any" placeholder="Fibre g" aria-label="Fibre g"></div>
    <input name="name" class="mt" placeholder="Name (optional)" aria-label="Name"><div class="grid2 mt"><button>Add to ${esc(slot.toLowerCase())}</button><button type="button" class="sec" onclick="quickAdd=false;render()">Cancel</button></div></form>` : ''}
  <div class="acts4"><button class="sec" onclick="scanBarcode()"><b>▥</b>Barcode scan</button><button class="sec" onclick="S.draft.mode='speak';render();speak()"><b>🎤</b>Voice log</button><button class="sec" onclick="photoIn.click()"><b>📷</b>Meal scan</button><button class="sec" onclick="quickAdd=true;render()"><b>⚡</b>Quick add</button></div>
  <button class="link" onclick="S.draft.mode='type';render();document.getElementById('mealText').focus()">Describe a whole meal instead</button>
  <div class="utabs" role="tablist">${['History', 'Favourites', 'My Foods'].map(t => `<button role="tab" aria-selected="${t === mealTab}" class="${t === mealTab ? 'on' : ''}" onclick="mealTab='${t}';render()">${t}</button>`).join('')}</div>
  ${rows.length ? `<div class="card"><ul>${rows.join('')}</ul></div>` : `<p class="mute center">${mealTab === 'History' ? 'Meals you log show here.' : mealTab === 'Favourites' ? 'Tap ☆ on a logged meal to make it a favourite.' : 'Foods looked up with Claude and scanned barcodes show here.'}</p>`}`;
}

// ---------- nutrition sheet: change amount, see nutrition ----------
// openFoodInfo(kind, payload): 'bank' = FOODS/S.foods row · 'barcode' = barcode number · 'past' = past meal/favourite object · 'meal' = logged entry id (Save changes)
// Foods with per-100 g values use grams; past meals only have totals, so their amount is a servings multiplier (0.5–3).
let fi = null;
const fiMeal = m => ({name: m.name, base: ['kcal', 'protein', 'carbs', 'fat', 'fibre'].map(k => +m[k] || 0)});
function openFoodInfo(kind, p) {
  if (kind === 'bank') fi = {kind, name: p[1], per100: p[3], g: p[5], src: (S.foods || []).some(f => f[1] === p[1]) ? 'Claude estimate' : 'Food bank', f: p};
  else if (kind === 'barcode') { const b = S.barcodes?.[p]; if (!b) return; fi = {kind, name: b.name, per100: b.per100, g: b.serving || b.pack || 100, src: 'Barcode', code: p, sugar: b.sugar100, salt: b.salt100}; }
  else if (kind === 'past') fi = {kind, ...fiMeal(p), k: 1, src: p.est === false ? 'Typed' : 'Past meal', m: p};
  else if (kind === 'meal') {
    const e = S.meals.find(x => x.id == p); if (!e) return;
    fi = e.per100 && e.grams ? {kind, name: e.name, per100: e.per100, g: e.grams, src: e.fiSrc || 'Logged', id: e.id} : {kind, ...fiMeal(e), k: 1, src: e.est ? 'Estimate' : 'Typed', id: e.id};
  } else return;
  fi.g0 = fi.g; fi.back = cur === 'FoodInfo' ? fi.back : cur; go('FoodInfo');
}
const fiVals = () => fi.per100 ? [0, 1, 2, 3, 4].map(i => (+fi.per100[i] || 0) * fi.g / 100) : fi.base.map(v => v * fi.k);
const fiSlot = () => S.draft?.slot || slotNow();
function fiValsHTML() {
  const [k, p, c, f, fb] = fiVals(), x = fi.per100 ? fi.g / 100 : 0;
  return `<div class="fi-kcal"><span class="big">${Math.round(k)}</span> kcal</div>
    <div class="fi-grid"><div><b>${n1(p)} g</b><span>Protein</span></div><div><b>${n1(c)} g</b><span>Carbs</span></div><div><b>${n1(f)} g</b><span>Fat</span></div><div><b>${n1(fb)} g</b><span>Fibre</span></div>
    ${fi.sugar != null ? `<div><b>${n1(fi.sugar * x)} g</b><span>Sugar</span></div>` : ''}${fi.salt != null ? `<div><b>${n1(fi.salt * x)} g</b><span>Salt</span></div>` : ''}</div>`;
}
function fiSet(v) { // live update without re-rendering the input
  if (fi.per100) fi.g = Math.max(0, Math.round(+v || 0)); else fi.k = Math.min(3, Math.max(.5, +v || 1));
  const el = document.getElementById('fiVals'); if (el) el.innerHTML = fiValsHTML();
}
function fiChip(m) { if (fi.per100) fi.g = Math.round(fi.g0 * m); else fi.k = m; render(); }
screens.FoodInfo = () => {
  if (!fi) return `<h1>Food</h1><div class="card"><p class="mute">Nothing selected.</p><button onclick="go('Food')">Back</button></div>`;
  const pg = !!fi.per100;
  return `<div class="mhead"><button class="rnd" onclick="go(fi.back||'Food')" aria-label="Back">‹</button><b class="ttl">Nutrition</b><span></span></div>
  <div class="card fi-sheet"><h2>${esc(fi.name)}</h2><span class="tag">${esc(fi.src)}</span>
    <label for="fiAmt">${pg ? 'Amount (g)' : 'Servings'}</label>
    <div class="row" style="align-items:center"><input id="fiAmt" type="number" inputmode="decimal" ${pg ? 'min="0" step="1"' : 'min="0.5" max="3" step="0.5"'} value="${pg ? fi.g : fi.k}" oninput="fiSet(this.value)"><span class="mute" style="flex:0 0 auto">${pg ? 'g' : '× serving'}</span></div>
    <div class="chips">${(pg ? [['½', .5], ['1', 1], ['×2', 2], ['×3', 3]] : [['½', .5], ['1', 1], ['1½', 1.5], ['×2', 2], ['×3', 3]]).map(([l, m]) => `<button class="chip${(pg ? fi.g === Math.round(fi.g0 * m) : fi.k === m) ? ' on' : ''}" onclick="fiChip(${m})">${l}</button>`).join('')}</div>
    <div id="fiVals">${fiValsHTML()}</div>
    ${pg ? `<p class="mute">Per 100 g: ${Math.round(fi.per100[0])} kcal · P ${n1(fi.per100[1])} · C ${n1(fi.per100[2])} · F ${n1(fi.per100[3])} · Fibre ${n1(fi.per100[4] || 0)} g${fi.sugar != null ? ` · Sugar ${n1(fi.sugar)}` : ''}${fi.salt != null ? ` · Salt ${n1(fi.salt)}` : ''}</p>` : '<p class="mute">Past meals only store totals, so the amount is a multiple of what you logged.</p>'}
    ${fi.kind === 'meal' ? '<button class="mt" onclick="fiSave()">Save changes</button>' : `<button class="mt" onclick="fiAdd()">Add to ${esc(fiSlot().toLowerCase())}</button>`}
    <button class="sec mt" onclick="fiFav()">☆ Favourite</button></div>`;
};
function fiEntry() { // the sheet's food at the chosen amount, as a meal entry
  const [k, p, c, f, fb] = fiVals(), pg = !!fi.per100;
  return {name: fi.name, portion: pg ? `${fi.g} g ${fi.name}` : fi.k === 1 ? (fi.m?.portion || '') : `${fi.k} × ${fi.m?.portion || 'serving'}`, kcal: Math.round(k), protein: n1(p), carbs: n1(c), fat: n1(f), fibre: n1(fb), est: fi.src !== 'Barcode' && fi.src !== 'Typed'};
}
function fiAdd() {
  if (S.draft && fi.per100 && (fi.kind === 'bank' || fi.kind === 'barcode')) { // keep building the open meal, as + does
    const it = fi.kind === 'bank' ? {...foodToItem(fi.f), grams: fi.g} : {id: uid(), name: fi.name, fam: '', per100: fi.per100, grams: fi.g, unitG: fi.g, src: 'packet', vary: false, qtyGiven: true, asked: true, barcode: fi.code};
    S.draft.items.push(it); mealQ = ''; save(); return go('Meal');
  }
  const slot = fiSlot(), date = S.draft?.date || (fi.back === 'Food' ? fDay() : today()), back = fi.back === 'Meal' ? mealBack : fi.back || 'Food';
  S.meals.push({id: uid(), date, ...fiEntry(), slot, ...(fi.per100 ? {per100: fi.per100, grams: fi.g, fiSrc: fi.src} : {}), savedAt: Date.now()});
  if (S.draft && !S.draft.items.length) S.draft = null;
  quickAdd = false; mealQ = ''; save(); go(back); toastMsg('Added to ' + slot);
}
function fiSave() { // scales the logged entry; draft items scale with it
  const e = S.meals.find(x => x.id == fi.id); if (!e) return;
  const r = fi.per100 ? (e.grams ? fi.g / e.grams : 1) : fi.k;
  if (e.items) e.items.forEach(x => x.grams = Math.round(x.grams * r));
  Object.assign(e, fiEntry(), {name: e.name, est: e.est, ...(fi.per100 ? {grams: fi.g} : {})});
  if (!fi.per100 && e.items) e.portion = e.items.map(x => `${x.grams} g ${x.name}`).join(', ');
  save(); go(fi.back || 'Food'); toastMsg('Saved');
}
function fiFav() { const m = fiEntry(); if (S.favs.some(f => f.name === m.name && f.kcal === m.kcal)) return alert('Already a favourite.'); S.favs.push({id: uid(), date: today(), ...m}); save(); toastMsg('Added to favourites'); }
TAB_OF.FoodInfo = 'Food';
const fiQuickFood = () => { const r = recentMeals(); return `<div class="card"><div class="sec-h"><h2>Quick add</h2><button class="link" style="width:auto" onclick="copyYesterday()">Copy yesterday</button></div>
  ${r.length ? `<ul>${r.map(m => rowH(m.name, `${gb(m.kcal)} kcal`, `repeatMeal(${js(pick(m, MEAL_KEYS))})`, `openFoodInfo('past',${js(pick(m, MEAL_KEYS))})`, '1 serving')).join('')}</ul>` : '<p class="mute">Meals you log show here for one-tap adding.</p>'}</div>`; };

// Past day: what else happened, alongside the editable meals
function dayRecap(d) {
  const sets = S.workouts.filter(w => w.date === d), ex = [...new Set(sets.map(w => w.exercise))], wt = S.weights.filter(w => w.date === d).at(-1), water = dayTotals(d).water, st = stepsOn(d);
  return `<div class="card"><b>${ukDate(d)}${dayDone(d) ? ' ✓' : ''}</b><ul>
    <li><span>Workout</span><span class="mute">${sets.length ? `${ex.length} exercise${ex.length === 1 ? '' : 's'}, ${sets.length} sets` : 'none'}</span></li>
    <li><span>Water</span><span class="mute">${water ? water + ' ml' : 'not logged'}</span></li>
    <li><span>Weight</span><span class="mute">${wt ? esc(wt.kg) + ' kg' : '–'}</span></li>
    <li><span>Steps</span><span class="mute">${st == null ? 'not logged' : st.toLocaleString('en-GB')}</span></li></ul>
    <p class="mute">Edit meals below. ${dayDone(d) ? '' : `<button class="link" style="width:auto" onclick="completeDay('${d}')">Mark this day complete</button>`}</p></div>`;
}
