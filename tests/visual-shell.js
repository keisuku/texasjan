#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");

const screens={
  title:"art/visual-archive/v2/01-title-opening.webp",
  lobby:"art/clean-masters/clean-master-lobby.webp",
  match:"art/visual-archive/v2/03-mode-select.webp",
  cosmetics:"art/visual-archive/v2/08-customization.webp",
  shop:"art/clean-masters/clean-master-gacha.webp"
};

for(const [screen,asset] of Object.entries(screens)){
  if(!html.includes(`id="screen-${screen}" class="screen golden-shell-screen"`)){
    throw new Error(`${screen}: Golden Visual shell class missing`);
  }
  if(!html.includes(`src="./${asset}"`)){
    throw new Error(`${screen}: expected asset is not wired`);
  }
  const file=path.join(root,asset);
  if(!fs.existsSync(file)||fs.statSync(file).size<1024){
    throw new Error(`${screen}: asset missing or empty: ${asset}`);
  }
}

for(const control of [
  'data-go="lobby"',
  'data-match="rank"',
  'id="bGoldenRankStart"',
  'data-go="cosmetics"',
  'data-go="shop"',
  'data-draw="10"'
]){
  if(!html.includes(control))throw new Error(`playable control missing: ${control}`);
}

for(const screen of ["lobby","match","cosmetics","shop"]){
  const start=html.indexOf(`<section id="screen-${screen}"`);
  const end=html.indexOf("</section>",start);
  const section=html.slice(start,end);
  if(!section.includes('class="production-meta-ui"')){
    throw new Error(`${screen}: visible production UI layer missing`);
  }
  if(section.includes('class="golden-shell-ui"')){
    throw new Error(`${screen}: invisible hotspot layer must not remain`);
  }
}

const resultAsset="art/visual-archive/v2/07-gacha-result.webp";
if(!html.includes(`url("./${resultAsset}")`))throw new Error("gacha result Golden Visual is not wired");
if(!fs.existsSync(path.join(root,resultAsset)))throw new Error("gacha result asset is missing");
if(!html.includes('id="bGachaAgain"')||!html.includes('id="gcCards"')){
  throw new Error("gacha result must expose real reward data and draw-again control");
}

const gameStart=html.indexOf('<section id="screen-game"');
const gameEnd=html.indexOf('</section>',gameStart);
const gameMarkup=html.slice(gameStart,gameEnd);
for(const label of ["共通牌 15枚","私牌 8枚","最終手牌 13枚 ＋ ツモ","降りる","コール","レイズ","オールイン"]){
  if(!gameMarkup.includes(label))throw new Error(`Japanese game label missing: ${label}`);
}
for(const stale of [">FOLD<",">CALL<",">RAISE<",">ALL-IN<",">MY PRIVATE 8<",">MY FINAL HAND"]){
  if(gameMarkup.includes(stale))throw new Error(`stale game label remains: ${stale}`);
}
if(!gameMarkup.includes('id="allInBurst"')||!html.includes("function flashAllIn(player,target)")){
  throw new Error("localized ALL-IN pressure effect is missing");
}
if(!html.includes('classList.toggle("user-win",!!r.userWon)')){
  throw new Error("victory result state is not connected to real match data");
}

if(!html.includes("これは最終UIではない")){
  throw new Error("temporary-shell boundary must remain explicit");
}

console.log("visual shell: PASS (5 screens, real meta UI/data, assets and playable controls)");
