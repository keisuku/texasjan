(function(root){
  'use strict';
  let api,dialog,body,toolbar,context,mode='',restoreFocus=null;
  const fmt=n=>Number(n||0).toLocaleString();
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function close(){if(dialog&&dialog.open)dialog.close();}
  function open(name){
    mode=name;restoreFocus=document.activeElement;api.pause(true);
    document.getElementById('playDialogTitle').textContent=name==='guide'?'遊び方':name==='history'?'この端末の対局記録':'この局の振り返り';
    body.innerHTML=name==='guide'?guide():name==='history'?history():review();
    if(!dialog.open)dialog.showModal();
  }
  function guide(){
    const v=api.view(),d=MahjongSession.describe(v);
    return '<div class="play-kicker">MAHJONG HOLD’EM / CPU対戦</div><p class="play-lead">牌を読む。<br>相手を読む。勝負を張る。</p><p>共通牌と自分だけの8枚を組み合わせ、強い14枚を作ります。全員を降ろせば、手が未完成でも勝ちです。</p>'+
      '<div class="play-current"><strong>'+escape(d.title)+'</strong><p>'+escape(d.detail)+'</p></div>'+
      '<div class="play-guide-step"><b>01</b><div><strong>まずは「3枚の組 × 4 ＋ 同じ2枚」</strong><p>同じ牌3枚、または同じ種類の連続する3枚を集めます。七対子・国士無双もあります。役と点数は自動判定します。</p><div class="play-guide-tiles">'+['Man1','Man2','Man3'].map(t=>'<img src="./assets/tiles/'+t+'.svg" alt="'+t+'">').join('')+'<span>＋</span>'+['Haku','Haku','Haku'].map(t=>'<img src="./assets/tiles/'+t+'.svg" alt="白">').join('')+'</div></div></div>'+
      '<div class="play-guide-step"><b>02</b><div><strong>15枚 → ＋4 → ＋4 → ＋4</strong><p>共通15枚が出たら4枚を選び、次の公開で固定。さらに2枚を加え、次の公開で固定します。残り8枚は最後まで選び直せます。</p></div></div>'+
      '<div class="play-guide-step"><b>03</b><div><strong>勝負を続けるか、降りるか</strong><p>チェックは追加0点。コールは相手の額に合わせ、レイズは上乗せ。降りると、その局で払った点だけを失います。オールインは残り全部です。</p></div></div>'+
      '<div class="play-guide-step"><b>04</b><div><strong>14枚をそろえてショーダウン</strong><p>固定牌は金枠。元の牌をタップすると選べます。入れ替えるときは先に1枚外します。「おすすめ」も固定牌を残して候補を作ります。</p></div></div>'+
      '<p class="play-note">同点は分配。参加料は共通POT、追加ベットは支払った額に応じて受け取れる範囲が決まります。現在はCPUとの練習用ゲームです。</p><button class="play-start" data-play-close>対局へ戻る</button>';
  }
  function history(){
    const stats=api.stats(),rows=api.history();
    return '<div class="play-history-stats"><span>直近の対局<b>'+stats.hands+'局</b></span><span>勝利<b>'+stats.wins+'局</b></span><span>合計収支<b>'+MahjongSession.signed(stats.net)+'</b></span></div><p class="play-note">直近40件をこの端末に保存します。同じ配牌の練習は集計に含めません。</p>'+
      (!rows.length?'<p class="play-history-empty">最初の一局を終えると、収支と結果がここに残ります。</p>':rows.map((r,i)=>'<article class="play-history-row"><header><span>'+(r.practice?'練習':r.folded?'フォールド':r.won?'勝利':'決着')+'</span><b class="'+(r.net>=0?'positive':'negative')+'">'+MahjongSession.signed(r.net)+'点</b></header><p>'+escape(r.detail)+'</p><small>POT '+fmt(r.pot)+' ・ '+new Date(r.at).toLocaleString('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})+'</small></article>').join(''));
  }
  function review(){
    const r=api.result();if(!r)return '<p>一局を終えると、判断と取り分を確認できます。</p>';
    const own=(r.actions||[]).filter(a=>a.player===5),streets=['手元8枚','共通15枚','共通19枚','共通23枚','共通27枚'];
    const names={'FOLD':'降りる','CALL':'コール','CHECK':'チェック','BET':'ベット','RAISE':'レイズ','ALL-IN':'オールイン'};
    return '<div class="play-kicker">'+(r.practice?'同じ配牌の練習':'今回の収支')+'</div><p class="play-lead">'+MahjongSession.signed(r.net)+' 点</p><p>支払い '+fmt(r.contributions&&r.contributions[5])+'点 ／ 受け取り '+fmt(r.payouts&&r.payouts[5])+'点</p><p>'+escape(r.detail)+'</p><div class="play-current"><strong>あなたの判断</strong><p>選択と結果を記録しています。判断の良し悪しや勝率を断定するものではありません。</p></div><ol class="play-action-list">'+own.map(a=>'<li><strong>'+streets[a.stage]+'</strong>　'+(names[a.type]||escape(a.type))+(a.paid?' ＋'+fmt(a.paid)+'点':'')+'<br><small>判断前のPOT '+fmt(a.potBefore)+'点</small></li>').join('')+'</ol>'+
      ((r.pots||[]).filter(p=>p.amount>0).map((p,i)=>'<div class="play-pot-row"><span>POT '+(i+1)+' ・ '+fmt(p.amount)+'点</span><b>'+(p.winners||[]).map(n=>escape(api.name(n))).join('・')+'</b></div>').join(''))+
      '<p class="play-note" style="margin-top:14px">「同じ配牌で練習」では持ち点と席順もこの局の開始時に戻ります。練習結果はランクポイントに加算しません。</p><button class="play-start" data-play-retry>同じ配牌で練習</button>';
  }
  function init(bridge){
    api=bridge;
    toolbar=document.createElement('nav');toolbar.className='play-tools';toolbar.setAttribute('aria-label','対局メニュー');
    toolbar.innerHTML='<button type="button" data-play-guide>遊び方</button><button type="button" data-play-speed aria-label="相手の思考時間を切り替える">速さ 1×</button><button type="button" data-play-history>記録</button>';
    document.getElementById('screen-game').appendChild(toolbar);
    context=document.createElement('div');context.className='play-context';context.setAttribute('aria-live','polite');document.getElementById('screen-game').appendChild(context);
    const box=document.createElement('div');box.className='rs-review';box.innerHTML='<button type="button" data-play-review>この局を振り返る</button><button type="button" data-play-retry>同じ配牌で練習</button>';document.getElementById('screen-result').appendChild(box);
    dialog=document.createElement('dialog');dialog.className='play-dialog';dialog.setAttribute('aria-labelledby','playDialogTitle');dialog.innerHTML='<header class="play-dialog-head"><h2 id="playDialogTitle"></h2><button type="button" aria-label="閉じる" data-play-close>×</button></header><div class="play-dialog-body"></div>';document.body.appendChild(dialog);body=dialog.querySelector('.play-dialog-body');
    dialog.addEventListener('close',()=>{api.pause(false);if(restoreFocus&&restoreFocus.isConnected)restoreFocus.focus();});
    document.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.hasAttribute('data-play-guide'))open('guide');
      if(b.hasAttribute('data-play-history'))open('history');
      if(b.hasAttribute('data-play-review'))open('review');
      if(b.hasAttribute('data-play-close'))close();
      if(b.hasAttribute('data-play-speed')){api.speed();render(api.view());}
      if(b.hasAttribute('data-play-retry')){close();api.retry();}
    });
    render(api.view());
  }
  function render(v){
    if(!api||!context)return;
    toolbar.querySelector('[data-play-speed]').textContent='速さ '+v.speed+'×';
    const who=v.result?'決着':v.folded?'フォールド済み':v.yourTurn?'あなたの番':v.acting?'相手の番':'牌を選ぶ';
    const payment=v.yourTurn?'追加 '+fmt(v.call)+' 点':'この局 '+fmt(v.invested)+' 点';
    context.innerHTML='<span data-turn="'+(v.yourTurn?'you':'other')+'">'+who+'</span><strong>'+payment+'</strong><span>あと'+MahjongSession.describe(v).left+'枚公開</span>';
    document.querySelectorAll('.rs-review button').forEach(b=>b.disabled=!api.result());
  }
  root.MahjongExperience={init:init,render:render,open:open};
})(window);
