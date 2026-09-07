#!/usr/bin/env node
'use strict';

// Node-only integration: real logic, handlers and one renderCore DOM smoke.
// This does not replace acceptance/mobile/motion/visual browser tests.
const assert = require('node:assert/strict');
const path = require('node:path');
const { createGame } = require('./helpers/game-vm.cjs');
const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
let passed = 0, failed = 0, skipped = 0;
function check(name, test) {
  try { test(); passed++; console.log('PASS  ' + name); }
  catch (error) { failed++; console.error('FAIL  ' + name + '\n' + (error.stack || error)); }
}
const game = seed => createGame(root, seed || 20260907);
const total = g => g.evaluate('tableStacks().reduce(function(n,x){return n+x;},pot)');
function settleRound(g) {
  g.evaluate('fastForwardBetting()');
  assert.notEqual(g.evaluate('betting.phase'), 'acting', 'Betting cannot remain stuck after fast-forward');
}
function advance(g) { settleRound(g); if (g.evaluate('stage') > 0) g.click('bRec'); g.click('bNext'); }
function finishHand(g) {
  for (let step = 0; step < 6 && g.evaluate('phase') === 'play'; step++) {
    advance(g);
    assert(g.evaluate('tableStacks().every(function(n){return Number.isInteger(n)&&n>=0;})'), 'Stacks stay nonnegative integers');
  }
  assert.equal(g.evaluate('phase'), 'result', 'Hand reaches a result');
  assert.equal(g.evaluate('pot'), 0, 'Settlement consumes the pot');
}
function cards(g) { return g.state('({my,opponents:seats.map(function(s){return s.hand;}),common,doraInd,wall})'); }

console.log('NODE VM INTEGRATION — CSS/layout/assets/animation/browser behavior are NOT tested');
check('actual renderCore writes tiles, actionable labels, disabled states and result receipts', () => {
  const g = game(); g.enableCoreRendering();
  const count = selector => g.document.querySelectorAll(selector).length;
  assert.equal(count('#myrow .tile'), 8); assert.equal(count('#commons .tile'), 0);
  assert.equal(count('#rack .slot'), 14);
  assert.equal(g.document.getElementById('bRec').disabled, true);
  assert.equal(g.document.getElementById('bCall').disabled, false);
  assert.match(g.document.getElementById('bCall').textContent, /チェック|コール/);
  settleRound(g); g.click('bNext');
  assert.equal(count('#commons .tile'), 15); assert.equal(count('#rack .slot'), 14);
  settleRound(g); assert.equal(g.document.getElementById('bCall').disabled, true);
  assert.equal(g.document.getElementById('bNext').disabled, true);
  assert.match(g.document.getElementById('bNext').textContent, /固定4枚/);
  g.click('bRec'); assert.equal(count('#rack .tile'), 4);
  assert.equal(g.document.getElementById('bNext').disabled, false);
  g.click('bNext'); assert.equal(g.evaluate('stage'), 2);
  assert.equal(count('#rack .fixedCore'), 4);
  assert.equal(count('#revealRail .tile:not(.back)'), 4);
  advance(g); assert.equal(g.evaluate('stage'), 3);
  settleRound(g); g.click('bNext'); assert.equal(g.evaluate('stage'), 4);
  assert.equal(count('#revealRail .tile:not(.back)'), 12);
  settleRound(g); g.click('bRec');
  assert.equal(count('#rack .tile'), 14); assert.equal(count('#rack .fixedCore'), 6);
  assert.equal(g.document.getElementById('bNext').disabled, false);
  assert.match(g.document.getElementById('bNext').textContent, /ショーダウン/);
  g.click('bNext'); assert.equal(g.evaluate('phase'), 'result');
  assert.equal(g.document.getElementById('bRec').disabled, true);
  assert.equal(g.document.getElementById('bClear').disabled, true);
  assert.equal(g.document.getElementById('bCall').disabled, true);
  assert.match(g.document.getElementById('bNext').textContent, /結果を見る/);
  g.click('bNext'); assert.equal(g.evaluate('currentScreen'), 'result');
  assert.equal(count('#rsShowTabs .rs-showtab'), 6);
  assert.equal(count('#rsPrivateTiles .tile'), 8);
  assert.equal(count('#rsTiles .tile'), 14);
  assert.match(g.document.getElementById('rsPot').textContent, new RegExp(g.evaluate('lastResult.pot.toLocaleString()')));
  if (g.document.querySelector('.play-context')) {
    assert.match(g.document.querySelector('.play-context').textContent, /決着/);
    assert.equal(g.document.querySelector('[data-play-review]').disabled, false);
    g.document.querySelector('[data-play-review]').click();
    assert.match(g.document.querySelector('.play-dialog-body').textContent, /支払い .*点 ／ 受け取り .*点/);
  }
});
check('title → lobby → matching → game uses actual click handlers', () => {
  const g = game();
  assert.equal(g.evaluate('currentScreen'), 'title');
  g.click('bTitleStart'); assert.equal(g.evaluate('currentScreen'), 'lobby');
  g.document.querySelector('[data-match="rank"]').click();
  assert.equal(g.evaluate('currentScreen'), 'match');
  assert.equal(g.document.querySelectorAll('#mtTable .mt-seat').length, 6);
  g.click('bMatchStart'); assert.equal(g.evaluate('currentScreen'), 'game');
  assert.equal(g.evaluate('stage'), 0);
});
check('abandoning/restarting an active hand preserves all 28,150 points', () => {
  const g = game(); assert.equal(total(g), 28150);
  for (let attempt = 0; attempt < 4; attempt++) {
    settleRound(g); g.click('bMatchStart');
    assert.equal(total(g), 28150, 'Restart refunds unsettled contributions before posting the next ante');
  }
});
check('selection caps, fixed copies, reveals and recommendations remain consistent', () => {
  const g = game();
  g.evaluate('togglePick("p",0,my[0])'); assert.equal(g.evaluate('picks.length'), 0);
  advance(g); assert.deepEqual(g.state('[stage,common.length,picks.length]'), [1,15,0]);
  g.evaluate('for(let i=0;i<5;i++)togglePick("c",i,common[i])');
  assert.equal(g.evaluate('picks.length'), 4);
  assert.equal(g.evaluate('isPicked("c",4)'), false, 'Fifth copy cannot auto-replace an earlier choice');
  advance(g);
  const firstFixed = g.state('picks.filter(function(p){return p.locked;}).map(function(p){return [p.src,p.index,p.id];})');
  assert.equal(firstFixed.length, 4); assert.deepEqual(g.state('[stage,common.length]'), [2,19]);
  g.evaluate('removePick(picks[0].seq)'); assert.equal(g.evaluate('picks.length'), 4);
  g.click('bRec');
  assert.equal(g.evaluate('picks.length'), 6);
  assert.deepEqual(g.state('picks.filter(function(p){return p.locked;}).map(function(p){return [p.src,p.index,p.id];})'), firstFixed);
  advance(g); assert.deepEqual(g.state('[stage,common.length,picks.filter(function(p){return p.locked;}).length]'), [3,23,6]);
  const fixed = g.state('picks.filter(function(p){return p.locked;}).map(function(p){return [p.src,p.index,p.id];})');
  settleRound(g); g.click('bNext'); assert.deepEqual(g.state('[stage,common.length]'), [4,27]);
  for (const mode of ['total','pairs','sequence','flush','triplet']) {
    g.evaluate(`recommend(${JSON.stringify(mode)})`);
    assert.equal(g.evaluate('picks.length'), 14, 'Recommendation fills 14 real copies');
    assert(g.evaluate('picks.every(function(p){return (p.src==="p"?my:common)[p.index]===p.id;})'));
    assert.equal(g.evaluate('new Set(picks.map(function(p){return p.src+":"+p.index;})).size'), 14);
    assert.deepEqual(g.state('picks.filter(function(p){return p.locked;}).map(function(p){return [p.src,p.index,p.id];})'), fixed);
  }
});
check('showdown rejects premature publication and incomplete betting', () => {
  const g = game(); advance(g); advance(g); advance(g);
  assert.equal(g.evaluate('stage'), 3); g.click('bRec');
  const before = total(g); g.evaluate('showdown()');
  assert.equal(g.evaluate('phase'), 'play', '23 common tiles must not permit showdown');
  assert.equal(total(g), before);
  settleRound(g); g.click('bNext'); g.click('bRec');
  if (g.evaluate('betting.phase') === 'acting') {
    g.evaluate('showdown()'); assert.equal(g.evaluate('phase'), 'play', 'Pending betting must finish first');
  }
  settleRound(g); g.evaluate('showdown()'); assert.equal(g.evaluate('phase'), 'result');
});
check('30 consecutive hands settle, conserve points, and expose six result inspectors', () => {
  const g = game();
  for (let hand = 0; hand < 30; hand++) {
    finishHand(g); assert.equal(total(g), 28150, 'Point conservation at hand ' + hand);
    const finished = g.state('({stacks:tableStacks(),lastResult})');
    g.evaluate('showdown()'); assert.deepEqual(g.state('({stacks:tableStacks(),lastResult})'), finished, 'Settlement is idempotent');
    g.click('bNext'); assert.equal(g.evaluate('currentScreen'), 'result');
    assert.equal(g.document.querySelectorAll('#rsRanking .rs-rankrow').length, 6);
    const tabs = g.document.querySelectorAll('#rsShowTabs .rs-showtab');
    if (g.evaluate('lastResult.showdown && lastResult.showdown.length')) {
      assert.equal(tabs.length, 6);
      for (let i = 0; i < tabs.length; i++) {
        g.document.querySelectorAll('#rsShowTabs .rs-showtab')[i].click();
        assert.equal(g.evaluate('resultInspectIndex'), i);
      }
    }
    g.click('bResultAgain');
    assert.deepEqual(g.state('[currentScreen,phase,stage,common.length]'), ['game','play',0,0]);
    assert.equal(total(g), 28150, 'Point conservation on next hand');
  }
});
check('a settled result cannot change its selected hand or award more points', () => {
  const g = game(); finishHand(g);
  const before = g.state('({picks,lastResult,stacks:tableStacks()})');
  g.evaluate('removePick(picks[picks.length-1].seq);clearRack();recommend("total");togglePick("p",0,my[0]);showdown()');
  assert.deepEqual(g.state('({picks,lastResult,stacks:tableStacks()})'), before);
});

const hasReplay = game().evaluate('typeof replayLastHand === "function"');
if (!hasReplay) {
  skipped++; console.log('SKIP  replay/history did not exist in this source snapshot');
} else {
  check('repeat practice uses identical deals, isolates rating, and restores campaign stacks', () => {
    const g = game(); const initialCards = cards(g), startingDealer = g.evaluate('dealerSeat');
    finishHand(g);
    const completedCards = cards(g), campaignStacks = g.state('tableStacks()');
    const rank = g.evaluate('rankPoints'), stats = g.state('handHistory.stats()');
    const initialSeed = g.evaluate('lastResult.seed');
    for (let retry = 0; retry < 2; retry++) {
      g.evaluate('replayLastHand()');
      assert.equal(g.evaluate('practiceHand'), true);
      assert.equal(g.evaluate('handSeed'), initialSeed);
      assert.equal(g.evaluate('dealerSeat'), startingDealer);
      assert.deepEqual(cards(g), initialCards, 'Same wall, private tiles, opponents and dora at practice start');
      finishHand(g);
      assert.deepEqual(cards(g), completedCards, 'Same communal reveals');
      assert.equal(g.evaluate('rankPoints'), rank, 'Practice never changes rating');
      assert.equal(g.evaluate('lastResult.delta'), 0);
      assert.deepEqual(g.state('handHistory.stats()'), stats, 'Practice is excluded from campaign statistics');
    }
    g.click('bResultAgain');
    assert.equal(g.evaluate('practiceHand'), false);
    assert.deepEqual(g.state('handStartingStacks'), campaignStacks, 'Leaving practice restores campaign stacks before ante');
    assert.equal(total(g), 28150);
    finishHand(g);
    const nextCampaignStacks = g.state('tableStacks()');
    g.evaluate('replayLastHand()'); advance(g);
    assert.equal(g.evaluate('practiceHand'), true);
    g.click('bMatchStart');
    assert.deepEqual(g.state('handStartingStacks'), nextCampaignStacks, 'Abandoning an unfinished retry also restores the campaign');
    assert.equal(total(g), 28150);
  });
  check('guide and history dialogs pause and resume actual betting; folded runout terminates', () => {
    const g = game();
    g.document.querySelector('[data-play-guide]').click();
    assert.equal(g.evaluate('experiencePaused'), true);
    assert.equal(g.document.querySelector('dialog').open, true);
    assert.match(g.document.getElementById('playDialogTitle').textContent, /遊び方/);
    g.document.querySelector('dialog [data-play-close]').click();
    assert.equal(g.evaluate('experiencePaused'), false);
    assert.equal(g.document.querySelector('dialog').open, false);
    assert.equal(g.evaluate('betting.currentActor'), 5);
    g.click('bFold'); assert.equal(g.evaluate('userFolded'), true);
    const paid = g.evaluate('handContributions[5]');
    g.evaluate('runoutFolded()'); g.flushTimers();
    assert.equal(g.evaluate('phase'), 'result');
    assert.equal(g.evaluate('handContributions[5]'), paid, 'No further cost after fold');
    assert.equal(total(g), 28150);
    g.document.querySelector('[data-play-history]').click();
    assert.equal(g.document.querySelector('dialog').open, true);
    assert.match(g.document.querySelector('.play-dialog-body').textContent, /フォールド/);
  });
}
console.log(`RESULT  ${passed} passed, ${failed} failed, ${skipped} skipped (Node VM; no CSS/layout/browser validation)`);
process.exitCode = failed ? 1 : 0;
