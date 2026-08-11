/* MAHJONG HOLD'EM — スキン定義（見た目の商品カタログ）
   ======================================================================
   index.html はこのファイルだけを読みます。fetch を使わないので file:// でも動きます。

   ■ 考え方
   見た目は「確定させるもの」ではなく「差し替えられる商品」です。
   新しい絵ができたときは、既存の値を書き換えるのではなく skins に1件足してください。
   そうすれば前の見た目は失われず、そのまま選択肢として残ります。

   ■ スロットとロール
   slots  … 装飾品のカテゴリ。1カテゴリにつき同時に1つだけ選べます。
   roles  … そのカテゴリが差し替える画像の役割名。CSS 側の変数名と対応します。
            ロール "btn-fold" は CSS の var(--asset-btn-fold) になります。

   ■ 1スキンの形
   { slot, id, name, note, owned, price, swatch, assets:{ロール:URL} }
   assets が空のスキンは「素材を使わない」＝ CSS 手描きの見た目にフォールバックします。
   owned:false は未所持。装飾品設定では鍵付きで並び、選択できません。
   ====================================================================== */
window.MH_SKINS = {

  /* preview … 装飾品設定の見本画像に使うロールと、その収め方（contain / cover）。
     そのロールの素材を持たないスキンは swatch の色見本で表示されます。 */
  slots: [
    { id:"tile",      name:"牌",         preview:{role:"tile-body-flat",fit:"contain"},
      roles:["tile-body-flat","tile-body-upright","tile-back-flat"] },
    { id:"arena",     name:"卓・背景",   preview:{role:"arena",fit:"cover"},
      roles:["arena"] },
    { id:"frame",     name:"枠・ボタン", preview:{role:"btn-call",fit:"contain"},
      roles:["frame-gold-plate","frame-gold-ribbon","frame-seat-plate",
             "frame-group","btn-fold","btn-call","btn-raise","dial"] },
    { id:"chip",      name:"チップ",     preview:{role:"chip-single",fit:"contain"},
      roles:["chip-single","chip-stack"] },
    { id:"effect",    name:"和了演出",   preview:{role:"fx-glow",fit:"contain"},
      roles:["fx-glow","fx-sparkle"] },
    { id:"character", name:"キャラクター", preview:{role:"character",fit:"cover"},
      roles:["character"] },
    { id:"nameplate", name:"ネームプレート", preview:{role:"nameplate",fit:"cover"},
      roles:["nameplate"] }
  ],

  skins: [

    /* ---------- 牌 ---------- */
    { slot:"tile", id:"ivory", name:"象牙", note:"標準の牌。落ち着いた乳白色",
      owned:true, swatch:"linear-gradient(160deg,#FFFDF1,#E1D1C2 55%,#8C7A66)",
      assets:{
        "tile-body-flat":    "./assets/ui/tile-body-flat.png",
        "tile-body-upright": "./assets/ui/tile-body-upright.png",
        "tile-back-flat":    "./assets/ui/tile-back-flat.png"
      } },
    { slot:"tile", id:"line", name:"線画", note:"素材を使わず輪郭で描く。軽くて明快",
      owned:true, swatch:"linear-gradient(160deg,#F6EFDC,#D6C6B6 60%,#5E5246)",
      assets:{} },
    { slot:"tile", id:"obsidian", name:"黒曜", note:"漆黒の牌に金の彫り",
      owned:false, price:1200, swatch:"linear-gradient(160deg,#4A4450,#1A1A1E)", assets:{} },

    /* ---------- 卓・背景 ---------- */
    { slot:"arena", id:"jade", name:"翡翠の間", note:"標準の卓。深緑の羅紗に金の縁",
      owned:true, swatch:"linear-gradient(160deg,#2C7A5E,#0C2A22)",
      assets:{ "arena":"./assets/arena-with-characters-v1.webp" } },
    { slot:"arena", id:"empty", name:"無人卓", note:"対局者のいない静かな卓",
      owned:true, swatch:"linear-gradient(160deg,#3B6E58,#10251E)",
      assets:{ "arena":"./assets/golden-arena-backplate-v1.webp" } },
    { slot:"arena", id:"night", name:"夜想", note:"深夜の会員制ラウンジ",
      owned:false, price:2400, swatch:"linear-gradient(160deg,#3A2A6B,#0A0A1E)", assets:{} },

    /* ---------- 枠・ボタン ---------- */
    { slot:"frame", id:"heavy", name:"重厚", note:"厚みのある金。標準",
      owned:true, swatch:"linear-gradient(160deg,#FFFFD8,#AC6E38 45%,#653612)",
      assets:{
        "frame-gold-plate":  "./assets/ui/frame-gold-plate.png",
        "frame-gold-ribbon": "./assets/ui/frame-gold-ribbon.png",
        "frame-seat-plate":  "./assets/ui/frame-seat-plate.png",
        "frame-group":       "./assets/ui/frame-group.png",
        "btn-fold":          "./assets/ui/btn-fold.png",
        "btn-call":          "./assets/ui/btn-call.png",
        "btn-raise":         "./assets/ui/btn-raise.png",
        "dial":              "./assets/ui/dial.png"
      } },
    { slot:"frame", id:"sharp", name:"シャープ", note:"角丸と縁が全部品で揃ったベクター版",
      owned:true, swatch:"linear-gradient(160deg,#FFF3C4,#C98A3E 45%,#5A3A14)",
      assets:{
        "frame-gold-plate":  "./assets/ui/svg/frame-gold-plate.svg",
        "frame-gold-ribbon": "./assets/ui/svg/frame-gold-ribbon.svg",
        "frame-seat-plate":  "./assets/ui/svg/frame-seat-plate.svg",
        "frame-group":       "./assets/ui/svg/frame-group.svg",
        "btn-fold":          "./assets/ui/svg/btn-fold.svg",
        "btn-call":          "./assets/ui/svg/btn-call.svg",
        "btn-raise":         "./assets/ui/svg/btn-raise.svg",
        "dial":              "./assets/ui/dial.png"
      } },
    { slot:"frame", id:"flat", name:"素", note:"素材を使わない最小構成",
      owned:true, swatch:"linear-gradient(160deg,#E8C864,#8A6E17)",
      assets:{} },

    /* ---------- チップ ---------- */
    { slot:"chip", id:"classic", name:"赤白", note:"標準のチップ",
      owned:true, swatch:"conic-gradient(#D63A2E 0 25%,#F3ECE0 0 50%,#D63A2E 0 75%,#F3ECE0 0)",
      assets:{
        "chip-single":"./assets/ui/chip-single.png",
        "chip-stack": "./assets/ui/chip-stack.png"
      } },
    { slot:"chip", id:"jade", name:"翡翠", note:"緑と金のチップ",
      owned:false, price:600, swatch:"conic-gradient(#1C7444 0 25%,#E8C864 0 50%,#1C7444 0 75%,#E8C864 0)",
      assets:{} },

    /* ---------- 和了演出 ---------- */
    { slot:"effect", id:"gold", name:"金光", note:"標準の和了演出",
      owned:true, swatch:"radial-gradient(circle,#FFF6C8,#E8C864 40%,rgba(232,200,100,0))",
      assets:{
        "fx-glow":   "./assets/ui/fx-glow.png",
        "fx-sparkle":"./assets/ui/fx-sparkle.png"
      } },
    { slot:"effect", id:"quiet", name:"静", note:"演出を控えめにする",
      owned:true, swatch:"radial-gradient(circle,#9FB6AC,rgba(159,182,172,0))",
      assets:{} },

    /* ---------- キャラクター ---------- */
    { slot:"character", id:"none", name:"なし", note:"立ち絵を表示しない",
      owned:true, swatch:"linear-gradient(160deg,#2A3F38,#16241F)", assets:{} },
    { slot:"character", id:"reserved", name:"未実装", note:"立ち絵の素材待ち",
      owned:false, swatch:"linear-gradient(160deg,#3A4F48,#1E2C27)", assets:{} },

    /* ---------- ネームプレート ---------- */
    { slot:"nameplate", id:"brass", name:"真鍮", note:"標準のネームプレート",
      owned:true, swatch:"linear-gradient(180deg,#EBD489,#8A6E17)", assets:{} },
    { slot:"nameplate", id:"onyx", name:"黒檀", note:"黒地に金の文字",
      owned:false, price:400, swatch:"linear-gradient(180deg,#3A342A,#12100C)", assets:{} }

  ]
};
