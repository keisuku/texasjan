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

if(!html.includes("これは最終UIではない")){
  throw new Error("temporary-shell boundary must remain explicit");
}

console.log("visual shell: PASS (5 screens, assets and playable controls)");
