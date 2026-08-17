/* Portable opponent policy.  It receives public betting state plus a compact
   tile-strength estimate; it never reads DOM or hidden hands from other seats. */
(function(root,factory){
  const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.MahjongBettingAI=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  function counts(ids){const c=new Array(34).fill(0);ids.forEach(function(t){c[t]++;});return c;}
  function melds(input){
    const c=input.slice();let m=0;
    for(let t=0;t<34&&m<4;t++)while(c[t]>=3&&m<4){c[t]-=3;m++;}
    for(let s=0;s<3&&m<4;s++)for(let r=0;r<=6&&m<4;r++)
      while(c[s*9+r]&&c[s*9+r+1]&&c[s*9+r+2]&&m<4){c[s*9+r]--;c[s*9+r+1]--;c[s*9+r+2]--;m++;}
    return m;
  }
  function confidence(opts){
    const hand=opts.hand||[],common=opts.common||[],c=counts(hand.concat(common)),base=counts(common);
    const meldGain=Math.max(0,melds(c)-melds(base));let pairs=0,basePairs=0,links=0,baseLinks=0,dora=0,impact=0;
    for(let t=0;t<34;t++){
      if(c[t]>=2)pairs++;
      if(base[t]>=2)basePairs++;
      if(t<27&&t%9<8&&c[t]&&c[t+1])links++;
      if(t<27&&t%9<8&&base[t]&&base[t+1])baseLinks++;
    }
    hand.forEach(function(t){
      if(t===opts.dora)dora++;
      if(base[t])impact+=t>=27?.035:.025;
      if(t<27){const r=t%9;if(r>0&&base[t-1])impact+=.012;if(r<8&&base[t+1])impact+=.012;}
    });
    const style={sequence:.02,flush:.03,triplet:.05,pairs:.02,total:0}[opts.mode]||0;
    const noise=((opts.random||Math.random)()-.5)*.20;
    return Math.max(.02,Math.min(.98,.12+meldGain*.11+Math.min(3,Math.max(0,pairs-basePairs))*.035+
      Math.min(4,Math.max(0,links-baseLinks))*.018+Math.min(.24,impact)*.65+dora*.04+
      (Number(opts.street)||1)*.006+style+noise));
  }
  function choose(opts){
    const l=opts.legal,random=opts.random||Math.random,state=opts.state,street=Math.max(1,Number(opts.street)||1);
    if(!l)return {kind:"check",target:0};
    const strength=opts.confidence,pressure=l.rawToCall/Math.max(1,opts.pot+l.rawToCall);
    const affordable=l.rawToCall<=Math.max(state.minRaise,state.stacks[opts.player]*.32);
    if(l.rawToCall>0&&strength<pressure+.16&&!affordable)return {kind:"fold",target:0};
    if(l.rawToCall>0&&strength<.39&&random()<[.24,.30,.36,.42][Math.min(3,street-1)])return {kind:"fold",target:0};
    const opening=state.highestBet===0;
    const chance=(opening?[.14,.18,.23,.28]:[.025,.04,.065,.09])[Math.min(3,street-1)]
      +(opts.mode==="triplet"?.025:0);
    const threshold=opening?.45:.72;
    if(l.canRaise&&strength>threshold&&random()<chance){
      const streetSize=[100,150,250,400][Math.min(3,street-1)];
      const bump=Math.max(state.lastFullRaise,streetSize);
      return {kind:"raise",target:Math.min(l.maxTarget,state.highestBet+bump)};
    }
    return {kind:l.rawToCall>0?"call":"check",target:0};
  }
  return {confidence:confidence,choose:choose};
});
