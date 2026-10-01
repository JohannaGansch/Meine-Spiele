const OWNER="JohannaGansch",REPO="Meine-Spiele",FOLDER="Unity_Spiele";
const API="https://api.github.com/repos/"+OWNER+"/"+REPO+"/contents/"+FOLDER+"?ref=main";
const PAGE="https://"+OWNER.toLowerCase()+".github.io/"+REPO+"/";
let games=[],filter="all";
const $=id=>document.getElementById(id);

function cleanName(n){return n.replace(/[_-]+/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
function guessType(n){n=n.toLowerCase();if(/vogel|bird|avian|spatz|eule|owl|adler/.test(n))return"bird";if(/dino|rex|raptor|jurassic|saur/.test(n))return"dino";return"all"}

async function load(){
  $("status").textContent="🔎 Suche nach neuen Unity-Spielen auf GitHub…";
  try{
    const r=await fetch(API,{headers:{Accept:"application/vnd.github+json"}});
    if(!r.ok)throw new Error(r.status);
    const items=await r.json();
    const folders=items.filter(x=>x.type==="dir"&&x.name.toLowerCase()!=="website");
    let meta={};
    try{const m=await fetch("spiele.json?cb="+Date.now());if(m.ok)meta=await m.json()}catch{}
    games=folders.map(f=>{
      const x=meta[f.name]||meta[f.name.toLowerCase()]||{};
      return{
        name:x.name||cleanName(f.name),
        folder:f.name,
        type:x.type||guessType(f.name),
        description:x.description||"Ein Unity-Spiel von Johanna.",
        version:x.version||"—",
        image:x.image||"",
        url:x.url||PAGE+"Unity_Spiele/"+encodeURIComponent(f.name)+"/"
      }
    });
    render();
    $("updated").textContent="Zuletzt aktualisiert: "+new Date().toLocaleTimeString("de-AT");
  }catch(e){
    $("status").textContent="⚠️ Die Spiele konnten gerade nicht aus GitHub geladen werden.";
    console.error(e);
  }
}

function render(){
  const q=$("search").value.trim().toLowerCase();
  const shown=games.filter(g=>(filter==="all"||g.type===filter)&&(!q||g.name.toLowerCase().includes(q)||g.description.toLowerCase().includes(q)));
  $("title").textContent=filter==="dino"?"🦖 Dinosaurier":filter==="bird"?"🐦 Vögel":"Alle Spiele";
  $("count").textContent=shown.length;
  $("status").textContent=games.length?games.length+" Spiel"+(games.length===1?"":"e")+" aus GitHub gefunden.":"Noch keine Spiele gefunden – bald kommt hier mehr! 🌿";
  $("cards").innerHTML=shown.length?shown.map(card).join(""):'<div class="empty">Keine passenden Spiele gefunden.</div>';
}

function card(g){
  const icon=g.type==="dino"?"🦖":g.type==="bird"?"🐦":"🎮";
  const label=g.type==="dino"?"DINO":g.type==="bird"?"VOGEL":"SPIEL";
  const image=g.image?'<img src="'+safe(g.image)+'" alt="">':icon;
  return '<article class="card"><div class="thumb">'+image+'<span class="tag">'+icon+' '+label+'</span></div><div class="body"><h3>'+safe(g.name)+'</h3><div class="desc">'+safe(g.description)+'</div><div class="meta"><span>J.G. · Unity</span><span>v'+safe(g.version)+'</span></div><a class="play" href="'+safe(g.url)+'">▶️ Spiel öffnen</a></div></article>';
}
function safe(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");filter=b.dataset.filter;render()});
$("search").oninput=render;$("refresh").onclick=load;load();
