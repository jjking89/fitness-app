// ===== Today, Progress (weight & body composition), Health (logs + private records), weekly review =====
const londonNow = () => { const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/London', weekday: 'short', hour: 'numeric', hourCycle: 'h23'}).formatToParts(new Date()).map(x => [x.type, x.value])); return {day: p.weekday, hour: +p.hour}; };
const stepsOn = d => { const s = S.steps.filter(x => x.date === d).at(-1); return s ? +s.steps : null; };
function setSteps(date, steps) { S.steps = S.steps.filter(x => x.date !== date); S.steps.push({id: uid(), date, steps}); save(); render(); }
function sleepHours(bed, wake) { const [bh, bm] = bed.split(':').map(Number), [wh, wm] = wake.split(':').map(Number); let m = wh * 60 + wm - (bh * 60 + bm); if (m <= 0) m += 1440; return Math.round(m / 6) / 10; }
const fmtHours = h => h ? `${Math.floor(h)} h ${String(Math.round(h % 1 * 60)).padStart(2, '0')} min` : '–';
function logSleep(f) { const d = form(f); S.sleep.push({id: uid(), date: d.date, bed: d.bed, wake: d.wake, hours: sleepHours(d.bed, d.wake), note: d.note}); save(); render(); }
const reviewDue = () => { const n = londonNow(); return n.day === 'Sun' && n.hour >= 9 && !S.reviews.some(r => r.date === today()); };

// ---------- Today ----------
const LOG_LISTS = ['meals', 'water', 'workouts', 'weights', 'steps', 'sleep'];
function weekStrip() { // Sunday-first current week; tick = diary completed, dot = logged but not completed
  const logged = new Set(LOG_LISTS.flatMap(k => S[k].map(x => x.date))), t = today(), start = dayOffset(-new Date(t + 'T12:00').getDay());
  return `<div class="wk">${[...Array(7)].map((_, i) => { const d = dayOffset(i, start), on = dayDone(d), part = !on && logged.has(d);
    return `<div class="${d === t ? 'now' : ''}" aria-label="${ukDate(d)}${on ? ', completed' : part ? ', partly logged' : ''}"><span>${'SMTWTFS'[i]}</span><i class="${on ? 'on' : part ? 'part' : ''}">${on ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12l4 4 8-8"/></svg>' : ''}</i></div>`; }).join('')}</div>`;
}
const MEAL_SLOTS = [['Breakfast', 'sun'], ['Lunch', 'bowl'], ['Dinner', 'moon'], ['Snacks', 'apple']];
const slotOf = m => { if (m.slot) return m.slot; if (!m.savedAt) return 'Snacks'; const h = new Date(m.savedAt).getHours(); return h < 11 ? 'Breakfast' : h < 16 ? 'Lunch' : h < 21 ? 'Dinner' : 'Snacks'; }; // display-only grouping
function mealSlotCard([slot, icon], list, detail = false) {
  const k = sum(list, 'kcal'), c = sum(list, 'carbs') * 4, f = sum(list, 'fat') * 9, p = sum(list, 'protein') * 4, e = c + f + p, pc = v => e ? Math.round(v / e * 100) : 0;
  const first = list[0], n = first ? (first.items?.length > 1 ? first.items.length : list.length) : 0, label = first ? (first.items?.[0]?.name || first.name) : '';
  return `<div class="card meal"><span class="mic">${ic(IC[icon])}</span><div class="mb"><b>${slot}</b><div class="mute">${first ? esc(label) + (n > 1 ? ` and ${n - 1} more` : '') : 'Nothing logged'}</div>
    ${first ? `<div class="mute">${gb(k)} kcal · C ${pc(c)}% · F ${pc(f)}% · P ${pc(p)}%</div>` : ''}</div><button class="pill" onclick="logMeal('${slot}')" aria-label="Log ${slot}">${detail && first ? '+ Add' : 'Log'}</button>
    ${detail && first ? `<ul class="entries">${list.map(m => `<li><span>${m.photo ? `<img class="thumb" src="${m.photo}" alt=""> ` : ''}${esc(m.name)}${m.est ? ' <span class="tag">estimate</span>' : ''}<br><span class="mute">${gb(m.kcal)} kcal · P ${gb(m.protein)} · C ${gb(m.carbs)} · F ${gb(m.fat)} g</span></span>
      <span style="white-space:nowrap"><button onclick="favMeal(${m.id})" aria-label="Add to favourites">☆</button><button onclick="editEntry('meals',${m.id})" aria-label="Edit">Edit</button><button onclick="del('meals',${m.id})" aria-label="Delete">✕</button></span></li>`).join('')}</ul>` : ''}</div>`;
}
const mbar = (have, t, col) => `<div class="bar sm"><div style="width:${+t ? Math.min(100, have / t * 100) : 0}%;background:${col}"></div></div>`;
function macroCard(t) { // display only; fibre shows '–' until totals/targets carry it
  return `<div class="card m3">${[['Carbs', t.carbs, P().carbs, 'var(--c-carb)'], ['Fat', t.fat, P().fat, 'var(--c-fat)'], ['Protein', t.protein, P().protein, 'var(--c-pro)'], ['Fibre', t.fibre, P().fibre, 'var(--c-fib)', true]].map(([l, h, tg, col, opt]) =>
    `<div><div class="mute">${l}</div>${opt && (h == null || !+tg) ? '<div><b>–</b></div>' : `<div><b>${gb(h)}</b> g${+tg ? ` / ${gb(tg)}` : ''}</div>${mbar(h, tg, col)}`}</div>`).join('')}</div>`;
}
screens.Today = () => {
  const t = dayTotals(), kt = +P().kcal, meals = S.meals.filter(m => m.date === today());
  return `<div class="sec-h"><h1 class="xl">Today</h1><button class="link" style="width:auto" onclick="go('Settings')" aria-label="Settings">⚙️ Settings</button></div>${weekStrip()}
  ${!P().done ? `<div class="card"><h2>Set up your profile</h2><p class="mute">${S.iv ? `Question ${S.iv + 1} of ${QUESTIONS.length}` : 'One question at a time. Skip or say not sure to anything.'}</p><button onclick="go('Interview')">${S.iv ? 'Continue' : 'Start'}</button></div>` : ''}
  ${coachCard()}${S.reviews.at(-1)?.auto && S.reviews.at(-1).date === today() ? `<div class="note"><b>Your weekly review is ready.</b> <button class="mt" onclick="revId=S.reviews.at(-1).id;go('Review')">Open weekly review</button></div>` : ''}
  <div class="pills">
    <button class="pill" onclick="go('Coach')">💬 Ask coach</button></div>
  ${S.draft ? `<button class="sec mt" onclick="go('Meal')">Continue meal draft (${S.draft.items.length})</button>` : ''}
  <div class="card mt"><div class="cal-h"><b>Calories</b><span class="mute">${kt ? (t.kcal <= kt ? gb(kt - t.kcal) + ' left' : gb(t.kcal - kt) + ' over') : 'no target'}</span></div>
    <div class="cal"><span class="big">${gb(t.kcal)}</span> cal${kt ? ` / ${gb(kt)}` : ''}</div>${kt ? mbar(t.kcal, kt, t.kcal > kt ? 'var(--warn)' : 'var(--acc)') : ''}</div>
  ${macroCard(t)}
  <div class="card">${macroRow('Water', t.water, P().waterGoal, 'ml')}<div class="grid2 mt"><button class="sec" onclick="add('water',{ml:250})">+250 ml</button><button class="sec" onclick="add('water',{ml:500})">+500 ml</button></div>${completeBtn()}</div>
  <div class="sec-h"><h2>Diary</h2><button class="link" onclick="go('Food')">View all</button></div>
  ${MEAL_SLOTS.map(sl => mealSlotCard(sl, meals.filter(m => slotOf(m) === sl[0]))).join('')}
`;
};

// ---------- Progress ----------
const METRICS = [['weight', 'Weight', 'kg', false], ['fatMass', 'Body fat mass', 'kg', true], ['fatPct', 'Body fat', '%', true], ['lean', 'Lean mass', 'kg', true], ['smm', 'Skeletal muscle mass', 'kg', true],
  ['bmr', 'BMR', 'kcal/day', true], ['metAge', 'Metabolic age', 'years', true], ['waterPct', 'Body water', '%', true], ['hr', 'Heart rate', 'bpm', false]];
// every dated weight reading, from manual entries and dated scale readings
function allWeights() {
  const r = S.weights.map(w => ({date: w.date, kg: +w.kg, source: w.source || 'Manual'}));
  for (const b of S.body) for (const rd of bodyReadings(b)) if (rd.date && rd.m.weight) r.push({date: rd.date, kg: +rd.m.weight, source: b.source + (rd.label ? ' · ' + rd.label : '')});
  return r.filter(x => x.date && x.kg > 0).sort((a, b) => a.date < b.date ? -1 : 1);
}
const bodyReadings = b => b.kind === 'report'
  ? [{label: 'headline', date: b.headlineDate, m: {weight: b.headline}}, {label: 'first reading', date: b.fromDate, m: b.from}, {label: 'latest reading', date: b.toDate, m: b.to}]
  : [{label: '', date: b.date, m: b.metrics}];
function weightChart(w, avg) {
  if (w.length < 2) return '<p class="mute">Add two dated weight readings to see a chart.</p>';
  const t0 = +new Date(w[0].date), t1 = +new Date(w.at(-1).date) || t0 + 1, vals = w.map(x => x.kg), lo = Math.min(...vals) - 1, hi = Math.max(...vals) + 1;
  const X = d => 10 + (+new Date(d) - t0) / Math.max(1, t1 - t0) * 280, Y = v => 95 - (v - lo) / (hi - lo) * 85;
  const avgPts = avg ? w.map(p => { const win = w.filter(q => q.date <= p.date && +new Date(p.date) - +new Date(q.date) < 7 * 864e5); return [X(p.date), Y(win.reduce((a, q) => a + q.kg, 0) / win.length)]; }) : [];
  return `<svg viewBox="0 0 300 110" style="width:100%" role="img" aria-label="Weight chart from ${ukDate(w[0].date)} to ${ukDate(w.at(-1).date)}">
    <polyline points="${w.map(p => X(p.date) + ',' + Y(p.kg)).join(' ')}" fill="none" stroke="var(--acc)" stroke-width="1.5" opacity="${avg ? .4 : 1}"/>
    ${w.map(p => `<circle cx="${X(p.date)}" cy="${Y(p.kg)}" r="2.5" fill="var(--acc)"><title>${p.kg} kg · ${ukDate(p.date)} · ${esc(p.source)}</title></circle>`).join('')}
    ${avg ? `<polyline points="${avgPts.map(p => p.join(',')).join(' ')}" fill="none" stroke="var(--ink)" stroke-width="2"/>` : ''}
    <text x="0" y="108" font-size="8" fill="var(--mute)">${ukDate(w[0].date)}</text><text x="300" y="108" font-size="8" fill="var(--mute)" text-anchor="end">${ukDate(w.at(-1).date)}</text>
    <text x="0" y="8" font-size="8" fill="var(--mute)">${gb(hi)} kg</text></svg>`;
}
let showAvg = false;
let progTab = 'Body';
screens.Progress = () => {
  const w = allWeights(), dated = S.body.flatMap(b => bodyReadings(b).filter(r => r.date).map(r => ({...r, source: b.source}))), reports = S.body.filter(b => b.kind === 'report');
  const wk = [...Array(7)].map((_, i) => { const d = dayOffset(i - 6); return [d, dayTotals(d).kcal]; }), kt = +P().kcal, logged = wk.filter(x => x[1]), avg = logged.length ? sum(logged.map(x => ({k: x[1]})), 'k') / logged.length : 0, hi = Math.max(kt, ...wk.map(x => x[1]), 1);
  return `<h1 class="xl">Progress</h1>
  ${seg([['Body', "progTab='Body';render()"], ['Nutrition', "progTab='Nutrition';render()"], ['Training', "progTab='Training';render()"]], progTab)}
  ${progTab === 'Nutrition' ? `<div class="card insight">${ic(IC.bulb)}<p>${logged.length ? `You averaged <b>${gb(Math.round(avg))} kcal</b> on ${logged.length} logged day${logged.length === 1 ? '' : 's'} this week${kt ? ` against a ${gb(kt)} kcal target` : ''}.` : 'Log meals this week to see your calorie average here.'}</p></div>
  <div class="card" id="p-cal"><h2>Calories, last 7 days</h2><div class="bars" role="img" aria-label="Daily calories for the last 7 days">${wk.map(([d, k]) => `<div title="${ukDate(d)}: ${gb(k)} kcal"><span class="mute">${k ? gb(k) : ''}</span><i style="height:${k / hi * 100}%"></i><span class="mute">${'SMTWTFS'[new Date(d + 'T12:00').getDay()]}</span></div>`).join('')}</div>${kt ? `<p class="mute">Target ${gb(kt)} kcal/day</p>` : ''}</div>` : ''}
  ${progTab === 'Body' ? `<div class="card" id="p-wt"><h2>Weight</h2>
    ${S.coach.history.length ? `<p class="mute">Last update ${ukDate(S.coach.history.at(-1).date)}: ${S.coach.history.at(-1).to.kcal} kcal${S.coach.history.at(-1).undone ? ' (undone)' : ''} · based on ${esc(S.coach.history.at(-1).how)}</p>` : ''}${weightChart(w, showAvg && w.length >= 7)}
    ${w.length >= 7 ? `<label class="chk"><input type="checkbox" ${showAvg ? 'checked' : ''} onchange="showAvg=this.checked;render()"> Show 7-day average</label>` : `<p class="mute">7-day average appears once you have 7 readings (${w.length} so far).</p>`}
    <form class="row mt" onsubmit="event.preventDefault();add('weights',{...form(this),source:'Manual'})"><input name="date" type="date" value="${today()}" aria-label="Date"><input name="kg" type="number" step="0.1" inputmode="decimal" placeholder="kg" required><button class="sec">Add</button></form>
    <ul class="mt">${items('weights', x => `${x.kg} kg <span class="tag">${esc(x.source || 'Manual')}</span>`, 10)}</ul></div>
  <details class="card more" id="p-body"><summary>Body composition</summary>${reports.map(reportCard).join('')}
  <h2>Body composition trends</h2>${METRICS.filter(m => m[0] !== 'weight').map(([k, l, u, est]) => { const pts = dated.filter(r => r.m?.[k] !== undefined && r.m[k] !== ''); return pts.length ? `<h3>${l}${est ? '<span class="tag">scale estimate</span>' : ''}</h3>
      <ul>${pts.sort((a, b) => a.date < b.date ? -1 : 1).map(r => `<li><span>${gb(r.m[k])} ${u}</span><span class="mute">${ukDate(r.date)} · ${esc(r.source)}${r.label ? ' · ' + r.label : ''}</span></li>`).join('')}</ul>` : ''; }).join('') || '<p class="mute">No dated body-composition readings yet. Undated report values are shown in the snapshot above.</p>'}</details>
  <div class="card"><h2>Add readings</h2><div class="grid2"><button class="sec" onclick="go('BodyManual')">Manual entry</button><button class="sec" onclick="go('BodyImport')">Import scale report</button></div></div>` : ''}
  ${progTab === 'Training' ? trainingProgress() : ''}`;
};
function reportCard(b) {
  const row = (l, a, z, u, est) => `<li><span>${l}${est ? '<span class="tag">scale estimate</span>' : ''}</span><span>${a ?? '–'} → ${z ?? '–'} ${u}</span></li>`;
  return `<div class="card"><h2>${esc(b.source)} report snapshot</h2><p class="mute">${b.headlineDate || b.fromDate || b.toDate ? '' : 'Undated — '}${esc(b.note || '')}</p>
    <ul><li><span>Headline weight</span><span>${b.headline ?? '–'} kg · ${b.headlineDate ? ukDate(b.headlineDate) : 'date not confirmed'}</span></li>
    <li><span>Comparison dates</span><span class="mute">${b.fromDate ? ukDate(b.fromDate) : 'not confirmed'} → ${b.toDate ? ukDate(b.toDate) : 'not confirmed'}</span></li>
    ${METRICS.map(([k, l, u, est]) => b.from[k] !== undefined || b.to[k] !== undefined ? row(l, b.from[k], b.to[k], u, est) : '').join('')}
    ${b.score ? `<li><span>${esc(b.source)} Health Score</span><span>${esc(b.score)}${b.scoreLabel ? ` — labelled “${esc(b.scoreLabel)}” by ${esc(b.source)}` : ''}</span></li>` : ''}</ul>
    <div class="note">Body composition, BMR and metabolic age are estimates from the scale. ${b.score ? 'The scale\'s score is shown for reference only. ' : ''}This app never uses these values to set calorie targets, judge medication or decide whether you can exercise.</div>
    <details><summary>Confirm dates</summary><form onsubmit="event.preventDefault();Object.assign(S.body.find(x=>x.id==${b.id}),form(this));save();render()">
      <label>Headline weight date</label><input type="date" name="headlineDate" value="${b.headlineDate || ''}"><label>First comparison reading date</label><input type="date" name="fromDate" value="${b.fromDate || ''}">
      <label>Latest comparison reading date</label><input type="date" name="toDate" value="${b.toDate || ''}"><button class="sec mt">Save dates</button></form></details>
    <button class="link" onclick="if(confirm('Delete this report snapshot?')){S.body=S.body.filter(x=>x.id!=${b.id});save();render()}">Delete snapshot</button></div>`;
}
screens.BodyManual = () => `<h1>Manual reading</h1><button class="sec" onclick="go('Progress')">← Progress</button>
  <form class="card mt" onsubmit="event.preventDefault();saveManualBody(this)"><label>Date</label><input type="date" name="date" value="${today()}" required>
  <label>Source</label><input name="source" value="Manual" required>
  ${METRICS.map(([k, l, u, est]) => `<label>${l} (${u})${est ? ' · scale estimate' : ''}</label><input name="${k}" type="number" step="any" inputmode="decimal">`).join('')}
  <button class="mt">Review</button></form>`;
function saveManualBody(f) {
  const d = form(f), m = {}; METRICS.forEach(([k]) => { if (d[k] !== '') m[k] = +d[k]; });
  if (!Object.keys(m).length) return alert('Enter at least one value.');
  if (!confirm(`Save ${d.source} reading for ${ukDate(d.date)}?\n` + METRICS.filter(([k]) => k in m).map(([k, l, u]) => `${l}: ${m[k]} ${u}`).join('\n'))) return;
  S.body.push({id: uid(), kind: 'reading', date: d.date, source: d.source, metrics: m}); save(); go('Progress');
}
// Scale report import: paste the report's text, review the parsed fields, then save.
const PATTERNS = {headline: /headline weight[^\d]*([\d.,]+)/i, weight: /weight comparison/i, fatMass: /body fat mass/i, fatPct: /body fat percentage|body fat %/i, lean: /lean (?:body )?mass/i, smm: /skeletal muscle mass/i,
  bmr: /\bbmr\b|basal metabolic/i, metAge: /metabolic age/i, waterPct: /body water/i, hr: /heart rate/i};
function parseReport(text) {
  const from = {}, to = {}, num = s => +s.replace(/,/g, ''); let headline, score, scoreLabel;
  for (const line of text.split('\n')) {
    const h = line.match(PATTERNS.headline); if (h) { headline = num(h[1]); continue; }
    const sc = line.match(/health score[^\d]*([\d,]+)(?:.*?(?:labelled|labeled|rated)\s+["“]?([^"”.]+?)["”]?(?:\s+by\b|\.|$))?/i); if (sc) { score = num(sc[1]); scoreLabel = sc[2]?.trim(); continue; }
    for (const [k, re] of Object.entries(PATTERNS)) {
      if (k === 'headline' || !re.test(line)) continue;
      const m = line.replace(re, '').match(/([\d.,]+)\s*(?:%|kg|kcal\/day|kcal|bpm|years)?\s*(?:to|→|->|–)\s*([\d.,]+)/i) || line.replace(re, '').match(/([\d.,]+)/);
      if (m) { from[k] = num(m[1]); if (m[2]) to[k] = num(m[2]); }
      break;
    }
  }
  return {headline, from, to, score, scoreLabel};
}
let bodyPending = null;
screens.BodyImport = () => `<h1>Import scale report</h1><button class="sec" onclick="go('Progress')">← Progress</button>
  <div class="card mt"><p class="mute">Paste the values from your scale's report (e.g. “Body fat mass 46.3 to 45.8 kg”). Nothing is saved until you review it. Data stays on this device.</p>
    <label>Source</label><input id="biSrc" value="Hume"><label>Report name (optional)</label><input id="biNote" placeholder="e.g. Three-week report">
    <textarea id="biText" rows="10" class="mt" placeholder="Headline weight 80.0 kg&#10;Weight comparison 81.2 to 80.0 kg"></textarea>
    <button class="mt" onclick="bodyPending={id:uid(),kind:'report',date:'',source:biSrc.value||'Scale',note:biNote.value,headlineDate:'',fromDate:'',toDate:'',...parseReport(biText.value)};render()">Preview import</button></div>
  ${bodyPending ? `<h2>Preview</h2>${reportCard(bodyPending).replace(/<details>[\s\S]*<\/details>|<button class="link"[\s\S]*?<\/button>/g, '')}
    <p class="mute">Dates are left blank until you confirm them on the Progress screen.</p>
    <button onclick="S.body.push(bodyPending);bodyPending=null;save();go('Progress')">Save snapshot</button><button class="sec mt" onclick="bodyPending=null;render()">Discard</button>` : ''}`;
TAB_OF.BodyManual = 'Progress';

// ---------- Health ----------
const SAFETY = `<div class="note">This app only records and shows information. It doesn't assess symptoms, give reassurance or medical advice, or clear you for exercise. For new or worrying symptoms, contact your care team. In an emergency call 999; for urgent advice call NHS 111. <a href="https://www.nhs.uk/conditions/arrhythmia/" target="_blank" rel="noopener">NHS guidance: arrhythmia</a></div>`;
const APPT_TYPES = ['Sleep apnoea assessment', 'Exercise testing', 'Cardiac MRI', 'Blood tests', 'Cardiology appointment', 'Other'];
const SYMPTOMS = ['Chest discomfort', 'Palpitations', 'Light-headedness', 'Change in exercise tolerance', 'Other'];
screens.Health = () => {
  const H = S.health, st = stepsOn(today());
  return `<h1>Health</h1>
  <div class="card"><h2>Steps</h2>${macroRow('Today', st ?? 0, P().stepGoal, '')}${st == null ? '<p class="mute">Not logged today.</p>' : ''}
    <form class="row mt" onsubmit="event.preventDefault();setSteps(this.d.value,this.s.value)"><input name="d" type="date" value="${today()}" aria-label="Date"><input name="s" type="number" inputmode="numeric" placeholder="Steps" required><button class="sec">Save</button></form>
    <p class="mute">Manual entry. Saving again for the same day replaces it. Automatic steps aren't available: iPhone web apps can't read Apple Health.</p>
    <ul>${items('steps', x => (+x.steps).toLocaleString('en-GB') + ' steps', 5)}</ul></div>
  <div class="card"><h2>Sleep</h2><form onsubmit="event.preventDefault();logSleep(this)">
    <label>Night of</label><input name="date" type="date" value="${dayOffset(-1)}">
    <div class="row"><div><label>Bedtime</label><input name="bed" type="time" required></div><div><label>Wake time</label><input name="wake" type="time" required></div></div>
    <input name="note" placeholder="Notes (optional)" class="mt"><button class="mt">Save sleep</button></form>
    <ul class="mt">${items('sleep', x => `${fmtHours(+x.hours)}${x.bed ? ` · ${esc(x.bed)}–${esc(x.wake)}` : ''}${x.source ? ` <span class="tag">${esc(x.source)}</span>` : ''}${sleepExtras(x) ? '<br><span class="mute">' + sleepExtras(x) + '</span>' : ''}${x.note ? '<br><span class="mute">' + esc(x.note) + '</span>' : ''}`, 5)}</ul></div>
  ${ringCard()}
  <h2 style="margin-top:20px">🔒 Private health</h2><p class="mute">Stored only on this device. Left out of backups and summaries unless you choose to include it.</p>
  ${SAFETY}
  <div class="card"><h2>Clinician notes &amp; guidance</h2><p class="mute">Date each entry. The newest “Guidance” entry is shown on Training.</p>
    <form onsubmit="event.preventDefault();add('health.notes',form(this));this.reset()"><div class="row"><div><label>Date</label><input type="date" name="date" value="${today()}" required></div><div><label>Type</label><select name="kind"><option value="guidance">Guidance</option><option value="result">Test result</option><option value="other">Other</option></select></div></div>
      <label>Source</label><input name="source" placeholder="e.g. clinic letter, echo report"><label>Summary</label><textarea name="text" rows="4" required></textarea><button class="mt">Save note</button></form>
    <ul class="mt">${items('health.notes', x => `<span class="tag">${esc(x.kind)}</span> ${esc(x.source)}<br>${esc(x.text)}`, 50)}</ul></div>
  <div class="card"><h2>Training limits from your care team</h2><p class="mute">Leave blank unless your care team gave them to you.</p>
    <label>Movements to avoid</label><input value="${esc(H.constraints.avoid)}" onchange="S.health.constraints.avoid=this.value;save()">
    <label>Heart-rate zones</label><input value="${esc(H.constraints.hr)}" onchange="S.health.constraints.hr=this.value;save()">
    <label>Intensity limits</label><input value="${esc(H.constraints.intensity)}" onchange="S.health.constraints.intensity=this.value;save()"></div>
  <details class="card more"><summary>Follow-ups &amp; appointments</summary>
    <form onsubmit="event.preventDefault();add('health.appts',form(this));this.reset()"><label>Type</label><select name="type">${APPT_TYPES.map(t => `<option>${t}</option>`).join('')}</select>
      <div class="row"><div><label>Status</label><select name="status"><option>To arrange</option><option>Booked</option><option>Done</option></select></div><div><label>Date</label><input type="date" name="date"></div><div><label>Time</label><input type="time" name="time"></div></div>
      <input name="note" placeholder="Notes" class="mt"><button class="mt">Add follow-up</button></form>
    <ul class="mt">${items('health.appts', x => `<b>${esc(x.type)}</b> <span class="tag">${esc(x.status)}</span>${x.note ? '<br>' + esc(x.note) : ''}`, 50)}</ul></details>
  <details class="card more"><summary>Symptom log</summary>
    <form onsubmit="event.preventDefault();add('health.symptoms',form(this));this.reset()"><label>Symptom</label><select name="symptom">${SYMPTOMS.map(t => `<option>${t}</option>`).join('')}</select>
      <div class="row"><div><label>Date</label><input type="date" name="date" value="${today()}" required></div><div><label>Time</label><input type="time" name="time"></div></div>
      <label>What were you doing?</label><input name="activity"><label>How long did it last?</label><input name="duration" placeholder="e.g. 2 minutes"><label>Notes</label><textarea name="note" rows="2"></textarea><button class="mt">Log symptom</button></form>
    <ul class="mt">${items('health.symptoms', x => `<b>${esc(x.symptom)}</b>${x.activity ? ' · during ' + esc(x.activity) : ''}${x.duration ? ' · ' + esc(x.duration) : ''}${x.note ? '<br>' + esc(x.note) : ''}`, 50)}</ul></details>
  <details class="card more"><summary>Medication (optional)</summary>
    <label class="chk"><input type="checkbox" ${H.med.enabled ? 'checked' : ''} onchange="S.health.med.enabled=this.checked;save();render()"> Track a GLP-1 medication</label>
    ${H.med.enabled ? `<div class="note">This app never suggests changing a dose or taking a catch-up dose. Ask your prescriber or pharmacist.</div>
      <label>Medication name</label><input value="${esc(H.med.name)}" onchange="S.health.med.name=this.value;save()"><label>Prescribed dose</label><input value="${esc(H.med.dose)}" onchange="S.health.med.dose=this.value;save()">
      <label>Start date</label><input type="date" value="${esc(H.med.start)}" onchange="S.health.med.start=this.value;save()">
      <h3>Log a dose</h3><form onsubmit="event.preventDefault();add('health.doses',form(this));this.reset()"><div class="row"><div><label>Date</label><input type="date" name="date" value="${today()}" required></div><div><label>Time</label><input type="time" name="time"></div></div>
        <label>Dose taken</label><input name="dose"><label>Appetite</label><select name="appetite"><option value="">—</option><option>Much lower than usual</option><option>A bit lower</option><option>Usual</option><option>Higher</option></select>
        <label>Side effects</label><input name="side"><label>Notes</label><input name="note"><button class="mt">Save dose</button></form>
      <ul class="mt">${items('health.doses', x => `${esc(x.dose) || 'Dose'}${x.appetite ? ' · appetite: ' + esc(x.appetite) : ''}${x.side ? '<br>Side effects: ' + esc(x.side) : ''}`, 20)}</ul>` : ''}</details>
  <button class="sec" onclick="go('Clinician')">Preview summary for my clinician</button>`;
};

// ---------- clinician summary (preview, then copy or download; never sent automatically) ----------
let clin = {from: '', to: '', notes: true, symptoms: true, appts: true, meds: false, training: true};
function clinicianText() {
  const f = clin.from || dayOffset(-90), t = clin.to || today(), inR = x => !x.date || (x.date >= f && x.date <= t), H = S.health, L = [];
  L.push(`Health summary — ${ukDate(f)} to ${ukDate(t)}`, 'Recorded by the patient in a personal tracker. Not a clinical assessment.', '');
  if (clin.notes) { L.push('CLINICIAN NOTES & GUIDANCE'); H.notes.filter(inR).sort(byDateDesc).forEach(n => L.push(`- ${ukDate(n.date)} [${n.kind}] ${n.source ? n.source + ': ' : ''}${n.text}`)); L.push(''); }
  if (clin.symptoms) { L.push('SYMPTOMS'); const s = H.symptoms.filter(inR).sort(byDateDesc); s.length ? s.forEach(x => L.push(`- ${ukDate(x.date)} ${x.time || ''} ${x.symptom}${x.activity ? '; during ' + x.activity : ''}${x.duration ? '; lasted ' + x.duration : ''}${x.note ? '; ' + x.note : ''}`)) : L.push('- None recorded'); L.push(''); }
  if (clin.appts) { L.push('FOLLOW-UPS'); H.appts.forEach(a => L.push(`- ${a.type}: ${a.status}${a.date ? ' ' + ukDate(a.date) : ''}${a.note ? ' — ' + a.note : ''}`)); L.push(''); }
  if (clin.training) { const sess = new Set(S.workouts.filter(inR).map(w => w.session || w.date)); L.push('TRAINING', `- ${sess.size} strength sessions logged`, ''); }
  if (clin.meds && H.med.enabled) { L.push('MEDICATION', `- ${H.med.name || 'Name not entered'} · prescribed ${H.med.dose || 'not entered'} · started ${H.med.start ? ukDate(H.med.start) : 'not entered'}`); H.doses.filter(inR).sort(byDateDesc).forEach(d => L.push(`- ${ukDate(d.date)} ${d.time || ''} ${d.dose}${d.appetite ? '; appetite ' + d.appetite : ''}${d.side ? '; side effects ' + d.side : ''}`)); }
  return L.join('\n');
}
screens.Clinician = () => `<h1>Clinician summary</h1><button class="sec" onclick="go('Health')">← Health</button>
  <div class="card mt"><div class="row"><div><label>From</label><input type="date" value="${clin.from || dayOffset(-90)}" onchange="clin.from=this.value;render()"></div><div><label>To</label><input type="date" value="${clin.to || today()}" onchange="clin.to=this.value;render()"></div></div>
  ${[['notes', 'Clinician notes'], ['symptoms', 'Symptoms'], ['appts', 'Follow-ups'], ['training', 'Training count'], ['meds', 'Medication']].map(([k, l]) => `<label class="chk"><input type="checkbox" ${clin[k] ? 'checked' : ''} onchange="clin.${k}=this.checked;render()"> ${l}</label>`).join('')}</div>
  <div class="card"><h2>Preview</h2><pre>${esc(clinicianText())}</pre>
  <div class="grid2"><button class="sec" onclick="copyText(clinicianText())">Copy</button><button class="sec" onclick="download('health-summary-'+today()+'.txt',clinicianText())">Download .txt</button></div>
  <p class="mute">Nothing is sent automatically. You choose where to paste or attach it.</p></div>`;

// ---------- weekly review ----------
function buildReview() {
  const from = dayOffset(-7), to = dayOffset(-1), days = Array.from({length: 7}, (_, i) => dayOffset(-7 + i)), inW = x => x.date >= from && x.date <= to;
  const dayName = d => DAYS[(new Date(d + 'T12:00').getDay() + 6) % 7];
  const planned = days.filter(d => S.week.days[dayName(d)]), trained = days.filter(d => S.workouts.some(w => w.date === d));
  const mealDays = days.filter(d => S.meals.some(m => m.date === d)), tot = mealDays.map(d => dayTotals(d));
  const w = allWeights().filter(inW), st = days.map(stepsOn), sl = S.sleep.filter(inW), wa = days.map(d => S.water.some(x => x.date === d) ? dayTotals(d).water : null);
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null, logged = a => a.filter(v => v != null);
  const r = {from, to, working: [], blockers: [], proposals: [], lines: []};
  r.lines.push(['Workouts', `${trained.length} completed${planned.length ? ` of ${planned.length} planned` : ''}${trained.length ? ' (' + trained.map(ukDate).join(', ') + ')' : ''}`]);
  r.lines.push(['Meals logged', `${mealDays.length} of 7 days${7 - mealDays.length ? ` · ${7 - mealDays.length} day(s) not logged (not counted as zero)` : ''}`]);
  r.lines.push(['Calories', tot.length ? `avg ${Math.round(avg(tot.map(t => t.kcal)))} kcal on ${tot.length} logged day(s)${+P().kcal ? ` · target ${P().kcal}` : ''}` : 'no data']);
  r.lines.push(['Fibre', tot.length ? `avg ${Math.round(avg(tot.map(t => t.fibre || 0)))} g on ${tot.length} logged day(s)${+P().fibre ? ` · target ${P().fibre} g` : ''}` : 'no data']);
  r.lines.push(['Protein', tot.length ? `avg ${Math.round(avg(tot.map(t => t.protein)))} g on ${tot.length} logged day(s)${+P().protein ? ` · target ${P().protein} g` : ''}` : 'no data']);
  r.lines.push(['Weight', w.length >= 2 ? `${w[0].kg} → ${w.at(-1).kg} kg (${w.length} readings)` : w.length ? `${w[0].kg} kg (1 reading)` : 'no readings']);
  r.lines.push(['Steps', logged(st).length ? `avg ${Math.round(avg(logged(st))).toLocaleString('en-GB')} on ${logged(st).length} logged day(s)` : 'not logged']);
  r.lines.push(['Sleep', sl.length ? `avg ${fmtHours(avg(sl.map(s => +s.hours)))} on ${sl.length} logged night(s)` : 'not logged']);
  r.lines.push(['Water', logged(wa).length ? `avg ${Math.round(avg(logged(wa)))} ml on ${logged(wa).length} logged day(s)${+P().waterGoal ? ` · goal ${P().waterGoal} ml` : ''}` : 'not logged']);
  const missed = planned.filter(d => !trained.includes(d));
  if (planned.length && !missed.length) r.working.push('You completed every planned workout.');
  else if (trained.length) r.working.push(`You trained ${trained.length} time(s).`);
  if (mealDays.length >= 5) r.working.push(`Meal logging was consistent (${mealDays.length}/7 days).`);
  if (+P().protein && tot.filter(t => t.protein >= +P().protein).length) r.working.push(`Protein target reached on ${tot.filter(t => t.protein >= +P().protein).length} logged day(s).`);
  if (missed.length) r.blockers.push(`Missed planned workout(s): ${missed.map(ukDate).join(', ')}.`);
  if (mealDays.length < 5) r.blockers.push(`Meals logged on only ${mealDays.length} of 7 days, so totals are incomplete.`);
  if (!logged(st).length || !sl.length) r.blockers.push(`Not logged: ${[!logged(st).length && 'steps', !sl.length && 'sleep', !logged(wa).length && 'water'].filter(Boolean).join(', ')}.`);
  if (missed.length) { const md = dayName(missed[0]), free = DAYS.find(d => !S.week.days[d] && d !== md); if (free && S.week.days[md]) r.proposals.push({type: 'move', from: md, to: free, text: `Move the ${md} session to ${free} next week.`, status: ''}); }
  if (mealDays.length < 5) r.proposals.push({type: 'habit', text: 'Log each meal straight after eating using Speak meal or a favourite.', status: ''});
  if (+P().waterGoal && logged(wa).length && avg(logged(wa)) < +P().waterGoal) r.proposals.push({type: 'habit', text: 'Keep a 500 ml bottle with you at lunch.', status: ''});
  else if (+P().stepGoal && logged(st).length && avg(logged(st)) < +P().stepGoal) r.proposals.push({type: 'habit', text: 'Add a 10-minute walk after one meal each day.', status: ''});
  r.proposals = r.proposals.slice(0, 3);
  const ci = coachInsights(from); r.working.push(...ci.work.filter(x => !r.working.includes(x))); r.improve = ci.imp;
  return r;
}
function startReview() { const r = buildReview(); S.reviews.push({id: uid(), date: today(), ...r}); save(); revId = S.reviews.at(-1).id; go('Review'); }
let revId = null, revHealth = false;
function decide(i, ok) {
  const r = S.reviews.find(x => x.id == revId), p = r.proposals[i]; if (p.status) return;
  p.status = ok ? 'accepted' : 'rejected';
  if (ok && p.type === 'move') { S.week.days[p.to] = S.week.days[p.from]; delete S.week.days[p.from]; }
  save(); render();
}
function reviewText(r, withHealth) {
  const L = [`Weekly review ${ukDate(r.from)} – ${ukDate(r.to)}`, ...r.lines.map(([a, b]) => `${a}: ${b}`), '', 'Working:', ...r.working.map(x => '- ' + x), 'Got in the way:', ...r.blockers.map(x => '- ' + x), 'To improve:', ...(r.improve || []).map(x => `- ${x.what}. How: ${x.how}`), 'Proposed changes:', ...r.proposals.map(p => `- ${p.text} [${p.status || 'undecided'}]`)];
  if (withHealth) { const H = S.health, inW = x => x.date >= r.from && x.date <= r.to; L.push('', 'Private health (included by choice):', ...H.symptoms.filter(inW).map(s => `- ${ukDate(s.date)} ${s.symptom}`), ...(H.med.enabled ? H.doses.filter(inW).map(d => `- ${ukDate(d.date)} dose ${d.dose}`) : [])); }
  return L.join('\n');
}
screens.Review = () => {
  const r = S.reviews.find(x => x.id == revId) || S.reviews.at(-1);
  if (!r) return `<h1>Weekly review</h1><button onclick="startReview()">Run weekly review</button>`;
  revId = r.id;
  return `<h1>Weekly review</h1><p class="mute">${ukDate(r.from)} – ${ukDate(r.to)} (previous seven complete days)</p>
  <div class="card"><ul>${r.lines.map(([a, b]) => `<li><span>${a}</span><span style="text-align:right">${esc(b)}</span></li>`).join('')}</ul></div>
  <div class="card"><h2>What seems to be working</h2><ul>${r.working.map(x => `<li>${esc(x)}</li>`).join('') || '<li class="mute">Not enough data yet.</li>'}</ul>
    <h2 class="mt">What to improve, and how</h2>${(r.improve || []).map(x => `<div class="imp"><b>${esc(x.what)}</b><p class="mute">${esc(x.how)}</p></div>`).join('') || '<p class="mute">Nothing to fix. Keep doing what you did.</p>'}
    <h2 class="mt">What got in the way</h2><ul>${r.blockers.map(x => `<li>${esc(x)}</li>`).join('') || '<li class="mute">Nothing obvious.</li>'}</ul></div>
  <div class="card"><h2>Proposed changes for next week</h2>${r.proposals.map((p, i) => `<div class="mt"><p>${esc(p.text)}${p.status ? ` <span class="tag">${p.status}</span>` : ''}</p>${p.status ? '' : `<div class="grid2"><button onclick="decide(${i},true)">Accept</button><button class="sec" onclick="decide(${i},false)">Reject</button></div>`}</div>`).join('') || '<p class="mute">No changes suggested.</p>'}
    <p class="mute">The review never changes training intensity or medication. Calorie targets only change through weekly auto-targets, if you turned them on in Settings.</p></div>
  <div class="card"><h2>Reminder</h2><label class="chk"><input type="checkbox" ${S.settings.reminder ? 'checked' : ''} onchange="S.settings.reminder=this.checked;save()"> Show a reminder in the app on Sundays from 9 am (UK time)</label>
    <p class="mute">The app can't send notifications when closed. For a real alert, add a repeating calendar event:</p><button class="sec" onclick="download('weekly-review.ics',ICS,'text/calendar')">Add Sunday 9 am calendar reminder (.ics)</button></div>
  ${aiKey() ? `<div class="card"><h2>Coach's take</h2>${revAdvice[r.id] ? `<div style="white-space:pre-wrap">${esc(revAdvice[r.id])}</div>` : '<p class="mute">Get a short plan for next week from your coach.</p>'}
    <button class="${revAdvice[r.id] ? 'sec ' : ''}mt" ${revBusy ? 'disabled' : ''} onclick="reviewAdvice(${r.id})">${revBusy ? 'Thinking…' : revAdvice[r.id] ? 'Ask again' : '✨ Get coach advice'}</button></div>` : ''}
  <details class="card more"><summary>Share with Claude (optional)</summary><label class="chk"><input type="checkbox" ${revHealth ? 'checked' : ''} onchange="revHealth=this.checked;render()"> Include private health and medication notes</label>
    <pre>${esc(reviewText(r, revHealth))}</pre><button class="sec" onclick="copyText(reviewText(S.reviews.find(x=>x.id==revId),revHealth))">Copy to paste into Claude</button><p class="mute">Nothing is sent unless you paste it yourself.</p></details>
  ${S.reviews.length > 1 ? `<details class="card more"><summary>Past reviews</summary><ul>${S.reviews.slice().reverse().map(x => `<li><span>${ukDate(x.from)} – ${ukDate(x.to)}</span><button onclick="revId=${x.id};render()">Open</button></li>`).join('')}</ul></details>` : ''}`;
};
const ICS = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Fitness tracker//EN', 'BEGIN:VEVENT', 'UID:weekly-review-fitness', 'DTSTAMP:20260101T000000Z',
  'DTSTART;TZID=Europe/London:20260104T090000', 'DURATION:PT15M', 'RRULE:FREQ=WEEKLY;BYDAY=SU', 'SUMMARY:Run weekly fitness review', 'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:Run weekly review', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');

// ---------- fictional test data ----------
function demo() {
  if (!confirm('Add fictional test entries? Your profile is kept.')) return;
  const d = n => dayOffset(-n);
  for (let i = 9; i >= 1; i--) S.weights.push({id: uid(), date: d(i), kg: (90 - i * .15 + (i % 2) * .3).toFixed(1), source: 'Test data'});
  S.meals.push({id: uid(), date: d(1), name: 'Test: porridge & berries', kcal: 420, protein: 18, carbs: 66, fat: 8, est: true});
  const sess = uid();
  [[10, 20], [10, 20], [8, 22.5]].forEach(([reps, kg]) => S.workouts.push({id: uid(), date: d(2), session: sess, exercise: 'Goblet squat', reps, kg}));
  S.steps.push({id: uid(), date: d(1), steps: 8200});
  S.sleep.push({id: uid(), date: d(2), bed: '23:15', wake: '06:45', hours: 7.5, note: 'Test entry'});
  save(); render();
}
TAB_OF.Review = 'Today';
