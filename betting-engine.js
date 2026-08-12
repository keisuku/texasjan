/*
 * MAHJONG HOLD'EM betting state machine.
 *
 * Pure game-state code: no DOM, animation, assets or timers.  The same rules can
 * be moved to a Unity client or an authoritative server without bringing the
 * current HTML renderer with them.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.MahjongBetting=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  function cloneBool(a,n,fallback){
    const out=new Array(n);
    for(let i=0;i<n;i++)out[i]=a&&a[i]!==undefined?!!a[i]:!!fallback;
    return out;
  }
  function cloneNum(a,n){
    const out=new Array(n);
    for(let i=0;i<n;i++)out[i]=Math.max(0,Number(a&&a[i])||0);
    return out;
  }
  function canAct(s,i){return !s.folded[i]&&!s.allIn[i]&&s.stacks[i]>0;}
  function livePlayers(s){
    const out=[];for(let i=0;i<s.playerCount;i++)if(!s.folded[i])out.push(i);return out;
  }
  function nextActor(s,after){
    for(let step=1;step<=s.playerCount;step++){
      const i=(after+step+s.playerCount)%s.playerCount;
      if(canAct(s,i))return i;
    }
    return -1;
  }
  function roundComplete(s){
    const live=livePlayers(s);
    if(live.length<=1)return true;
    return live.every(function(i){
      return s.allIn[i]||(s.acted[i]&&s.roundBets[i]===s.highestBet);
    });
  }
  function refreshPhase(s,after){
    if(roundComplete(s)){
      s.phase="complete";s.currentActor=-1;
      const live=livePlayers(s);s.uncontestedWinner=live.length===1?live[0]:null;
    }else{
      s.phase="acting";s.currentActor=nextActor(s,after);
    }
  }
  function startRound(config){
    const n=Math.max(2,Number(config.playerCount)||6);
    const s={
      playerCount:n,userIndex:Number(config.userIndex),dealerIndex:Number(config.dealerIndex)||0,
      street:Number(config.street)||1,phase:"acting",currentActor:-1,
      stacks:cloneNum(config.stacks,n),folded:cloneBool(config.folded,n,false),
      allIn:new Array(n).fill(false),acted:new Array(n).fill(false),
      roundBets:new Array(n).fill(0),highestBet:0,
      minRaise:Math.max(1,Number(config.minRaise)||100),lastFullRaise:Math.max(1,Number(config.minRaise)||100),
      lastAggressor:null,actions:[],uncontestedWinner:null
    };
    for(let i=0;i<n;i++)if(!s.folded[i]&&s.stacks[i]===0)s.allIn[i]=true;
    refreshPhase(s,s.dealerIndex);
    return s;
  }
  function legal(s,i){
    if(s.phase!=="acting"||s.currentActor!==i||!canAct(s,i))return null;
    const toCall=Math.max(0,s.highestBet-s.roundBets[i]);
    const maxTarget=s.roundBets[i]+s.stacks[i];
    return {
      toCall:Math.min(toCall,s.stacks[i]),rawToCall:toCall,maxTarget:maxTarget,
      minRaiseTarget:s.highestBet+s.lastFullRaise,
      canCheck:toCall===0,canCall:toCall>0&&s.stacks[i]>0,
      canRaise:maxTarget>s.highestBet
    };
  }
  function act(s,i,kind,targetTotal){
    const l=legal(s,i);if(!l)throw new Error("not this player's turn");
    kind=String(kind||"").toLowerCase();
    let paid=0,label="",raised=false,target=s.roundBets[i];
    if(kind==="fold"){
      s.folded[i]=true;s.acted[i]=true;label="FOLD";
    }else if((kind==="check"||kind==="call")&&l.rawToCall===0){
      s.acted[i]=true;label="CHECK";
    }else if(kind==="call"||kind==="check"){
      paid=Math.min(l.rawToCall,s.stacks[i]);
      target=s.roundBets[i]+paid;s.roundBets[i]=target;s.stacks[i]-=paid;s.acted[i]=true;
      if(s.stacks[i]===0)s.allIn[i]=true;
      label=s.allIn[i]&&target<s.highestBet?"ALL-IN":"CALL";
    }else if(kind==="raise"||kind==="bet"){
      if(!l.canRaise)throw new Error("raise is not available");
      const requested=Math.max(s.highestBet+1,Number(targetTotal)||0);
      const fullMinimum=s.highestBet+s.lastFullRaise;
      target=Math.min(l.maxTarget,requested);
      if(target<fullMinimum&&target<l.maxTarget)target=Math.min(l.maxTarget,fullMinimum);
      paid=target-s.roundBets[i];
      const oldHigh=s.highestBet;
      s.roundBets[i]=target;s.stacks[i]-=paid;
      if(s.stacks[i]===0)s.allIn[i]=true;
      raised=target>oldHigh;
      if(raised){
        const size=target-oldHigh;
        if(size>=s.lastFullRaise)s.lastFullRaise=size;
        s.highestBet=target;s.lastAggressor=i;
        for(let p=0;p<s.playerCount;p++)if(p!==i&&canAct(s,p))s.acted[p]=false;
      }
      s.acted[i]=true;
      label=s.allIn[i]?"ALL-IN":(oldHigh===0?"BET":"RAISE");
    }else throw new Error("unknown action: "+kind);

    const action={player:i,type:label,paid:paid,target:s.roundBets[i],raised:raised};
    s.actions.push(action);refreshPhase(s,i);
    return {action:action,phase:s.phase,nextActor:s.currentActor,
      uncontestedWinner:s.uncontestedWinner,toCall:s.currentActor>=0?Math.max(0,s.highestBet-s.roundBets[s.currentActor]):0};
  }
  function snapshot(s){
    return JSON.parse(JSON.stringify(s));
  }
  return {startRound:startRound,legal:legal,act:act,livePlayers:livePlayers,roundComplete:roundComplete,snapshot:snapshot};
});
