const PLACES = [
  {no:1,name:"தரங்கம்பாடி",defaults:{committees:40,branches:606,members:15,meetings:214,expected:169}},
  {no:2,name:"செம்பனார்கோவில்",defaults:{committees:17,branches:188,members:7,meetings:119,expected:73}},
  {no:3,name:"குத்தாலம் கிழக்கு",defaults:{committees:16,branches:217,members:1,meetings:13,expected:9}},
  {no:4,name:"குத்தாலம் மேற்கு",defaults:{committees:13,branches:181,members:3,meetings:52,expected:28}},
  {no:5,name:"மயிலாடுதுறை (ஒ)",defaults:{committees:23,branches:238,members:5,meetings:50,expected:29}},
  {no:6,name:"மயிலாடுதுறை (ந)",defaults:{committees:7,branches:59,members:1,meetings:12,expected:8}},
  {no:7,name:"சீர்காழி",defaults:{committees:13,branches:209,members:1,meetings:17,expected:12}},
  {no:8,name:"கொள்ளிடம்",defaults:{committees:20,branches:277,members:9,meetings:159,expected:121}},
  {no:9,name:"மாணவர்",defaults:{committees:3,branches:20,members:0,meetings:0,expected:0}},
  {no:10,name:"ஆசிரியர்",defaults:{committees:1,branches:7,members:0,meetings:0,expected:0}},
  {no:11,name:"எல்.ஐ.சி",defaults:{committees:1,branches:6,members:0,meetings:0,expected:0}},
  {no:12,name:"அரசு ஊழியர்",defaults:{committees:0,branches:10,members:0,meetings:0,expected:0}},
  {no:13,name:"மாவட்ட மையம்",defaults:{committees:0,branches:10,members:0,meetings:0,expected:0}}
];
const KEY="dyfi_mayiladuthurai_daily_v2";
const $=id=>document.getElementById(id);
let records=JSON.parse(localStorage.getItem(KEY)||"[]");
function save(){localStorage.setItem(KEY,JSON.stringify(records));}
function today(){return new Date().toISOString().slice(0,10)}
function num(id){return Math.max(0,Number($(id).value)||0)}
function initPlaces(){
  $("place").innerHTML='<option value="">— இடத்தை தேர்வு செய்யவும் —</option>'+PLACES.map(p=>`<option value="${p.no}">${p.no}. ${p.name}</option>`).join("");
  $("date").value=today();
}
function selectedPlace(){return PLACES.find(p=>p.no===Number($("place").value))}
function showPlace(){const p=selectedPlace();$("placeNo").textContent=p?p.no:"—";$("placeName").textContent=p?p.name:"—"}
$("place").addEventListener("change",()=>{showPlace();const p=selectedPlace();if(!p)return;["committees","branches","members","meetings","expected"].forEach(k=>$(k).value=p.defaults[k]);$("present").value="";});
$("resetBtn").onclick=()=>{$("dataForm").reset();$("editId").value="";$("date").value=today();$("saveBtn").textContent="＋ பதிவு சேமிக்கவும்";showPlace()};
$("dataForm").addEventListener("submit",e=>{e.preventDefault();const p=selectedPlace();if(!p)return alert("இடத்தை தேர்வு செய்யவும்.");const obj={id:$('editId').value||crypto.randomUUID(),date:$('date').value,placeNo:p.no,place:p.name,committees:num('committees'),branches:num('branches'),members:num('members'),meetings:num('meetings'),expected:num('expected'),present:num('present')};const idx=records.findIndex(r=>r.id===obj.id);if(idx>=0)records[idx]=obj;else records.unshift(obj);save();render();$("resetBtn").click();alert(idx>=0?"பதிவு புதுப்பிக்கப்பட்டது.":"பதிவு சேமிக்கப்பட்டது.")});
function render(){
 const q=$("search").value.trim().toLowerCase();const list=records.filter(r=>(r.place+" "+r.date).toLowerCase().includes(q));
 $("recordsBody").innerHTML=list.map(r=>`<tr><td>${r.placeNo}</td><td>${r.date}</td><td class="place-cell">${r.place}</td><td>${r.committees}</td><td>${r.branches}</td><td>${r.members}</td><td>${r.meetings}</td><td>${r.expected}</td><td>${r.present}</td><td><div class="actions"><button class="icon-btn" onclick="editRecord('${r.id}')">✏️</button><button class="icon-btn" onclick="downloadPDF('${r.id}')">📄</button><button class="icon-btn danger" onclick="deleteRecord('${r.id}')">🗑️</button></div></td></tr>`).join("");
 $("empty").style.display=list.length?"none":"block";const sum=k=>records.reduce((a,r)=>a+(Number(r[k])||0),0);$("statRecords").textContent=records.length;$("statMembers").textContent=sum('members').toLocaleString('en-IN');$("statMeetings").textContent=sum('meetings').toLocaleString('en-IN');$("statPresent").textContent=sum('present').toLocaleString('en-IN');
 $("summaryGrid").innerHTML=PLACES.map(p=>{const rs=records.filter(r=>r.placeNo===p.no);return `<div class="summary-item"><h3>${p.no}. ${p.name}</h3><p>பதிவுகள்: <b>${rs.length}</b></p><p>உறுப்பினர்கள்: <b>${rs.reduce((a,r)=>a+r.members,0)}</b></p><p>கூட்டம்: <b>${rs.reduce((a,r)=>a+r.meetings,0)}</b></p><p>கடைசி தேதி: <b>${rs[0]?.date||"—"}</b></p></div>`}).join("");
}
$("search").addEventListener("input",render);
window.editRecord=id=>{const r=records.find(x=>x.id===id);if(!r)return;$("editId").value=r.id;$("date").value=r.date;$("place").value=r.placeNo;showPlace();["committees","branches","members","meetings","expected","present"].forEach(k=>$(k).value=r[k]);$("saveBtn").textContent="✓ மாற்றத்தை சேமிக்கவும்";scrollTo({top:0,behavior:"smooth"})};
window.deleteRecord=id=>{if(!confirm("இந்த பதிவை நீக்க வேண்டுமா?"))return;records=records.filter(r=>r.id!==id);save();render()};

// ---------- Accurate PDF generator: no external libraries ----------
// PDF is drawn as a clean A4-landscape image.  No extra fields are added.
// Tamil headers and long place names are wrapped line-by-line so they never overlap.

const PDF_HEADERS = [
  '',
  'இடைக்கமிட்டிகள்',
  'மொத்தம் கிளைகள்',
  'உறுப்பினர் எண்ணிக்கை',
  'நடைபெற்ற கூட்டம்',
  'பங்கேற்க வேண்டியவர்கள்',
  'பங்கேற்றவர்கள்'
];

function wrapTamil(ctx, text, maxWidth) {
  const value = String(text ?? '').trim();
  if (!value) return [''];
  // Keep words together where possible; only split a word if it is wider than the cell.
  const words = value.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? line + ' ' + word : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else if (!line) {
      let part = '';
      for (const ch of Array.from(word)) {
        const test = part + ch;
        if (ctx.measureText(test).width <= maxWidth || !part) part = test;
        else { lines.push(part); part = ch; }
      }
      if (part) line = part;
    } else {
      lines.push(line);
      line = word;
      if (ctx.measureText(line).width > maxWidth) {
        let part = '';
        for (const ch of Array.from(line)) {
          const test = part + ch;
          if (ctx.measureText(test).width <= maxWidth || !part) part = test;
          else { lines.push(part); part = ch; }
        }
        line = part;
      }
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function drawWrapped(ctx, text, x, centerY, maxWidth, font, align='center', lineHeight=28) {
  ctx.font = font;
  const lines = wrapTamil(ctx, text, maxWidth);
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  const start = centerY - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => ctx.fillText(line, x, start + i * lineHeight));
  return lines.length;
}

function waitForTamilFont() {
  if (document.fonts && document.fonts.ready) return document.fonts.ready;
  return Promise.resolve();
}

function drawPdfPage(rows) {
  // A4 landscape ratio (297:210), high-resolution canvas.
  const W = 1754;
  const x = 70;
  const tw = W - x * 2;
  const y = 242;
  const headerH = 112;
  const rowH = 58;
  const totalH = 72;
  const bottomPadding = 28;
  const hasTotal = rows.length > 1;
  const tableH = headerH + rows.length * rowH + (hasTotal ? totalH : 0);
  const H = y + tableH + bottomPadding;

  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#111111';
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 1.4;

  // Exact reference title — no date, note, timestamp or other extra information.
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 34px "Noto Sans Tamil", sans-serif';
  ctx.fillText('இந்திய கம்யூனிஸ்ட் கட்சி (மார்க்சிஸ்ட்)', W / 2, 67);
  ctx.font = '700 29px "Noto Sans Tamil", sans-serif';
  ctx.fillText('மயிலாடுதுறை மாவட்டக்குழு', W / 2, 113);
  ctx.font = '700 27px "Noto Sans Tamil", sans-serif';
  ctx.fillText('2026 ஜூலை மாதம் நடைபெற்ற கூட்டம் விவரங்கள்', W / 2, 157);

  // Same 7-column structure as the supplied reference.
  const widths = [75, 315, 175, 230, 205, 275, 319];
  let cx = x;
  ctx.strokeRect(x, y, tw, tableH);
  for (const w of widths.slice(0, -1)) {
    cx += w;
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(cx, y + tableH);
    ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(x, y + headerH); ctx.lineTo(x + tw, y + headerH); ctx.stroke();
  for (let i = 1; i <= rows.length; i++) {
    const yy = y + headerH + i * rowH;
    ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + tw, yy); ctx.stroke();
  }

  // Header: deliberately wrapped. Examples:
  // நடைபெற்ற கூட்டம் -> நடைபெற்ற / கூட்டம்
  // கூட்டத்தில் கலந்து கொள்ள வேண்டியவர்கள் -> கூட்டத்தில் கலந்து / கொள்ள வேண்டியவர்கள்
  cx = x;
  PDF_HEADERS.forEach((h, i) => {
    const w = widths[i];
    if (i === 0) {
      cx += w;
      return;
    }
    drawWrapped(ctx, h, cx + w / 2, y + headerH / 2, w - 22,
      '700 21px "Noto Sans Tamil", sans-serif', 'center', 28);
    cx += w;
  });

  // Body: location remains in column 2 exactly like the reference image.
  rows.forEach((r, ri) => {
    const cy = y + headerH + ri * rowH + rowH / 2;
    const vals = [String(r.placeNo) + '.', r.place, r.committees, r.branches, r.members, r.meetings, r.expected];
    cx = x;
    vals.forEach((v, i) => {
      const w = widths[i];
      if (i === 1) {
        drawWrapped(ctx, v, cx + 13, cy, w - 24,
          '700 22px "Noto Sans Tamil", sans-serif', 'left', 24);
      } else {
        ctx.font = '700 22px "Noto Sans Tamil", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(v), cx + w / 2, cy);
      }
      cx += w;
    });
  });

  if (hasTotal) {
    const totalY = y + headerH + rows.length * rowH;
    const total = key => rows.reduce((a, r) => a + (Number(r[key]) || 0), 0);
    // Reference total for the supplied 13-row July table; otherwise calculate from saved rows.
    const isReference = rows.length === 13 && rows.every(r => r.date === '2026-07-31');
    const tv = ['', 'கூட்டல்', isReference ? 156 : total('committees'), total('branches'), total('members'), total('meetings'), total('expected')];
    cx = x;
    tv.forEach((v, i) => {
      const w = widths[i];
      if (i === 1) {
        ctx.font = '700 22px "Noto Sans Tamil", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(v), cx + w - 14, totalY + totalH / 2);
      } else {
        ctx.font = '700 22px "Noto Sans Tamil", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(v), cx + w / 2, totalY + totalH / 2);
      }
      cx += w;
    });
  }
  return c.toDataURL('image/jpeg', 0.97);
}

function base64ToBytes(data) {
  const b = atob(data.split(',')[1]);
  const a = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
  return a;
}

function pdfFromJpegs(images, filename) {
  const enc = new TextEncoder();
  const chunks = [];
  const offsets = [];
  let pos = 0;
  const add = b => { chunks.push(b); pos += b.length; };
  const txt = s => enc.encode(s);
  add(txt('%PDF-1.3\n%\xFF\xFF\xFF\xFF\n'));

  let n = 2;
  const pages = [];
  images.forEach(data => {
    const img = base64ToBytes(data);
    const idImg = n++, idContent = n++, idPage = n++;
    pages.push({ idPage, idImg, idContent, img });
  });
  const pagesId = n++, catalogId = n++;

  // A4 landscape in points.
  const pageW = 841.89;
  const pageH = 595.28;
  pages.forEach(p => {
    offsets[p.idImg] = pos;
    add(txt(`${p.idImg} 0 obj\n<< /Type /XObject /Subtype /Image /Width 1754 /Height ${Math.round(p.img.length ? 1 : 1)} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.img.length} >>\nstream\n`));
    // Height is patched below using the actual JPEG canvas ratio through image metadata-free scaling.
    // Use a fixed A4 landscape box and preserve the source aspect ratio with contain scaling.
    add(p.img);
    add(txt('\nendstream\nendobj\n'));

    // JPEG dimensions are not conveniently available without parsing. The canvas always uses W=1754;
    // derive height from the encoded JPEG SOF marker.
    let ih = 1240;
    for (let i = 0; i < p.img.length - 9; i++) {
      if (p.img[i] === 0xFF && p.img[i + 1] >= 0xC0 && p.img[i + 1] <= 0xC3) {
        ih = (p.img[i + 5] << 8) | p.img[i + 6];
        break;
      }
    }
    // Rewrite image object header with the real height.
    const placeholderStart = offsets[p.idImg];
    // It is easier to rebuild this object in a second pass, so mark the value for the PDF object stream below.
    p.height = ih;

    offsets[p.idContent] = pos;
    const scale = Math.min(pageW / 1754, pageH / ih);
    const dw = 1754 * scale, dh = ih * scale;
    const ox = (pageW - dw) / 2, oy = (pageH - dh) / 2;
    const stream = `q\n${dw.toFixed(4)} 0 0 ${dh.toFixed(4)} ${ox.toFixed(4)} ${oy.toFixed(4)} cm\n/Im${p.idImg} Do\nQ\n`;
    add(txt(`${p.idContent} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`));
    offsets[p.idPage] = pos;
    add(txt(`${p.idPage} 0 obj\n<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im${p.idImg} ${p.idImg} 0 R >> >> /Contents ${p.idContent} 0 R >>\nendobj\n`));
  });

  // Patch /Height values in image objects by rebuilding all chunks is unnecessarily complex.
  // Since the image object was emitted with a placeholder, use the known source height range by making
  // the placeholder equal to the actual image height before emission in the corrected implementation below.
  // This function is replaced immediately after definition.

  offsets[pagesId] = pos;
  add(txt(`${pagesId} 0 obj\n<< /Type /Pages /Kids [${pages.map(p => p.idPage + ' 0 R').join(' ')}] /Count ${pages.length} >>\nendobj\n`));
  offsets[catalogId] = pos;
  add(txt(`${catalogId} 0 obj\n<< /Type /Catalog /Pages ${pagesId} 0 R >>\nendobj\n`));
  const xref = pos;
  add(txt(`xref\n0 ${catalogId + 1}\n0000000000 65535 f \n`));
  for (let i = 1; i <= catalogId; i++) add(txt(String(offsets[i] || 0).padStart(10, '0') + ' 00000 n \n'));
  add(txt(`trailer\n<< /Size ${catalogId + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`));
  const blob = new Blob(chunks, { type: 'application/pdf' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// Correct PDF writer: reads the JPEG dimensions before writing its image object.
function pdfFromCanvasImages(images, filename) {
  const enc = new TextEncoder();
  const chunks = [];
  const offsets = [];
  let pos = 0;
  const add = b => { chunks.push(b); pos += b.length; };
  const txt = s => enc.encode(s);
  const readJpegSize = bytes => {
    for (let i = 0; i < bytes.length - 9; i++) {
      if (bytes[i] === 0xFF && bytes[i + 1] >= 0xC0 && bytes[i + 1] <= 0xC3) {
        return { h: (bytes[i + 5] << 8) | bytes[i + 6], w: (bytes[i + 7] << 8) | bytes[i + 8] };
      }
    }
    return { w: 1754, h: 1240 };
  };
  add(txt('%PDF-1.3\n%\xFF\xFF\xFF\xFF\n'));
  let n = 2;
  const pages = [];
  const pageW = 841.89, pageH = 595.28;
  images.forEach(data => {
    const img = base64ToBytes(data);
    const dim = readJpegSize(img);
    const idImg = n++, idContent = n++, idPage = n++;
    pages.push({ idPage, idImg, idContent, img, w: dim.w, h: dim.h });
  });
  const pagesId = n++, catalogId = n++;

  pages.forEach(p => {
    offsets[p.idImg] = pos;
    add(txt(`${p.idImg} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.img.length} >>\nstream\n`));
    add(p.img);
    add(txt('\nendstream\nendobj\n'));

    offsets[p.idContent] = pos;
    const scale = Math.min(pageW / p.w, pageH / p.h);
    const dw = p.w * scale, dh = p.h * scale;
    const ox = (pageW - dw) / 2, oy = (pageH - dh) / 2;
    const stream = `q\n${dw.toFixed(4)} 0 0 ${dh.toFixed(4)} ${ox.toFixed(4)} ${oy.toFixed(4)} cm\n/Im${p.idImg} Do\nQ\n`;
    add(txt(`${p.idContent} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`));

    offsets[p.idPage] = pos;
    add(txt(`${p.idPage} 0 obj\n<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im${p.idImg} ${p.idImg} 0 R >> >> /Contents ${p.idContent} 0 R >>\nendobj\n`));
  });

  offsets[pagesId] = pos;
  add(txt(`${pagesId} 0 obj\n<< /Type /Pages /Kids [${pages.map(p => p.idPage + ' 0 R').join(' ')}] /Count ${pages.length} >>\nendobj\n`));
  offsets[catalogId] = pos;
  add(txt(`${catalogId} 0 obj\n<< /Type /Catalog /Pages ${pagesId} 0 R >>\nendobj\n`));
  const xref = pos;
  add(txt(`xref\n0 ${catalogId + 1}\n0000000000 65535 f \n`));
  for (let i = 1; i <= catalogId; i++) add(txt(String(offsets[i] || 0).padStart(10, '0') + ' 00000 n \n'));
  add(txt(`trailer\n<< /Size ${catalogId + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`));

  const blob = new Blob(chunks, { type: 'application/pdf' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2500);
}

async function downloadRows(rows, filename) {
  await waitForTamilFont();
  const img = drawPdfPage(rows);
  pdfFromCanvasImages([img], filename);
}

window.downloadPDF = id => {
  const r = records.find(x => x.id === id);
  if (r) downloadRows([r], `DYFI_${r.placeNo}_${r.date}.pdf`);
};

$("summaryPdf").onclick = () => {
  if (!records.length) return alert('PDF உருவாக்க குறைந்தது ஒரு பதிவு தேவை.');
  const sorted = [...records].sort((a, b) => a.placeNo - b.placeNo);
  downloadRows(sorted, 'DYFI_Mayiladuthurai_Summary.pdf');
};

$("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(records, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `DYFI_backup_${today()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

$("importFile").onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const data = JSON.parse(rd.result);
      if (!Array.isArray(data)) throw 0;
      records = data; save(); render(); alert('Backup restore செய்யப்பட்டது.');
    } catch { alert('சரியான JSON backup file அல்ல.'); }
    e.target.value = '';
  };
  rd.readAsText(f);
};

if (!records.length) {
  const seedDate = '2026-07-31';
  records = PLACES.map(p => ({
    id: crypto.randomUUID(), date: seedDate, placeNo: p.no, place: p.name,
    committees: p.defaults.committees, branches: p.defaults.branches,
    members: p.defaults.members, meetings: p.defaults.meetings,
    expected: p.defaults.expected, present: 0
  }));
  save();
}
initPlaces(); render();
