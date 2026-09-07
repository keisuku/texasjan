/* Device-local practice records and reproducible deals. No remote service. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.MahjongSession=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const KEY='mh.hands.v1',LIMIT=40;
  function seed(value){
    let n=2166136261;
    const s=String(value);
    for(let i=0;i<s.length;i++){n^=s.charCodeAt(i);n=Math.imul(n,16777619);}
    return n>>>0;
  }
  function random(value){
    let n=seed(value);
    return function(){n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
  }
  function signed(n){return (n>0?'+':'')+Number(n||0).toLocaleString();}
  function describe(s){
    const left=[27,12,8,4,0][s.stage]||0;
    if(s.result)return {title:'決着。勝った手と収支を確認',detail:'結果を見るから、この局の判断を振り返れます。',left:0};
    if(s.folded)return {title:'フォールド済み・追加の支払いなし',detail:'「決着まで見る」で残りの公開と結果へ進めます。',left:left};
    if(s.stage===0)return {title:'手元の8枚で、参加を決める',detail:'チェックは追加0点。ベットが入ったら、コールか降りるかを選びます。',left:left};
    const need=Math.max(0,(s.stage===1?4:s.stage===2?6:14)-s.selected);
    const title=s.stage===1?'次の公開までに、残す4枚を選ぶ':s.stage===2?'あと2枚を加え、固定6枚を決める':s.stage===3?'固定6枚を残して、完成形を探す':'共通27枚から、最終14枚で勝負';
    const detail=need?'あと'+need+'枚。迷ったら「おすすめ」で候補を選べます。':s.stage<3?'次の4枚を公開すると、選んだ牌は固定されます。':'完成形と点数を確認。役がなくてもベットで勝負できます。';
    return {title:title,detail:detail,left:left};
  }
  function create(storage){
    let rows=[];
    try{const data=JSON.parse(storage&&storage.getItem(KEY));if(Array.isArray(data))rows=data.filter(function(x){return x&&typeof x.id==='string'&&Number.isFinite(x.net)&&Number.isFinite(x.pot);}).slice(-LIMIT);}catch(e){}
    return {
      read:function(){return rows.map(function(x){return Object.assign({},x);}).reverse();},
      add:function(row){
        if(!row||!row.id||!Number.isFinite(row.net)||rows.some(function(x){return x.id===row.id;}))return false;
        rows.push({id:String(row.id),at:Number(row.at)||Date.now(),seed:String(row.seed),net:row.net,pot:Number(row.pot)||0,
          won:!!row.won,folded:!!row.folded,practice:!!row.practice,detail:String(row.detail||'').slice(0,180),actions:(row.actions||[]).map(function(x){return Object.assign({},x);}).slice(0,120)});
        rows=rows.slice(-LIMIT);try{if(storage)storage.setItem(KEY,JSON.stringify(rows));}catch(e){}
        return true;
      },
      stats:function(){const played=rows.filter(function(x){return !x.practice;});return {hands:played.length,wins:played.filter(function(x){return x.won;}).length,net:played.reduce(function(n,x){return n+x.net;},0)};}
    };
  }
  return {random:random,describe:describe,create:create,signed:signed};
});
