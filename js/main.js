const WA="60193078815";
(function(){
  const root=document.documentElement,btn=document.getElementById("theme-btn"),lbl=document.getElementById("theme-label");
  const isDark=()=>root.dataset.theme?root.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;
  const sync=()=>{lbl.textContent=isDark()?"Cerah":"Gelap"};
  try{const s=localStorage.getItem("theme");if(s)root.dataset.theme=s}catch(e){}
  sync();
  btn.addEventListener("click",()=>{const t=isDark()?"light":"dark";root.dataset.theme=t;try{localStorage.setItem("theme",t)}catch(e){}sync()});
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change",sync);
})();
// [variant, code, OTR with insurance, 10% deposit, 90% loan, 9 yrs, 7 yrs, full loan 9 yrs]
const toModel=m=>[m.name,{type:m.type,rows:(m.variants||[]).map(v=>[v.variant,v.code,+v.otr,+v.deposit,+v.loan,+v.monthly_9,+v.monthly_7,+v.full_loan_9])}];
const nocache="?v="+Date.now();
const [priceData,galleryData]=await Promise.all([
  fetch("data/prices.json"+nocache).then(r=>r.json()),
  fetch("data/gallery.json"+nocache).then(r=>r.json())
]);
const PRICES=Object.fromEntries((priceData.models||[]).map(toModel));
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
document.getElementById("gallery").innerHTML=(galleryData.photos||[]).map(p=>`<figure><img src="${esc(p.image)}" alt="${esc(p.description||p.caption)}" loading="lazy">${p.caption?`<figcaption>${esc(p.caption)}</figcaption>`:""}</figure>`).join("");
const money=v=>v.toLocaleString("en-MY",{minimumFractionDigits:2,maximumFractionDigits:2});
const whole=v=>v.toLocaleString("en-MY");
const tabs=document.getElementById("tabs"),panel=document.getElementById("price-panel");
function show(name){
  tabs.querySelectorAll(".tab").forEach(t=>t.setAttribute("aria-selected",t.dataset.m===name));
  const m=PRICES[name];
  const msg=encodeURIComponent(`Salam Puan Azita, saya berminat dengan Perodua ${name}. Boleh saya dapatkan sebut harga terkini?`);
  panel.innerHTML=`<div class="model-head"><div><span class="type">${m.type}</span><h3>${name}</h3></div><a href="https://wa.me/${WA}?text=${msg}" target="_blank" rel="noopener">Tanya ${name} di WhatsApp →</a></div>
  <div class="table-wrap"><table><thead><tr><th>Varian</th><th>Kod</th><th>Harga OTR<br>(termasuk insurans)</th><th>Deposit 10%</th><th>Pinjaman 90%</th><th>Bulanan<br>9 tahun</th><th>Bulanan<br>7 tahun</th><th>Pinjaman penuh<br>9 tahun</th></tr></thead>
  <tbody>${m.rows.map(r=>`<tr><td>${r[0]}</td><td class="code">${r[1]}</td><td>${money(r[2])}</td><td>${money(r[3])}</td><td>${money(r[4])}</td><td class="hl">${whole(r[5])}</td><td>${whole(r[6])}</td><td>${whole(r[7])}</td></tr>`).join("")}</tbody></table></div>`;
}
Object.keys(PRICES).forEach((n,i)=>{
  tabs.insertAdjacentHTML("beforeend",`<button class="tab" role="tab" type="button" data-m="${n}" aria-selected="${i===0}">${n}</button>`);
});
tabs.addEventListener("click",e=>{const b=e.target.closest(".tab");if(b)show(b.dataset.m)});
show(Object.keys(PRICES)[0]);

const sel=document.getElementById("b-model"),vsel=document.getElementById("c-variant");
Object.entries(PRICES).forEach(([n,m])=>{
  sel.insertAdjacentHTML("beforeend",`<option>${n}</option>`);
  const g=document.createElement("optgroup");g.label=n;
  m.rows.forEach(r=>{const o=document.createElement("option");o.value=r[2];o.textContent=`${r[0]} · RM ${money(r[2])}`;g.appendChild(o)});
  vsel.appendChild(g);
});
vsel.selectedIndex=Math.min(7,vsel.options.length-1);document.getElementById("c-price").value=vsel.value||50000;

const fmt=v=>"RM "+Math.round(v).toLocaleString("en-MY");
function calc(){
  const p=+document.getElementById("c-price").value||0,
        d=+document.getElementById("c-down").value||0,
        r=+document.getElementById("c-rate").value||0,
        y=+document.getElementById("c-years").value||9;
  const loan=p*(1-d/100), interest=loan*(r/100)*y, monthly=(loan+interest)/(y*12);
  document.getElementById("c-out").textContent=fmt(monthly);
  document.getElementById("c-detail").textContent=`Pinjaman ${fmt(loan)} · jumlah faedah ${fmt(interest)} · ${y*12} bulan`;
}
vsel.addEventListener("change",()=>{if(vsel.value)document.getElementById("c-price").value=vsel.value;calc()});
document.getElementById("c-price").addEventListener("input",()=>{vsel.value=""});
document.getElementById("calc").addEventListener("input",calc);
document.getElementById("calc").addEventListener("submit",e=>e.preventDefault());
calc();

document.getElementById("book").addEventListener("submit",e=>{
  e.preventDefault();
  const name=document.getElementById("b-name").value.trim();
  document.getElementById("b-err").hidden=!!name;
  if(!name){document.getElementById("b-sent").hidden=true;return;}
  const date=document.getElementById("b-date").value;
  const text=`Salam Puan Azita, saya ${name}. Saya berminat: ${document.getElementById("b-type").value} untuk Perodua ${sel.value}${date?`, pada ${date}`:""}.`;
  document.getElementById("b-link").href=`https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  document.getElementById("b-sent").hidden=false;
});

document.querySelectorAll(".copy").forEach(b=>b.addEventListener("click",()=>{
  const t=b.dataset.copy;
  const fallback=()=>{const r=document.createRange();r.selectNodeContents(b.previousElementSibling);const s=getSelection();s.removeAllRanges();s.addRange(r)};
  if(!navigator.clipboard){fallback();return;}
  navigator.clipboard.writeText(t).then(()=>{b.textContent="Disalin";setTimeout(()=>b.textContent="Salin",1500)}).catch(fallback);
}));
