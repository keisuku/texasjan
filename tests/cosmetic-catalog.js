#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");
const vm=require("vm");
const root=path.resolve(__dirname,"..");
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,"skins/manifest.js"),"utf8"),context);

const data=context.window.MH_SKINS;
if(!data||!Array.isArray(data.skins))throw new Error("skin manifest missing");

const rewards=data.skins.filter(s=>s.owned===false&&s.ready===true&&s.price);
if(rewards.length<4)throw new Error("at least four production-ready rewards are required");

for(const skin of rewards){
  const slot=data.slots.find(s=>s.id===skin.slot);
  const previewRole=slot&&slot.preview&&slot.preview.role;
  const preview=skin.previewAsset||(previewRole&&skin.assets&&skin.assets[previewRole]);
  if(!preview)throw new Error(`${skin.id}: production reward has no real preview asset`);
  const file=path.join(root,preview.replace(/^\.\//,""));
  if(!fs.existsSync(file)||fs.statSync(file).size<1024){
    throw new Error(`${skin.id}: preview asset is missing or empty`);
  }
}

for(const placeholder of ["obsidian","night","jade","onyx"]){
  const matches=data.skins.filter(s=>s.id===placeholder);
  if(matches.some(s=>s.ready===true))throw new Error(`${placeholder}: placeholder entered the gacha pool`);
}

const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
if(!html.includes("s.ready===true&&s.price"))throw new Error("gacha pool is not gated by production readiness");
if(!html.includes("s.owned!==false||s.ready===true"))throw new Error("cosmetic grid still exposes unfinished locked placeholders");

console.log(`cosmetic catalog: PASS (${rewards.length} production-ready rewards)`);
