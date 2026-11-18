// ===== Smart meals: restaurant builders (main + sides) that remember your usual order, and portion learning =====
// Everything learned stays on this device in S.habits: {grams: {food: g}, count: {food: n}, orders: {restaurant: {main, sides, size}}}.
FOODS.push(
  [['naan', 'naan bread', 'garlic naan'], 'Naan bread', 'bread', [290, 9, 50, 6, 2], 130, 130],
  [['poppadom', 'poppadoms'], 'Poppadom', 'crisps', [500, 18, 40, 30, 8], 12, 24],
  [['onion bhaji', 'bhaji'], 'Onion bhaji', 'fried', [270, 6, 25, 16, 4], 60, 120],
  [['tikka masala', 'chicken tikka masala'], 'Chicken tikka masala', 'curry', [160, 13, 6, 9, 1], 350, 350, true],
  [['korma', 'chicken korma'], 'Chicken korma', 'curry', [190, 12, 7, 13, 1], 350, 350, true],
  [['madras', 'jalfrezi', 'balti', 'bhuna'], 'Chicken curry (madras/jalfrezi)', 'curry', [140, 13, 6, 7, 1.5], 350, 350, true],
  [['pilau rice', 'pilau'], 'Pilau rice', 'rice', [175, 3.5, 30, 4.5, 0.8], 250, 250, true],
  [['saag aloo'], 'Saag aloo', 'veg', [110, 2.5, 12, 6, 3], 200, 200],
  [['nandos mash', 'creamy mash', 'mash', 'mashed potato'], 'Mashed potato', 'potato', [115, 2, 15, 5, 1.5], 200, 200],
  [['salt and pepper chips', 'salt_and_pepper chips'], 'Salt and pepper chips', 'chips', [250, 3.5, 30, 13, 3], 250, 250, true],
  [['crispy chilli beef', 'chilli beef'], 'Crispy chilli beef', 'chinese', [300, 12, 30, 15, 1], 300, 300, true],
  [['prawn crackers'], 'Prawn crackers', 'crisps', [540, 1, 60, 32, 1], 25, 25],
  [['white rice', 'boiled rice', 'plain rice'], 'Rice (cooked)', 'rice', [130, 2.7, 28, .3, .4], 200, 200, true],
);
FOODS.push(
  [['chicken chorizo', 'chorizo', 'chicken sausage', 'nandos sausage'], "Nando's chicken chorizo (starter)", '', [243, 18, 5, 17, 0.5], 140, 140],
  [['halloumi sticks', 'halloumi sticks peri honey', 'halloumi and honey'], 'Halloumi sticks & PERi-honey', '', [310, 15, 15, 21, 0.5], 170, 170],
  [['halloumi sticks chilli jam', 'halloumi and chilli jam'], 'Halloumi sticks & chilli jam', '', [286, 15, 14, 19, 0.5], 160, 160],
  [['houmous', 'hummus', 'houmous with peri peri drizzle'], 'Houmous with PERi-PERi drizzle & pitta', '', [283, 8, 30, 14, 5], 280, 280],
  [['cheesy garlic pitta', 'garlic pitta'], 'Cheesy garlic pitta', '', [298, 11, 35, 12, 2.5], 200, 200],
  [['olives', 'spicy mixed olives'], 'Spicy mixed olives', '', [153, 1, 2, 15, 3], 90, 90],
  [['peri peri nuts', 'peri-peri nuts', 'nuts'], 'PERi-PERi nuts', '', [610, 22, 15, 50, 7], 130, 130],
  [['dare to share', 'sharing platter'], 'Dare to Share platter', '', [217, 9, 22, 10, 3], 300, 300],
);
for (const f of FOODS.slice(-21)) for (const k of f[0]) KW.push([k, f]);
KW.sort((a, b) => b[0].length - a[0].length);

const MENUS = {
  "Nando's": {keys: ['nandos', "nando's", 'nando'], sizes: null,
    starters: ["Nando's chicken chorizo (starter)", 'Halloumi sticks & PERi-honey', 'Halloumi sticks & chilli jam', 'Houmous with PERi-PERi drizzle & pitta', 'Cheesy garlic pitta', 'Spicy mixed olives', 'PERi-PERi nuts', 'Dare to Share platter'],
    mains: ['Peri-peri chicken (on the bone)', 'Chicken butterfly', 'Chicken thighs (grilled)', 'Chicken wrap', 'Chicken wings'],
    sides: ['Peri-salted chips', 'Spicy rice', 'Macho peas', 'Corn on the cob', 'Coleslaw', 'Mashed potato', 'Garlic bread', 'Sweet potato wedges', 'Halloumi']},
  'Wagamama': {keys: ['wagamama', 'wagas'], sizes: null,
    mains: ['Chicken katsu curry', 'Yaki soba', 'Ramen', 'Pad thai', 'Chicken teriyaki (with rice)', 'Firecracker chicken (with rice)', 'Donburi (rice bowl)'],
    sides: ['Gyoza', 'Edamame', 'Bao bun', 'Fried rice']},
  'Caribbean takeaway': {keys: ['caribbean', 'jamaican', 'carribean', 'takeaway box'], sizes: {Small: 0.8, Regular: 1, Large: 1.3},
    mains: ['Jerk chicken', 'Curry goat', 'Oxtail stew', 'Brown stew chicken', 'Curry chicken', 'Fried chicken', 'Escovitch / fried fish', 'Jerk pork'],
    sides: ['Rice and peas', 'Rice (cooked)', 'Fried plantain', 'Coleslaw', 'Macaroni pie / mac and cheese', 'Fried dumpling', 'Festival', 'Salad']},
  'Chinese takeaway': {keys: ['chinese'], sizes: {Small: 0.8, Regular: 1, Large: 1.3},
    mains: ['Sweet and sour chicken', 'Crispy chilli beef', 'Chow mein', 'Chicken curry (madras/jalfrezi)'],
    sides: ['Fried rice', 'Rice (cooked)', 'Salt and pepper chips', 'Spring roll', 'Prawn crackers', 'Chips']},
  'Indian takeaway': {keys: ['indian', 'curry house'], sizes: null,
    mains: ['Chicken tikka masala', 'Chicken korma', 'Chicken curry (madras/jalfrezi)', 'Curry goat'],
    sides: ['Pilau rice', 'Rice (cooked)', 'Naan bread', 'Poppadom', 'Onion bhaji', 'Saag aloo']},
  "McDonald's": {keys: ['mcdonalds', "mcdonald's", 'maccies', 'mcds'], sizes: null, mains: ['Big Mac', 'Cheeseburger', 'Chicken burger', 'Chicken nuggets'], sides: ['Fries (fast food)', 'Cola', 'Diet cola', 'Milkshake']},
  'KFC': {keys: ['kfc'], sizes: null, mains: ['Fried chicken', 'Chicken burger', 'Chicken wings'], sides: ['Fries (fast food)', 'Coleslaw', 'Cola']},
  'Burger King': {keys: ['burger king', 'bk'], sizes: null, mains: ['Burger (beef, in bun)', 'Chicken burger', 'Chicken nuggets'], sides: ['Fries (fast food)', 'Onion rings', 'Cola']},
  'Five Guys': {keys: ['five guys'], sizes: null, mains: ['Burger (beef, in bun)', 'Cheeseburger', 'Hot dog'], sides: ['Fries (fast food)', 'Milkshake', 'Cola']},
  'Greggs': {keys: ['greggs'], sizes: null, mains: ['Sausage roll', 'Steak bake', 'Sandwich (typical)'], sides: ['Doughnut', 'Cookie', 'Coffee']},
  'Subway': {keys: ['subway'], sizes: null, mains: ['Sub sandwich'], sides: ['Cookie', 'Crisps', 'Cola']},
  'Pizza Express': {keys: ['pizza express'], sizes: null, mains: ['Margherita pizza', 'Pepperoni pizza', 'Calzone', 'Garlic bread'], sides: ['Salad', 'Tiramisu']},
  "Domino's": {keys: ['dominos', "domino's"], sizes: null, mains: ['Margherita pizza', 'Pepperoni pizza'], sides: ['Garlic bread', 'Chicken wings', 'Cola']},
  'Pizza Hut': {keys: ['pizza hut'], sizes: null, mains: ['Margherita pizza', 'Pepperoni pizza'], sides: ['Garlic bread', 'Chicken wings', 'Salad']},
  'Pret': {keys: ['pret', 'pret a manger'], sizes: null, mains: ['Sandwich (typical)', 'Tortilla wrap', 'Soup'], sides: ['Croissant', 'Coffee', 'Cookie']},
  'Leon': {keys: ['leon'], sizes: null, mains: ['Chicken wrap', 'Curry (typical)'], sides: ['Fries (fast food)', 'Salad']},
  'Itsu / Wasabi': {keys: ['itsu', 'wasabi'], sizes: null, mains: ['Sushi (rolls)', 'Donburi (rice bowl)', 'Gyoza'], sides: ['Edamame', 'Miso soup']},
  'German Doner Kebab': {keys: ['german doner', 'gdk', 'kebab shop'], sizes: null, mains: ['Doner kebab (meat)', 'Shish kebab', 'Chicken shawarma'], sides: ['Fries (fast food)', 'Cola']},
  'Wingstop': {keys: ['wingstop'], sizes: null, mains: ['Chicken wings'], sides: ['Fries (fast food)', 'Coleslaw', 'Cola']},
  'Popeyes': {keys: ['popeyes'], sizes: null, mains: ['Fried chicken', 'Chicken burger'], sides: ['Fries (fast food)', 'Coleslaw', 'Cola']},
  'Costa / Starbucks': {keys: ['costa', 'starbucks', 'caffe nero'], sizes: null, mains: ['Croissant', 'Sandwich (typical)'], sides: ['Coffee', 'Milk (semi-skimmed)', 'Cookie']},
  'Toby Carvery': {keys: ['toby', 'carvery'], sizes: null, mains: ['Beef mince', 'Chicken breast'], sides: ['Potato', 'Vegetables', 'Sauce']},
  'Fast food': {keys: ['fast food'], sizes: null,
    mains: ['Big Mac', 'Cheeseburger', 'Chicken burger', 'Burger (beef, in bun)', 'Chicken nuggets', 'Fried chicken'],
    sides: ['Fries (fast food)', 'Onion rings', 'Cola', 'Diet cola', 'Milkshake']},
};
const bankFood = name => FOODS.find(f => f[1] === name);
const restaurantOf = q => { q = String(q).toLowerCase(); return Object.keys(MENUS).find(r => MENUS[r].keys.some(k => q.includes(k))); };

// ---------- learning ----------
const habits = () => (S.habits ||= {grams: {}, count: {}, orders: {}});
function learnItems(items) {
  const h = habits();
  for (const it of items) if (it?.name && it.per100) { h.grams[it.name] = it.grams; h.count[it.name] = (h.count[it.name] || 0) + 1; }
}
// typed foods without an amount use your usual portion
const _parseFood = parseFood;
parseFood = function (txt) { const f = _parseFood(txt); const g = f && !f.qtyGiven && S.habits?.grams?.[f.name]; if (g) { f.grams = g; f.qtyGiven = true; f.asked = true; } return f; };
const _foodToItem = foodToItem;
foodToItem = function (f) { const it = _foodToItem(f), g = S.habits?.grams?.[it.name]; if (g) it.grams = g; return it; };
// remember what was saved
const _confirmMeal = confirmMeal;
confirmMeal = function () { const items = S.draft?.items.slice(), n = S.meals.length; _confirmMeal(); if (items && S.meals.length > n) { learnItems(items); save(); } };
// search: restaurant builder first, then your most-eaten foods first
const _foodHits = foodHits;
foodHits = function (q) {
  const r = restaurantOf(q), out = _foodHits(q), c = S.habits?.count || {}, nameOf = h => (h.match(/<span>([^<]*)<br>/) || [])[1] || '';
  out.sort((a, b) => (c[nameOf(b)] || 0) - (c[nameOf(a)] || 0));
  return r ? [`<li class="bld"><span>🍽 <b>Build a ${esc(r)} meal</b><br><span class="mute">${S.habits?.orders?.[r] ? 'Your usual is filled in' : 'Pick a main and sides'}</span></span><button class="rnd plus" onclick="openBuilder(${js(r)})" aria-label="Build a ${esc(r)} meal">+</button></li>`, ...out] : out;
};

// ---------- builder ----------
let bld = null;
function openBuilder(rest) {
  const last = S.habits?.orders?.[rest], m = MENUS[rest];
  bld = last ? {rest, main: last.main, sides: [...last.sides], starters: [...(last.starters || [])], size: last.size || 'Regular'} : {rest, main: m.mains[0], sides: m.sides.slice(0, 1), starters: [], size: 'Regular'};
  mealQ = ''; go('Builder');
}
const bldKcal = () => { const m = MENUS[bld.rest], k = m.sizes?.[bld.size] || 1; return [...bld.starters, bld.main, ...bld.sides].map(bankFood).filter(Boolean).reduce((t, f) => t + f[3][0] * (S.habits?.grams?.[f[1]] || f[5]) * k / 100, 0); };
function bldToggleStarter(s) { bld.starters = bld.starters.includes(s) ? bld.starters.filter(x => x !== s) : [...bld.starters, s]; render(); }
function bldToggleSide(s) { bld.sides = bld.sides.includes(s) ? bld.sides.filter(x => x !== s) : [...bld.sides, s]; render(); }
function bldAdd() {
  const m = MENUS[bld.rest], k = m.sizes?.[bld.size] || 1;
  S.draft ||= newDraft();
  for (const name of [...bld.starters, bld.main, ...bld.sides]) { const f = bankFood(name); if (!f) continue; const it = foodToItem(f); it.grams = Math.round((S.habits?.grams?.[name] || f[5]) * k); it.qtyGiven = it.asked = true; S.draft.items.push(it); }
  S.draft.name ||= bld.rest;
  habits().orders[bld.rest] = {main: bld.main, sides: [...bld.sides], starters: [...bld.starters], size: bld.size};
  bld = null; save(); go('Meal');
}
screens.Builder = () => {
  if (!bld) return `<p>Nothing to build.</p><button onclick="go('Meal')">Back</button>`;
  const m = MENUS[bld.rest], chip = (txt, on, act) => `<button class="chip ${on ? 'on' : ''}" onclick="${act}">${esc(txt)}</button>`;
  return `<div class="sec-h"><h1>${esc(bld.rest)}</h1><button class="link" style="width:auto" onclick="bld=null;go('Meal')">Cancel</button></div>
  ${m.starters ? `<div class="card"><b>Starter</b> <span class="mute">optional</span><div class="chips">${m.starters.map(x => chip(x.replace(/ \(starter\)| & pitta/, ''), bld.starters.includes(x), `bldToggleStarter(${js(x)})`)).join('')}</div></div>` : ''}
  <div class="card"><b>Main</b><div class="chips">${m.mains.map(x => chip(x.replace(/ \(.*\)/, ''), bld.main === x, `bld.main=${js(x)};render()`)).join('')}</div></div>
  <div class="card"><b>Sides</b> <span class="mute">${bld.sides.length} picked</span><div class="chips">${m.sides.map(x => chip(x.replace(/ \/.*| \(.*\)/, ''), bld.sides.includes(x), `bldToggleSide(${js(x)})`)).join('')}</div></div>
  ${m.sizes ? `<div class="card"><b>Size</b><div class="chips">${Object.keys(m.sizes).map(s => chip(s, bld.size === s, `bld.size=${js(s)};render()`)).join('')}</div></div>` : ''}
  <div class="card"><div class="sec-h"><span><span class="big">${gb(Math.round(bldKcal()))}</span> kcal <span class="tag">estimate</span></span></div>
    <p class="mute">Uses typical ${esc(bld.rest)} portions${Object.keys(S.habits?.grams || {}).length ? ' and your usual amounts' : ''}. You can adjust grams on the next screen.</p>
    <button onclick="bldAdd()">Add to ${esc((S.draft?.slot || slotNow()).toLowerCase())}</button></div>`;
};
TAB_OF.Builder = 'Food';
// typing "nandos" / "caribbean" in the describe box opens the builder too
const _applyMealText = applyMealText;
applyMealText = function () { const t = document.getElementById('mealText')?.value || '', r = restaurantOf(t); if (r && !S.draft.photos.length && t.trim().split(/\s+/).length <= 3) { S.draft.text = ''; return openBuilder(r); } return _applyMealText(); };

// ---------- monthly menu refresh (runs inside the app, on your phone) ----------
// Once a month, if you've allowed it, Claude searches the web for new or changed UK menu items at the chains above
// and adds them to your food bank and the meal builders. About 20–40p a month (web searches).
const MENU_DAYS = 30;
function applyMenuUpdates() {
  for (const it of S.menuUpdates?.items || []) {
    const f = [[it.name.toLowerCase(), it.short?.toLowerCase()].filter(Boolean), it.name, '', it.per100, it.grams, it.grams, true];
    if (!FOODS.some(x => x[1] === it.name)) { FOODS.push(f); for (const k of f[0]) KW.push([k, f]); }
    const m = MENUS[it.rest]; if (m && !m.mains.includes(it.name) && !m.sides.includes(it.name) && !(m.starters || []).includes(it.name)) (it.kind === 'main' ? m.mains : it.kind === 'starter' ? (m.starters ||= []) : m.sides).push(it.name);
  }
  KW.sort((a, b) => b[0].length - a[0].length);
}
let menuBusy = false;
async function checkMenus(force = false) {
  if (menuBusy || !aiKey() || !S.settings.menuUpdates) return;
  const last = S.menuUpdates?.date; if (!force && last && daysBetween(last, today()) < MENU_DAYS) return;
  menuBusy = true;
  try {
    const known = Object.entries(MENUS).map(([r, m]) => `${r}: ${[...(m.starters || []), ...m.mains, ...m.sides].join(', ')}`).join('\n');
    const res = await fetch('https://api.anthropic.com/v1/messages', {method: 'POST', headers: {'content-type': 'application/json', 'x-api-key': aiKey(), 'anthropic-version': '2026-10-21', 'anthropic-dangerous-direct-browser-access': 'true'},
      body: JSON.stringify({model: 'claude-sonnet-5-5', max_tokens: 8000, output_config: {effort: 'low'}, tools: [{type: 'web_search_20260209', name: 'web_search', max_uses: 6, user_location: {type: 'approximate', country: 'GB'}}],
        messages: [{role: 'user', content: `Search the web for current UK menu items at these chains. For each chain list its NEW items (last 3 months) and, where fewer than 6 items are listed below, its 8 most popular items: ${Object.keys(MENUS).join(', ')}. Ignore items already listed here:\n${known}\n\nReply with only lines in this exact format, no other text (reply NONE if nothing new):\nRestaurant | item name | starter/main/side | portion grams | kcal for that portion | protein g | carbs g | fat g | fibre g\nRestaurant must be exactly one of: ${Object.keys(MENUS).join(', ')}. Use the chain's published calories where available.`}]})});
    const j = await res.json(); if (!res.ok) throw new Error(j.error?.message || res.status);
    const text = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n'), items = [];
    for (const line of text.split('\n')) { const x = line.split('|').map(v => v.trim()); if (x.length < 9 || !MENUS[x[0]]) continue;
      const g = parseFloat(x[3]) || 100, per = i => n1((parseFloat(x[i]) || 0) / g * 100);
      if (parseFloat(x[4]) > 0) items.push({rest: x[0], name: `${x[0] === "Nando's" ? "Nando's " : ''}${x[1]}`.replace(/^Nando's Nando's/, "Nando's"), short: x[1], kind: x[2].toLowerCase(), grams: Math.round(g), per100: [per(4), per(5), per(6), per(7), per(8)]}); }
    const prev = S.menuUpdates?.items || [], fresh = items.filter(i => !prev.some(p => p.name === i.name));
    S.menuUpdates = {date: today(), items: [...prev, ...fresh]}; save(); applyMenuUpdates();
    if (fresh.length) toastMsg(`Menu update: ${fresh.length} new item${fresh.length === 1 ? '' : 's'} added (${[...new Set(fresh.map(i => i.rest))].join(', ')}).`);
    else if (force) toastMsg('Menus checked: nothing new this month.');
  } catch (e) { if (force) alert("Couldn't check menus: " + e.message); }
  menuBusy = false;
}
applyMenuUpdates();
setTimeout(() => checkMenus(), 4000); // a few seconds after opening, at most once a month
