/*
 * Deterministic settlement for the prototype's integer play points.
 * No DOM, random numbers, stack mutations or persistent state.
 *
 * contributions: total paid by each seat during this hand.
 * folded: seats that cannot win; their matched points remain in the pots.
 * scores: higher is better; a number is required only in contested pots.
 * deadContributions (optional): the shared entry fee already included in each
 * contribution. This preserves the prototype's variable entry-fee rule; it is
 * not the standard equal / short-ante poker rule. Omit for ordinary wager caps.
 * actionOrder + dealerIndex: odd points go clockwise after the dealer.
 *
 * Add payouts[i] to each stack once. awards excludes returned uncalled points;
 * refunds contains only those returns. Each pot records its own eligible seats.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.MahjongPotSettlement=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  function pointArray(input,n,name){
    if(!Array.isArray(input)||input.length!==n)throw new Error(name+" must have one entry per seat");
    return input.map(function(value){
      if(!Number.isSafeInteger(value)||value<0)throw new Error(name+" must contain non-negative integer points");
      return value;
    });
  }
  function sum(values){
    const total=values.reduce(function(a,b){return a+b;},0);
    if(!Number.isSafeInteger(total))throw new Error("point total exceeds safe integer range");
    return total;
  }
  function clockwiseOrder(input,n,dealer){
    const order=input===undefined?Array.from({length:n},function(_,i){return i;}):input;
    if(!Array.isArray(order)||order.length!==n||new Set(order).size!==n||order.some(function(i){
      return !Number.isInteger(i)||i<0||i>=n;
    }))throw new Error("actionOrder must contain every seat exactly once");
    if(dealer===undefined)return order.slice();
    if(!Number.isInteger(dealer)||dealer<0||dealer>=n)throw new Error("invalid dealerIndex");
    const next=(order.indexOf(dealer)+1)%n;
    return order.slice(next).concat(order.slice(0,next));
  }
  function settle(config){
    if(!config||!Array.isArray(config.contributions)||!config.contributions.length){
      throw new Error("contributions must be a non-empty array");
    }
    const n=config.contributions.length;
    const contributions=pointArray(config.contributions,n,"contributions");
    const dead=pointArray(config.deadContributions===undefined?new Array(n).fill(0):config.deadContributions,n,"deadContributions");
    const wagers=contributions.map(function(value,i){
      if(dead[i]>value)throw new Error("deadContributions cannot exceed contributions");
      return value-dead[i];
    });
    const folded=config.folded===undefined?new Array(n).fill(false):config.folded;
    if(!Array.isArray(folded)||folded.length!==n||folded.some(function(value){return typeof value!=="boolean";})){
      throw new Error("folded must contain one boolean per seat");
    }
    const order=clockwiseOrder(config.actionOrder,n,config.dealerIndex);
    const live=order.filter(function(i){return !folded[i];});
    const total=sum(contributions),awards=new Array(n).fill(0),refunds=new Array(n).fill(0),pots=[];
    if(total>0&&!live.length)throw new Error("cannot award a pot with no live player");

    function awardPot(amount,cap,lower,contributors,eligible,kind){
      if(!eligible.length)throw new Error("pot has no eligible live contributor");
      let winners=eligible.slice();
      if(winners.length>1){
        const scores=config.scores;
        if(!Array.isArray(scores)||scores.length!==n||eligible.some(function(i){return !Number.isFinite(scores[i]);})){
          throw new Error("every contested seat needs a finite score");
        }
        const best=Math.max.apply(null,eligible.map(function(i){return scores[i];}));
        winners=eligible.filter(function(i){return scores[i]===best;});
      }
      const share=Math.floor(amount/winners.length),odd=amount%winners.length;
      const payouts=new Array(n).fill(0);
      winners.forEach(function(i,at){payouts[i]=share+(at<odd?1:0);awards[i]+=payouts[i];});
      pots.push({kind:kind,amount:amount,cap:cap,lower:lower,contributors:contributors.slice(),
        eligible:eligible.slice(),winners:winners,awards:payouts});
    }

    const deadTotal=sum(dead);
    if(deadTotal>0)awardPot(deadTotal,null,0,order.filter(function(i){return dead[i]>0;}),live,"entry");

    const levels=Array.from(new Set(wagers.filter(function(value){return value>0;}))).sort(function(a,b){return a-b;});
    let lower=0;
    levels.forEach(function(cap){
      const contributors=order.filter(function(i){return wagers[i]>=cap;});
      const amount=(cap-lower)*contributors.length;
      if(contributors.length===1){
        const owner=contributors[0];
        // A lone wager was never matched. A folded lone contributor instead
        // signals an invalid ledger, such as a dead fee passed as a live bet.
        if(folded[owner])throw new Error("uncalled contribution belongs to a folded seat; check deadContributions");
        refunds[owner]+=amount;
      }else{
        const eligible=contributors.filter(function(i){return !folded[i];});
        awardPot(amount,cap,lower,contributors,eligible,"wager");
      }
      lower=cap;
    });

    const payouts=awards.map(function(value,i){return value+refunds[i];});
    if(sum(payouts)!==total)throw new Error("settlement does not conserve points");
    return {total:total,awards:awards,refunds:refunds,payouts:payouts,pots:pots,
      winners:order.filter(function(i){return awards[i]>0;})};
  }

  return {settle:settle};
});
