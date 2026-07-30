// Smoke harness: minimal DOM stubs + the page script + assertions.
// Run with: node test/smoke.js
"use strict";
class FakeClassList {
  constructor(){ this.s = new Set(); }
  add(...c){ c.forEach(x=>this.s.add(x)); }
  remove(...c){ c.forEach(x=>this.s.delete(x)); }
  toggle(c, force){ const on = force===undefined ? !this.s.has(c) : force; on?this.s.add(c):this.s.delete(c); return on; }
  contains(c){ return this.s.has(c); }
}
class FakeEl {
  constructor(tag){ this.tagName=(tag||"div").toUpperCase(); this.classList=new FakeClassList();
    this.style={}; this.dataset={}; this.children=[]; this._inner=""; this.textContent=""; this.title=""; this.value=""; }
  set innerHTML(v){ this._inner=v; this.children = v ? [new FakeEl(),new FakeEl()] : []; }
  get innerHTML(){ return this._inner; }
  set className(v){ this.classList = new FakeClassList(); v.split(/\s+/).filter(Boolean).forEach(c=>this.classList.add(c)); }
  appendChild(c){ this.children.push(c); return c; }
  removeChild(){ }
  querySelector(){ return new FakeEl(); }
  querySelectorAll(){ return [new FakeEl(), new FakeEl(), new FakeEl()]; }
  addEventListener(){ }
  getBoundingClientRect(){ return {left:0,top:0,width:600,height:400}; }
  getContext(){ return {clearRect(){},fillRect(){},globalAlpha:1,fillStyle:""}; }
  select(){ }
  get offsetWidth(){ return 100; }
  focus(){ }
}
const els = {};
const doc = {
  getElementById(id){ return els[id] || (els[id] = new FakeEl()); },
  createElement(t){ return new FakeEl(t); },
  body: new FakeEl("body"),
  activeElement: null,
  execCommand(){ return true; }
};
doc.body.appendChild = c => c; doc.body.removeChild = () => {};
const store = {};
global.document = doc;
global.window = global;
global.localStorage = { getItem:k=>store[k]??null, setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];} };
Object.defineProperty(global, "navigator", { value: { clipboard: { writeText: () => Promise.resolve() } }, configurable: true });
global.addEventListener = () => {};
global.innerWidth = 1200; global.innerHeight = 800;
global.requestAnimationFrame = () => 0;
global.getComputedStyle = () => ({ getPropertyValue: () => "#f5b356" });
global.AudioContext = class { constructor(){ this.state="running"; this.currentTime=0; this.destination={}; }
  resume(){} createOscillator(){ return {type:"",frequency:{value:0},connect(){},start(){},stop(){}}; }
  createGain(){ const g={gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}; return g; } };

const fs = require("fs");
const html = fs.readFileSync(require("path").join(__dirname, "..", "index.html"), "utf8");
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];

// Assertions must run inside the eval scope to see the script's consts.
function tests(){
function assert(cond, msg){ if(!cond) { console.error("FAIL: "+msg); process.exitCode = 1; } }

// 1. generation: 1000 ideas across normal + hard mode, all fields sane
const rarKeys = new Set(RARITIES.map(r=>r.k));
const seenRar = new Set(), seenCat = new Set();
for (let mode=0; mode<2; mode++){
  S.hard = mode===1;
  for (let i=0;i<500;i++){
    const idea = generateIdea();
    assert(rarKeys.has(idea.rar), "bad rarity "+idea.rar);
    assert(typeof idea.title==="string" && idea.title.length>1, "bad title");
    assert(typeof idea.hook==="string" && idea.hook.length>20 && !idea.hook.includes("{"), "bad hook: "+idea.hook);
    assert(Array.isArray(idea.feats) && idea.feats.length>=3 && idea.feats.length<=5, "feat count "+idea.feats.length);
    assert(new Set(idea.feats).size === idea.feats.length, "duplicate features");
    assert(idea.twists.length>=1 && idea.twists.every(t=>t.length>5), "bad twists");
    assert(typeof idea.plat==="string" && idea.plat.length>2, "bad platform");
    assert(idea.scope && idea.scope.n, "bad scope");
    assert(typeof idea.sig==="string", "bad sig");
    seenRar.add(idea.rar); seenCat.add(idea.cat);
  }
}
assert(seenRar.size===6, "not all rarities rolled (got "+[...seenRar]+")");
assert(seenCat.size===6, "not all categories rolled (got "+[...seenCat]+")");

// 2. full pull path: 60 pulls exercise xp/streak/codex/challenges/history/render
S.hard = true;
for (let i=0;i<60;i++) pull();
assert(S.pulls===60, "pull count "+S.pulls);
assert(S.xp>0, "no xp");
assert(S.streak===60, "streak "+S.streak);
assert(S.codex.length>0 && S.codex.length<=60, "codex size "+S.codex.length);
assert(history.length===10, "history size "+history.length);
assert(levelInfo(S.xp).li>0, "no level up after 60 hard pulls");

// 3. fusion sanity: legendary/mythic games are always fused
for (let i=0;i<200;i++){
  const g = buildGame(RARITIES[4]);
  assert(g.type.includes(" × "), "legendary game not fused: "+g.type);
}
const m = buildGame(RARITIES[5]);
assert(m.twists.length===2, "mythic should have 2 twists");

// 4. formatters + favorites + codex render don't throw
const idea = generateIdea();
current = idea; addToCodex(idea);
assert(formatText(idea).includes(idea.title), "formatText");
assert(formatMd(idea).startsWith("## "), "formatMd");
toggleFav(idea); assert(S.favs.includes(idea.sig), "fav add");
toggleFav(idea); assert(!S.favs.includes(idea.sig), "fav remove");
renderCodex(); renderHistory(); renderChallenges(); renderRank();

// 5. persistence round-trip
save();
const reloaded = JSON.parse(store[KEY]);
assert(reloaded.pulls===S.pulls && reloaded.xp===S.xp, "persistence round-trip");

// 6. daily rollover resets stats but keeps codex + xp
S.day = "2000-01-01"; save();
loadState();
assert(S.stats.pullsToday===0, "daily stats not reset");
assert(S.codex.length>0, "codex lost on rollover");
assert(S.xp>0, "xp lost on rollover");
assert(S.daily.length===3, "daily challenges not picked");

console.log(process.exitCode ? "SMOKE FAILED" : "SMOKE OK — all assertions passed");
}
eval(src + "\n;(" + tests.toString() + ")();");
