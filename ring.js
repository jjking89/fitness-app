// ===== Smart ring (sleep): wired up, not connected yet =====
// Sleep entries can carry ring fields. A live connection plugs in later through RING.sync().
// Ring heart data is for your own records only: it never sets training intensity or targets.
const RING_FIELDS = [['score', 'Sleep score', ''], ['deep', 'Deep', 'h'], ['rem', 'REM', 'h'], ['light', 'Light', 'h'], ['hrv', 'HRV', 'ms'], ['rhr', 'Resting HR', 'bpm']];
const RING = {
  brands: ['Oura', 'Ultrahuman', 'RingConn', 'Samsung Galaxy Ring', 'Other'],
  connected: () => false, // ponytail: no live API yet; add OAuth + fetch here when the ring arrives
  async sync() { throw new Error('Ring connection is not set up yet. Use Import sleep CSV for now.'); },
};
const sleepExtras = x => RING_FIELDS.filter(([k]) => x[k] !== undefined && x[k] !== '').map(([k, l, u]) => `${l} ${x[k]}${u ? ' ' + u : ''}`).join(' · ');
// CSV with a header row. Recognised columns: date, bedtime/bed, wake/waketime, hours/duration, score, deep, rem, light, hrv, rhr/resting_hr
let ringPreview = null;
function readSleepCsv(input) {
  const f = input.files[0]; input.value = ''; if (!f) return;
  f.text().then(t => {
    const [head, ...rows] = t.trim().split(/\r?\n/).map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
    const col = (...names) => head.findIndex(h => names.includes(h.toLowerCase().replace(/[\s-]+/g, '_')));
    const C = {date: col('date', 'day'), bed: col('bed', 'bedtime', 'bedtime_start'), wake: col('wake', 'waketime', 'bedtime_end'), hours: col('hours', 'duration', 'total_sleep'),
      score: col('score', 'sleep_score'), deep: col('deep'), rem: col('rem'), light: col('light'), hrv: col('hrv', 'average_hrv'), rhr: col('rhr', 'resting_hr', 'lowest_heart_rate')};
    if (C.date < 0) return alert('No "date" column found. The first row must be column names, e.g. date,hours,deep,rem,hrv,rhr');
    const have = new Set(S.sleep.map(s => s.date + '|' + (s.source || '')));
    const src = S.settings.ringBrand || 'Ring';
    const out = rows.map(r => { const v = k => C[k] >= 0 ? r[C[k]] : ''; const e = {id: uid(), date: v('date').slice(0, 10), source: src, bed: v('bed').slice(-5), wake: v('wake').slice(-5)};
      e.hours = +v('hours') || (e.bed && e.wake ? sleepHours(e.bed, e.wake) : '');
      RING_FIELDS.forEach(([k]) => { if (v(k) !== '') e[k] = +v(k) || v(k); }); return e; }).filter(e => /^\d{4}-\d{2}-\d{2}$/.test(e.date));
    ringPreview = {rows: out.filter(e => !have.has(e.date + '|' + src)), dupes: out.filter(e => have.has(e.date + '|' + src)).length};
    render();
  });
}
function ringCard() {
  const last7 = S.sleep.filter(s => s.date >= dayOffset(-7)), avg = k => { const v = last7.map(s => +s[k]).filter(Boolean); return v.length ? n1(v.reduce((a, b) => a + b, 0) / v.length) : null; };
  return `<div class="card"><h2>Smart ring</h2>
    <label>Ring</label><select onchange="S.settings.ringBrand=this.value;save();render()"><option value="">Not chosen</option>${RING.brands.map(b => `<option ${S.settings.ringBrand === b ? 'selected' : ''}>${b}</option>`).join('')}</select>
    <p class="mute">Status: <b>${RING.connected() ? 'connected' : 'not connected yet'}</b>. A live connection will come later. Until then, export sleep data from your ring's app as CSV and import it here.</p>
    <div class="grid2"><button class="sec" disabled>Connect ring (coming soon)</button><button class="sec" onclick="document.getElementById('sleepCsv').click()">Import sleep CSV</button></div>
    <input type="file" id="sleepCsv" accept=".csv,text/csv" hidden onchange="readSleepCsv(this)">
    ${ringPreview ? `<div class="note mt"><b>Preview:</b> ${ringPreview.rows.length} new night(s), ${ringPreview.dupes} already imported (skipped).
      <ul>${ringPreview.rows.slice(0, 5).map(e => `<li>${ukDate(e.date)} · ${fmtHours(+e.hours)}<br><span class="mute">${sleepExtras(e)}</span></li>`).join('')}</ul>
      <div class="grid2"><button onclick="S.sleep.push(...ringPreview.rows);ringPreview=null;save();render()" ${ringPreview.rows.length ? '' : 'disabled'}>Import</button><button class="sec" onclick="ringPreview=null;render()">Cancel</button></div></div>` : ''}
    ${last7.length ? `<h3>Last 7 nights</h3><div class="grid3">${[['Sleep', avg('hours'), 'h'], ['Deep', avg('deep'), 'h'], ['REM', avg('rem'), 'h'], ['HRV', avg('hrv'), 'ms'], ['Resting HR', avg('rhr'), 'bpm'], ['Score', avg('score'), '']].map(([l, v, u]) => `<div><div class="mute">${l}</div><b>${v ?? '–'}</b> ${v != null ? u : ''}</div>`).join('')}</div>` : ''}
    <p class="mute">Heart readings from the ring are for your records. They never set training intensity or targets; your care team decides those.</p></div>`;
}
