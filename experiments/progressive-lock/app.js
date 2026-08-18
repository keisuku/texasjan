"use strict";
(function(){
  const STAGES=[
    {key:"preflop",label:"開始",title:"私牌8枚だけで参加を判断",sub:"この段階では牌を決めません。賭けだけを行います。",target:0},
    {key:"flop",label:"共通15枚",title:"中核となる4枚を選ぶ",sub:"私牌8枚と共通15枚のどこから選んでも構いません。",target:4},
    {key:"turn",label:"追加4枚①",title:"さらに4枚を選ぶ",sub:"最初の4枚は変更できません。合計8枚を中核にします。",target:4},
    {key:"river",label:"追加4枚②",title:"残り6枚で最終14枚を作る",sub:"固定8枚は必ず使用。未固定牌から6枚を加えます。",target:6},
    {key:"showdown",label:"決着",title:"固定8枚＋自由6枚で勝負",sub:"他家は順位を押すと、同じ領域で一人ずつ確認できます。",target:0}
  ];
  const privateTiles=["Man2","Man3","Man3","Pin5","Pin5","Sou6","Ton","Hatsu"];
  const common15=["Man1","Man4","Man7","Pin2","Pin2","Pin8","Sou3","Sou4","Sou5","Ton","Nan","Haku","Haku","Chun","Hatsu"];
  const turn4=["Man3","Pin5","Sou6","Chun"];
  const river4=["Man5","Pin2","Haku","Nan"];
  const all=[
    ...privateTiles.map((name,i)=>({uid:"p"+i,name,source:"private",group:0})),
    ...common15.map((name,i)=>({uid:"c"+i,name,source:"common",group:1})),
    ...turn4.map((name,i)=>({uid:"t"+i,name,source:"common",group:2})),
    ...river4.map((name,i)=>({uid:"r"+i,name,source:"common",group:3}))
  ];
  const byId=Object.fromEntries(all.map(x=>[x.uid,x]));
  const numberKanji=["","一","二","三","四","五","六","七","八","九"];
  function tileLabel(name){
    const match=name.match(/^(Man|Pin|Sou)([1-9])$/);
    if(match){const suit={Man:"萬",Pin:"筒",Sou:"索"}[match[1]];return numberKanji[Number(match[2])]+suit;}
    return {Ton:"東",Nan:"南",Shaa:"西",Pei:"北",Haku:"白",Hatsu:"發",Chun:"中"}[name]||name;
  }
  const presets={
    0:{locked:[],draft:[]},
    1:{locked:[],draft:["c6","c7","c8","p3"]},
    2:{locked:["c6","c7","c8","p3"],draft:["p4","c3","c4","t1"]},
    3:{locked:["c6","c7","c8","p3","p4","c3","c4","t1"],draft:["p0","p1","p2","c9","c10","r3"]},
    4:{locked:["c6","c7","c8","p3","p4","c3","c4","t1"],draft:["p0","p1","p2","c9","c10","r3"]}
  };
  const opponents=[
    {name:"九蓮",score:"獲得 2,400点",private:["Man1","Man1","Man6","Pin3","Sou2","Sou7","Nan","Chun"],final:["Man1","Man1","Man2","Man3","Man4","Pin2","Pin2","Pin2","Sou3","Sou4","Sou5","Nan","Nan","Chun"],from:[0,1,7,12]},
    {name:"カムイ",score:"獲得 1,800点",private:["Man4","Man4","Pin1","Pin7","Sou3","Sou8","Haku","Hatsu"],final:["Man4","Man4","Pin2","Pin2","Pin5","Pin5","Sou3","Sou3","Sou8","Sou8","Haku","Haku","Hatsu","Hatsu"],from:[0,1,6,7,10,11,12,13]},
    {name:"翡翠",score:"獲得 1,200点",private:["Man7","Man7","Man9","Pin8","Pin8","Sou4","Ton","Ton"],final:["Man7","Man7","Man7","Pin8","Pin8","Pin8","Sou4","Sou4","Sou4","Ton","Ton","Ton","Haku","Haku"],from:[0,1,3,4,6,9,10]},
    {name:"レン",score:"獲得 900点",private:["Man2","Man5","Pin3","Pin4","Sou6","Sou7","Shaa","Haku"],final:["Man2","Man3","Man4","Man5","Man6","Man7","Pin2","Pin3","Pin4","Sou5","Sou6","Sou7","Haku","Haku"],from:[0,3,4,5,10,11,12]},
    {name:"アキ",score:"降り",private:["Man8","Pin1","Pin9","Sou1","Sou9","Pei","Chun","Chun"],final:["Man8","Man8","Pin1","Pin2","Pin3","Pin7","Pin8","Pin9","Sou1","Sou2","Sou3","Chun","Chun","Chun"],from:[0,1,8,12,13]}
  ];
  let stage=0,locked=[],draft=[],toastTimer=0,shownPlayer=0;
  const q=new URLSearchParams(location.search), requested=q.get("stage");
  const assetRoot=(location.protocol==="file:"||location.hostname==="localhost"||location.hostname==="127.0.0.1")
    ?"https://raw.githubusercontent.com/keisuku/texasjan/main/":"../../";
  const el=id=>document.getElementById(id);
  el("app").style.backgroundImage='url("'+assetRoot+'claude-handoff/visual/arena-with-characters.webp")';
  function tileSrc(name){return assetRoot+"assets/tiles/"+name+".svg";}
  function available(x){return x.group===0||x.group<=stage;}
  function selected(uid){return draft.includes(uid);}
  function tileNode(x,small){
    const b=document.createElement("button");b.type="button";b.className="tile";b.dataset.uid=x.uid;
    const li=locked.indexOf(x.uid);if(li>=0){b.classList.add("locked","disabled");b.dataset.lock=String(li+1);b.disabled=true;b.setAttribute("aria-disabled","true");}
    if(selected(x.uid))b.classList.add("draft");if(x.group===stage&&stage>=2)b.classList.add("new");
    b.setAttribute("aria-label",tileLabel(x.name)+(li>=0?" 固定済み":selected(x.uid)?" 選択中":""));b.setAttribute("aria-pressed",selected(x.uid)?"true":"false");b.innerHTML='<img alt="" src="'+tileSrc(x.name)+'">';
    b.addEventListener("click",()=>toggle(x.uid));return b;
  }
  function toggle(uid){
    if(stage===0||stage===4||locked.includes(uid))return;
    const x=byId[uid];if(!x||!available(x))return;
    const at=draft.indexOf(uid);if(at>=0)draft.splice(at,1);
    else{const max=STAGES[stage].target;if(draft.length>=max){notify(max+"枚選択済みです。入れ替える牌を先に外してください。");return;}draft.push(uid);}
    render();
  }
  function notify(text){const t=el("toast");t.textContent=text;t.classList.add("on");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("on"),1700);}
  function renderSteps(){
    const n=el("steps");n.innerHTML="";STAGES.forEach((s,i)=>{const b=document.createElement("button");b.type="button";b.className="step"+(i===stage?" current":i<stage?" done":"");b.textContent=s.label;b.setAttribute("aria-label",(i+1)+" / 5　"+s.label+"。"+s.title);if(i===stage)b.setAttribute("aria-current","step");b.addEventListener("click",()=>loadStage(i));n.appendChild(b);});
  }
  function renderPool(id,items){const n=el(id);n.innerHTML="";items.forEach(x=>n.appendChild(tileNode(x)));n.hidden=!items.length;}
  function renderCore(){
    const n=el("core");n.innerHTML="";const ids=locked.concat(stage===3||stage===4?[]:draft);
    for(let i=0;i<8;i++){const s=document.createElement("div");s.className="slot"+(ids[i]?" fixed":"");if(ids[i])s.appendChild(tileNode(byId[ids[i]],true));else s.textContent=String(i+1);n.appendChild(s);}
    el("coreCount").textContent=locked.length+(stage<3?" ＋ 選択 "+draft.length:"")+" / 8";
  }
  function displayTile(name,fromPrivate){
    const b=document.createElement("span");b.className="tile disabled"+(fromPrivate?" from-private":"");b.setAttribute("role","img");b.setAttribute("aria-label",tileLabel(name)+(fromPrivate?"、私牌から採用":""));b.innerHTML='<img alt="" src="'+tileSrc(name)+'">';return b;
  }
  function showData(){
    if(shownPlayer===0){const ids=locked.concat(draft);return {name:"あなた",score:"獲得 3,600点",private:privateTiles,final:ids.map(uid=>byId[uid].name),from:ids.map((uid,i)=>byId[uid].source==="private"?i:-1).filter(i=>i>=0)};}
    return opponents[shownPlayer-1];
  }
  function renderFinal(){
    const data=showData(),n=el("final"),p=el("shownPrivate");n.innerHTML="";p.innerHTML="";
    data.final.forEach((name,i)=>n.appendChild(displayTile(name,data.from.includes(i))));data.private.forEach(name=>p.appendChild(displayTile(name,false)));
    el("shownName").textContent=(shownPlayer+1)+"位　"+data.name;el("shownScore").textContent=data.score;
    const ranking=el("ranking");ranking.innerHTML="";["あなた",...opponents.map(x=>x.name)].forEach((name,i)=>{const b=document.createElement("button");b.type="button";b.className="rank"+(i===shownPlayer?" active":"");b.textContent=(i+1)+"位 "+name;b.addEventListener("click",()=>{shownPlayer=i;renderFinal();});ranking.appendChild(b);});
  }
  function render(){
    renderSteps();const s=STAGES[stage];el("instruction").innerHTML="<strong>"+s.title+"</strong><span>"+s.sub+"</span>";
    const common=stage>=1?all.filter(x=>x.group===1):[];renderPool("common",common);renderPool("turn",stage>=2?all.filter(x=>x.group===2):[]);renderPool("river",stage>=3?all.filter(x=>x.group===3):[]);renderPool("private",all.filter(x=>x.group===0));
    el("commonZone").style.display=stage===0?"none":"block";el("commonCount").textContent=stage===0?"0枚":stage===1?"15枚":stage===2?"19枚":"23枚";renderCore();
    el("showdown").classList.toggle("on",stage===4);if(stage===4)renderFinal();
    const c=el("confirm"),a=el("actions"),bettingLocked=stage>0;a.hidden=stage===4;a.classList.toggle("dim",stage>0&&stage<4);a.querySelectorAll("button").forEach(b=>b.disabled=bettingLocked);
    if(stage===0){c.textContent="私牌は固定せず、ベットへ";c.disabled=false;}
    else if(stage===1||stage===2){c.textContent=draft.length+" / 4　この4枚で進む";c.disabled=draft.length!==4;}
    else if(stage===3){c.textContent=(locked.length+draft.length)+" / 14　最終手牌を決定";c.disabled=draft.length!==6;}
    else{c.textContent="次の局へ";c.disabled=false;}
    el("hint").textContent=stage===0?"牌の固定は共通15枚の公開後に始まります。":stage===4?"固定した8枚は金色の番号、私牌由来は水色の印で確認できます。":"牌をタップして選択。ドラッグ操作はありません。";
  }
  function confirm(){
    if(stage===0){notify("プリフロップのベット完了。共通15枚を公開します。");loadStage(1,true);return;}
    if(stage===1||stage===2){if(draft.length!==4)return;locked=locked.concat(draft);draft=[];notify(stage===1?"最初の4枚を固定しました。":"中核8枚が決まりました。");stage++;render();return;}
    if(stage===3){if(draft.length!==6)return;stage=4;notify("ショーダウン");render();return;}
    loadStage(0,true);
  }
  function loadStage(i,blank){
    stage=Math.max(0,Math.min(4,Number(i)||0));shownPlayer=0;const p=presets[stage];locked=blank&&stage===1?[]:p.locked.slice();draft=blank&&stage===1?[]:p.draft.slice();render();
  }
  el("confirm").addEventListener("click",confirm);document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>notify(b.dataset.action==="降りる"?"この局を降りました。":b.dataset.action+"を選択しました。")));
  const startIndex=STAGES.findIndex(x=>x.key===requested);loadStage(startIndex>=0?startIndex:0);
  window.ProgressiveLockMock={getState:()=>({stage,locked:locked.slice(),draft:draft.slice()}),loadStage,toggle,confirm,render};
})();
