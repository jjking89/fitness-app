// ===== Claude: "Ask coach" chat and photo meal estimates =====
// The API key lives in its own localStorage entry on this device only. It is never in backups or exports.
// Every send asks first. Private health is left out unless the user ticks it for that message.
const AI_KEY = 'fitness-ai-key', AI_MODEL = 'claude-opus-5-5';
const aiKey = () => { try { return localStorage.getItem(AI_KEY) || ''; } catch { return ''; } };
function setAiKey(v) { try { v.trim() ? localStorage.setItem(AI_KEY, v.trim()) : localStorage.removeItem(AI_KEY); } catch {} render(); }

// Raw fetch: this app has no build step to bundle the SDK.
async function claude(system, content, maxTokens = 4000) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {method: 'POST', headers: {
    'content-type': 'application/json', 'x-api-key': aiKey(), 'anthropic-version': '2026-10-21',
    'anthropic-dangerous-direct-browser-access': 'true', 'anthropic-beta': 'server-side-fallback-2026-07-01'},
    body: JSON.stringify({model: AI_MODEL, max_tokens: maxTokens, fallbacks: 'default', system, messages: content})});
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(res.status === 401 ? 'The API key was rejected. Check it in Settings.' : res.status === 429 ? 'Too many requests. Try again in a minute.' : j.error?.message || `Error ${res.status}`);
  if (j.stop_reason === 'refusal') throw new Error("Claude declined that request. Try rephrasing it.");
  return j.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
}

const COACH_RULES = `You are a friendly, practical personal trainer and nutrition coach inside a private fitness app. The user finds motivation hard and wants the app to do as much as possible for them, so give short, specific, doable next steps (one to three), in UK English with metric units. Be encouraging without being cheesy.
Hard limits: never diagnose, never reassure about symptoms, and never say the user is cleared or safe to exercise. For chest discomfort, palpitations, light-headedness or anything worrying, tell them to contact their care team, NHS 111, or 999 in an emergency. Never advise changing a medication dose or taking a catch-up dose. Don't set heart-rate zones or training intensity from heart test results, scale readings or personal records; the care team decides those. Body-composition scale values are estimates; don't use them for calorie targets. Where the user's care team has given guidance, it comes first.`;

function coachContext(withHealth) {
  const w = allWeights().slice(-6).map(x => `${x.date}: ${x.kg} kg`).join(', ') || 'none';
  const days = [...Array(7)].map((_, i) => dayOffset(i - 7)).map(d => { const t = dayTotals(d); return t.n ? `${d}: ${gb(t.kcal)} kcal, P ${Math.round(t.protein)} g, C ${Math.round(t.carbs)} g, F ${Math.round(t.fat)} g, fibre ${Math.round(t.fibre || 0)} g` : `${d}: not logged`; }).join('\n');
  const wo = [...new Set(S.workouts.filter(x => x.date >= dayOffset(-14)).map(x => `${x.date} ${x.exercise}`))].slice(-30).join('; ') || 'none';
  const T = P(), L = [`Today: ${today()}`, `Goal: ${T.goal || 'not set'}; goal weight ${T.goalWeight || 'not set'} kg; pace ${T.kgPerWeek || 'default'} kg/week`,
    `Targets: ${T.kcal || '–'} kcal, protein ${T.protein || '–'} g, carbs ${T.carbs || '–'} g, fat ${T.fat || '–'} g, fibre ${T.fibre || '–'} g`,
    `Experience: ${T.experience || '–'}; training days: ${(T.days || []).join?.(', ') || '–'}; session ${T.session || 45} min`,
    `Food likes: ${T.foodLike || '–'}; avoids: ${T.foodAvoid || '–'}; allergies: ${T.allergies || '–'}`,
    `Recent weights: ${w}`, `Last 7 days food:\n${days}`, `Exercises in the last 14 days: ${wo}`];
  if (withHealth) L.push(`Care-team guidance (dated notes): ${S.health.notes.filter(n => n.kind === 'guidance').map(n => `${n.date}: ${n.text}`).join(' | ') || 'none'}`,
    `Care-team constraints: avoid ${S.health.constraints.avoid || '–'}; heart rate ${S.health.constraints.hr || '–'}; intensity ${S.health.constraints.intensity || '–'}`, `Clinician guidance from profile: ${T.clinician || '–'}`);
  return L.join('\n');
}

// ---------- chat (kept in memory only: closing the app clears it) ----------
let chat = [], chatBusy = false, chatHealth = false;
async function askCoach(f) {
  const q = f.q.value.trim(); if (!q || chatBusy) return;
  if (!aiKey()) return go('Settings');
  if (!confirm(`Send your question and a summary of your last week (goal, targets, weights, food totals, exercises${chatHealth ? ', and your care-team notes' : ''}) to Anthropic's Claude?`)) return;
  chat.push({role: 'user', content: q}); chatBusy = true; render();
  try {
    const msgs = chat.map((m, i) => ({role: m.role, content: i === 0 ? `My data:\n${coachContext(chatHealth)}\n\nQuestion: ${m.content}` : m.content}));
    chat.push({role: 'assistant', content: await claude(COACH_RULES, msgs)});
  } catch (e) { chat.pop(); alert(e.message); }
  chatBusy = false; render();
}
screens.Coach = () => `<h1 class="xl">Ask coach</h1>
  ${aiKey() ? '' : `<div class="note">Add your Claude API key in Settings to use this. <button class="mt" onclick="go('Settings')">Open Settings</button></div>`}
  ${chat.length ? '' : `<div class="card"><p class="mute">Try one of these, or ask your own:</p>${['How did my week go, and what should I change?', 'Give me a high-protein, high-fibre dinner idea', "I can't be bothered to train today. Help."].map(s => `<button class="sec mt" onclick="document.getElementById('cq').value=${js(s)}">${esc(s)}</button>`).join('')}</div>`}
  ${chat.map(m => `<div class="card ${m.role === 'user' ? 'me' : ''}"><div class="mute">${m.role === 'user' ? 'You' : 'Coach'}</div><div style="white-space:pre-wrap">${esc(m.content)}</div></div>`).join('')}
  ${chatBusy ? '<p class="mute">Coach is thinking…</p>' : ''}
  <form class="card" onsubmit="event.preventDefault();askCoach(this)"><textarea id="cq" name="q" rows="2" placeholder="Ask anything about training or food"></textarea>
    <label class="chk"><input type="checkbox" ${chatHealth ? 'checked' : ''} onchange="chatHealth=this.checked"> Include my care-team notes</label>
    <button ${chatBusy ? 'disabled' : ''}>Send</button>${chat.length ? `<button type="button" class="link" onclick="chat=[];render()">New chat</button>` : ''}</form>
  <p class="mute">Claude can make mistakes. It is not medical advice. Chats aren't saved.</p>`;

// ---------- photo estimate ----------
let estBusy = false;
async function estimatePhoto() {
  const d = S.draft; if (!d?.photos.length || estBusy) return;
  if (!aiKey()) return go('Settings');
  if (!S.settings.photoConsent) { // asked once; turn off any time in Settings
    if (!confirm('Estimate meal photos automatically? Each photo (and anything you typed) is sent to Anthropic\'s Claude to work out the food and portions. Nothing else is sent. You can turn this off in Settings.')) return;
    S.settings.photoConsent = true; save(); }
  estBusy = true; render();
  try {
    const content = [...d.photos.map(ph => ({type: 'image', source: {type: 'base64', media_type: 'image/jpeg', data: ph.split(',')[1]}})),
      {type: 'text', text: CLAUDE_PROMPT + (d.text ? `\nThe user says: ${d.text}` : '') + '\nWork out portion weights yourself from visual cues (standard dinner plate about 26 cm, cutlery, cups, hands, packaging). Never ask the user to weigh. Include visible oil, butter, sauces and drinks. Use typical UK recipes, including Caribbean, Asian and takeaway dishes. If unsure of an item, still give your best guess.'}];
    const items = parsePasted(await claude('You estimate food portions and nutrition from photos for a UK fitness app. Reply only in the requested line format.', [{role: 'user', content}], 2000));
    if (!items.length) throw new Error("Couldn't read an estimate from the reply. Describe the meal instead.");
    d.items.push(...items); d.askedOil = true; // Claude already includes visible oil and sauces
  } catch (e) { alert(e.message); }
  estBusy = false; save(); render();
}

// ---------- unknown foods: ask Claude once, then remember the values on this device ----------
async function lookupUnknown() {
  const d = S.draft, unk = d?.items.filter(x => x.src === 'unknown'); if (!unk?.length || estBusy) return;
  if (!aiKey()) return go('Settings');
  if (!confirm(`Send ${unk.map(x => '"' + x.name + '"').join(', ')} (names and grams only) to Anthropic's Claude for typical UK values? They'll be remembered for next time.`)) return;
  estBusy = true; render();
  try {
    const reply = await claude('You give typical UK nutrition values for foods, restaurant dishes and takeaways (e.g. Nandos, Wagamama, Caribbean, Italian, Japanese, fast food). Reply only in the requested line format.',
      [{role: 'user', content: `For each food, give values for the stated grams, one line each, same order, no other text: name | grams | kcal | protein g | carbs g | fat g | fibre g
${unk.map(x => `${x.name} | ${x.grams}`).join('\n')}`}], 1500);
    const got = parsePasted(reply);
    unk.forEach((x, i) => { const g = got[i]; if (!g) return;
      Object.assign(x, {per100: g.per100, src: 'paste', fam: x.fam || ''});
      S.foods = (S.foods || []).filter(f => f[0][0] !== x.name.toLowerCase()); S.foods.push([[x.name.toLowerCase()], x.name, '', g.per100, x.grams, x.grams, true]); });
    if (!got.length) throw new Error("Couldn't read values from the reply. Add packet values instead.");
  } catch (e) { alert(e.message); }
  estBusy = false; save(); render();
}
