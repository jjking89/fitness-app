// ===== Your saved profile: one-tap save, easy restore, and a warning when you're in the wrong place =====
// iPhone keeps separate storage for the Home Screen app and for Safari tabs, and a re-added icon starts empty.
// So: (1) warn when the app is open in a Safari tab, (2) one-tap "Save my data" to Files/iCloud, (3) restore from a file or pasted text.
const PF_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
const pfInApp = () => navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
const pfHasData = () => !!(S.profile?.done || S.meals?.length || S.workouts?.length || S.weights?.length);
const pfDays = () => S.settings?.lastBackup ? daysBetween(S.settings.lastBackup, today()) : 999;

function pfBackupJSON() { const b = buildBackup(false); for (const m of b.meals || []) delete m.photo; delete b.draft; return JSON.stringify(b); } // photos left out to keep it small
async function pfSave() {
  const name = `fitness-profile-${today()}.json`, text = pfBackupJSON();
  try {
    const file = new File([text], name, {type: 'application/json'});
    if (navigator.canShare?.({files: [file]})) await navigator.share({files: [file], title: 'Fitness profile backup'});
    else download(name, text, 'application/json');
    S.settings.lastBackup = today(); save(); render(); toastMsg('Saved. Keep it in Files, iCloud Drive or OneDrive.');
  } catch (e) { if (e?.name !== 'AbortError') alert("Couldn't save: " + e.message); }
}
async function pfCopy() { try { await navigator.clipboard.writeText(pfBackupJSON()); S.settings.lastBackup = today(); save(); toastMsg('Copied. Paste it somewhere safe (e.g. Notes) or send it to your PC.'); } catch { alert("Couldn't copy. Use Save my data instead."); } }
function pfPaste() { const t = document.getElementById('pfText')?.value.trim(); if (!t) return alert('Paste your saved data first.'); readImport(t); }

// Home: warnings and reminders
const pfToday = screens.Today;
screens.Today = () => {
  let top = '';
  if (PF_IOS && !pfInApp()) top += `<div class="note"><b>You're in Safari, not the Fitness app.</b> Data here is kept separately from your Home Screen app. Open <b>Fitness</b> from your Home Screen to see your saved profile.</div>`;
  if (!P().done && !S.meals.length) top += `<div class="card"><b>Set this up before?</b><p class="mute">Restore your saved profile instead of starting again.</p><button class="sec" onclick="go('Backup')">Restore my data</button></div>`;
  else if (pfHasData() && pfDays() >= 7) top += `<div class="card"><div class="sec-h"><b>💾 Save a copy of your data</b><span class="mute">${pfDays() > 900 ? 'never saved' : pfDays() + ' days ago'}</span></div><p class="mute">Takes 2 taps. Keeps your profile and logs safe if the app is ever reinstalled.</p><button onclick="pfSave()">Save my data</button></div>`;
  return pfToday().replace(/(<div class="wk">)/, top + '$1');
};
// Backup screen: simpler, profile-focused
screens.Backup = () => `<h1>Save and restore</h1>
  <div class="card"><h2>Save my data</h2><p class="mute">Your profile, meals, workouts, weights, plan, supplements and settings in one file (private health notes are left out). ${S.settings.lastBackup ? 'Last saved ' + ukDate(S.settings.lastBackup) + '.' : 'Not saved yet.'}</p>
    <button onclick="pfSave()">💾 Save my data</button><button class="sec mt" onclick="pfCopy()">Copy as text</button>
    <p class="mute">Choose <b>Save to Files</b> → iCloud Drive or OneDrive. Meal photos aren't included.</p></div>
  <div class="card"><h2>Restore</h2><p class="mute">Shows a preview first. Nothing changes until you confirm.</p>
    <button class="sec" onclick="imp.click()">Choose saved file</button>
    <label>Or paste saved text</label><textarea id="pfText" rows="3" placeholder='{"v":1,"profile":…}'></textarea><button class="sec mt" onclick="pfPaste()">Restore from text</button></div>
  ${PF_IOS && !pfInApp() ? `<div class="note">You're in Safari. Restore inside the Home Screen app, otherwise it goes into Safari's separate storage.</div>` : ''}`;
