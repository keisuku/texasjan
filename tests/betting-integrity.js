#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const Betting=require("../betting-engine.js");
const Settlement=require("../pot-settlement.js");
let passed=0;
function test(name,fn){fn();passed++;console.log("PASS  "+name);}
function table(stacks,more){return Betting.startRound(Object.assign({playerCount:stacks.length,
  dealerIndex:stacks.length-1,userIndex:stacks.length-1,stacks:stacks,minRaise:100},more));}
function act(s,kind,target){return Betting.act(s,s.currentActor,kind,target);}
function settle(contributions,folded,scores,extra){return Settlement.settle(Object.assign({contributions,folded,scores},extra));}

test("a short all-in requires a response without reopening the prior bettor",function(){
  const s=table([1000,150,1000]);
  act(s,"raise",100);act(s,"raise",150);act(s,"call");
  assert.equal(s.currentActor,0);
  assert.equal(Betting.legal(s,0).toCall,50);
  assert.equal(Betting.legal(s,0).canRaise,false);
  const before=Betting.snapshot(s);
  assert.throws(()=>act(s,"raise",300),/raise is not available/);
  assert.deepEqual(s,before,"an illegal raise must not mutate the state");
  act(s,"call");
  assert.equal(s.phase,"complete");
  assert.deepEqual(s.roundBets,[150,150,150]);
});

test("a player who has not acted can raise over a short all-in",function(){
  const s=table([1000,150,1000]);
  act(s,"raise",100);act(s,"raise",150);
  assert.equal(Betting.legal(s,2).canRaise,true);
  assert.equal(Betting.legal(s,2).minRaiseTarget,250);
  act(s,"raise",250);
  assert.equal(Betting.legal(s,0).canRaise,true);
  act(s,"call");
  assert.equal(s.phase,"complete");
});

test("cumulative short all-ins reopen only seats facing a full raise",function(){
  const s=table([1000,125,1000,200,1000]);
  act(s,"raise",100);act(s,"raise",125);act(s,"call");act(s,"raise",200);act(s,"call");
  assert.equal(s.currentActor,0);
  assert.equal(Betting.legal(s,0).canRaise,true);
  assert.equal(Betting.legal(s,0).minRaiseTarget,300);
  act(s,"call");
  assert.equal(s.currentActor,2);
  assert.equal(Betting.legal(s,2).toCall,75);
  assert.equal(Betting.legal(s,2).canRaise,false);
  act(s,"call");
  assert.equal(s.phase,"complete");
  assert.equal(s.lastFullRaise,100);
});

test("a full raise resets each responder's later reopening threshold",function(){
  const s=table([1000,1000,450,1000]);
  act(s,"raise",100);act(s,"raise",300);act(s,"raise",450);act(s,"call");
  assert.equal(s.currentActor,0);
  assert.equal(Betting.legal(s,0).canRaise,true);
  act(s,"call");
  assert.equal(Betting.legal(s,1).canRaise,false);
  act(s,"call");
  assert.equal(s.phase,"complete");
  assert.equal(s.lastFullRaise,200);
});

test("checking does not reopen after a sub-minimum opening all-in",function(){
  const s=table([1000,50,1000]);
  act(s,"check");act(s,"raise",50);act(s,"call");
  assert.equal(Betting.legal(s,0).canRaise,false);
  act(s,"call");assert.equal(s.phase,"complete");
});

test("full ordinary betting and clockwise seat order remain compatible",function(){
  const clockwise=[0,1,3,5,4,2],s=table([1000,1000,1000,1000,1000,1000],{dealerIndex:5,actionOrder:clockwise});
  const seen=[];
  while(s.phase==="acting"){seen.push(s.currentActor);act(s,"check");}
  assert.deepEqual(seen,[4,2,0,1,3,5]);
  const raised=table([1000,1000,1000]);
  act(raised,"check");act(raised,"raise",200);act(raised,"call");act(raised,"call");
  assert.deepEqual(raised.roundBets,[200,200,200]);
  assert.equal(raised.phase,"complete");
});

test("a new street skips betting when only one live seat still has points",function(){
  const s=table([0,1000,0]);
  assert.equal(s.phase,"complete");assert.equal(s.currentActor,-1);
  assert.equal(s.uncontestedWinner,null,"all-in opponents still contest the hand");
  assert.equal(Betting.legal(s,1),null);
});

test("the last funded seat must still call or fold an outstanding all-in",function(){
  const s=table([150,1000]);
  act(s,"raise",150);
  assert.equal(s.phase,"acting");
  assert.equal(Betting.legal(s,1).toCall,150);
  assert.equal(Betting.legal(s,1).canRaise,false);
  act(s,"call");assert.equal(s.phase,"complete");
  const f=table([150,1000]);act(f,"raise",150);act(f,"fold");
  assert.equal(f.uncontestedWinner,0);
});

test("matched lone actors do not get unnecessary checks or bets",function(){
  const s=table([1000,1000,1000]);
  act(s,"check");act(s,"fold");act(s,"fold");
  assert.equal(s.phase,"complete");assert.equal(s.uncontestedWinner,0);
  const all=table([0,0,0]);assert.equal(all.phase,"complete");
});

test("raising is unavailable when no opponent can cover any higher amount",function(){
  const s=table([200,1000,50]);
  act(s,"raise",200);
  assert.equal(Betting.legal(s,1).canRaise,false);
  act(s,"call");act(s,"call");
  assert.equal(s.phase,"complete");
});

test("a short-stack winner takes the main pot, not a deeper side pot",function(){
  const r=settle([100,300,300],[false,false,false],[30,20,10]);
  assert.deepEqual(r.payouts,[300,400,0]);
  assert.deepEqual(r.pots.map(p=>p.eligible),[[0,1,2],[1,2]]);
  assert.deepEqual(r.winners,[0,1]);
});

test("multiple all-ins create independent main and side-pot winners",function(){
  const r=settle([100,200,500,500],[false,false,false,false],[30,20,10,0]);
  assert.deepEqual(r.payouts,[400,300,600,0]);
  assert.deepEqual(r.pots.map(p=>p.amount),[400,300,600]);
});

test("unmatched excess is returned even when that player loses the hand",function(){
  const r=settle([100,300,700],[false,false,false],[30,20,10]);
  assert.deepEqual(r.awards,[300,400,0]);
  assert.deepEqual(r.refunds,[0,0,400]);
  assert.deepEqual(r.payouts,[300,400,400]);
  assert.deepEqual(r.winners,[0,1],"a refund is not a hand victory");
});

test("folded points stay in pots but folded hands cannot win",function(){
  const r=settle([100,300,300],[false,true,false],[20,999,10]);
  assert.deepEqual(r.payouts,[300,0,400]);
  assert.deepEqual(r.pots.map(p=>p.eligible),[[0,2],[2]]);
});

test("an uncontested winner receives matched points and their uncalled refund",function(){
  const r=settle([500,100,200],[false,true,true],null);
  assert.deepEqual(r.awards,[500,0,0]);
  assert.deepEqual(r.refunds,[300,0,0]);
  assert.deepEqual(r.payouts,[800,0,0]);
});

test("ties split every pot with odd points clockwise after the dealer",function(){
  const r=settle([1,2,2,2],[true,false,false,false],[999,10,10,0],{actionOrder:[0,2,1,3],dealerIndex:0});
  assert.deepEqual(r.pots.map(p=>p.amount),[4,3]);
  assert.deepEqual(r.payouts,[0,3,4,0]);
  assert.deepEqual(r.pots[1].winners,[2,1]);
});

test("each odd point goes to the next tied seat, never all to one seat",function(){
  const r=settle([1,1,1,1,1],[true,false,false,false,true],[9,1,1,1,9],{dealerIndex:1});
  assert.deepEqual(r.payouts,[0,1,2,2,0]);
});

test("the prototype's unequal entry fees are shared, never refunded as unmatched bets",function(){
  const r=settle([300,100,50],[true,false,false],[999,10,20],{deadContributions:[300,100,50]});
  assert.deepEqual(r.payouts,[0,0,450]);
  assert.deepEqual(r.refunds,[0,0,0]);
  assert.equal(r.pots[0].kind,"entry");
});

test("entry fees and wagers settle separately so a deep ante cannot distort side-pot caps",function(){
  const r=settle([110,600,700],[false,false,false],[30,20,10],{deadContributions:[10,300,300]});
  assert.deepEqual(r.awards,[910,400,0]);
  assert.deepEqual(r.refunds,[0,0,100]);
  assert.equal(r.total,1410);
});

test("settlement is deterministic and leaves its input untouched",function(){
  const input={contributions:[100,200,300],folded:[false,false,false],scores:[5,5,2],actionOrder:[0,2,1],dealerIndex:2};
  const before=JSON.stringify(input),first=Settlement.settle(input);
  assert.deepEqual(Settlement.settle(input),first);assert.equal(JSON.stringify(input),before);
});

test("invalid point ledgers and missing contested scores fail before any payout",function(){
  assert.throws(()=>settle([100,-1],[false,false],[1,2]),/non-negative/);
  assert.throws(()=>settle([1.5,2],[false,false],[1,2]),/integer/);
  assert.throws(()=>settle([100,100],[false,false],[null,2]),/finite score/);
  assert.throws(()=>settle([100,100],[true,true],[1,2]),/no live player/);
  assert.throws(()=>settle([100,50],[true,false],[1,2]),/folded seat/);
  assert.throws(()=>settle([100,100],[false,false],[1,2],{deadContributions:[101,0]}),/cannot exceed/);
  assert.throws(()=>settle([100,100],[false,false],[1,2],{actionOrder:[0,0]}),/every seat/);
  assert.throws(()=>settle([Number.MAX_SAFE_INTEGER,1],[false,false],[1,2]),/safe integer/);
  assert.deepEqual(settle([0,0],[true,true],null).payouts,[0,0]);
});

test("2,000 seeded multi-street hands conserve points through all-ins, folds and ties",function(){
  let seed=0x5ee77e;
  function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;}
  for(let hand=0;hand<2000;hand++){
    const n=2+Math.floor(random()*5),starting=Array.from({length:n},()=>1+Math.floor(random()*1500));
    let stacks=starting.slice(),folded=new Array(n).fill(false),contributions=new Array(n).fill(0);
    const dead=stacks.map((stack,i)=>hand%2?Math.min(stack,20+Math.floor(stack*.06)):0);
    stacks=stacks.map((stack,i)=>{contributions[i]=dead[i];return stack-dead[i];});
    for(let street=0;street<5;street++){
      const s=table(stacks,{folded,street,dealerIndex:hand%n});let actions=0;
      while(s.phase==="acting"){
        assert.ok(++actions<100,"betting must terminate");
        const i=s.currentActor,l=Betting.legal(s,i),roll=random();let kind,target;
        if(l.canRaise&&roll<.30){
          kind="raise";target=random()<.45?l.maxTarget:l.minRaiseTarget+Math.floor(random()*3)*100;
        }else kind=l.rawToCall>0?(roll<.43?"fold":"call"):(roll<.06?"fold":"check");
        contributions[i]+=Betting.act(s,i,kind,target).action.paid;
        assert.ok(s.stacks.every(v=>Number.isSafeInteger(v)&&v>=0));
      }
      stacks=s.stacks.slice();folded=s.folded.slice();
      if(s.uncontestedWinner!==null)break;
    }
    const scores=Array.from({length:n},()=>Math.floor(random()*4));
    const r=settle(contributions,folded,scores,{deadContributions:dead,dealerIndex:hand%n});
    const before=starting.reduce((a,b)=>a+b,0),after=stacks.reduce((a,b,i)=>a+b+r.payouts[i],0);
    assert.equal(after,before);
    r.payouts.forEach((value,i)=>{assert.ok(Number.isSafeInteger(value)&&value>=0);if(folded[i])assert.equal(value,0);});
    r.pots.forEach(p=>p.winners.forEach(i=>{
      assert.ok(p.eligible.includes(i));assert.equal(folded[i],false);
      if(p.kind==="wager")assert.ok(contributions[i]-dead[i]>=p.cap);
    }));
  }
});

console.log("RESULT  "+passed+" integrity tests passed");
