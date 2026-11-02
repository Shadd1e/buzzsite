(function(){
"use strict";
/* Set this to your form-handling URL once one exists. While empty, nothing is sent and the site says so. */
var ENDPOINT="";
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function post(kind,data){return fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:kind,data:data})}).then(function(r){if(!r.ok)throw 0})}

/* content grids */
var G={
feat:[["Private chats","Photos, videos, files, stickers and voice notes."],["Communities","Groups around a place or purpose, like your street or estate."],["Updates","Share a status or follow what your communities post."],["BuzzDrop","Swap Buzz identities with someone nearby by scanning, without sharing your number."],["Marketplace","Local sellers, plus Depot for wholesale and bulk. Prices in naira."],["Housing","Homes, rentals and short stays, with the person managing the property."],["Services","Repairs and everyday work from people near you."],["Lawyers","Verified lawyers by practice area, location, language and availability."],["Assistant","Tell it what you want and it points you to the right place."]],
safe:[["Buzz Alert","Local updates at four levels: national, regional, local and personal."],["Rescue Mode","A discreet route to trusted people and approved response channels."],["Trusted contacts","Choose who Buzz can notify in an emergency, and review your alert history."],["Stealth","Hides sensitive rescue cues from your normal profile."],["Security Live","For genuine security incidents only, from a safe distance of 20 feet (6 metres) or more. Never chase or confront anyone to record them."]],
pro:[["Marketplace","Sell products and services. List in Depot to reach wholesale buyers."],["Housing","List and manage properties. Verification comes first; buyers speak to the manager."],["Lawyers","A separate space for verified solicitors."]]};
$$("[data-g]").forEach(function(g){g.innerHTML=G[g.dataset.g].map(function(a){return '<div class="box"><h3>'+a[0]+'</h3><p>'+a[1]+'</p></div>'}).join("")});

/* generic forms: [label,name,type,required,options,hint,minLength] */
var CAT=["Chat and calls","Safety and alerts","Marketplace, housing or lawyers","Payments","A delivery rider","A user or account","A seller or listing","A scam or fraud attempt","An order I can’t find","The website","Something else"];
var F={
waitlist:{b:"Join the waitlist",c:"Buzz may contact me about access. See the privacy summary.",f:[["Full name","name","text",1],["Phone number","phone","tel",1],["City or area","city","text",1],["Your phone","device","select",0,["Android","iPhone"]]]},
report:{b:"Send message",f:[["Type","type","select",0,["Contact","Report","Complaint","Suggestion"]],["About","category","select",1,CAT],["Message","message","area",1,0,"",10],["Name","name","text",0,0,"optional"],["Phone or email","contact","text",0,0,"optional, if you want a reply"]]},
careers:{b:"Send application",c:"Buzz may store my application and contact me about it.",f:[["Full name","name","text",1],["Email","email","email",1],["Phone number","phone","tel",1],["Link to CV or portfolio","link","url",0,0,"optional"],["Why Buzz, and why you?","message","area",1,0,"",20]]},
suspend:{b:"Request suspension",c:"This is my account and the details are true. I understand giving false details may be a crime.",f:[["Buzz ID","buzzId","text",1],["Phone number registered on Buzz","phone","tel",1],["Full name on the account","name","text",1],["A security question you set up","q1","text",1],["Your answer","a1","text",1],["A different phone number or email","alt","text",1,0,"your lost phone can’t take our call"]]},
track:{b:"Track goods",local:1,f:[["Tracking code","code","text",1],["Phone number on the order","phone","tel",1]]}};
$$("form[data-f]").forEach(function(form){
  var k=form.dataset.f,c=F[k],h="";
  if(!ENDPOINT)h+='<p class="notice">This form isn’t connected yet. Nothing you enter is sent or saved.</p>';
  c.f.forEach(function(f){
    var l=f[0]+(f[5]?' <small>'+f[5]+'</small>':""),a=' name="'+f[1]+'"'+(f[3]?" required":"")+(f[6]?' minlength="'+f[6]+'"':"");
    if(f[2]==="select")h+='<label>'+l+'<select'+a+'>'+(f[3]?'<option value="">Choose one</option>':"")+f[4].map(function(o){return "<option>"+o+"</option>"}).join("")+'</select></label>';
    else if(f[2]==="area")h+='<label>'+l+'<textarea'+a+' maxlength="3000"></textarea></label>';
    else h+='<label>'+l+'<input type="'+f[2]+'"'+a+' maxlength="200"'+(f[2]==="tel"?' inputmode="tel"':"")+'></label>'});
  h+='<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">';
  if(c.c)h+='<label class="ck"><input type="checkbox" required><span>'+c.c+'</span></label>';
  h+='<p class="msg" aria-live="polite"></p><div><button class="btn" type="submit">'+c.b+'</button></div>';
  form.innerHTML=h;form.noValidate=true;
  form.addEventListener("submit",function(e){
    e.preventDefault();var m=$(".msg",form);m.className="msg";m.textContent="";
    if(form.website.value)return;
    var bad=null,why="";
    $$("[required]",form).forEach(function(el){if(bad)return;
      var v=el.type==="checkbox"?el.checked:el.value.trim();
      if(!v){bad=el;why=el.type==="checkbox"?"Please tick the box to continue.":"Please fill in the required fields."}
      else if(el.type==="email"&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value)){bad=el;why="That email address doesn’t look right."}
      else if(el.type==="tel"&&el.value.replace(/\D/g,"").length<7){bad=el;why="Enter a phone number we can reach."}
      else if(el.minLength>0&&el.value.trim().length<el.minLength){bad=el;why="Please write a little more."}});
    if(bad){m.textContent=why;bad.focus();return}
    if(c.local){m.textContent="Tracking isn’t connected yet, so we can’t look up this order.";return}
    if(!ENDPOINT){m.textContent="Not sent. This form isn’t connected yet, so nothing was received or saved.";return}
    var d={};$$("input,select,textarea",form).forEach(function(el){if(el.name&&el.name!=="website")d[el.name]=el.value.trim()});
    post(k,d).then(function(){m.className="msg ok";m.textContent="Sent. We’ll be in touch.";form.reset()}).catch(function(){m.textContent="Couldn’t send. Please try again."})})});

/* rider signup: one question at a time */
var S=[
{k:"name",q:"What should we call you?",n:"So we know who we’re talking to.",t:"text",ph:"Your first name is fine",ack:function(v){return "Nice to meet you, "+v.split(" ")[0]+"."}},
{k:"phone",q:"What’s your phone number?",n:"It’s how we’ll reach you, by call or WhatsApp.",t:"tel",ph:"0803 000 0000",ack:"Great, now we know how to reach you."},
{k:"area",q:"Which area can you ride in?",n:"We start where Buzz sellers are busiest.",t:"text",ph:"e.g. Yaba, Lagos",ack:"Good. That tells us where to look first."},
{k:"vehicle",q:"What will you ride or drive?",n:"Bigger orders need bigger vehicles, so this helps us match you.",o:["Bicycle","Motorbike","Car","Van"],ack:"That helps a lot."},
{k:"time",q:"When can you ride?",n:"So we never call you for work you can’t do.",o:["Full time","Part time","Weekends only","Evenings only"],ack:"Noted. Nearly there."},
{k:"exp",q:"Have you delivered before?",n:"Optional. It’s a bonus, not a requirement.",t:"area",opt:1,ph:"One line is plenty, or skip this",ack:"Thanks. That’s every detail."},
{k:"ok",q:"Last one: is it OK if we contact you?",n:"We check your ID with you before your first delivery. Please don’t type any ID numbers here.",o:["Yes, that’s fine"],ack:"All done. Well finished."}];
var wiz=$("#wiz"),bar=$("#bar"),segs=$("#segs"),praise=$("#praise"),ix=-1,D={},saying="Ready when you are.",tab="join",page="home";
segs.innerHTML=S.map(function(){return '<div class="seg"><i></i></div>'}).join("");
function prog(n,t){$$(".seg",segs).forEach(function(s,i){s.classList.toggle("on",i<n)});praise.textContent=t}
function barOn(){bar.hidden=!(page==="riderhub"&&tab==="join")}
function wrender(){
  var h="";
  if(ix<0){
    h='<h2>Ride with Buzz</h2><p>Buzz sellers need people to carry orders to buyers. Sign up and we’ll contact you when riders are needed in your area.</p><p class="why">Seven short questions, one at a time. About two minutes.</p><button class="btn" id="go" type="button">Start</button>';prog(0,"Ready when you are.")
  }else if(ix<S.length){
    var s=S[ix];
    h='<form id="wf" novalidate><span class="cnt">Question '+(ix+1)+' of '+S.length+'</span><h2>'+s.q+'</h2><p class="why">'+s.n+'</p>';
    if(s.o)h+='<div class="opts">'+s.o.map(function(o){return '<button type="button" class="opt'+(D[s.k]===o?" sel":"")+'" data-v="'+esc(o)+'">'+esc(o)+'</button>'}).join("")+'</div>';
    else if(s.t==="area")h+='<textarea name="v" maxlength="400" placeholder="'+esc(s.ph||"")+'" aria-label="'+esc(s.q)+'">'+esc(D[s.k]||"")+'</textarea>';
    else h+='<input name="v" type="'+s.t+'" maxlength="120" placeholder="'+esc(s.ph||"")+'" value="'+esc(D[s.k]||"")+'" aria-label="'+esc(s.q)+'"'+(s.t==="tel"?' inputmode="tel"':"")+'>';
    h+='<p class="msg" id="wm" aria-live="polite"></p><div class="row">'+(s.o?"":'<button class="btn" type="submit">'+(s.opt&&!D[s.k]?"Skip":"Continue")+'</button>')+(ix>0?'<button class="lnk" type="button" id="back">Back</button>':"")+'</div></form>';
    prog(ix,ix?saying:"Ready when you are.")
  }else{
    var a=D.area||"your area";
    h='<h2>You’re all set, '+esc((D.name||"").split(" ")[0])+'.</h2><p>We’ll contact you on <b>'+esc(D.phone)+'</b> when riders are needed in '+esc(a)+'. Keep your phone nearby.</p><dl class="dl"><dt>Area</dt><dd>'+esc(D.area)+'</dd><dt>Vehicle</dt><dd>'+esc(D.vehicle)+'</dd><dt>Availability</dt><dd>'+esc(D.time)+'</dd>'+(D.exp?'<dt>Experience</dt><dd>'+esc(D.exp)+'</dd>':"")+'</dl>'+(ENDPOINT?"":'<p class="notice">Preview: this form isn’t connected yet, so nothing was sent.</p>')+'<div class="row"><button class="btn" type="button" id="trk">Track goods</button><button class="lnk" type="button" id="again">Start again</button></div>';
    prog(S.length,"That’s the whole journey. Thank you.")}
  wiz.innerHTML=h;wiz.firstChild&&0;wiz.classList.remove("in");void wiz.offsetWidth;wiz.classList.add("in");
  var inp=$("input,textarea",wiz);if(inp&&ix>=0)inp.focus({preventScroll:true})}
function advance(v){
  var s=S[ix];D[s.k]=v;saying=typeof s.ack==="function"?s.ack(v):s.ack;
  if(ix===S.length-1&&ENDPOINT){post("rider",D).then(function(){ix++;wrender()}).catch(function(){var m=$("#wm");if(m)m.textContent="Couldn’t send. Please try again."});return}
  ix++;wrender()}
wiz.addEventListener("click",function(e){
  var t=e.target.closest("button");if(!t)return;
  if(t.id==="go"){ix=0;wrender()}
  else if(t.id==="back"){ix--;saying="Take your time.";wrender()}
  else if(t.id==="again"){D={};ix=-1;saying="";wrender()}
  else if(t.id==="trk"){setTab("track")}
  else if(t.dataset.v){$$(".opt",wiz).forEach(function(o){o.classList.toggle("sel",o===t)});var v=t.dataset.v;setTimeout(function(){advance(v)},240)}});
wiz.addEventListener("submit",function(e){
  e.preventDefault();var s=S[ix],v=$("[name=v]",wiz).value.trim(),m=$("#wm");
  if(!v&&!s.opt){m.textContent="Please fill this in to continue.";return}
  if(s.t==="tel"&&v.replace(/\D/g,"").length<7){m.textContent="That number looks too short. Check it and try again.";return}
  advance(v)});
function setTab(t){tab=t;$$(".tab").forEach(function(b){b.setAttribute("aria-selected",b.dataset.tab===t)});$("#tab-join").hidden=t!=="join";$("#tab-track").hidden=t!=="track";barOn()}
$$(".tab").forEach(function(b){b.addEventListener("click",function(){setTab(b.dataset.tab)})});

/* routing */
var PAGES=["home","riderhub","report","careers","suspend","legal"];
function route(){
  var h=location.hash.slice(1),el=h&&document.getElementById(h);
  page=PAGES.indexOf(h)>=0?h:"home";
  PAGES.forEach(function(p){$("#"+p).hidden=p!==page});
  var t=$("#"+page+" h1");document.title=page==="home"?"Buzz":t.textContent+" · Buzz";
  barOn();
  if(page==="riderhub"&&!wiz.innerHTML)wrender();
  if(page==="home"&&el&&el.id!=="home")el.scrollIntoView();else window.scrollTo(0,0)}
window.addEventListener("hashchange",route);route();
})();
