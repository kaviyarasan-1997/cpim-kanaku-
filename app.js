const ADMIN_NAME='Kaviyarasan';
const PLACES=[
{no:1,name:'தரங்கம்பாடி'},{no:2,name:'செம்பனார்கோவில்'},{no:3,name:'குத்தாலம் கிழக்கு'},{no:4,name:'குத்தாலம் மேற்கு'},{no:5,name:'மயிலாடுதுறை (ஒ)'},{no:6,name:'மயிலாடுதுறை (ந)'},{no:7,name:'சீர்காழி'},{no:8,name:'கொள்ளிடம்'},{no:9,name:'மாணவர்'},{no:10,name:'ஆசிரியர்'},{no:11,name:'எல்.ஐ.சி'},{no:12,name:'அரசு ஊழியர்'},{no:13,name:'மாவட்ட மையம்'}
];
const KEY='dyfi_mayiladuthurai_monthly_v7';
const MONTHS=['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பர்'];
const $=id=>document.getElementById(id);
let data=loadData(), currentKey='', currentRecord=null;
function istNow(){return new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Kolkata'}));}
function pad(n){return String(n).padStart(2,'0')}
function currentPeriod(){const d=istNow();return {year:d.getFullYear(),month:d.getMonth()+1}}
function periodKey(){return `${$('year').value}-${pad($('month').value)}`}
function recordKey(placeNo){return `${periodKey()}__${placeNo}`}
function emptyRecord(placeNo){const p=PLACES.find(x=>x.no===Number(placeNo));return {key:recordKey(placeNo),year:Number($('year').value),month:Number($('month').value),placeNo:p.no,place:p.name,branches:0,members:0,meetings:0,expected:0,present:0}}
function loadData(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{}}catch{return {}}}
function persist(){localStorage.setItem(KEY,JSON.stringify(data));$('saveState').textContent='LOCAL STORAGE • SAVED';$('saveStateDot').className='saved'}
function setDirty(t='LOCAL STORAGE • READY'){$('saveState').textContent=t;$('saveStateDot').className=''}
function setup(){
 const now=currentPeriod();$('year').innerHTML=Array.from({length:8},(_,i)=>now.year-4+i).map(y=>`<option value="${y}">${y}</option>`).join('');$('year').value=now.year;
 $('month').innerHTML=MONTHS.map((m,i)=>`<option value="${i+1}">${m}</option>`).join('');$('month').value=now.month;
 $('committee').innerHTML=PLACES.map(p=>`<option value="${p.no}">${p.no}. ${p.name}</option>`).join('');$('committee').value=1;
 bind(); updatePeriod(); loadCurrent(); render();
}
function bind(){
 ['year','month'].forEach(id=>$(id).addEventListener('change',()=>{updatePeriod();loadCurrent();render()}));
 $('committee').addEventListener('change',()=>{loadCurrent();render()});
 $('search').addEventListener('input',render);
 $('zeroBtn').onclick=()=>{['branches','members','meetings','expected','present'].forEach(id=>$(id).value=0);setDirty('மாற்றம் செய்யப்பட்டுள்ளது — சேமிக்கவும்')};
 $('dataForm').onsubmit=e=>{e.preventDefault();saveCurrent()};
 $('pdfBtn').onclick=downloadFullPdf;
 $('backupBtn').onclick=backup;
 $('restoreBtn').onclick=()=>$('restoreFile').click();
 $('restoreFile').onchange=restore;
}
function updatePeriod(){const text=`${$('year').value} ${MONTHS[Number($('month').value)-1]}`;$('monthTitle').textContent=`${text} மாதம் நடைபெற்ற கூட்டம் விவரங்கள்`;$('periodLabel').textContent=text;document.title=`DYFI — ${text} — மயிலாடுதுறை`}
function loadCurrent(){const p=PLACES.find(x=>x.no===Number($('committee').value));currentKey=recordKey(p.no);currentRecord=data[currentKey]||emptyRecord(p.no);$('placeNo').textContent=p.no;$('placeName').textContent=p.name;$('selectedPlace').textContent=`${p.no}. ${p.name}`;const exists=!!data[currentKey];$('recordState').textContent=exists?'✓ சேமிக்கப்பட்ட பதிவு':'புதிய பதிவு — 0';['branches','members','meetings','expected','present'].forEach(k=>$(k).value=Number(currentRecord[k])||0);setDirty(exists?'LOCAL STORAGE • SAVED':'LOCAL STORAGE • READY')}
function saveCurrent(){const p=PLACES.find(x=>x.no===Number($('committee').value));const obj={key:currentKey,year:Number($('year').value),month:Number($('month').value),placeNo:p.no,place:p.name,branches:n('branches'),members:n('members'),meetings:n('meetings'),expected:n('expected'),present:n('present')};data[currentKey]=obj;persist();currentRecord=obj;$('recordState').textContent='✓ சேமிக்கப்பட்ட பதிவு';render();alert(`${p.name} — ${MONTHS[obj.month-1]} ${obj.year} பதிவு சேமிக்கப்பட்டது.`)}
function n(id){return Math.max(0,Math.floor(Number($(id).value)||0))}
function recordsForPeriod(){return PLACES.map(p=>data[`${periodKey()}__${p.no}`]).filter(Boolean).sort((a,b)=>a.placeNo-b.placeNo)}
function allRowsForPeriod(){return PLACES.map(p=>data[`${periodKey()}__${p.no}`]||emptyRecord(p.no)).sort((a,b)=>a.placeNo-b.placeNo)}
function render(){const q=$('search').value.trim().toLowerCase();const rows=recordsForPeriod().filter(r=>r.place.toLowerCase().includes(q));$('recordsBody').innerHTML=rows.map(r=>`<tr><td>${r.placeNo}</td><td class="place-cell">${r.place}</td><td>${r.branches}</td><td>${r.members}</td><td>${r.meetings}</td><td>${r.expected}</td><td>${r.present}</td><td><div class="actions"><button class="icon-btn" title="Edit" onclick="editRecord(${r.placeNo})">✏️</button><button class="icon-btn danger" title="Delete" onclick="deleteRecord(${r.placeNo})">🗑️</button></div></td></tr>`).join('');$('empty').style.display=rows.length?'none':'block';const all=allRowsForPeriod();const sum=k=>all.reduce((a,r)=>a+(Number(r[k])||0),0);$('statRecords').textContent=recordsForPeriod().length;$('statBranches').textContent=sum('branches').toLocaleString('en-IN');$('statMembers').textContent=sum('members').toLocaleString('en-IN');$('statMeetings').textContent=sum('meetings').toLocaleString('en-IN');$('summaryGrid').innerHTML=all.map(r=>`<div class="summary-item ${data[r.key]?'saved-item':''}"><h3>${r.placeNo}. ${r.place}</h3><p>கிளைகள் <b>${r.branches}</b></p><p>உறுப்பினர்கள் <b>${r.members}</b></p><p>கூட்டம் <b>${r.meetings}</b></p><p>வேண்டியவர்கள் <b>${r.expected}</b></p><p>பங்கேற்றவர்கள் <b>${r.present}</b></p></div>`).join('')}
window.editRecord=no=>{$('committee').value=no;loadCurrent();window.scrollTo({top:0,behavior:'smooth'})};
window.deleteRecord=no=>{const key=recordKey(no);const r=data[key];if(!r)return;if(confirm(`${r.place} — இந்த ${MONTHS[r.month-1]} ${r.year} பதிவை முழுமையாக நீக்கவா?`)){delete data[key];persist();loadCurrent();render()}};
function backup(){const blob=new Blob([JSON.stringify({app:'DYFI Mayiladuthurai Monthly Data',version:7,exportedAt:new Date().toISOString(),data},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='DYFI_Mayiladuthurai_Backup.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}
function restore(e){const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const obj=JSON.parse(rd.result);if(!obj.data||typeof obj.data!=='object')throw Error('bad');if(confirm('Backup data-வை restore செய்தால் தற்போதைய Local Storage data replace ஆகும். தொடரவா?')){data=obj.data;persist();loadCurrent();render();alert('Backup restore முடிந்தது.')}}catch(err){alert('Backup file சரியான format-ல் இல்லை.')}e.target.value=''};rd.readAsText(f)}
// PDF — single full report for the selected month/year. Unrecorded committees are explicitly 0.
const HEADERS=['எண்','கமிட்டி / அமைப்பு','மொத்தம் கிளைகள்','உறுப்பினர் எண்ணிக்கை','நடைபெற்ற கூட்டம்','கூட்டத்தில் கலந்து கொள்ள வேண்டியவர்கள்','பங்கேற்றவர்கள்'];
function wrap(ctx,text,max){const words=String(text).trim().split(/\s+/);const out=[];let line='';for(const w of words){const t=line?line+' '+w:w;if(ctx.measureText(t).width<=max){line=t}else{if(line)out.push(line);line=w;if(ctx.measureText(line).width>max){let part='';for(const ch of Array.from(line)){const z=part+ch;if(ctx.measureText(z).width<=max||!part)part=z;else{out.push(part);part=ch}}line=part}}}if(line)out.push(line);return out.length?out:['']}
function drawWrap(ctx,text,x,y,max,font,lh){ctx.font=font;ctx.textAlign='center';ctx.textBaseline='middle';const lines=wrap(ctx,text,max);const start=y-(lines.length-1)*lh/2;lines.forEach((s,i)=>ctx.fillText(s,x,start+i*lh))}
async function waitFonts(){if(document.fonts?.ready)await document.fonts.ready}
function canvasReport(rows){
 const W=1754,margin=48,tableY=205,widths=[80,285,245,235,235,405,203],headerH=96,rowH=65,totalH=70,footer=70;
 const totals={branches:rows.reduce((a,r)=>a+(Number(r.branches)||0),0),members:rows.reduce((a,r)=>a+(Number(r.members)||0),0),meetings:rows.reduce((a,r)=>a+(Number(r.meetings)||0),0),expected:rows.reduce((a,r)=>a+(Number(r.expected)||0),0),present:rows.reduce((a,r)=>a+(Number(r.present)||0),0)};
 const H=tableY+headerH+rows.length*rowH+totalH+footer;
 const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
 ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.fillStyle='#111';ctx.strokeStyle='#111';ctx.lineWidth=1.4;
 ctx.font='700 31px "Noto Sans Tamil",sans-serif';ctx.textAlign='center';ctx.fillText('இந்திய கம்யூனிஸ்ட் கட்சி (மார்க்சிஸ்ட்)',W/2,43);
 ctx.font='700 27px "Noto Sans Tamil",sans-serif';ctx.fillText('மயிலாடுதுறை மாவட்டக்குழு',W/2,80);
 ctx.font='700 25px "Noto Sans Tamil",sans-serif';ctx.fillText(`${rows[0].year} ${MONTHS[rows[0].month-1]} மாதம் நடைபெற்ற கூட்டம் விவரங்கள்`,W/2,120);
 ctx.font='500 17px "Noto Sans Tamil",sans-serif';ctx.fillText('DYFI • CPIM Web App',W/2,150);
 const totalW=widths.reduce((a,b)=>a+b,0),x=(W-totalW)/2;
 const tableBottom=tableY+headerH+rows.length*rowH+totalH;
 ctx.strokeRect(x,tableY,totalW,headerH+rows.length*rowH+totalH);
 let cx=x;for(let i=1;i<widths.length;i++){cx+=widths[i-1];ctx.beginPath();ctx.moveTo(cx,tableY);ctx.lineTo(cx,tableBottom);ctx.stroke()}
 ctx.beginPath();ctx.moveTo(x,tableY+headerH);ctx.lineTo(x+totalW,tableY+headerH);ctx.stroke();
 for(let i=1;i<=rows.length;i++){const yy=tableY+headerH+i*rowH;ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+totalW,yy);ctx.stroke()}
 const totalY=tableY+headerH+rows.length*rowH;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,totalY);ctx.lineTo(x+totalW,totalY);ctx.stroke();ctx.lineWidth=1.4;
 cx=x;HEADERS.forEach((h,i)=>{drawWrap(ctx,h,cx+widths[i]/2,tableY+headerH/2,widths[i]-18,'700 18px "Noto Sans Tamil",sans-serif',22);cx+=widths[i]});
 rows.forEach((r,i)=>{const vals=[r.placeNo+'.',r.place,r.branches,r.members,r.meetings,r.expected,r.present];let xx=x;vals.forEach((v,j)=>{const w=widths[j];drawWrap(ctx,String(v),xx+w/2,tableY+headerH+i*rowH+rowH/2,w-(j===1?18:12),j===1?'700 19px "Noto Sans Tamil",sans-serif':'700 20px "Noto Sans Tamil",sans-serif',23);xx+=w})});
 const totalVals=['','மொத்தம்',totals.branches,totals.members,totals.meetings,totals.expected,totals.present];
 let tx=x;totalVals.forEach((v,j)=>{const w=widths[j];drawWrap(ctx,String(v),tx+w/2,totalY+totalH/2,w-(j===1?18:12),'700 20px "Noto Sans Tamil",sans-serif',24);tx+=w});
 ctx.font='600 16px "Noto Sans Tamil",sans-serif';ctx.textAlign='center';ctx.fillText(`மொத்தம்: ${rows.length} கமிட்டிகள்`,W/2,H-30);
 return c.toDataURL('image/jpeg',.98)
}
function jpegBytes(data){const b=atob(data.split(',')[1]),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
function jpegDim(b){for(let i=0;i<b.length-9;i++)if(b[i]===255&&b[i+1]>=192&&b[i+1]<=195)return{h:(b[i+5]<<8)|b[i+6],w:(b[i+7]<<8)|b[i+8]};return{w:1754,h:1000}}
function makePdf(img,filename){const enc=new TextEncoder(),parts=[],off=[];let pos=0;const add=b=>{parts.push(b);pos+=b.length},txt=s=>enc.encode(s);add(txt('%PDF-1.3\n%\xFF\xFF\xFF\xFF\n'));const bytes=jpegBytes(img),d=jpegDim(bytes),im=3,ct=4,pg=5,pages=6,cat=7,pw=841.89,ph=595.28;off[im]=pos;add(txt(`${im} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${d.w} /Height ${d.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`));add(bytes);add(txt('\nendstream\nendobj\n'));const sc=Math.min((pw-24)/d.w,(ph-24)/d.h),dw=d.w*sc,dh=d.h*sc,ox=(pw-dw)/2,oy=(ph-dh)/2,stream=`q\n${dw.toFixed(3)} 0 0 ${dh.toFixed(3)} ${ox.toFixed(3)} ${oy.toFixed(3)} cm\n/Im${im} Do\nQ\n`;off[ct]=pos;add(txt(`${ct} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`));off[pg]=pos;add(txt(`${pg} 0 obj\n<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im${im} ${im} 0 R >> >> /Contents ${ct} 0 R >>\nendobj\n`));off[pages]=pos;add(txt(`${pages} 0 obj\n<< /Type /Pages /Kids [${pg} 0 R] /Count 1 >>\nendobj\n`));off[cat]=pos;add(txt(`${cat} 0 obj\n<< /Type /Catalog /Pages ${pages} 0 R >>\nendobj\n`));const x=pos;add(txt(`xref\n0 8\n0000000000 65535 f \n`));for(let i=1;i<=7;i++)add(txt(String(off[i]||0).padStart(10,'0')+' 00000 n \n'));add(txt(`trailer\n<< /Size 8 /Root ${cat} 0 R >>\nstartxref\n${x}\n%%EOF`));const blob=new Blob(parts,{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500)}
async function downloadFullPdf(){await waitFonts();const rows=allRowsForPeriod();const img=canvasReport(rows);makePdf(img,`DYFI_Mayiladuthurai_${$('year').value}_${pad($('month').value)}_Full_Report.pdf`)}
setup();
