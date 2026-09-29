(()=>{"use strict";
const $=id=>document.getElementById(id),config=window.CANVAS_DASH_SUPABASE||{};let mode="signup";
function norm(v){return String(v||"").trim().toLowerCase().replace(/^@/,"").replace(/[^a-z0-9._-]/g,"").slice(0,24)}
function status(msg,type){const e=$("status");e.textContent=msg;e.className="status"+(type?" "+type:"")}
function setMode(next){mode=next;const sign=next==="signup";$("signup-tab").classList.toggle("active",sign);$("signin-tab").classList.toggle("active",!sign);$("profile-fields").classList.toggle("hidden",!sign);$("title").textContent=sign?"Create your account":"Welcome back";$("submit").textContent=sign?"Create account":"Sign in";$("password").autocomplete=sign?"new-password":"current-password";status("")}
async function saveSession(data){const session={access_token:data.access_token,refresh_token:data.refresh_token,expires_in:data.expires_in,user:data.user,obtained_at:Date.now()};let profile=null;if(data.user&&data.user.id){const r=await fetch(config.url.replace(/\/$/,"")+"/rest/v1/profiles?id=eq."+encodeURIComponent(data.user.id)+"&select=id,username,display_name,school",{headers:{apikey:config.publishableKey,Authorization:"Bearer "+data.access_token}});if(r.ok){const rows=await r.json();profile=rows[0]||null}}
  const localProfile=profile?{id:profile.id,name:profile.display_name||"",username:profile.username||"",school:profile.school||""}:null;await new Promise((resolve,reject)=>chrome.storage.local.set(Object.assign({canvas_dash_session:session},localProfile?{lcd_profile:localProfile}:{}),()=>chrome.runtime.lastError?reject(new Error(chrome.runtime.lastError.message)):resolve()));return localProfile}
async function request(url,opts){const r=await fetch(config.url.replace(/\/$/,"")+url,Object.assign({},opts,{headers:Object.assign({"Content-Type":"application/json",apikey:config.publishableKey},opts&&opts.headers||{})}));const d=await r.json();if(!r.ok)throw new Error(d.msg||d.message||d.error_description||"Authentication failed");return d}
$("signup-tab").addEventListener("click",()=>setMode("signup"));$("signin-tab").addEventListener("click",()=>setMode("signin"));
$("auth-form").addEventListener("submit",async e=>{e.preventDefault();const b=$("submit");b.disabled=true;status(mode==="signup"?"Creating account…":"Signing in…");try{let data;if(mode==="signup"){const username=norm($("username").value),displayName=$("display-name").value.trim(),school=$("school").value.trim();if(username.length<3)throw new Error("Choose a Canvas Dash ID with at least 3 characters.");if(!displayName)throw new Error("Add your display name.");data=await request("/auth/v1/signup",{method:"POST",body:JSON.stringify({email:$("email").value.trim(),password:$("password").value,data:{username,display_name:displayName,school}})})}else{data=await request("/auth/v1/token?grant_type=password",{method:"POST",body:JSON.stringify({email:$("email").value.trim(),password:$("password").value})})}if(!data.access_token)throw new Error("No session returned. Check your Supabase email confirmation setting.");const p=await saveSession(data);status((mode==="signup"?"Account created":"Signed in")+(p&&p.username?" · @"+p.username:"")+" ✓","ok");$("submit").textContent="Done ✓";setTimeout(()=>window.close(),700)}catch(err){status(err.message||String(err),"err");b.disabled=false}});

try {
  const requested=new URLSearchParams(window.location.search).get("mode");
  setMode(requested==="signin"?"signin":"signup");
  chrome.storage.local.get(["canvas_dash_session","lcd_profile"],function(saved){
    if(saved&&saved.canvas_dash_session&&saved.canvas_dash_session.access_token){
      const p=saved.lcd_profile||{};
      status("Already signed in"+(p.username?" as @"+p.username:"")+" on this device.","ok");
    }
  });
} catch(e) { setMode("signup"); }
})();