// ===== Training: gyms & inventory, routine generator, routines, weekly planner, live workout, rest timer =====
const EQUIP = ['Barbell', 'Squat rack', 'Flat bench', 'Adjustable bench', 'Dumbbells', 'Kettlebells', 'Cable machine', 'Lat pulldown', 'Seated row machine',
  'Leg press', 'Leg extension', 'Leg curl', 'Chest press machine', 'Shoulder press machine', 'Smith machine', 'Pull-up bar', 'Resistance bands', 'Treadmill', 'Rowing machine', 'Exercise bike'];
// Generic exercise library: [name, muscle group, equipment needed, default rest in seconds]
const LIB = [
  ['Barbell back squat', 'Legs', ['Barbell', 'Squat rack'], 150], ['Goblet squat', 'Legs', ['Dumbbells'], 90], ['Leg press', 'Legs', ['Leg press'], 120],
  ['Smith machine squat', 'Legs', ['Smith machine'], 120], ['Bodyweight split squat', 'Legs', [], 60], ['Leg extension', 'Legs', ['Leg extension'], 60],
  ['Romanian deadlift', 'Hamstrings', ['Barbell'], 120], ['Dumbbell Romanian deadlift', 'Hamstrings', ['Dumbbells'], 90], ['Leg curl', 'Hamstrings', ['Leg curl'], 60], ['Kettlebell swing', 'Hamstrings', ['Kettlebells'], 60], ['Glute bridge', 'Hamstrings', [], 60],
  ['Barbell bench press', 'Chest', ['Barbell', 'Flat bench'], 150], ['Dumbbell bench press', 'Chest', ['Dumbbells', 'Flat bench'], 90], ['Chest press machine', 'Chest', ['Chest press machine'], 90], ['Push-up', 'Chest', [], 60], ['Cable fly', 'Chest', ['Cable machine'], 60],
  ['Lat pulldown', 'Back', ['Lat pulldown'], 90], ['Pull-up', 'Back', ['Pull-up bar'], 120], ['Seated cable row', 'Back', ['Seated row machine'], 90], ['One-arm dumbbell row', 'Back', ['Dumbbells', 'Flat bench'], 90], ['Band row', 'Back', ['Resistance bands'], 60],
  ['Overhead press', 'Shoulders', ['Barbell'], 120], ['Seated dumbbell press', 'Shoulders', ['Dumbbells', 'Adjustable bench'], 90], ['Shoulder press machine', 'Shoulders', ['Shoulder press machine'], 90], ['Lateral raise', 'Shoulders', ['Dumbbells'], 60], ['Cable lateral raise', 'Shoulders', ['Cable machine'], 60],
  ['Dumbbell curl', 'Arms', ['Dumbbells'], 60], ['Cable triceps pushdown', 'Arms', ['Cable machine'], 60], ['Band curl', 'Arms', ['Resistance bands'], 60],
  ['Incline dumbbell press', 'Chest', ['Dumbbells', 'Adjustable bench'], 90], ['Dumbbell fly', 'Chest', ['Dumbbells', 'Flat bench'], 60], ['Face pull', 'Shoulders', ['Cable machine'], 60],
  ['Hammer curl', 'Arms', ['Dumbbells'], 60], ['Overhead triceps extension', 'Arms', ['Dumbbells'], 60], ['Plank', 'Core', [], 45],
];
const libOf = n => LIB.find(l => l[0] === n) || [n, 'Other', [], 90];
const gym = () => S.gyms.find(g => g.id == S.gymId) || S.gyms[0];
const restOf = n => +(S.rest[n] ?? (+S.settings.restDefault || libOf(n)[3]));
const prefTag = n => ({like: ' 👍', dislike: ' 👎', avoid: ' ⛔'}[S.prefs[n]] || '');
const fmtTime = s => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
const exOptions = (sel = '') => `<option value="">Choose exercise…</option>` + LIB.map(l => `<option ${l[0] === sel ? 'selected' : ''}>${esc(l[0])}</option>`).join('') + (sel && !LIB.some(l => l[0] === sel) ? `<option selected>${esc(sel)}</option>` : '');
const prefSelect = n => `<select onchange="S.prefs[${js(n)}]=this.value;save()" style="width:auto;padding:8px" aria-label="Preference for ${esc(n)}">${['', 'like', 'dislike', 'avoid'].map(o => `<option value="${o}" ${(S.prefs[n] || '') === o ? 'selected' : ''}>${o || '—'}</option>`).join('')}</select>`;
const latestGuidance = () => S.health.notes.filter(n => n.kind === 'guidance').sort(byDateDesc)[0];

// ---------- what you're willing and able to do ----------
const terms = txt => has(txt) ? String(txt).toLowerCase().split(/[,;\n]+/).map(s => s.trim()).filter(s => s.length > 2) : [];
const avoidTerms = () => [...terms(P().equipAvoid), ...terms(S.health.constraints.avoid)];
const equipOk = (g, ex) => { const ok = new Set(g.equipment.filter(e => e.status === 'available').map(e => e.name)); return libOf(ex)[2].every(e => ok.has(e)); };
function willing(ex) {
  const l = libOf(ex), words = avoidTerms();
  if (S.prefs[ex] === 'avoid' || l[2].some(e => S.prefs[e] === 'avoid')) return false;
  return !words.some(w => ex.toLowerCase().includes(w) || l[2].some(e => e.toLowerCase().includes(w)));
}
const likeScore = n => S.prefs[n] === 'like' || terms(P().equipLike).some(w => [n, ...libOf(n)[2]].some(x => x.toLowerCase().includes(w) || w.includes(x.toLowerCase()))) ? 0 : S.prefs[n] === 'dislike' ? 2 : 1;
function candidates(group, g, exclude = []) {
  return LIB.filter(l => l[1] === group && !exclude.includes(l[0]) && equipOk(g, l[0]) && willing(l[0]))
    .sort((a, b) => likeScore(a[0]) - likeScore(b[0]) || b[3] - a[3]).map(l => l[0]);
}
const alternatives = ex => candidates(libOf(ex)[1], gym(), [ex]);

// ---------- Routine generator: compound lifts first, time-capped ----------
// Evidence-based defaults: 1–2 big compound lifts first while fresh (heavier, longer rest), then 3–4 accessories
// (moderate reps, short rest), each muscle trained about twice a week, sets taken close to failure (1–3 reps in reserve).
const COMPOUND = new Set(['Barbell back squat', 'Goblet squat', 'Leg press', 'Smith machine squat', 'Romanian deadlift', 'Dumbbell Romanian deadlift',
  'Barbell bench press', 'Dumbbell bench press', 'Chest press machine', 'Lat pulldown', 'Pull-up', 'Seated cable row', 'One-arm dumbbell row',
  'Overhead press', 'Seated dumbbell press', 'Shoulder press machine']);
const isCompound = n => COMPOUND.has(n);
// experience: [compound sets, compound reps, compound rest s, accessory sets, accessory reps, accessory rest s]
const VOLUME = {'New to it': [3, '8–10', 120, 2, '10–15', 60], 'Under 1 year': [3, '6–10', 150, 3, '10–12', 60], '1–3 years': [4, '5–8', 150, 3, '8–12', 60], '3+ years': [4, '5–8', 180, 3, '8–12', 60]};
const WARMUP = 5, WORK_MIN = 1.25, MOVE_MIN = 1.5; // minutes: warm-up, one working set incl. loading/setup, moving between stations
// Supersets: accessory pairs done back to back ('a' then 'b'); rest only after the 'b' exercise.
const restMin = items => items.reduce((t, i) => t + (i.ss === 'a' ? 0 : (i.sets - 1) * i.rest / 60), 0);
function estMinutes(items, skipOptional = false) { // total time, rests included
  const it = items.filter(i => !(skipOptional && i.optional));
  return Math.round(WARMUP + it.reduce((t, i) => t + i.sets * WORK_MIN + (i.ss === 'b' ? .5 : MOVE_MIN), 0) + restMin(it));
}
const liftMinutes = items => Math.round(estMinutes(items) - restMin(items)); // warm-up, sets and moving, no rests
const timeLabel = items => `~${liftMinutes(items)} min workout · ~${estMinutes(items)} min with rests`;
const accRank = n => (isCompound(n) ? 1 : 0) + (libOf(n)[2].every(e => e === 'Resistance bands') ? 2 : 0);
const totalCap = () => +S.settings.totalCap || 60;
// Movement patterns, best "whole muscle" choice first. A body part = one main movement + one that finishes it off
// (e.g. flat press hits the whole chest, a fly adds the stretch). Max 2–3 exercises per body part in a session.
const PAT = {
  press: ['Barbell bench press', 'Dumbbell bench press', 'Chest press machine', 'Incline dumbbell press', 'Push-up'], fly: ['Cable fly', 'Dumbbell fly'],
  vpull: ['Lat pulldown', 'Pull-up'], row: ['Seated cable row', 'One-arm dumbbell row', 'Band row'],
  ohp: ['Seated dumbbell press', 'Shoulder press machine', 'Overhead press'], lateral: ['Lateral raise', 'Cable lateral raise'], rear: ['Face pull'],
  curl: ['Dumbbell curl', 'Hammer curl', 'Band curl'], tri: ['Cable triceps pushdown', 'Overhead triceps extension'],
  squat: ['Barbell back squat', 'Leg press', 'Smith machine squat', 'Goblet squat', 'Bodyweight split squat'], quad: ['Leg extension', 'Bodyweight split squat'],
  hinge: ['Romanian deadlift', 'Dumbbell Romanian deadlift', 'Kettlebell swing', 'Glute bridge'], ham: ['Leg curl', 'Glute bridge'],
  lunge: ['Bodyweight split squat', 'Goblet squat'], core: ['Plank'],
};
// Session templates. 'H:x' = heavy main lift (full rest); [x, y] = superset; trailing '*' = optional.
const TEMPLATES = {
  Upper: ['H:press', 'H:row', ['vpull', 'ohp'], ['fly', 'lateral'], ['curl*', 'tri*']],           // chest 2 · back 2 · shoulders 2 · arms 2
  Lower: ['H:squat', 'H:hinge', ['quad', 'ham'], ['lunge*', 'core*']],                             // quads 2–3 · hamstrings/glutes 2 · core
  'Full body A': ['H:squat', 'H:press', ['row', 'lateral'], ['ham', 'tri*']],
  'Full body B': ['H:hinge', 'H:vpull', ['ohp', 'quad'], ['fly', 'curl*']],
};
const SPLITS = {
  ul: {label: 'Upper body / Lower body', names: ['Upper', 'Lower']},
  fb: {label: 'Full body each session', names: ['Full body A', 'Full body B']},
};
const defaultSplit = n => n === 3 ? 'fb' : 'ul';
function pickFor(pat, g, used, prev) {
  const all = (PAT[pat] || []).filter(x => !used.includes(x) && equipOk(g, x) && willing(x)).sort((x, y) => likeScore(x) - likeScore(y)); // stable: keeps best-first order within like groups
  return [...all.filter(x => !prev.includes(x)), ...all.filter(x => prev.includes(x))];
}
function buildRoutine(name, slots, g, limit, prev = []) {
  const [cs, cr, crest, as, ar, arest] = VOLUME[P().experience] || VOLUME['Under 1 year'], used = [], items = [], missing = [];
  const make = (slot, ss) => {
    const optional = slot.endsWith('*'), heavy = slot.startsWith('H:'), pat = slot.replace(/^H:|[*]$/g, ''), c = pickFor(pat, g, used, prev);
    if (!c.length) { missing.push(pat); return null; }
    used.push(c[0]);
    return heavy ? {ex: c[0], sets: cs, reps: cr, rest: crest, alt: c[1] || '', optional: false, compound: true}
      : {ex: c[0], sets: optional ? 2 : as, reps: pat === 'core' ? '30–45 s' : ar, rest: arest, alt: c[1] || '', optional, ss};
  };
  for (const slot of slots) {
    if (Array.isArray(slot)) { const x = make(slot[0], 'a'), y = make(slot[1], 'b');
      if (x && y) { x.sets = y.sets = Math.min(x.sets, y.sets); items.push(x, y); } else for (const z of [x, y]) if (z) { z.ss = ''; items.push(z); } }
    else { const x = make(slot, ''); if (x) items.push(x); }
  }
  const over = () => liftMinutes(items) > limit || estMinutes(items) > totalCap();
  const partner = it => it.ss === 'a' ? items[items.indexOf(it) + 1] : it.ss === 'b' ? items[items.indexOf(it) - 1] : null;
  const bump = (it, d) => { it.sets += d; const p = partner(it); if (p) p.sets = it.sets; };
  const dropLast = () => { const l = items.pop(); if (l.ss === 'b') items.pop(); };
  // fit both caps: trim accessory sets (last first), then drop optional pairs, then the last accessory. Main lifts stay.
  for (let i = items.length - 1; over() && i >= 0; i--) if (!items[i].compound && items[i].sets > 2) { bump(items[i], -1); i = items.length; }
  while (over() && items.at(-1)?.optional) dropLast();
  while (over() && items.length > 4 && !items.at(-1).compound) dropLast();
  // use the time you have: add sets (accessories first, max 4; then main lifts, max 5) while both caps hold
  for (let grew = true; grew;) { grew = false;
    for (const it of [...items.filter(i => !i.compound && i.ss !== 'b'), ...items.filter(i => i.compound)]) {
      if (it.sets >= (it.compound ? 5 : 4)) continue;
      bump(it, 1); if (over()) bump(it, -1); else grew = true;
    } }
  return {id: uid(), name, items, missing, generated: true, gymId: g.id};
}
function generatePlan() {
  const g = gym(), days = Array.isArray(P().days) ? P().days : [], limit = +P().session || 45, sp = SPLITS[P().split] || SPLITS[defaultSplit(days.length)];
  const routines = []; for (const n of sp.names) routines.push(buildRoutine(n, TEMPLATES[n], g, limit, routines.flatMap(r => r.items.map(i => i.ex))));
  const week = {}; days.forEach((d, i) => week[d] = routines[i % routines.length].id);
  S.pending = {kind: 'training', routines, week, at: today()}; save();
}

// ---------- generate flow: confirm branch & days, fill gaps one question at a time, confirm inventory, review ----------
screens.Generate = () => {
  const p = P(), g = S.gyms[0];
  if (p.branch === undefined) return askHere('branch');
  if (!p.branchConfirmed) return `<h1>Before your first workout</h1><div class="card"><h2>Which Anytime Fitness branch do you attend?</h2>
    <p>${has(p.branch) ? `Saved: <b>${esc(p.branch)}</b>. Is that exactly right?` : 'No branch saved yet.'}</p>
    ${has(p.branch) ? `<button onclick="P().branchConfirmed=true;save();render()">Yes, that's my branch</button>` : ''}
    <button class="sec mt" onclick="editAnswer('branch','Generate')">${has(p.branch) ? 'Change branch' : 'Enter branch'}</button>
    ${!has(p.branch) ? `<button class="link mt" onclick="P().branchConfirmed=true;save();render()">Continue without a branch</button>` : ''}</div>`;
  if (!p.daysConfirmed) return `<h1>Before your first workout</h1><div class="card"><h2>How many days can you train?</h2>
    <p>${Array.isArray(p.days) ? `Saved: <b>${p.days.join(', ')}</b> (${p.days.length} days a week). Correct?` : 'No training days saved yet.'}</p>
    ${Array.isArray(p.days) ? `<button onclick="P().daysConfirmed=true;save();render()">Yes</button>` : ''}
    <button class="sec mt" onclick="editAnswer('days','Generate')">${Array.isArray(p.days) ? 'Change days' : 'Choose days'}</button></div>`;
  if (!p.split || p.splitDays !== p.days.length) { const n = p.days.length, rec = defaultSplit(n);
    return `<h1>How should your week be split?</h1><div class="card"><p class="mute">You train ${n} day${n === 1 ? '' : 's'} a week. Every session covers each body part with 2–3 exercises: a main lift for the whole muscle, plus one to finish it off.</p>
      ${Object.entries(SPLITS).map(([k, v]) => `<button class="${k === rec ? '' : 'sec'} mt" onclick="P().split='${k}';P().splitDays=${n};S.pending=null;save();render()">${v.label}${k === rec ? ' (recommended)' : ''}<br><span style="font-weight:400;font-size:14px">${k === 'ul' ? (n === 2 ? 'Day 1 full upper body: chest, back, shoulders, arms. Day 2 legs.' : 'Alternate upper and lower days.') : 'Each session hits legs, chest, back and shoulders.'}</span></button>`).join('')}</div>`; }
  for (const k of ['experience', 'equipLike', 'equipAvoid', 'clinician']) if (p[k] === undefined) return askHere(k);
  if (!g.confirmedAt) { S.gymId = g.id; return inventoryCheck(g, 'Generate'); }
  if (!S.pending || S.pending.kind !== 'training') generatePlan();
  return reviewPlan();
};
const askHere = k => { ivSingle = k; ivReturn = 'Generate'; return screens.Interview(); }; // ask one missing question inline
function inventoryCheck(g, back) {
  const unconf = g.equipment.filter(e => e.status === 'unconfirmed');
  return `<h1>Confirm equipment</h1><p class="mute">${esc(g.name)}</p>
  <div class="card"><h2>Official listing</h2>
    <div class="note">A generic Anytime Fitness equipment list does <b>not</b> confirm what is at your branch. Only tick what you have seen, or what the branch's own listing states.</div>
    <label for="lst">What the branch listing confirms (paste text or link, optional)</label><textarea id="lst" rows="3" onchange="gymById(${g.id}).listing=this.value;save()">${esc(g.listing)}</textarea></div>
  <div class="card"><h2>Tick what you've confirmed</h2><p class="mute">Ticked = available. Unticked items stay "unconfirmed" until you check them.</p>
    ${g.equipment.map((e, i) => `<label class="chk"><input type="checkbox" data-i="${i}" ${e.status === 'available' ? 'checked' : ''}> ${esc(e.name)}${e.status === 'unavailable' ? ' <span class="tag">unavailable</span>' : ''}</label>`).join('')}
    <button class="sec mt" onclick="gymPhotoFor=${g.id};gymPhotoIn.click()">📷 Add gym-floor photo (for your reference)</button>
    <p class="mute">Please take photos without other people in view. Photos stay on this device and aren't analysed — use them to tick the list.</p>
    ${g.photos.map(p => `<img class="thumb" src="${p}" alt="Gym floor photo"> `).join('')}
    <button class="mt" onclick="saveInventory(${g.id},'${back}')">Save confirmed inventory</button></div>
  ${unconf.length && g.confirmedAt ? `<div class="note">Still unclear: ${unconf.map(e => esc(e.name)).join(', ')}. Check these next visit.</div>` : ''}`;
}
const gymById = id => S.gyms.find(g => g.id == id);
function saveInventory(id, back) {
  const g = gymById(id);
  document.querySelectorAll('[data-i]').forEach(c => { const e = g.equipment[c.dataset.i]; if (c.checked) e.status = 'available'; else if (e.status === 'available') e.status = 'unconfirmed'; });
  g.confirmedAt = today(); S.pending = null; save();
  const left = g.equipment.filter(e => e.status === 'unconfirmed').map(e => e.name);
  if (left.length) alert(`Saved. Please verify these when you can: ${left.join(', ')}. Mark them available or unavailable under Gyms.`);
  go(back);
}
let gymPhotoFor = null;
gymPhotoIn.onchange = async () => { const f = gymPhotoIn.files[0]; gymPhotoIn.value = ''; if (!f) return; try { gymById(gymPhotoFor).photos.push(await shrinkImage(f, 640)); save(); render(); } catch { alert('Could not read that image.'); } };

function routineCard(r, g = gym()) {
  const flagged = r.items.filter(i => !equipOk(g, i.ex) || !willing(i.ex));
  return `<div class="card"><h2>${esc(r.name)}</h2><p class="mute">Estimated ${estMinutes(r.items)} min incl. ${WARMUP} min warm-up, rests and ${MOVE_MIN} min per station change${r.items.some(i => i.optional) ? ` · ${estMinutes(r.items, true)} min without the optional exercise` : ''}</p>
    <ul><li><span>Warm-up: 5 min easy cardio + 1–2 light sets of the first exercise</span></li>
    ${r.items.map(i => `<li><span><b>${esc(i.ex)}</b>${i.optional ? '<span class="tag">optional – skip if busy</span>' : ''}${!equipOk(g, i.ex) ? '<span class="tag warn">needs replacement here</span>' : ''}<br>
      <span class="mute">${i.sets} × ${esc(i.reps)} reps · rest ${i.rest} s${i.alt ? ' · alternative: ' + esc(i.alt) : ' · no alternative with confirmed equipment'}</span></span></li>`).join('')}</ul>
    ${r.missing?.length ? `<div class="note">No confirmed equipment or willing movement for: ${r.missing.join(', ')}. Confirm more equipment to fill these.</div>` : ''}
    ${flagged.length ? `<div class="note">${flagged.length} exercise(s) need replacing at ${esc(g.name)}.</div>` : ''}</div>`;
}
function guidanceBlock() {
  const gd = latestGuidance(), c = S.health.constraints;
  return `<div class="card"><h2>Clinician guidance</h2>${gd ? `<div class="note"><b>${ukDate(gd.date)}${gd.source ? ' · ' + esc(gd.source) : ''}:</b> ${esc(gd.text)}</div>` : has(P().clinician) ? `<div class="note">${esc(P().clinician)}</div>` : '<p class="mute">None recorded.</p>'}
    <p class="mute">Heart-rate zones: ${esc(c.hr) || 'blank'} · Intensity limits: ${esc(c.intensity) || 'blank'} · Movements to avoid: ${esc(c.avoid) || 'blank'}<br>Only fill these in Health from your care team. This app doesn't set intensity from scans, scale readings or personal records.</p></div>`;
}
function reviewPlan() {
  const p = S.pending, g = gym(), needsCheck = latestGuidance() || has(P().clinician);
  return `<h1>Review your plan</h1><p class="mute">${esc(g.name)} · ${P().session} min sessions · nothing is saved until you tap Save</p>
  ${guidanceBlock()}
  <div class="card"><h2>Week</h2><ul>${DAYS.map(d => `<li><span>${d}</span><span>${p.week[d] ? esc(p.routines.find(r => r.id === p.week[d]).name) : '<span class="mute">Rest</span>'}</span></li>`).join('')}</ul></div>
  ${p.routines.map(r => routineCard(r, g)).join('')}
  ${needsCheck ? `<label class="chk"><input type="checkbox" id="gchk"> I've checked this plan against my latest clinician guidance</label>` : ''}
  <button class="mt" onclick="applyTrainingPlan()">Save plan</button>
  <div class="grid2 mt"><button class="sec" onclick="S.pending=null;render()">Regenerate</button><button class="sec" onclick="S.pending=null;save();go('Training')">Cancel</button></div>`;
}
function applyTrainingPlan() {
  if (document.getElementById('gchk') && !gchk.checked) return alert('Please confirm you have checked the plan against your clinician guidance.');
  const p = S.pending;
  S.routines = S.routines.filter(r => !r.generated).concat(p.routines);
  S.week.days = p.week; S.plan = {start: today(), weeks: +S.settings.planWeeks || 6}; S.pending = null; save(); go('Training');
}

// ---------- routines: edit, import, adapt to gym ----------
let editingRoutine = null;
screens.Routine = () => {
  const r = S.routines.find(x => x.id == editingRoutine); if (!r) return '<p>Routine not found.</p>';
  const g = gym();
  return `<h1>Edit routine</h1><button class="sec" onclick="go('Training')">← Training</button>
  <div class="card mt"><label>Name</label><input value="${esc(r.name)}" onchange="curRoutine().name=this.value;save()">
    <p class="mute">Estimated ${estMinutes(r.items)} min at ${esc(g.name)}</p></div>
  ${r.items.map((i, k) => `<div class="card"><label>Exercise ${k + 1}${!equipOk(g, i.ex) ? ' <span class="tag warn">needs replacement here</span>' : ''}</label>
    <select onchange="rSet(${k},'ex',this.value)">${exOptions(i.ex)}</select>
    <div class="grid3 mt"><div><label>Sets</label><input type="number" inputmode="numeric" value="${i.sets}" onchange="rSet(${k},'sets',+this.value)"></div>
    <div><label>Reps</label><input value="${esc(i.reps)}" onchange="rSet(${k},'reps',this.value)"></div>
    <div><label>Rest s</label><input type="number" inputmode="numeric" value="${i.rest}" onchange="rSet(${k},'rest',+this.value)"></div></div>
    <label>Alternative</label><select onchange="rSet(${k},'alt',this.value)">${exOptions(i.alt)}</select>
    <label class="chk"><input type="checkbox" ${i.optional ? 'checked' : ''} onchange="rSet(${k},'optional',this.checked)"> Optional (skip if busy)</label>
    <div class="grid2 mt"><button class="sec" onclick="rMove(${k})" ${k ? '' : 'disabled'}>Move up</button><button class="sec" onclick="curRoutine().items.splice(${k},1);save();render()">Remove</button></div></div>`).join('')}
  <button class="sec" onclick="curRoutine().items.push({ex:'',sets:3,reps:'8–12',rest:90,alt:'',optional:false});save();render()">+ Add exercise</button>
  <button class="sec mt" onclick="adaptRoutine()">Adapt to ${esc(g.name)}</button>
  <button class="link mt" onclick="if(confirm('Delete this routine?')){S.routines=S.routines.filter(x=>x.id!=editingRoutine);for(const d in S.week.days)if(S.week.days[d]==editingRoutine)delete S.week.days[d];save();go('Training')}">Delete routine</button>`;
};
const curRoutine = () => S.routines.find(x => x.id == editingRoutine);
function rSet(k, f, v) { const i = curRoutine().items[k]; i[f] = v; if (f === 'ex' && v) { i.rest = restOf(v); i.alt = alternatives(v)[0] || ''; } save(); render(); }
function rMove(k) { const it = curRoutine().items; it.splice(k - 1, 0, it.splice(k, 1)[0]); save(); render(); }
function adaptRoutine() {
  const r = curRoutine(), g = gym(), changes = [];
  r.items.forEach((i, k) => { if (i.ex && (!equipOk(g, i.ex) || !willing(i.ex))) { const a = (i.alt && equipOk(g, i.alt) && willing(i.alt)) ? i.alt : alternatives(i.ex)[0]; changes.push([k, i.ex, a]); } });
  if (!changes.length) return alert(`Everything in this routine is available at ${g.name}.`);
  if (!confirm('Proposed changes:\n' + changes.map(([, a, b]) => `${a} → ${b || 'no replacement found'}`).join('\n') + '\n\nApply?')) return;
  changes.forEach(([k, , b]) => { if (b) Object.assign(r.items[k], {ex: b, rest: restOf(b), alt: alternatives(b).find(x => x !== b) || ''}); });
  save(); render();
}
screens.RoutineImport = () => `<h1>Import routine</h1><div class="card"><p class="mute">One exercise per line: <b>Exercise | sets | reps | rest seconds | alternative</b>. Add "optional" at the end to mark one as skippable.</p>
  <input id="riName" placeholder="Routine name"><textarea id="riText" rows="8" class="mt" placeholder="Leg press | 3 | 8–12 | 120 | Goblet squat"></textarea>
  <button class="mt" onclick="previewRoutineImport()">Preview</button></div><div id="riPrev"></div>`;
let riPending = null;
function previewRoutineImport() {
  const its = riText.value.split('\n').map(l => l.split('|').map(s => s.trim())).filter(p => p[0]).map(p => ({ex: p[0], sets: +p[1] || 3, reps: p[2] || '8–12', rest: +p[3] || restOf(p[0]), alt: p[4] && !/^optional$/i.test(p[4]) ? p[4] : '', optional: p.some(x => /^optional$/i.test(x))}));
  if (!its.length) return alert('Nothing to import.');
  riPending = {id: uid(), name: riName.value || 'Imported routine', items: its};
  riPrev.innerHTML = routineCard(riPending) + `<button onclick="S.routines.push(riPending);riPending=null;save();go('Training')">Save routine</button>`;
}

// ---------- weekly planner ----------
screens.Planner = () => `<h1 class="xl">Training</h1>${seg([['Routines', "go('Training')"], ['Planner', "go('Planner')"], ['Gyms', "go('Gyms')"]], 'Planner')}<h2>Weekly planner</h2>
  <div class="card mt"><p class="mute">Your days: ${Array.isArray(P().days) ? P().days.join(', ') : 'not set'} · ${P().session} min · ${esc(P().experience) || 'experience not set'}</p>
  <ul>${DAYS.map(d => `<li><span>${d}${Array.isArray(P().days) && P().days.includes(d) ? '' : ' <span class="mute">(not a usual day)</span>'}</span>
    <select style="width:auto" onchange="if(this.value)S.week.days['${d}']=+this.value;else delete S.week.days['${d}'];save();render()"><option value="">Rest</option>${S.routines.map(r => `<option value="${r.id}" ${S.week.days[d] == r.id ? 'selected' : ''}>${esc(r.name)} (${estMinutes(r.items)} min)</option>`).join('')}</select></li>`).join('')}</ul></div>
  ${guidanceBlock()}`;

// ---------- gyms ----------
screens.Gyms = () => {
  const g = gym();
  return `<h1 class="xl">Training</h1>${seg([['Routines', "go('Training')"], ['Planner', "go('Planner')"], ['Gyms', "go('Gyms')"]], 'Gyms')}<h2>Gyms</h2>
  <div class="card mt"><label>Gym</label><select onchange="S.gymId=+this.value;save();render()" ${S.active ? 'disabled' : ''}>${S.gyms.map(x => `<option value="${x.id}" ${x.id == g.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
    <label>Name</label><input value="${esc(g.name)}" onchange="gym().name=this.value;save()">
    <p class="mute">${g.confirmedAt ? 'Inventory confirmed ' + ukDate(g.confirmedAt) : 'Inventory not confirmed yet'}</p>
    <button class="sec" onclick="go('Inventory')">Confirm equipment (tick list / photos)</button>
    <div class="grid2 mt"><button class="sec" onclick="newGym()">+ New gym</button><button class="sec" onclick="delGym()">Delete gym</button></div></div>
  <div class="card"><h2>Equipment</h2><p class="mute">Status · your preference</p><ul>${g.equipment.map((e, i) => `<li><span>${esc(e.name)}${prefTag(e.name)}</span><span style="display:flex;gap:4px">
    <select onchange="gym().equipment[${i}].status=this.value;save()" style="width:auto;padding:8px" aria-label="Status of ${esc(e.name)}">${['available', 'unavailable', 'unconfirmed'].map(o => `<option ${e.status === o ? 'selected' : ''}>${o}</option>`).join('')}</select>${prefSelect(e.name)}</span></li>`).join('')}</ul>
    <form class="row mt" onsubmit="event.preventDefault();gym().equipment.push({name:this.n.value,status:'available'});save();render()"><input name="n" placeholder="Add equipment" required><button class="sec">Add</button></form></div>
  <div class="card"><h2>Exercise preferences</h2><ul>${LIB.map(l => `<li><span>${esc(l[0])}<br><span class="mute">${l[1]}</span></span>${prefSelect(l[0])}</li>`).join('')}</ul></div>`;
};
screens.Inventory = () => inventoryCheck(gym(), 'Gyms');
TAB_OF.Inventory = TAB_OF.RoutineImport = 'Training';
function newGym() { const name = prompt('Gym name'); if (!name) return; const g = {id: uid(), name, equipment: EQUIP.map(e => ({name: e, status: 'unconfirmed'})), listing: '', photos: [], confirmedAt: ''}; S.gyms.push(g); S.gymId = g.id; save(); render(); }
function delGym() { if (S.gyms.length < 2) return alert('Keep at least one gym.'); if (!confirm(`Delete ${gym().name}?`)) return; S.gyms = S.gyms.filter(g => g.id != gym().id); S.gymId = S.gyms[0].id; save(); render(); }

// ---------- live workout ----------
function lastTime(ex) {
  const prev = S.workouts.filter(w => w.exercise === ex && (!S.active || w.session !== S.active.id));
  if (!prev.length) return null;
  const last = prev.sort((a, b) => a.date < b.date ? -1 : 1).at(-1), key = last.session ?? last.date;
  return prev.filter(w => (w.session ?? w.date) === key);
}
function newItem(spec) {
  const s = typeof spec === 'string' ? {ex: spec, sets: 3, reps: '', rest: restOf(spec), alt: '', optional: false} : spec, lt = lastTime(s.ex);
  const sets = Array.from({length: Math.max(1, s.sets || 3)}, (_, j) => { const w = lt?.[Math.min(j, lt.length - 1)]; return {reps: w?.reps || '', kg: w?.kg || '', done: false, logId: null}; });
  if (s.rest) S.rest[s.ex] = s.rest;
  return {ex: s.ex, target: s.reps, alt: s.alt, optional: s.optional, ss: s.ss || '', note: '', sets};
}
function todaysRoutine() { const d = DAYS[(new Date().getDay() + 6) % 7]; return S.routines.find(r => r.id == S.week.days[d]); }
function startWorkout(routineId) {
  if (!S.active) {
    const r = S.routines.find(x => x.id == routineId) || todaysRoutine() || S.routines[0];
    S.active = {id: uid(), gymId: gym().id, date: today(), started: Date.now(), routine: r?.name || 'Quick workout', items: (r?.items || []).filter(i => i.ex).map(newItem)};
    save();
  }
  go('Training');
}
function finishWorkout() { if (!confirm('Finish workout? Unticked sets are discarded.')) return; S.active = null; S.timer = null; save(); render(); }
function setVal(i, j, k, v) {
  const s = S.active.items[i].sets[j]; s[k] = v;
  const w = s.logId && S.workouts.find(w => w.id == s.logId); if (w) w[k] = v;
  save(); if (w) render();
}
function setNote(i, v) { const it = S.active.items[i]; it.note = v; it.sets.forEach(s => { const w = s.logId && S.workouts.find(w => w.id == s.logId); if (w) w.note = v; }); save(); }
function toggleSet(i, j) {
  const it = S.active.items[i], s = it.sets[j];
  unlockAudio();
  if (s.done) { S.workouts = S.workouts.filter(w => w.id != s.logId); s.done = false; s.logId = null; }
  else {
    const w = {id: uid(), date: S.active.date, session: S.active.id, gymId: S.active.gymId, exercise: it.ex, reps: s.reps, kg: s.kg, note: it.note || ''};
    S.workouts.push(w); s.done = true; s.logId = w.id;
    const nx = S.active.items[i + 1];
    if (S.settings.autoRest && !(it.ss === 'a' && nx?.ss === 'b' && nx.sets.some(x => !x.done))) startTimer(restOf(it.ex), it.ex);
  }
  save(); render();
}
const addSet = i => { const ss = S.active.items[i].sets, l = ss.at(-1) || {}; ss.push({reps: l.reps || '', kg: l.kg || '', done: false, logId: null}); save(); render(); };
const addEx = ex => { if (ex) { S.active.items.push(newItem(ex)); save(); render(); } };
const removeItem = i => { if (confirm('Remove this exercise from today\'s workout? Logged sets are kept.')) { S.active.items.splice(i, 1); save(); render(); } };
let busyFor = null;
const swap = (i, ex) => { const old = S.active.items[i]; S.active.items[i] = newItem({ex, sets: old.sets.length, reps: old.target, rest: restOf(ex), alt: old.ex, optional: old.optional}); busyFor = null; save(); render(); };
function saveAsRoutine() {
  const name = prompt('Name this workout', S.active.routine); if (!name) return;
  S.routines.push({id: uid(), name, items: S.active.items.map(i => ({ex: i.ex, sets: i.sets.length, reps: i.target || '8–12', rest: restOf(i.ex), alt: i.alt || '', optional: !!i.optional}))});
  save(); alert('Saved as a reusable workout.');
}

// ---------- rest timer: saved as an absolute end time, so it's right after switching screens, reloading or waking the phone ----------
let actx;
function unlockAudio() { try { actx ||= new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch {} }
function cue() {
  if (S.settings.vibrate && navigator.vibrate) navigator.vibrate([300, 150, 300]);
  if (S.settings.sound && actx) try { [0, .35, .7].forEach(t => { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(actx.destination); g.gain.setValueAtTime(.3, actx.currentTime + t); o.start(actx.currentTime + t); o.stop(actx.currentTime + t + .2); }); } catch {}
}
function startTimer(sec, ex) { S.timer = {end: Date.now() + sec * 1000, left: null, ex, cued: false}; save(); tick(); }
const timeLeft = () => !S.timer ? 0 : S.timer.left != null ? S.timer.left : Math.ceil((S.timer.end - Date.now()) / 1000);
function timerCtl(a) {
  const t = S.timer; if (!t) return;
  if (a === 'pause') t.left = timeLeft();
  if (a === 'resume') { t.end = Date.now() + t.left * 1000; t.left = null; }
  if (a === 'plus') { if (t.left != null) t.left = Math.max(0, t.left) + 15; else t.end = Math.max(t.end, Date.now()) + 15000; t.cued = false; }
  if (a === 'reset') { const full = restOf(t.ex); S.timer = {end: Date.now() + full * 1000, left: t.left != null ? full : null, ex: t.ex, cued: false}; }
  if (a === 'skip') S.timer = null;
  save(); tick();
}
function tick() {
  const el = document.getElementById('timer'), t = S?.timer;
  if (!t) { el.style.display = 'none'; return; }
  const left = timeLeft(), over = left <= 0;
  if (over && !t.cued) { t.cued = true; save(); cue(); }
  el.style.display = 'block'; el.className = over ? 'over' : '';
  el.innerHTML = `<div class="mute" style="text-align:center">${over ? 'Rest over — next set' : t.left != null ? 'Paused' : 'Rest'} · ${esc(t.ex)}</div>
    <div class="t" role="timer">${over ? 'GO' : fmtTime(left)}</div><div class="row">
    ${over ? '' : t.left != null ? `<button onclick="timerCtl('resume')">Resume</button>` : `<button class="sec" onclick="timerCtl('pause')">Pause</button>`}
    <button class="sec" onclick="timerCtl('plus')">+15 s</button><button class="sec" onclick="timerCtl('reset')">Reset</button><button class="sec" onclick="timerCtl('skip')">${over ? 'Dismiss' : 'Skip'}</button></div>`;
}

// ---------- Training screen ----------
screens.Training = () => {
  if (S.active) return activeWorkout();
  const tr = todaysRoutine(), g = gym();
  return `<h1 class="xl">Training</h1>${seg([['Routines', "go('Training')"], ['Planner', "go('Planner')"], ['Gyms', "go('Gyms')"]], 'Routines')}<p class="mute">${P().session} min workouts, plus rests${Array.isArray(P().days) ? ' · ' + P().days.join(', ') : ''}</p>
  <div class="card"><label>Gym</label><select onchange="S.gymId=+this.value;save();render()">${S.gyms.map(x => `<option value="${x.id}" ${x.id == g.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
    <button class="sec mt" onclick="go('Gyms')">Gyms, equipment &amp; preferences</button></div>
  ${latestGuidance() || has(P().clinician) ? guidanceBlock() : ''}
  ${planCards(tr)}
  <div class="card"><h2>Rest timer</h2>
    <label class="chk"><input type="checkbox" ${S.settings.autoRest ? 'checked' : ''} onchange="S.settings.autoRest=this.checked;save()"> Start automatically when I tick a set</label>
    <label class="chk"><input type="checkbox" ${S.settings.sound ? 'checked' : ''} onchange="S.settings.sound=this.checked;save()"> Sound at end of rest</label>
    <label class="chk"><input type="checkbox" ${S.settings.vibrate ? 'checked' : ''} onchange="S.settings.vibrate=this.checked;save()"> Vibrate at end of rest (where supported)</label></div>
  <div class="card"><h2>Best lifts</h2><ul>${Object.entries(S.records).map(([e, r]) => `<li><span>${esc(e)}</span><span>${r.kg} kg × ${r.reps} · ${ukDate(r.date)}</span></li>`).join('') || '<li class="mute">None yet</li>'}</ul></div>
  <div class="card"><h2>Set history</h2><ul>${items('workouts', w => `${esc(w.exercise)} — ${w.reps || '?'} reps${w.kg ? ' @ ' + w.kg + ' kg' : ''}${w.note ? '<br><span class="mute">' + esc(w.note) + '</span>' : ''}`)}</ul></div>`;
};
const est1RM = r => r ? n1(r.kg * (1 + r.reps / 30)) : null; // Epley, from best logged set
const rbtn = (icon, label, act) => `<button class="rnd" onclick="${act}" aria-label="${label}">${ic(IC[icon])}</button>`;
function activeWorkout() {
  const a = S.active, curIdx = ssNext(a, a.items.findIndex(it => it.sets.some(s => !s.done))), mins = Math.round((Date.now() - a.started) / 60000);
  const ci = curIdx < 0 ? a.items.length - 1 : curIdx, cj = curIdx < 0 ? -1 : a.items[curIdx].sets.findIndex(s => !s.done), cex = a.items[ci]?.ex;
  return `<div class="wtop">${rbtn('back', 'Back to Today', "go('Today')")}<span></span>${rbtn('stats', 'Progress and best lifts', "go('Progress')")}${cex ? rbtn('swap', 'Equipment busy, show swaps', `busyFor=busyFor===${ci}?null:${ci};render()`) : ''}${rbtn('more', 'Save as reusable workout', 'saveAsRoutine()')}</div>
  <div class="wprog" aria-label="Exercise ${ci + 1} of ${a.items.length}">${a.items.map((_, i) => `<i class="${i < ci || curIdx < 0 ? 'done' : i === ci ? 'now' : ''}"></i>`).join('')}</div>
  <h1>${esc(a.routine)}</h1><p class="mute">${esc(gymById(a.gymId)?.name || '')} · ${mins} of ${P().session} min</p>
  ${a.items.map((it, i) => {
    const lt = lastTime(it.ex), pr = S.records[it.ex], alts = busyFor === i ? alternatives(it.ex) : null, rm = est1RM(pr);
    return `<div class="card ${i === curIdx ? 'cur' : ''}"><div class="exh"><h2>${i + 1}. ${esc(it.ex)}${prefTag(it.ex)}${it.optional ? '<span class="tag">optional</span>' : ''}</h2>${rm ? `<span class="rm">est. 1RM: ${gb(rm)}</span>` : ''}</div>
    <div class="mute">${it.ss ? `<span class="tag">superset ${it.ss === 'a' ? '1/2: then go straight to the next exercise' : '2/2: rest after this'}</span><br>` : ''}${it.target ? 'Target: ' + it.sets.length + ' × ' + esc(it.target) + ' · ' : ''}Last time: ${lt ? lt.map(w => `${w.reps || '?'}×${w.kg || 0}`).join(', ') + ' kg' : '—'}<br>Best: ${pr ? `${pr.kg} kg × ${pr.reps} (${ukDate(pr.date)})` : '—'}</div>
    ${it.sets.map((s, j) => `<div class="wset ${s.done ? 'done' : ''} ${i === curIdx && j === cj ? 'now' : ''}"><span class="badge ${s.warmup ? 'w' : ''}">${s.warmup ? 'W' : j + 1}</span>
      <label class="num"><input type="number" inputmode="decimal" step="0.5" value="${esc(s.kg)}" onchange="setVal(${i},${j},'kg',this.value)" aria-label="kg, set ${j + 1}"><small>kg</small></label>
      <label class="num"><input type="number" inputmode="numeric" value="${esc(s.reps)}" onchange="setVal(${i},${j},'reps',this.value)" aria-label="Reps, set ${j + 1}"><small>reps</small></label>
      <button class="chk" onclick="toggleSet(${i},${j})" aria-label="Set ${j + 1} complete" aria-pressed="${!!s.done}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg></button></div>`).join('')}
    <button class="addrow" onclick="addSet(${i})" aria-label="Add set">+</button>
    <input id="note${i}" placeholder="Notes (e.g. seat 4, felt easy)" value="${esc(it.note)}" onchange="setNote(${i},this.value)" class="mt">
    <div class="grid2 mt"><button class="sec" onclick="addSet(${i})">+ Set</button><button class="sec" onclick="busyFor=busyFor===${i}?null:${i};render()">Equipment busy</button></div>
    ${alts ? `<div class="mt">${alts.length ? alts.map(x => `<button class="sec mt" onclick="swap(${i},${js(x)})">Swap to ${esc(x)}${prefTag(x)}</button>`).join('') : '<p class="mute">No alternative with confirmed equipment at this gym. Mark equipment as available under Gyms.</p>'}</div>` : ''}
    <div class="row mt" style="align-items:center"><span class="mute" style="flex:2">Rest (s)</span><input type="number" inputmode="numeric" value="${restOf(it.ex)}" onchange="S.rest[${js(it.ex)}]=+this.value;save()" style="flex:1" aria-label="Rest seconds"><button class="sec" style="flex:1" onclick="unlockAudio();startTimer(restOf(${js(it.ex)}),${js(it.ex)})">Start rest</button></div>
    <button class="link mt" onclick="removeItem(${i})">${it.optional ? 'Skip this optional exercise' : 'Remove exercise'}</button></div>`;
  }).join('')}
  <select onchange="addEx(this.value)" aria-label="Add exercise">${exOptions()}</select>
  <button class="sec mt" onclick="saveAsRoutine()">Save as reusable workout</button>
  <button class="mt" onclick="finishWorkout()">Finish workout</button>
  <div class="wbar">${cex ? `<button class="sq sec" onclick="document.getElementById('note${ci}').focus()" aria-label="Notes">${ic(IC.edit)}</button><button class="sq sec" onclick="unlockAudio();startTimer(restOf(${js(cex)}),${js(cex)})" aria-label="Start rest timer">${ic(IC.clock)}</button>` : ''}
    <button class="pill" ${cj < 0 ? 'disabled' : `onclick="S.settings.autoRest||startTimer(restOf(${js(cex)}),${js(cex)});toggleSet(${ci},${cj})"`}>${cj < 0 ? 'All sets logged' : 'Log set'}</button></div>`;
}

// ---------- Jefit-style plan view: today's workout ready to go, the week's plan, and a manual section ----------
const exLine = i => { const s = typeof i === 'string' ? {ex: i} : i; return `<li class="exl"><span class="exn">${esc(s.ex)}${s.compound ? ' <span class="tag">compound</span>' : ''}${s.ss ? ` <span class="tag">superset ${s.ss === 'a' ? '1/2' : '2/2'}</span>` : ''}${s.optional ? ' <span class="tag">optional</span>' : ''}<br><span class="mute">${s.sets || 3} sets × ${esc(s.reps || '8–12')} reps · rest ${S.rest[s.ex] ?? s.rest ?? restOf(s.ex)} s</span></span></li>`; };
let openPlan = null;
function planCards(tr) {
  const gen = S.routines.filter(r => r.generated), dayOf = r => DAYS.filter(d => S.week.days[d] == r.id).join(', ');
  const hero = tr ? `<div class="card hero"><div class="mute">Today's workout${planTag()}</div><h2>${esc(tr.name)}</h2><p class="mute">${tr.items.length} exercises · ${timeLabel(tr.items)}</p>
      <ul>${tr.items.map(exLine).join('')}</ul><button class="mt" onclick="startWorkout(${tr.id})">Start workout</button></div>`
    : gen.length ? `<div class="card hero"><div class="mute">Today</div><h2>Rest day</h2><p class="mute">Nothing planned. Fancy a session anyway? Pick one below.</p></div>`
    : `<div class="card hero"><h2>Get a plan built for you</h2><p class="mute">Answer a few quick questions and I'll build your week: exercises, sets, reps and rest, timed to fit your session and your gym's equipment.</p><button class="mt" onclick="go('Generate')">Build my plan</button></div>`;
  const week = gen.length ? `<h3>Your plan</h3>${gen.map(r => `<div class="card"><div class="sec-h"><div><b>${esc(r.name)}</b><div class="mute">${dayOf(r) || 'Not on a day'} · ${r.items.length} exercises · ${timeLabel(r.items)}</div></div>
      <button class="link" style="width:auto" onclick="openPlan=openPlan===${r.id}?null:${r.id};render()">${openPlan === r.id ? 'Hide' : 'View'}</button></div>
      ${openPlan === r.id ? `<ul>${r.items.map(exLine).join('')}</ul>` : ''}<div class="grid2 mt"><button onclick="startWorkout(${r.id})">Start</button><button class="sec" onclick="editingRoutine=${r.id};go('Routine')">Edit</button></div></div>`).join('')}
      <button class="sec" onclick="rebuildPlan()">Rebuild my plan</button>` : '';
  const manual = `<h3>Manual</h3><div class="card"><p class="mute">Build your own, or just start and add exercises as you go.</p>
      ${act3([['Empty workout', 'plus', 'startWorkout()'], ['New routine', 'edit', "const r={id:uid(),name:'New routine',items:[]};S.routines.push(r);editingRoutine=r.id;save();go('Routine')"], ['Import', 'more', "go('RoutineImport')"]])}
      ${S.routines.filter(r => !r.generated).map(r => `<div class="sec-h"><span>${esc(r.name)}<br><span class="mute">${r.items.length} exercises · ~${estMinutes(r.items)} min</span></span><span style="white-space:nowrap"><button class="pill" onclick="startWorkout(${r.id})">Start</button> <button class="link" style="width:auto" onclick="editingRoutine=${r.id};go('Routine')">Edit</button></span></div>`).join('')}</div>`;
  return hero + week + manual;
}

// ---------- Progress → Training: workouts per week, best lifts, per-exercise trend ----------
let progEx = null;
function trainingProgress() {
  const weeks = [...Array(8)].map((_, i) => { const from = dayOffset(-7 * (7 - i) - ((new Date().getDay() + 6) % 7)); const days = [...Array(7)].map((_, j) => dayOffset(j, from)); return [from, new Set(S.workouts.filter(w => days.includes(w.date)).map(w => w.date)).size]; });
  const hi = Math.max(1, ...weeks.map(w => w[1])), exs = Object.keys(S.records).sort(), ex = progEx && S.records[progEx] ? progEx : exs[0];
  const sessions = ex ? Object.entries(S.workouts.filter(w => w.exercise === ex && +w.kg > 0).reduce((a, w) => (a[w.date] = Math.max(a[w.date] || 0, +w.kg), a), {})).sort() : [];
  const lo = sessions.length ? Math.min(...sessions.map(s => s[1])) : 0, top = sessions.length ? Math.max(...sessions.map(s => s[1])) : 1;
  const vol = S.workouts.filter(w => w.date >= dayOffset(-7)).reduce((a, w) => a + (+w.kg || 0) * (+w.reps || 0), 0);
  return `<div class="card insight">${ic(IC.bulb)}<p>${S.workouts.length ? `You lifted <b>${gb(Math.round(vol))} kg</b> in total over the last 7 days (weight × reps).` : 'Finish a workout and your progress shows up here.'}</p></div>
  <div class="card"><h2>Workouts per week</h2><div class="bars" role="img" aria-label="Workouts per week, last 8 weeks">${weeks.map(([d, n]) => `<div title="Week of ${ukDate(d)}: ${n}"><span class="mute">${n || ''}</span><i style="height:${n / hi * 100}%"></i><span class="mute">${+d.slice(8)}/${+d.slice(5, 7)}</span></div>`).join('')}</div></div>
  ${ex ? `<div class="card"><h2>Exercise progress</h2><select onchange="progEx=this.value;render()">${exs.map(e => `<option ${e === ex ? 'selected' : ''}>${esc(e)}</option>`).join('')}</select>
    ${sessions.length > 1 ? `<svg viewBox="0 0 300 100" style="width:100%" role="img" aria-label="Heaviest set per session for ${esc(ex)}"><polyline fill="none" stroke="var(--acc)" stroke-width="2.5" stroke-linejoin="round" points="${sessions.map(([, kg], i) => `${10 + i / (sessions.length - 1) * 280},${90 - (kg - lo) / Math.max(1, top - lo) * 75}`).join(' ')}"/>${sessions.map(([d, kg], i) => `<circle cx="${10 + i / (sessions.length - 1) * 280}" cy="${90 - (kg - lo) / Math.max(1, top - lo) * 75}" r="3.5" fill="var(--acc)"><title>${ukDate(d)}: ${kg} kg</title></circle>`).join('')}</svg>
      <p class="mute">${sessions[0][1]} kg → ${sessions.at(-1)[1]} kg over ${sessions.length} sessions</p>` : '<p class="mute">Log this exercise in two sessions to see a trend.</p>'}</div>` : ''}
  <div class="card"><h2>Best lifts</h2><ul>${exs.map(e => { const r = S.records[e]; return `<li><span>${esc(e)}<br><span class="mute">est. 1RM ${est1RM(r)} kg</span></span><span>${r.kg} kg × ${r.reps}<br><span class="mute">${ukDate(r.date)}</span></span></li>`; }).join('') || '<li class="mute">None yet</li>'}</ul></div>`;
}

// ---------- training blocks: stick with one plan for 4–6 weeks ----------
const planWeek = () => S.plan?.start ? Math.floor(daysBetween(S.plan.start, today()) / 7) + 1 : 0;
const planTag = () => S.plan?.start ? ` · week ${Math.min(planWeek(), S.plan.weeks)} of ${S.plan.weeks}` : '';
function rebuildPlan() {
  const w = planWeek();
  if (S.plan?.start && w < 4 && !confirm(`You're in week ${w} of ${S.plan.weeks}. Sticking with one plan for at least 4 weeks makes your progress clear. Rebuild anyway?`)) return;
  go('Generate');
}

// In a superset, once the 'a' exercise is ahead of its partner, the partner is next.
function ssNext(a, i) {
  const it = a.items[i], nx = a.items[i + 1], done = x => x.sets.filter(s => s.done).length;
  return it?.ss === 'a' && nx?.ss === 'b' && done(it) > done(nx) && nx.sets.some(s => !s.done) ? i + 1 : i;
}
