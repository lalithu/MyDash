(()=>{"use strict";
const $=id=>document.getElementById(id);let imageBlob=null,classes=[],busyBlocks=[];
const DAY_ORDER=[1,2,3,4,5,6,0],DAY_META={1:{short:"Mon",full:"Monday"},2:{short:"Tue",full:"Tuesday"},3:{short:"Wed",full:"Wednesday"},4:{short:"Thu",full:"Thursday"},5:{short:"Fri",full:"Friday"},6:{short:"Sat",full:"Saturday"},0:{short:"Sun",full:"Sunday"}};
const dayMap={mon:1,monday:1,tue:2,tues:2,tuesday:2,wed:3,wednesday:3,thu:4,thur:4,thurs:4,thursday:4,fri:5,friday:5,sat:6,saturday:6,sun:0,sunday:0};
const TIME_OPTIONS=(()=>{const a=[];for(let h=0;h<24;h++)for(let m=0;m<60;m+=15)a.push(String(h).padStart(2,"0")+":"+String(m).padStart(2,"0"));return a})();
const ACCENTS=["#e91e63","#2f5aa8","#0086c9","#5b8c3a","#7c4d9e","#d97706"];
const BUSY_ACCENT={Work:"#d97706","Office Hours":"#7c4d9e",Study:"#2f5aa8",Other:"#687885"};
function accentFor(s){let n=0;for(const c of String(s||"Class"))n=(31*n+c.charCodeAt(0))>>>0;return ACCENTS[n%ACCENTS.length]}
function showStatus(msg,type){const e=$("status");e.textContent=msg;e.className="status show"+(type?" "+type:"")}
function setProcessing(title,detail,percent){const box=$("processing"),bar=$("processing-bar");if(!box||!bar)return;$("processing-title").textContent=title||"Working…";$("processing-detail").textContent=detail||"";box.classList.add("show");box.setAttribute("aria-hidden","false");if(typeof percent==="number"){box.classList.remove("indeterminate");bar.style.width=Math.max(0,Math.min(100,percent))+"%"}else{box.classList.add("indeterminate");bar.style.width=""}}
function hideProcessing(){const box=$("processing"),bar=$("processing-bar");if(!box||!bar)return;box.classList.remove("show","indeterminate");box.setAttribute("aria-hidden","true");bar.style.width="0"}
function normalizeTime(v){if(!v&&v!==0)return"";v=String(v).trim();const m=v.match(/^(\d{1,2})(?::?(\d{2}))?\s*(AM|PM)?$/i);if(!m)return v;let h=+m[1],min=+(m[2]||0),ap=(m[3]||"").toUpperCase();if(ap==="PM"&&h<12)h+=12;if(ap==="AM"&&h===12)h=0;if(h===24)h=0;return String(h).padStart(2,"0")+":"+String(min).padStart(2,"0")}
function displayTime(v){const n=normalizeTime(v);if(!/^\d\d:\d\d$/.test(n))return v||"";let [h,m]=n.split(":").map(Number);const ap=h>=12?"PM":"AM";h=h%12||12;return `${h}:${String(m).padStart(2,"0")} ${ap}`}
function normalizeDays(v){if(Number.isInteger(v)&&v>=0&&v<=6)return[v];if(Array.isArray(v))return[...new Set(v.flatMap(normalizeDays))].sort((a,b)=>DAY_ORDER.indexOf(a)-DAY_ORDER.indexOf(b));const raw=String(v??"").trim();if(/^[0-6]$/.test(raw))return[Number(raw)];const s=raw.toLowerCase().replace(/[,/]/g," ").trim();if(!s)return[];const out=[];s.split(/\s+/).forEach(x=>{if(dayMap[x]!=null)out.push(dayMap[x]);else if(/^[mtwrfsu]+$/.test(x))for(const ch of x){const d={m:1,t:2,w:3,r:4,f:5,s:6,u:0}[ch];if(d!=null)out.push(d)}});return[...new Set(out)].sort((a,b)=>DAY_ORDER.indexOf(a)-DAY_ORDER.indexOf(b))}
function cleanJson(text){let s=String(text||"").trim().replace(/^```(?:json)?/i,"").replace(/```$/i,"").trim(),a=s.indexOf("["),b=s.lastIndexOf("]");if(a>=0&&b>a)s=s.slice(a,b+1);return JSON.parse(s)}
function normalizeRows(rows){return(rows||[]).map((r,i)=>({id:r.id||("class-"+Date.now()+"-"+i),title:String(r.title||r.course||r.courseName||r.courseCode||"Class").trim(),courseCode:String(r.courseCode||r.code||"").trim(),days:normalizeDays(r.days||r.meetingDays),start:normalizeTime(r.start||r.startTime),end:normalizeTime(r.end||r.endTime),location:String(r.location||r.room||"").trim(),source:"class"})).filter(r=>r.title&&r.days.length&&r.start&&r.end)}
function timeSelect(value,onChange){const s=document.createElement("select");TIME_OPTIONS.forEach(t=>{const o=document.createElement("option");o.value=t;o.textContent=displayTime(t);if(normalizeTime(value)===t)o.selected=true;s.appendChild(o)});s.addEventListener("change",()=>onChange(s.value));return s}
function dayPicker(days,onChange){const wrap=document.createElement("div");wrap.className="day-picker";let state=new Set(normalizeDays(days));DAY_ORDER.forEach(d=>{const b=document.createElement("button");b.type="button";b.className="day-chip"+(state.has(d)?" active":"");b.textContent=DAY_META[d].short;b.title=DAY_META[d].full;b.addEventListener("click",()=>{state.has(d)?state.delete(d):state.add(d);b.classList.toggle("active");onChange([...state].sort((x,y)=>DAY_ORDER.indexOf(x)-DAY_ORDER.indexOf(y)))});wrap.appendChild(b)});return wrap}
function field(label,node){const w=document.createElement("div");w.className="field";const l=document.createElement("label");l.textContent=label;w.append(l,node);return w}
function textInput(value,placeholder,onInput){const i=document.createElement("input");i.value=value||"";i.placeholder=placeholder||"";i.addEventListener("input",()=>onInput(i.value));return i}
function deleteButton(onClick){const b=document.createElement("button");b.type="button";b.className="delete-row";b.title="Delete";b.setAttribute("aria-label","Delete");b.textContent="×";b.addEventListener("click",onClick);return b}
function renderClasses(){const list=$("course-list");list.textContent="";if(!classes.length){const e=document.createElement("div");e.className="empty-state";e.textContent="No classes yet. Add one or try another screenshot.";list.appendChild(e);return}classes.forEach(c=>{const card=document.createElement("div");card.className="editor-card";card.dataset.classId=c.id;card.style.setProperty("--accent",accentFor(c.courseCode||c.title));const top=document.createElement("div");top.className="editor-top";top.append(field("Course",textInput(c.title,"Course name",v=>c.title=v)),field("Days",dayPicker(c.days,v=>c.days=v)),deleteButton(()=>{classes=classes.filter(x=>x!==c);renderClasses()}));const bottom=document.createElement("div");bottom.className="editor-bottom";bottom.append(field("Location",textInput(c.location,"Building / room",v=>c.location=v)),field("Start",timeSelect(c.start,v=>c.start=v)),field("End",timeSelect(c.end,v=>c.end=v)));card.append(top,bottom);list.appendChild(card)})}
function renderBusy(){const list=$("busy-list");list.textContent="";if(!busyBlocks.length){const e=document.createElement("div");e.className="empty-state";e.innerHTML="Nothing else blocks your week yet.<br><span style='font-size:12px'>Add work, office hours, practices, recurring meetings, etc.</span>";list.appendChild(e);return}busyBlocks.forEach(c=>{const card=document.createElement("div");card.className="editor-card busy-card";card.style.setProperty("--accent",BUSY_ACCENT[c.category]||BUSY_ACCENT.Other);const cat=document.createElement("select");["Work","Office Hours","Study","Other"].forEach(x=>{const o=document.createElement("option");o.value=x;o.textContent=x;if(c.category===x)o.selected=true;cat.appendChild(o)});cat.addEventListener("change",()=>{c.category=cat.value;card.style.setProperty("--accent",BUSY_ACCENT[c.category]||BUSY_ACCENT.Other)});const top=document.createElement("div");top.className="editor-top";top.append(field("Type",cat),field("Name",textInput(c.title,"e.g. Shift, TA hours",v=>c.title=v)),deleteButton(()=>{busyBlocks=busyBlocks.filter(x=>x!==c);renderBusy()}));const bottom=document.createElement("div");bottom.className="editor-bottom";bottom.append(field("Days",dayPicker(c.days,v=>c.days=v)),field("Start",timeSelect(c.start,v=>c.start=v)),field("End",timeSelect(c.end,v=>c.end=v)),field("Location",textInput(c.location,"Optional",v=>c.location=v)));card.append(top,bottom);list.appendChild(card)})}
function validateClassesForSave(){
  document.querySelectorAll("#course-list .editor-card").forEach(card=>card.classList.remove("invalid"));
  const problems=[];
  classes.forEach((c,index)=>{
    const days=normalizeDays(c.days),start=normalizeTime(c.start),end=normalizeTime(c.end),title=String(c.title||"").trim();
    const missing=[];
    if(!title)missing.push("course name");
    if(!days.length)missing.push("at least one day");
    if(!start)missing.push("start time");
    if(!end)missing.push("end time");
    if(start&&end&&start>=end)missing.push("an end time after the start time");
    if(missing.length)problems.push({c,index,missing});
  });
  if(problems.length){
    const first=problems[0],card=document.querySelector(`#course-list .editor-card[data-class-id="${CSS.escape(first.c.id)}"]`);
    if(card){card.classList.add("invalid");card.scrollIntoView({behavior:"smooth",block:"center"})}
    const label=String(first.c.title||"").trim()||`Class ${first.index+1}`;
    showStatus(`${label}: add ${first.missing.join(", ")} before saving.`,"err");
    return false;
  }
  return true;
}
function renderAll(){renderClasses();renderBusy();$("results").classList.add("show")}
function addClass(){classes.push({id:"class-manual-"+Date.now(),title:"",courseCode:"",days:[1],start:"09:00",end:"10:00",location:"",source:"class"});renderClasses();setTimeout(()=>{$("course-list").lastElementChild?.scrollIntoView({behavior:"smooth",block:"center"})},30)}
function addBusy(){busyBlocks.push({id:"busy-"+Date.now(),category:"Work",title:"",days:[1],start:"17:00",end:"18:00",location:"",source:"manual"});renderBusy();setTimeout(()=>{$("busy-list").lastElementChild?.scrollIntoView({behavior:"smooth",block:"center"})},30)}
async function parseWithLocalAI(){
  if(!imageBlob)throw new Error("Choose a screenshot first.");
  if(typeof LanguageModel==="undefined")throw new Error("Chrome's on-device image model is not available in this browser profile yet. Use the .ics option for now.");
  const opts={expectedInputs:[{type:"text",languages:["en"]},{type:"image"}],expectedOutputs:[{type:"text",languages:["en"]}]};
  setProcessing("Checking on-device AI…","Making sure Chrome's local model is ready.");
  const availability=await LanguageModel.availability(opts);
  if(availability==="unavailable"){hideProcessing();throw new Error("The on-device model is unavailable on this computer. Use the .ics option for now.");}
  if(availability==="available")setProcessing("Starting local AI…","Your screenshot stays on this device.");
  else setProcessing("Preparing local AI…","Chrome needs to finish downloading the on-device model.",0);
  const session=await LanguageModel.create({...opts,initialPrompts:[{role:"system",content:"You extract university class meeting schedules from screenshots. Return only valid JSON. Never invent a class, room, day, or time that is not visible. Ignore assignment deadlines, exam dates, grades, and navigation text. Prefer recurring weekly class meetings only. If the same class meets on multiple days at the same time, combine those days into one object."}],monitor(m){m.addEventListener("downloadprogress",e=>{const pct=Math.round((e.loaded||0)*100);setProcessing("Downloading local AI…",pct<100?`Chrome is preparing Gemini Nano · ${pct}%`:"Model downloaded · starting analysis",pct)})}});
  try{
    setProcessing("Reading your schedule…","Finding recurring classes, days, times, and rooms.");
    const response=await session.prompt([{role:"user",content:[{type:"text",value:'Extract every recurring class meeting visible. Return ONLY a JSON array. Each object: {"title":"course name or code","courseCode":"code if visible else empty","days":["Mon","Wed"],"start":"HH:MM AM","end":"HH:MM AM","location":"building and room if visible else empty"}. Read the day columns carefully. Combine days only when title, time, and location match. Do not guess a location.'},{type:"image",value:imageBlob}]}]);
    setProcessing("Building your editor…","Cleaning up the detected schedule.");
    classes=normalizeRows(cleanJson(response));
    if(!classes.length)throw new Error("I couldn't confidently detect recurring classes. Try a clearer screenshot or use an .ics export.");
    renderAll();hideProcessing();showStatus("Found "+classes.length+" class meeting blocks. Fix anything it missed, then save.","ok");
  }finally{try{session.destroy()}catch(e){}}
}
function parseICS(text){const events=[],blocks=String(text).split("BEGIN:VEVENT").slice(1).map(x=>x.split("END:VEVENT")[0]),unfold=s=>s.replace(/\r?\n[ \t]/g,"");for(const raw of blocks){const b=unfold(raw),val=name=>{const m=b.match(new RegExp("(?:^|\\n)"+name+"(?:;[^:]*)?:([^\\n\\r]+)","i"));return m?m[1].trim():""},summary=val("SUMMARY"),loc=val("LOCATION"),ds=val("DTSTART"),de=val("DTEND"),rr=val("RRULE");if(!summary||!ds||!de)continue;const tm=x=>{const m=x.match(/T(\d{2})(\d{2})/);return m?m[1]+":"+m[2]:""};let days=[];const by=rr.match(/BYDAY=([^;]+)/i);if(by)days=by[1].split(",").map(x=>({MO:1,TU:2,WE:3,TH:4,FR:5,SA:6,SU:0}[x])).filter(x=>x!=null);if(!days.length){const d=new Date(ds.slice(0,4)+"-"+ds.slice(4,6)+"-"+ds.slice(6,8)+"T12:00:00");days=[d.getDay()]}events.push({title:summary,courseCode:"",days,start:tm(ds),end:tm(de),location:loc})}return normalizeRows(events)}
function chooseFile(file){if(!file)return;hideProcessing();imageBlob=file;const p=$("preview");p.src=URL.createObjectURL(file);p.hidden=false;$("read").disabled=false;showStatus("Screenshot ready. Click “Read my schedule”.")}
function expandBusyForStorage(){const out=[];busyBlocks.forEach((b,idx)=>{const days=normalizeDays(b.days);days.forEach((d,j)=>out.push({id:(b.id||"busy-"+Date.now()+"-"+idx)+"-"+j,title:(b.title||b.category||"Busy").trim(),category:b.category||"Other",days:[d],start:normalizeTime(b.start),end:normalizeTime(b.end),location:(b.location||"").trim(),source:"manual"}))});return out.filter(x=>x.title&&x.days.length&&x.start&&x.end)}
function groupBusy(events){const grouped=[];for(const e of Array.isArray(events)?events:[]){const key=[e.title,e.category,e.start,e.end,e.location].join("|");let g=grouped.find(x=>x._key===key);if(!g){g={_key:key,id:"busy-existing-"+grouped.length,title:e.title||e.category||"Busy",category:e.category||"Other",days:[],start:e.start||"17:00",end:e.end||"18:00",location:e.location||"",source:"manual"};grouped.push(g)}g.days.push(...normalizeDays(e.days||[]))}return grouped.map(x=>{delete x._key;x.days=normalizeDays(x.days);return x})}
function selectedShareMode(){const e=document.querySelector('input[name="share-mode"]:checked');return e&&["full","busy","hidden"].includes(e.value)?e.value:"busy"}
function setShareMode(mode){const safe=["full","busy","hidden"].includes(mode)?mode:"busy";const e=document.querySelector('input[name="share-mode"][value="'+safe+'"]');if(e)e.checked=true}
function storageGet(keys){return new Promise(resolve=>{try{chrome.storage.local.get(keys,v=>resolve(v||{}))}catch(e){resolve({})}})}
function storageSet(value){return new Promise((resolve,reject)=>{try{chrome.storage.local.set(value,()=>{const e=chrome.runtime&&chrome.runtime.lastError;e?reject(new Error(e.message)):resolve()})}catch(e){reject(e)}})}
function sbConfig(){const c=window.CANVAS_DASH_SUPABASE||{};return{url:String(c.url||"").replace(/\/$/,""),publishableKey:c.publishableKey||""}}
async function refreshSession(session){const c=sbConfig();if(!c.url||!c.publishableKey||!session||!session.refresh_token)return null;const r=await fetch(c.url+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{"Content-Type":"application/json",apikey:c.publishableKey},body:JSON.stringify({refresh_token:session.refresh_token})});if(!r.ok)return null;const d=await r.json(),next={access_token:d.access_token,refresh_token:d.refresh_token||session.refresh_token,expires_in:d.expires_in,user:d.user||session.user,obtained_at:Date.now()};await storageSet({canvas_dash_session:next});return next}
async function rpcWithSession(name,args,retry=true){const c=sbConfig(),saved=await storageGet(["canvas_dash_session"]),session=saved.canvas_dash_session;if(!c.url||!c.publishableKey)throw new Error("Supabase config is missing.");if(!session||!session.access_token)return null;const r=await fetch(c.url+"/rest/v1/rpc/"+name,{method:"POST",headers:{"Content-Type":"application/json",apikey:c.publishableKey,Authorization:"Bearer "+session.access_token,Prefer:"return=representation"},body:JSON.stringify(args||{})});if(r.status===401&&retry){const fresh=await refreshSession(session);if(fresh)return rpcWithSession(name,args,false)}const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch(e){data=text}if(!r.ok){const msg=data&&(data.message||data.msg||data.hint||data.error_description)||("Request failed ("+r.status+")");throw new Error(msg)}return data}
function sharedBlocks(validClasses,manual,mode){if(mode==="hidden")return[];const out=[];const add=(row,kind)=>{normalizeDays(row.days).forEach(day=>{const isClass=kind==="class";const full=mode==="full";out.push({day,start:normalizeTime(row.start),end:normalizeTime(row.end),title:full?(isClass?(row.title||row.courseCode||"Class"):(row.category||"Busy")):"Busy",location:full&&isClass?(row.location||""):"",kind:full?kind:"busy",category:full?(isClass?"Class":(row.category||"Other")):"Busy"})})};validClasses.forEach(x=>add(x,"class"));manual.forEach(x=>add(x,"manual"));return out.filter(x=>Number.isInteger(x.day)&&x.start&&x.end).sort((a,b)=>a.day-b.day||a.start.localeCompare(b.start)||a.end.localeCompare(b.end)||a.title.localeCompare(b.title))}
async function syncSharePayload(mode,blocks){const res=await rpcWithSession("upsert_my_shared_schedule",{p_share_mode:mode,p_blocks:blocks});return res!==null}
async function loadExistingSchedule(){const saved=await storageGet(["lcd_schedule_classes","lcd_manual_events","lcd_schedule_share_mode"]);classes=normalizeRows(saved.lcd_schedule_classes||[]);busyBlocks=groupBusy(saved.lcd_manual_events||[]);setShareMode(saved.lcd_schedule_share_mode||"busy");if(classes.length||busyBlocks.length){renderAll();showStatus("Loaded your saved schedule. Edit anything below, or re-import above.","ok")}else{setShareMode(saved.lcd_schedule_share_mode||"busy")}}
$("image-file").addEventListener("change",e=>chooseFile(e.target.files[0]));const drop=$("drop");["dragenter","dragover"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add("drag")}));["dragleave","drop"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove("drag")}));drop.addEventListener("drop",e=>chooseFile(e.dataTransfer.files[0]));
$("read").addEventListener("click",async()=>{const b=$("read");b.disabled=true;try{await parseWithLocalAI()}catch(e){hideProcessing();showStatus(e.message||String(e),"err")}finally{b.disabled=false}});
$("ics-file").addEventListener("change",async e=>{try{classes=parseICS(await e.target.files[0].text());if(!classes.length)throw new Error("No recurring calendar events found in that .ics file.");renderAll();showStatus("Imported "+classes.length+" recurring class/event blocks from .ics. Review them, then save.","ok")}catch(err){showStatus(err.message||String(err),"err")}});
$("manual-start").addEventListener("click",()=>{renderAll();addClass();showStatus("Manual editor ready. Add the classes and busy blocks you want, then save.")});
$("add-class").addEventListener("click",addClass);$("add-busy").addEventListener("click",addBusy);
$("retry").addEventListener("click",()=>{hideProcessing();$("image-file").value="";$("preview").hidden=true;showStatus("Choose a new screenshot or .ics file above. Your current editor stays intact until you save a replacement.");$("import-card").scrollIntoView({behavior:"smooth",block:"start"})});
$("save").addEventListener("click",async()=>{
  const btn=$("save");
  if(!validateClassesForSave())return;
  const validClasses=normalizeRows(classes),manual=expandBusyForStorage();
  const mode=selectedShareMode(),blocks=sharedBlocks(validClasses,manual,mode),syncHash=JSON.stringify({mode,blocks});
  btn.disabled=true;btn.dataset.originalText=btn.dataset.originalText||btn.textContent;btn.textContent="Saving…";showStatus("Saving locally first…");
  try{
    const prior=await storageGet(["lcd_schedule_sync_hash","lcd_schedule_sync_pending","canvas_dash_session"]),changed=syncHash!==prior.lcd_schedule_sync_hash,pending=changed||!!prior.lcd_schedule_sync_pending;
    await storageSet({lcd_schedule_classes:validClasses,lcd_manual_events:manual,lcd_schedule_imported_at:Date.now(),lcd_schedule_share_mode:mode,lcd_schedule_sync_pending:pending});
    classes=validClasses;busyBlocks=groupBusy(manual);
    let synced=false;
    if(pending&&prior.canvas_dash_session&&prior.canvas_dash_session.access_token){
      btn.textContent="Syncing…";showStatus("Saved locally · syncing the share-safe schedule to friends…");
      synced=await syncSharePayload(mode,blocks);
      if(synced)await storageSet({lcd_schedule_sync_hash:syncHash,lcd_schedule_sync_pending:false,lcd_schedule_synced_at:Date.now()});
    }
    btn.textContent="Saved ✓";
    if(pending&&!synced)showStatus("Saved locally ✓ · sign in (or open Friends) to finish syncing.","ok");
    else if(changed&&synced)showStatus("Saved + synced ✓ · friends will refresh automatically.","ok");
    else showStatus("Saved ✓ · no shareable change, so no Realtime message was sent.","ok");
    setTimeout(()=>{try{window.close()}catch(e){}},1100);
  }catch(err){
    btn.disabled=false;btn.textContent=btn.dataset.originalText;showStatus("Saved locally, but friend sync needs attention: "+(err.message||String(err)),"err");
    try{await storageSet({lcd_schedule_sync_pending:true})}catch(e){}
  }
});
$("close").addEventListener("click",()=>window.close());
loadExistingSchedule();
})();
