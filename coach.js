// ===== Coach: weekly auto-targets from weigh-ins, "do this next" card, one-tap food, streaks =====
// Uses dated weight readings and logged food only. Never uses scale scores, body-composition estimates, symptoms or medication.
const KCAL_PER_KG = 7700, MAX_STEP = 150, KCAL_FLOOR = 1500; // ponytail: generic floor (no age/sex asked); a clinician's figure always wins
const GOAL_RATE = {'Lose fat': -0.005, 'Build muscle': 0.0025}; // fraction of body weight per week; other goals hold weight
const avgKg = list => list.reduce((a, x) => a + x.kg, 0) / list.length;
const daysBetween = (a, b) => Math.round((+new Date(b + 'T12:00') - +new Date(a + 'T12:00')) / 864e5);
const r10 = v => Math.round(v / 10) * 10;

// Average intake over fully-logged days (>= 1000 kcal) in the 14 days before `to`. Partly logged days are left out, not counted as low.
function loggedIntake(to) {
  const days = [...Array(14)].map((_, i) => dayOffset(-i - 1, to)).filter(d => sum(S.meals.filter(m => m.date === d), 'kcal') >= (dayDone(d) ? 800 : 1000)).map(d => sum(S.meals.filter(m => m.date === d), 'kcal'));
  return {n: days.length, avg: days.length ? days.reduce((a, b) => a + b, 0) / days.length : 0};
}
// Returns new targets, or null when there isn't enough data. Pure: doesn't change state.
function calcTargets() {
  const w = allWeights(); if (!w.length) return null;
  const last = w.at(-1), kg = avgKg(w.filter(x => daysBetween(x.date, last.date) <= 3));
  const prev = w.filter(x => { const d = daysBetween(x.date, last.date); return d >= 5 && d <= 14; });
  const rate = prev.length ? (kg - avgKg(prev)) / Math.max(5, daysBetween(prev.at(-1).date, last.date)) * 7 : null; // kg per week
  const intake = loggedIntake(last.date), old = S.coach.tdee;
  let tdee = kg * 30, how = 'a starting estimate from your weight (30 kcal per kg)';
  if (rate != null && intake.n >= 5) {
    const measured = intake.avg - rate * KCAL_PER_KG / 7;
    tdee = old ? old * 0.7 + measured * 0.3 : measured; // smooth: one odd week can't swing targets
    how = `your logged food (${intake.n} full days, avg ${gb(intake.avg)} kcal) and weight change (${rate > 0 ? '+' : ''}${rate.toFixed(2)} kg/week)`;
  } else if (old) { tdee = old; how = `last week's estimate (need 5 fully logged days and two weigh-ins 5+ days apart to update it)`; }
  const gw = +P().goalWeight, perWk = +P().kgPerWeek, dir = gw ? Math.sign(gw - kg) : (P().goal === 'Build muscle' ? 1 : -1);
  const wkRate = gw && Math.abs(gw - kg) < .5 ? 0 : perWk ? dir * Math.min(perWk, kg * 0.01) : (GOAL_RATE[P().goal] || 0) * kg; // kg/week; user's pace capped at 1% of body weight
  const goalAdj = Math.max(-1000, Math.min(500, wkRate * KCAL_PER_KG / 7));
  let kcal = tdee + goalAdj, cur = +P().kcal;
  if (cur) kcal = Math.max(cur - MAX_STEP, Math.min(cur + MAX_STEP, kcal));
  kcal = r10(Math.max(KCAL_FLOOR, kcal));
  const protein = Math.round(Math.min(200, kg * (P().goal === 'General fitness' ? 1.6 : 1.8)));
  const fat = Math.round(Math.max(kg * 0.6, kcal * 0.25 / 9)), carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return {date: last.date, kg: +kg.toFixed(1), rate, tdee: Math.round(tdee), how, t: {kcal, protein, carbs, fat, fibre: Math.max(30, Math.round(kcal / 1000 * 14))}};
}
const TKEYS = ['kcal', 'protein', 'carbs', 'fat', 'fibre'];
// Runs on every render; acts at most once per new weigh-in, 6+ days after the last update.
function coachTick() {
  if (S.settings.autoTargets !== true) return;
  const w = allWeights().at(-1), h = S.coach.history.at(-1);
  if (!w || (h && (w.date <= h.date || daysBetween(h.date, w.date) < 6))) return;
  const r = calcTargets(); if (!r) return;
  S.coach.history.push({id: uid(), date: r.date, from: pick(P(), TKEYS), to: r.t, how: r.how, kg: r.kg, rate: r.rate, seen: false});
  S.coach.tdee = r.tdee; Object.assign(S.profile, r.t); save();
}
// Undo keeps the entry (marked undone) so the same weigh-in doesn't re-apply it.
function undoTargets() { const h = S.coach.history.at(-1); if (h && !h.undone) { Object.assign(S.profile, h.from); Object.assign(h, {undone: true, seen: true}); S.coach.tdee = null; } save(); render(); }

// ---------- streak & next step ----------
function streak() {
  const logged = new Set(LOG_LISTS.flatMap(k => S[k].map(x => x.date)));
  let n = 0, d = logged.has(today()) ? today() : dayOffset(-1);
  while (logged.has(d)) { n++; d = dayOffset(-1, d); }
  return n;
}
const CHEER = ['Nice one.', 'Small steps count.', 'Turning up is the hard part.', 'Keep it rolling.', 'Good work.'];
const weighDue = () => { const w = allWeights().at(-1); return !w || daysBetween(w.date, today()) >= 7 || (DAYS[(new Date().getDay() + 6) % 7] === (S.settings.weighDay || 'Mon') && w.date !== today()); };
const lastSlotMeal = slot => S.meals.filter(m => m.date < today() && slotOf(m) === slot).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))[0];
const PRO = [['Greek yoghurt 200 g', 18], ['Tin of tuna', 28], ['Protein shake', 24], ['2 eggs', 13]], FIB = [['Porridge 40 g', 4], ['Half a tin of baked beans', 7], ['Apple and banana', 5], ['Handful of berries', 2]];
function coachCard() {
  const out = [], hr = new Date().getHours(), t = dayTotals(), tr = todaysRoutine(), s = streak();
  const h = S.coach.history.at(-1);
  if (h && !h.seen) out.push(`<div class="coach-new"><b>New targets for this week</b><p class="mute">${TKEYS.map(k => `${k === 'kcal' ? 'Calories' : k[0].toUpperCase() + k.slice(1)} ${h.from[k] || '–'} → <b>${h.to[k]}</b>`).join(' · ')}</p>
    <p class="mute">Based on ${esc(h.how)}. ${has(P().clinician) || S.health.med.enabled || S.health.notes.length ? 'If your care team has given you targets, use theirs instead.' : ''}</p>
    <div class="grid2"><button onclick="S.coach.history.at(-1).seen=true;save();render()">OK</button><button class="sec" onclick="undoTargets()">Undo</button></div></div>`);
  if (P().done && S.settings.autoTargets == null) out.push(`<div><b>Let me set your targets each week?</b><p class="mute">After each weekly weigh-in I'll update calories, protein, carbs, fat and fibre from your weight trend and the food you log. Changes are small (max ${MAX_STEP} kcal a week), never below ${KCAL_FLOOR} kcal, and you can undo them. ${S.health.med.enabled || has(P().clinician) ? 'You have care-team guidance or medication logged: check automatic targets with them.' : ''}</p>
    <div class="grid2"><button onclick="S.settings.autoTargets=true;save();render()">Yes, do it for me</button><button class="sec" onclick="S.settings.autoTargets=false;save();render()">No thanks</button></div>`);
  if (S.plan?.start && planWeek() > S.plan.weeks) out.push(`<div><b>Your ${S.plan.weeks}-week plan is done 🎉</b><p class="mute">Time for a fresh block with new exercises.</p><button onclick="go('Generate')">Build my next plan</button></div>`);
  if (weighDue()) out.push(`<form onsubmit="event.preventDefault();add('weights',{kg:this.kg.value,source:'Weekly weigh-in'})"><b>Weekly weigh-in</b><p class="mute">Same time, after the loo, before food.</p>
    <div class="row"><input name="kg" type="number" step="0.1" inputmode="decimal" placeholder="kg" required aria-label="Weight in kg"><button style="flex:0 0 auto;width:auto">Save</button></div></form>`);
  if (tr && !S.active && !S.workouts.some(w => w.date === today())) out.push(`<div><b>${esc(tr.name)} today</b> <span class="mute">~${estMinutes(tr.items)} min</span><button class="mt" onclick="startWorkout(${tr.id})">Start workout</button></div>`);
  const slot = hr < 11 ? 'Breakfast' : hr < 16 ? 'Lunch' : hr < 21 ? 'Dinner' : null, had = slot && S.meals.some(m => m.date === today() && slotOf(m) === slot), usual = slot && lastSlotMeal(slot);
  if (slot && !had && usual) out.push(`<div><b>${slot}?</b><p class="mute">Last time: ${esc(usual.name)} · ${gb(usual.kcal)} kcal</p><button class="sec" onclick="repeatMeal(${js(pick(usual, MEAL_KEYS))})">Same again</button></div>`);
  if (hr >= 15) {
    const pg = +P().protein - t.protein, fg = +P().fibre - (t.fibre || 0);
    if (pg >= 15) out.push(`<div><b>${Math.round(pg)} g protein to go</b><p class="mute">Easy wins: ${PRO.map(x => `${x[0]} (~${x[1]} g)`).join(', ')}</p></div>`);
    if (fg >= 5) out.push(`<div><b>${Math.round(fg)} g fibre to go</b><p class="mute">Easy wins: ${FIB.map(x => `${x[0]} (~${x[1]} g)`).join(', ')}</p></div>`);
  }
  const head = s ? `${s}-day streak 🔥 <span class="mute">${CHEER[s % CHEER.length]}</span>` : '<span class="mute">Log anything today to start a streak.</span>';
  return `<div class="card coach"><div class="coach-h">${head}</div>${out.map(x => `<div class="coach-i">${x}</div>`).join('') || '<p class="mute">All done for now. Nothing else to do today.</p>'}</div>`;
}
function copyYesterday() {
  const y = S.meals.filter(m => m.date === dayOffset(-1)); if (!y.length) return alert('Nothing logged yesterday.');
  if (!confirm(`Copy ${y.length} meal(s) from yesterday to today?`)) return;
  y.forEach(m => S.meals.push({id: uid(), date: today(), ...pick(m, MEAL_KEYS), savedAt: m.savedAt ? Date.now() - (Date.now() - m.savedAt) % 864e5 : Date.now()})); save(); render();
}
function recentMeals(n = 5) { const seen = new Set(); return [...S.meals].reverse().filter(m => !seen.has(m.name) && seen.add(m.name)).slice(0, n); }
const quickFood = () => { const r = recentMeals(); return `<div class="card"><div class="sec-h"><h2>Quick add</h2><button class="link" style="width:auto" onclick="copyYesterday()">Copy yesterday</button></div>
  ${r.length ? `<ul>${r.map(m => `<li><span>${esc(m.name)}<br><span class="mute">${gb(m.kcal)} kcal</span></span><button onclick="repeatMeal(${js(pick(m, MEAL_KEYS))})" aria-label="Add ${esc(m.name)} again">+ Add</button></li>`).join('')}</ul>` : '<p class="mute">Meals you log show here for one-tap adding.</p>'}</div>`; };
// Sunday 9am onwards: build the weekly review automatically, once.
function autoReview() { if (reviewDue()) { S.reviews.push({id: uid(), date: today(), ...buildReview(), auto: true}); save(); } }

// ---------- Settings: every adjustable value in one place ----------
const setP = (k, v) => { S.profile[k] = v === '' ? '' : +v; save(); render(); };
const setS = (k, v) => { S.settings[k] = v; save(); render(); };
const num = (label, val, on, step = 1, unit = '') => `<label>${label}</label><div class="row" style="align-items:center"><input type="number" inputmode="decimal" step="${step}" value="${val ?? ''}" onchange="${on}" style="flex:3">${unit ? `<span class="mute" style="flex:0 0 auto">${unit}</span>` : ''}</div>`;
const tog = (label, k) => `<label class="chk"><input type="checkbox" ${S.settings[k] ? 'checked' : ''} onchange="setS('${k}',this.checked)"> ${label}</label>`;
function goalInfo() {
  const w = allWeights().at(-1), g = +P().goalWeight, r = w && +P().kgPerWeek ? +Math.min(+P().kgPerWeek, w.kg * .01).toFixed(2) : 0;
  if (!w || !g) return '';
  const left = Math.abs(w.kg - g);
  return `<p class="mute">${left < .5 ? 'You are at your goal weight. Targets now hold your weight.' : `${left.toFixed(1)} kg to go${r ? ` · about ${Math.ceil(left / r)} weeks at ${r} kg/week` : ''}.`}</p>`;
}
screens.Settings = () => {
  const exs = [...new Set([...Object.keys(S.rest), ...S.routines.flatMap(r => r.items.map(i => i.ex || i))])].sort();
  const w = allWeights().at(-1), r = +P().kgPerWeek, fast = w && r > w.kg * 0.01;
  return `<h1 class="xl">Settings</h1>
  <div class="card"><h2>Weight goal</h2>
    <label>Main goal</label><select onchange="S.profile.goal=this.value;save();render()">${QUESTIONS.find(q => q[0] === 'goal')[3].map(o => `<option ${P().goal === o ? 'selected' : ''}>${o}</option>`).join('')}</select>
    ${num('Goal weight', P().goalWeight, "setP('goalWeight',this.value)", .1, 'kg')}
    ${num('Change per week', P().kgPerWeek, "setP('kgPerWeek',this.value)", .05, 'kg/week')}
    <p class="mute">Leave blank to use the default for your goal. Auto-targets cap this at 1% of your body weight a week.</p>
    ${fast ? `<div class="note">${r} kg a week is more than 1% of your body weight. Auto-targets will use ${(w.kg * .01).toFixed(2)} kg a week.</div>` : ''}
    ${goalInfo()}</div>
  <div class="card"><h2>Daily targets</h2>
    ${tog('Update targets automatically after each weekly weigh-in', 'autoTargets')}
    <label>Weigh-in day</label><select onchange="setS('weighDay',this.value)">${DAYS.map(d => `<option ${d === (S.settings.weighDay || 'Mon') ? 'selected' : ''}>${d}</option>`).join('')}</select>
    ${[['kcal', 'Calories', 'kcal', 10], ['protein', 'Protein', 'g', 1], ['carbs', 'Carbs', 'g', 1], ['fat', 'Fat', 'g', 1], ['fibre', 'Fibre', 'g', 1], ['waterGoal', 'Water', 'ml', 50], ['stepGoal', 'Steps', 'steps', 500]].map(([k, l, u, st]) => num(l, P()[k], `setP('${k}',this.value)`, st, u)).join('')}
    <p class="mute">You can change any target by hand. The next weekly update starts from what you set.</p>
    ${S.coach.history.length && !S.coach.history.at(-1).undone ? `<button class="sec mt" onclick="if(confirm('Go back to the targets before the last automatic update?'))undoTargets()">Undo last automatic update (${ukDate(S.coach.history.at(-1).date)})</button>` : ''}</div>
  <div class="card"><h2>Workouts</h2>
    ${num('Workout length, not counting rests', P().session, "setP('session',this.value)", 5, 'min')}
    ${num('Total time in the gym, with rests', S.settings.totalCap || 60, "setS('totalCap',+this.value||60)", 5, 'min')}
    <p class="mute">Plans fit both. Smaller exercises are paired as supersets to save time; the big lifts keep full rest. Rebuild your plan to apply changes.</p>
    ${num('Default rest between sets', S.settings.restDefault, "setS('restDefault',+this.value||'')", 15, 'sec')}
    <p class="mute">Blank uses a sensible rest for each exercise (longer for big lifts).</p>
    <label>Week split</label><select onchange="S.profile.split=this.value;S.profile.splitDays=(P().days||[]).length;save();render()">${Object.entries(SPLITS).map(([v, o]) => `<option value="${v}" ${(P().split || defaultSplit((P().days || []).length)) === v ? 'selected' : ''}>${o.label}</option>`).join('')}</select>
    <label>Stick with each plan for</label><select onchange="setS('planWeeks',+this.value);if(S.plan)S.plan.weeks=+this.value;save()">${[4, 5, 6].map(n => `<option value="${n}" ${(+S.settings.planWeeks || 6) === n ? 'selected' : ''}>${n} weeks</option>`).join('')}</select>
    ${tog('Start the rest timer when I tick a set', 'autoRest')}${tog('Sound when rest ends', 'sound')}${tog('Vibrate when rest ends (not on iPhone)', 'vibrate')}
    ${exs.length ? `<details class="more"><summary>Rest per exercise</summary>${exs.map(e => num(esc(e), restOf(e), `S.rest[${js(e)}]=+this.value||undefined;if(!S.rest[${js(e)}])delete S.rest[${js(e)}];save();render()`, 15, 'sec')).join('')}</details>` : ''}</div>
  <div class="card"><h2>AI coach (Claude)</h2><p class="mute">Coach chat and weekly advice use Claude Sonnet 5.5; meal photos and food lookups use Claude Haiku 5.5 (fractions of a penny each). Powers Ask coach and one-tap photo estimates. Get a key at console.anthropic.com. The key stays on this device only and is never in backups. Each send asks first, and costs pennies a month.</p>
    <input type="password" autocomplete="off" placeholder="${aiKey() ? 'Key saved: paste a new one to replace it' : 'sk-ant-…'}" onchange="setAiKey(this.value)" aria-label="Claude API key">
    ${aiKey() ? `<button class="link" onclick="if(confirm('Remove the API key from this device?'))setAiKey('')">Remove key</button>` : ''}
    <label class="chk"><input type="checkbox" ${S.settings.photoAuto !== false && S.settings.photoConsent ? 'checked' : ''} onchange="S.settings.photoAuto=this.checked;S.settings.photoConsent=this.checked;save()"> Estimate meal photos automatically</label></div>
  <div class="card"><h2>Reminders</h2>${tog('Show the weekly review on Sunday from 9 am', 'reminder')}
    <p class="mute">The review is built for you either way. Calendar reminder: Health → Weekly review.</p></div>
  <p class="mute center">App version ${typeof APP_V === 'undefined' ? '?' : new Date(+APP_V * 1000).toLocaleString('en-GB', {dateStyle: 'short', timeStyle: 'short'})}</p>
  <div class="card"><h2>More</h2><div class="grid2"><button class="sec" onclick="go('Profile')">Profile answers</button><button class="sec" onclick="go('Backup')">Backup &amp; restore</button>
    <button class="sec" onclick="go('Device')">Check this device</button><button class="sec" onclick="demo()">Load test data</button></div></div>`;
};

// ---------- Weekly coaching: what worked, what to improve, and how ----------
function weekStats(from) { // 7 days starting `from`
  const days = [...Array(7)].map((_, i) => dayOffset(i, from)), md = days.filter(d => S.meals.some(m => m.date === d)), tot = md.map(d => ({d, ...dayTotals(d)}));
  const av = (a, k) => a.length ? sum(a, k) / a.length : null, wknd = tot.filter(t => [0, 6].includes(new Date(t.d + 'T12:00').getDay())), wkdy = tot.filter(t => !wknd.includes(t));
  const best = {}; S.workouts.filter(w => days.includes(w.date) && +w.kg > 0).forEach(w => best[w.exercise] = Math.max(best[w.exercise] || 0, +w.kg));
  return {days, logged: md.length, full: tot.filter(t => t.kcal >= 1000).length, kcal: av(tot, 'kcal'), protein: av(tot, 'protein'), fibre: av(tot, 'fibre'),
    wknd: av(wknd, 'kcal'), wkdy: av(wkdy, 'kcal'), trained: new Set(S.workouts.filter(w => days.includes(w.date)).map(w => w.date)).size, best,
    sleep: av(S.sleep.filter(s => days.includes(s.date)), 'hours'), w: allWeights().filter(x => days.includes(x.date))};
}
function coachInsights(from) {
  const a = weekStats(from), b = weekStats(dayOffset(-7, from)), work = [], imp = [], T = P(), pct = (v, t) => v / t;
  const trend = (x, y, unit, label) => x != null && y != null && Math.round(x - y) ? ` (${x > y ? 'up' : 'down'} ${gb(Math.abs(Math.round(x - y)))} ${unit} on the week before)` : '';
  if (a.trained > b.trained && b.trained) work.push(`More workouts than the week before (${a.trained} vs ${b.trained}).`);
  const ups = Object.keys(a.best).filter(e => b.best[e] && a.best[e] > b.best[e]);
  if (ups.length) work.push(`Lifting more on ${ups.slice(0, 3).map(e => `${e} (${b.best[e]} → ${a.best[e]} kg)`).join(', ')}.`);
  if (a.logged >= 6) work.push(`Food logged ${a.logged} of 7 days. That's what makes your targets accurate.`);
  else if (a.logged < 5) imp.push({what: `Food logged on ${a.logged} of 7 days`, how: 'Use "Same again" on Today and "Copy yesterday" in Food. One tap counts. Logging a rough guess beats logging nothing.'});
  if (+T.kcal && a.kcal != null) {
    const r = pct(a.kcal, +T.kcal);
    if (r >= .9 && r <= 1.1) work.push(`Calories on target: avg ${gb(Math.round(a.kcal))} of ${gb(+T.kcal)} kcal${trend(a.kcal, b.kcal, 'kcal')}.`);
    else if (r > 1.1) imp.push({what: `Calories averaged ${gb(Math.round(a.kcal))}, ${gb(Math.round(a.kcal - T.kcal))} over target`, how: a.wknd != null && a.wkdy != null && a.wknd - a.wkdy > 300 ? `Weekends ran ${gb(Math.round(a.wknd - a.wkdy))} kcal higher than weekdays. Pick your weekend meals from the meal plan on Friday so it's decided already.` : 'Log the meal before you eat it, so you see the number first. Swap one snack a day for fruit or Greek yoghurt.'});
    else imp.push({what: `Calories averaged ${gb(Math.round(a.kcal))}, well under target`, how: 'Eating far under target makes sticking with it harder. Add a planned snack, or check you are logging everything.'});
  }
  if (+T.protein && a.protein != null) {
    if (a.protein >= T.protein * .9) work.push(`Protein on target: avg ${Math.round(a.protein)} g${trend(a.protein, b.protein, 'g')}.`);
    else imp.push({what: `Protein averaged ${Math.round(a.protein)} g of ${T.protein} g`, how: `Add a protein food to every meal: eggs or Greek yoghurt at breakfast, chicken or tuna at lunch. A shake covers ~24 g.`});
  }
  if (+T.fibre && a.fibre != null) {
    if (a.fibre >= T.fibre * .9) work.push(`Fibre on target: avg ${Math.round(a.fibre)} g${trend(a.fibre, b.fibre, 'g')}.`);
    else imp.push({what: `Fibre averaged ${Math.round(a.fibre)} g of ${T.fibre} g`, how: 'Easiest wins: porridge for breakfast (~4 g), beans or lentils with one meal (~7 g), wholemeal bread, berries. Add fibre gradually with plenty of water.'});
  }
  const plannedN = Object.keys(S.week.days).length;
  if (plannedN && a.trained < plannedN) imp.push({what: `${a.trained} of ${plannedN} planned workouts`, how: 'Short on time? Do just the first two exercises: a short session still counts. Or accept the proposal below to move a session to a better day.'});
  if (a.sleep != null && a.sleep < 7) imp.push({what: `Sleep averaged ${fmtHours(a.sleep)}`, how: 'Pick a fixed bedtime and set a phone alarm 30 minutes before it as your cue to wind down.'});
  else if (a.sleep >= 7) work.push(`Sleep averaged ${fmtHours(a.sleep)}.`);
  if (a.w.length && b.w.length) { const d = a.w.at(-1).kg - b.w.at(-1).kg, g = +T.goalWeight;
    if (g && Math.sign(d) === Math.sign(g - b.w.at(-1).kg) && Math.abs(d) >= .1) work.push(`Weight moved ${Math.abs(d).toFixed(1)} kg towards your goal.`);
    else if (g) imp.push({what: `Weight didn't move towards your goal this week (${d >= 0 ? '+' : ''}${d.toFixed(1)} kg)`, how: 'One week is noisy (water, salt, timing). Keep logging. If auto-targets are on, they will adjust after your next weigh-in.'}); }
  else if (!a.w.length) imp.push({what: 'No weigh-in this week', how: `Weigh on ${S.settings.weighDay || 'Mon'} morning: the box appears on Today. Targets can't update without it.`});
  return {work, imp: imp.slice(0, 4)};
}

// ---------- complete today's diary (like MyFitnessPal) ----------
const mainMeals = d => ['Breakfast', 'Lunch', 'Dinner'].every(sl => S.meals.some(m => m.date === d && slotOf(m) === sl));
const dayDone = d => !!S.done?.[d] || mainMeals(d); // ticked by the button, or automatically once breakfast, lunch and dinner are logged
const completeBtn = (d = today()) => !S.done?.[d] && mainMeals(d)
  ? `<div class="donebar">✓ Breakfast, lunch and dinner logged: day complete</div>`
  : S.done?.[d]
  ? `<div class="donebar">✓ Diary complete for today <button class="link" style="width:auto" onclick="delete S.done['${d}'];save();render()">Reopen</button></div>`
  : `<button class="mt" onclick="completeDay('${d}')">✓ Complete today's entry</button>`;
function completeDay(d = today()) {
  const eaten = dayTotals(d).kcal, w = allWeights().at(-1), tdee = S.coach.tdee || (w ? w.kg * 30 : 0);
  if (!eaten && !confirm('Nothing logged today. Mark it complete anyway?')) return;
  (S.done ||= {})[d] = true; save(); render();
  if (eaten && eaten < 1000) toastMsg(`Done ✓ Only ${gb(eaten)} kcal logged. If you missed anything, tap Reopen and add it.`);
  else if (w && tdee && eaten) { const in5 = w.kg - (tdee - eaten) * 35 / KCAL_PER_KG;
    toastMsg(`Done ✓ If every day were like today, you'd weigh about ${in5.toFixed(1)} kg in 5 weeks.`); }
  else toastMsg('Done ✓ Day completed.');
}
