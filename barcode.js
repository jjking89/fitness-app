// ===== Barcode: scan → Open Food Facts (free, no key) → remember on this device. Label photo via Claude Haiku if the product is missing. =====
// Only the barcode number is sent to Open Food Facts. The scanner library loads only when you first tap Scan.
const OFF_URL = code => `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,nutriments,serving_quantity,product_quantity`;
let scanner = null;
function loadScanner() {
  if (window.Html5Qrcode) return Promise.resolve();
  return new Promise((ok, fail) => { const s = document.createElement('script'); s.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'; s.onload = ok; s.onerror = () => fail(new Error('Could not load the scanner. Check your connection, or type the barcode number.')); document.head.append(s); });
}
async function scanBarcode() {
  const box = document.createElement('div'); box.id = 'scanbox';
  box.innerHTML = `<div class="scan-in"><b>Point at the barcode</b><div id="reader"></div>
    <form class="row mt" onsubmit="event.preventDefault();closeScan();handleCode(this.c.value.trim())"><input name="c" inputmode="numeric" pattern="[0-9]{6,14}" placeholder="Or type the number" required><button style="flex:0 0 auto;width:auto">Find</button></form>
    <button class="sec mt" onclick="closeScan()">Cancel</button></div>`;
  document.body.append(box);
  try {
    await loadScanner();
    const F = Html5QrcodeSupportedFormats;
    scanner = new Html5Qrcode('reader', {formatsToSupport: [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E], verbose: false});
    await scanner.start({facingMode: 'environment'}, {fps: 10, qrbox: {width: 260, height: 140}}, code => { closeScan(); handleCode(code); }, () => {});
  } catch (e) { const r = document.getElementById('reader'); if (r) r.innerHTML = `<p class="mute">${esc(e.message || 'Camera not available. Allow camera access in Settings, or type the number below.')}</p>`; }
}
function closeScan() {
  const s = scanner; scanner = null; document.getElementById('scanbox')?.remove();
  try { s?.stop().catch(() => {}).finally(() => { try { s.clear(); } catch {} }); } catch {} // stop() throws if the camera never started
}

async function handleCode(code) {
  if (!/^\d{6,14}$/.test(code)) return alert("That doesn't look like a barcode number.");
  S.barcodes ||= {};
  let p = S.barcodes[code];
  if (!p) {
    try {
      const j = await (await fetch(OFF_URL(code))).json(), n = j.product?.nutriments || {};
      if (j.status === 1 && n['energy-kcal_100g'] != null) {
        const pn = (j.product.product_name || '').trim(), br = (j.product.brands || '').split(',').map(b => b.trim()).filter(b => b && b.length < 25).pop() || '';
        p = {name: (br && !pn.toLowerCase().includes(br.toLowerCase()) ? `${br} ${pn}` : pn || br).trim() || 'Product ' + code,
          per100: ['energy-kcal_100g', 'proteins_100g', 'carbohydrates_100g', 'fat_100g', 'fiber_100g'].map(k => n1(+n[k] || 0)),
          serving: +j.product.serving_quantity || 0, pack: +j.product.product_quantity || 0, src: 'Open Food Facts'};
        S.barcodes[code] = p;
      }
    } catch { return alert("Couldn't reach the food database. Check your connection and try again."); }
  }
  if (!p) return notFound(code);
  addProduct(code, p);
}
function addProduct(code, p) {
  S.draft ||= newDraft();
  const grams = p.serving || p.pack || 100;
  S.draft.items.push({id: uid(), name: p.name, fam: '', per100: p.per100, grams, unitG: grams, src: 'packet', vary: false, qtyGiven: true, asked: true, barcode: code});
  save(); go('Meal');
  toastMsg(`Added ${p.name}: ${grams} g${p.serving ? ' (1 serving)' : p.pack ? ' (whole pack)' : ''}. Change the grams if you had more or less.`);
}
function notFound(code) {
  if (aiKey()) {
    if (!confirm("This product isn't in the free database yet. Take a photo of its nutrition label and I'll read it (sent to Claude) and remember it?")) return;
    labelFor = code; labelIn.click(); return;
  }
  S.draft ||= newDraft();
  const it = {id: uid(), name: 'Product ' + code, fam: '', per100: null, grams: 100, unitG: 100, src: 'unknown', vary: false, qtyGiven: true, barcode: code};
  S.draft.items.push(it); packetFor = it.id; save(); go('Meal');
  toastMsg("Not in the database. Type the label's per-100 g values below; I'll remember them for next time.");
}

// ---------- nutrition label photo → Claude Haiku → remembered under the barcode ----------
let labelFor = null;
const labelIn = Object.assign(document.createElement('input'), {type: 'file', accept: 'image/*', hidden: true});
document.body.append(labelIn);
labelIn.onchange = async () => {
  const f = labelIn.files[0], code = labelFor; labelIn.value = ''; labelFor = null; if (!f || !code) return;
  toastMsg('Reading the label…');
  try {
    const img = await shrinkImage(f, 1000);
    const reply = await claude('You read UK food nutrition labels. Reply with one line only, no other text.',
      [{role: 'user', content: [{type: 'image', source: {type: 'base64', media_type: 'image/jpeg', data: img.split(',')[1]}},
        {type: 'text', text: 'Give: product name | kcal per 100g | protein g per 100g | carbs g per 100g | fat g per 100g | fibre g per 100g | serving size g (0 if none). Use the per 100 g column.'}]}], 800, 'vision');
    const x = reply.split('\n')[0].split('|').map(v => v.trim());
    if (x.length < 6 || isNaN(parseFloat(x[1]))) throw new Error("Couldn't read the label. Try a closer, flatter photo, or type the values.");
    const p = {name: x[0] || 'Product ' + code, per100: x.slice(1, 6).map(v => n1(parseFloat(v) || 0)), serving: parseFloat(x[6]) || 0, pack: 0, src: 'label photo'};
    (S.barcodes ||= {})[code] = p; addProduct(code, p);
  } catch (e) { alert(e.message); }
};
// Values typed by hand for a barcoded item are remembered too.
const _savePacket = savePacket;
savePacket = function (id, f) { _savePacket(id, f); const x = S.draft?.items.find(i => i.id == id); if (x?.barcode && x.per100) { (S.barcodes ||= {})[x.barcode] = {name: x.name, per100: x.per100, serving: 0, pack: 0, src: 'typed'}; save(); } };

function toastMsg(t) { let el = document.getElementById('toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.append(el); } el.textContent = t; el.className = 'show'; clearTimeout(toastMsg.t); toastMsg.t = setTimeout(() => el.className = '', 4500); }
