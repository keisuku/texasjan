(function(global){
"use strict";

const TERMINALS=[0,8,9,17,18,26], HONORS=[27,28,29,30,31,32,33];
const ORPHANS=TERMINALS.concat(HONORS);
const DRAGONS=[31,32,33], WINDS=[27,28,29,30];
const GREEN=new Set([19,20,21,23,25,32]);

function counts(ids){
  const c=new Array(34).fill(0);
  ids.forEach(function(id){if(id>=0&&id<34)c[id]++;});
  return c;
}
function isHonor(t){return t>=27;}
function isTerminal(t){return t<27&&(t%9===0||t%9===8);}
function isOutside(t){return isHonor(t)||isTerminal(t);}
function sameSuit(a,b){return a<27&&b<27&&Math.floor(a/9)===Math.floor(b/9);}
function hasValuePair(t,opt){
  if(DRAGONS.indexOf(t)>=0)return true;
  return t===opt.seatWind||t===opt.roundWind;
}
function addYaku(list,name,han){list.push({name:name,han:han});}

function kokushi(c){
  let pair=false,total=0;
  for(let i=0;i<34;i++){
    if(c[i]&&ORPHANS.indexOf(i)<0)return false;
    if(ORPHANS.indexOf(i)>=0){if(c[i]===0)return false;if(c[i]>=2)pair=true;total+=c[i];}
  }
  return total===14&&pair;
}
function chuuren(c){
  let suit=-1;
  for(let t=0;t<34;t++)if(c[t]){
    if(t>=27)return false;
    const s=Math.floor(t/9);if(suit<0)suit=s;else if(s!==suit)return false;
  }
  if(suit<0)return false;
  const b=suit*9,need=[3,1,1,1,1,1,1,1,3];let extra=0;
  for(let r=0;r<9;r++){if(c[b+r]<need[r])return false;extra+=c[b+r]-need[r];}
  return extra===1;
}
function decompose(c){
  const out=[];
  function melds(rest,groups){
    let t=0;while(t<34&&rest[t]===0)t++;
    if(t===34){if(groups.length===4)out.push(groups.slice());return;}
    if(rest[t]>=3){
      rest[t]-=3;groups.push({kind:"triplet",tile:t});melds(rest,groups);groups.pop();rest[t]+=3;
    }
    if(t<27&&t%9<=6&&rest[t+1]>0&&rest[t+2]>0){
      rest[t]--;rest[t+1]--;rest[t+2]--;
      groups.push({kind:"sequence",tile:t});melds(rest,groups);groups.pop();
      rest[t]++;rest[t+1]++;rest[t+2]++;
    }
  }
  for(let p=0;p<34;p++)if(c[p]>=2){
    const rest=c.slice();rest[p]-=2;const before=out.length;melds(rest,[]);
    for(let i=before;i<out.length;i++)out[i]={pair:p,melds:out[i]};
  }
  return out;
}
function waitKinds(shape,win){
  const kinds=[];
  if(shape.pair===win)kinds.push("tanki");
  shape.melds.forEach(function(m){
    if(m.kind==="triplet"&&m.tile===win)kinds.push("shanpon");
    if(m.kind!=="sequence"||win<m.tile||win>m.tile+2)return;
    const r=m.tile%9,off=win-m.tile;
    if(off===1)kinds.push("kanchan");
    else if((r===0&&off===2)||(r===6&&off===0))kinds.push("penchan");
    else kinds.push("ryanmen");
  });
  return kinds.length?kinds:["unknown"];
}
function pointValue(han,fu,yakuman){
  if(yakuman){return {points:32000*yakuman,limit:yakuman>1?yakuman+"倍役満":"役満"};}
  if(han>=13)return {points:32000,limit:"数え役満"};
  if(han>=11)return {points:24000,limit:"三倍満"};
  if(han>=8)return {points:16000,limit:"倍満"};
  if(han>=6)return {points:12000,limit:"跳満"};
  const base=fu*Math.pow(2,han+2);
  if(han>=5||base>=2000)return {points:8000,limit:"満貫"};
  /* 非親ツモの合計評価点（親の2倍支払い + 子2人の1倍支払い）。
     実際の6人ポット精算には使わず、麻雀としての手の価値表示と比較にだけ使う。 */
  return {points:Math.ceil(base*2/100)*100+2*Math.ceil(base/100)*100,limit:""};
}
function suitState(ids){
  const suits=new Set();let honor=false;
  ids.forEach(function(t){if(t>=27)honor=true;else suits.add(Math.floor(t/9));});
  return {suits:suits,honor:honor};
}
function yakumanFor(ids,c,shape){
  const names=[];
  if(kokushi(c))names.push("国士無双");
  if(ids.every(function(t){return isHonor(t);}))names.push("字一色");
  if(ids.every(function(t){return isTerminal(t);}))names.push("清老頭");
  if(ids.every(function(t){return GREEN.has(t);}))names.push("緑一色");
  if(chuuren(c))names.push("九蓮宝燈");
  if(shape){
    const trips=shape.melds.filter(function(m){return m.kind==="triplet";}).map(function(m){return m.tile;});
    if(DRAGONS.every(function(t){return trips.indexOf(t)>=0;}))names.push("大三元");
    const windTrips=WINDS.filter(function(t){return trips.indexOf(t)>=0;});
    if(windTrips.length===4)names.push("大四喜");
    else if(windTrips.length===3&&WINDS.indexOf(shape.pair)>=0)names.push("小四喜");
    if(trips.length===4)names.push("四暗刻");
  }
  return names;
}
function normalCandidate(ids,c,shape,win,opt,wait){
  const yaku=[];
  addYaku(yaku,"リーチ",1);addYaku(yaku,"門前ツモ",1);
  const sequences=shape.melds.filter(function(m){return m.kind==="sequence";});
  const trips=shape.melds.filter(function(m){return m.kind==="triplet";});
  const allSimple=ids.every(function(t){return !isOutside(t);});
  if(allSimple)addYaku(yaku,"断么九",1);
  const pinfu=trips.length===0&&!hasValuePair(shape.pair,opt)&&wait==="ryanmen";
  if(pinfu)addYaku(yaku,"平和",1);

  const seqCount={};sequences.forEach(function(m){seqCount[m.tile]=(seqCount[m.tile]||0)+1;});
  const seqPairs=Object.keys(seqCount).filter(function(k){return seqCount[k]>=2;}).length;
  if(seqPairs>=2)addYaku(yaku,"二盃口",3);else if(seqPairs===1)addYaku(yaku,"一盃口",1);
  for(let r=0;r<=6;r++)if([0,1,2].every(function(s){return sequences.some(function(m){return m.tile===s*9+r;});})){
    addYaku(yaku,"三色同順",2);break;
  }
  for(let s=0;s<3;s++)if([0,3,6].every(function(r){return sequences.some(function(m){return m.tile===s*9+r;});})){
    addYaku(yaku,"一気通貫",2);break;
  }
  for(let r=0;r<9;r++)if([0,1,2].every(function(s){return trips.some(function(m){return m.tile===s*9+r;});})){
    addYaku(yaku,"三色同刻",2);break;
  }
  DRAGONS.forEach(function(t){if(trips.some(function(m){return m.tile===t;}))addYaku(yaku,{31:"白",32:"發",33:"中"}[t],1);});
  if(opt.seatWind!=null&&trips.some(function(m){return m.tile===opt.seatWind;}))addYaku(yaku,"自風",1);
  if(opt.roundWind!=null&&trips.some(function(m){return m.tile===opt.roundWind;}))addYaku(yaku,"場風",1);
  if(trips.length===4)addYaku(yaku,"対々和",2);
  if(trips.length>=3)addYaku(yaku,"三暗刻",2);
  const dragonTrips=DRAGONS.filter(function(t){return trips.some(function(m){return m.tile===t;});});
  if(dragonTrips.length===2&&DRAGONS.indexOf(shape.pair)>=0)addYaku(yaku,"小三元",2);
  if(ids.every(function(t){return isOutside(t);}))addYaku(yaku,"混老頭",2);

  const everyOutside=shape.melds.every(function(m){return m.kind==="triplet"?isOutside(m.tile):(m.tile%9===0||m.tile%9===6);})&&isOutside(shape.pair);
  if(everyOutside&&sequences.length){
    if(ids.some(isHonor))addYaku(yaku,"混全帯么九",2);else addYaku(yaku,"純全帯么九",3);
  }
  const ss=suitState(ids);
  if(ss.suits.size===1){if(ss.honor)addYaku(yaku,"混一色",3);else addYaku(yaku,"清一色",6);}

  const dora=opt.dora==null?0:c[opt.dora];
  if(dora)addYaku(yaku,"ドラ",dora);
  const han=yaku.reduce(function(n,y){return n+y.han;},0);
  let fu=20;
  if(!pinfu)fu+=2;
  if(DRAGONS.indexOf(shape.pair)>=0)fu+=2;
  if(shape.pair===opt.seatWind)fu+=2;if(shape.pair===opt.roundWind)fu+=2;
  trips.forEach(function(m){fu+=isOutside(m.tile)?8:4;});
  if(wait==="tanki"||wait==="kanchan"||wait==="penchan")fu+=2;
  fu=pinfu?20:Math.ceil(fu/10)*10;
  const pv=pointValue(han,fu,0);
  return {complete:true,type:"standard",yaku:yaku,han:han,fu:fu,points:pv.points,limit:pv.limit,wait:wait,shape:shape};
}
function chiitoiCandidate(ids,c,opt){
  const pairs=[];for(let t=0;t<34;t++)if(c[t]===2)pairs.push(t);
  if(pairs.length!==7)return null;
  const yaku=[];addYaku(yaku,"リーチ",1);addYaku(yaku,"門前ツモ",1);addYaku(yaku,"七対子",2);
  if(ids.every(function(t){return !isOutside(t);}))addYaku(yaku,"断么九",1);
  if(ids.every(function(t){return isOutside(t);}))addYaku(yaku,"混老頭",2);
  const ss=suitState(ids);if(ss.suits.size===1){if(ss.honor)addYaku(yaku,"混一色",3);else addYaku(yaku,"清一色",6);}
  const dora=opt.dora==null?0:c[opt.dora];if(dora)addYaku(yaku,"ドラ",dora);
  const han=yaku.reduce(function(n,y){return n+y.han;},0),pv=pointValue(han,25,0);
  return {complete:true,type:"chiitoi",yaku:yaku,han:han,fu:25,points:pv.points,limit:pv.limit,wait:"tanki",shape:null};
}
function finish(result){
  result.yakuNames=result.yaku.map(function(y){return y.name;});
  result.summary=result.yakuman?result.limit:(result.limit?result.limit+"・"+result.han+"翻":result.han+"翻"+result.fu+"符・"+result.points.toLocaleString()+"点");
  result.score=result.points*10000+result.han*100+result.fu;
  return result;
}
function evaluate(ids,winTile,options){
  const opt=Object.assign({dora:null,seatWind:null,roundWind:null},options||{});
  if(!Array.isArray(ids)||ids.length!==14)return {complete:false,yaku:[],yakuNames:[],han:0,fu:0,points:0,limit:"",summary:"未完成",score:0};
  const c=counts(ids);if(c.some(function(n){return n>4;}))return {complete:false,yaku:[],yakuNames:[],han:0,fu:0,points:0,limit:"",summary:"不正な牌構成",score:0};
  const win=winTile==null?ids[ids.length-1]:winTile;
  const candidates=[];
  const specialYakuman=yakumanFor(ids,c,null);
  if(specialYakuman.length){
    const pv=pointValue(0,0,specialYakuman.length);
    candidates.push({complete:true,type:"yakuman",yaku:specialYakuman.map(function(name){return {name:name,han:0};}),han:0,fu:0,points:pv.points,limit:pv.limit,wait:"special",shape:null,yakuman:specialYakuman.length});
  }
  const chi=chiitoiCandidate(ids,c,opt);if(chi)candidates.push(chi);
  decompose(c).forEach(function(shape){
    const yakuman=yakumanFor(ids,c,shape);
    if(yakuman.length){
      const pv=pointValue(0,0,yakuman.length);
      candidates.push({complete:true,type:"yakuman",yaku:yakuman.map(function(name){return {name:name,han:0};}),han:0,fu:0,points:pv.points,limit:pv.limit,wait:waitKinds(shape,win)[0],shape:shape,yakuman:yakuman.length});
      return;
    }
    waitKinds(shape,win).forEach(function(wait){candidates.push(normalCandidate(ids,c,shape,win,opt,wait));});
  });
  if(!candidates.length)return {complete:false,yaku:[],yakuNames:[],han:0,fu:0,points:0,limit:"",summary:"未完成",score:0};
  candidates.forEach(finish);candidates.sort(function(a,b){return b.score-a.score;});return candidates[0];
}
function findWaits(ids,options){
  if(!Array.isArray(ids)||ids.length!==13)return [];
  const c=counts(ids),out=[];
  for(let t=0;t<34;t++)if(c[t]<4){
    const r=evaluate(ids.concat(t),t,options);
    if(r.complete)out.push({tile:t,result:r});
  }
  out.sort(function(a,b){return b.result.score-a.result.score||a.tile-b.tile;});
  return out;
}

global.MahjongScore={evaluate:evaluate,findWaits:findWaits,counts:counts};
})(typeof window!=="undefined"?window:this);
