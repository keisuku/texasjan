#!/usr/bin/env node
"use strict";
const Betting=require("../betting-engine.js");
const AI=require("../betting-ai.js");

const HANDS=Math.max(1,Number(process.argv[2])||100000);
const START=[3940,4620,4730,4110,4880,5870],MODES=["sequence","flush","triplet","pairs","total"];
const ANTE=300,MIN_BET=100,TOTAL=START.reduce((a,b)=>a+b,0);
let seed=0x5eed1234;
function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;}
function shuffle(){const w=[];for(let t=0;t<34;t++)for(let k=0;k<4;k++)w.push(t);
  for(let i=w.length-1;i>0;i--){const j=Math.floor(random()*(i+1)),x=w[i];w[i]=w[j];w[j]=x;}return w;}
function anteFor(stack){return Math.min(Math.max(50,Math.floor(stack*.06)),ANTE,stack);}
function doraOf(i){if(i<27)return i%9===8?i-8:i+1;if(i<31)return i===30?27:i+1;return i===33?31:i+1;}
function pct(a,p){a=a.slice().sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.floor(a.length*p))];}
function stats(a){return {n:a.length,p10:pct(a,.10),p25:pct(a,.25),median:pct(a,.50),p75:pct(a,.75),p90:pct(a,.90),max:pct(a,1)};}

const streetPots=[[],[],[],[]],orbitActions=[];let folds=0,raises=0,checks=0,calls=0,allins=0,conservationFailures=0;
for(let handNo=0;handNo<HANDS;handNo++){
  const wall=shuffle(),hands=[];for(let i=0;i<6;i++)hands.push(wall.splice(0,8));
  const dora=doraOf(wall.shift());let common=wall.splice(0,15),stacks=START.slice(),pot=0,folded=new Array(6).fill(false);
  for(let i=0;i<6;i++){const paid=anteFor(stacks[i]);stacks[i]-=paid;pot+=paid;}
  const dealer=handNo%6;
  for(let street=1;street<=4;street++){
    if(street>1)common=common.concat(wall.splice(0,4));
    const round=Betting.startRound({playerCount:6,userIndex:5,dealerIndex:dealer,street:street,
      stacks:stacks,folded:folded,minRaise:MIN_BET});
    let guard=0;
    while(round.phase==="acting"&&guard++<100){
      const i=round.currentActor,l=Betting.legal(round,i);let choice;
      if(i===5)choice={kind:l.toCall>0?"call":"check",target:0};
      else{
        const confidence=AI.confidence({hand:hands[i],common:common,dora:dora,mode:MODES[i],street:street,random:random});
        choice=AI.choose({legal:l,confidence:confidence,pot:pot,street:street,mode:MODES[i],state:round,player:i,random:random});
      }
      const result=Betting.act(round,i,choice.kind,choice.target);pot+=result.action.paid;
      if(result.action.type==="FOLD")folds++;else if(result.action.type==="RAISE"||result.action.type==="BET")raises++;
      else if(result.action.type==="CHECK")checks++;else if(result.action.type==="CALL")calls++;else if(result.action.type==="ALL-IN")allins++;
    }
    if(guard>=100)throw new Error("orbit guard exceeded at hand "+handNo);
    stacks=round.stacks.slice();folded=round.folded.slice();streetPots[street-1].push(pot);orbitActions.push(round.actions.length);
    if(round.uncontestedWinner!==null)break;
  }
  if(stacks.reduce((a,b)=>a+b,0)+pot!==TOTAL)conservationFailures++;
}
console.log(JSON.stringify({hands:HANDS,seed:"0x5eed1234",totalChips:TOTAL,
  pots:{common15:stats(streetPots[0]),plus4I:stats(streetPots[1]),plus4II:stats(streetPots[2]),plus4III:stats(streetPots[3])},
  orbitActions:stats(orbitActions),actions:{checks:checks,calls:calls,raises:raises,folds:folds,allins:allins},
  conservationFailures:conservationFailures},null,2));
