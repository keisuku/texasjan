# MAHJONG HOLD'EM — Production North Star

最終更新: 2026-08-13

この文書は、現在のHTMLモックを延命するための計画ではない。Poker Chase級以上の商用品質へ到達するために、完成画から逆算して「何を作り、何を買い、何を捨てるか」を固定する制作規約である。

## 絶対ルール

1. **Golden Visualが先、実装は後。** 大きな構図・占有率・カメラ・情報階層は、製品相当の一枚絵または実装可能なコンポジットで人間の承認を得てから本実装する。
2. **仮部品の積み上げを製品化と呼ばない。** CSSグラデーション、自作の簡易SVG、絵文字、単色枠は検証用フォールバックに限定する。
3. **ブランドの中心は既製品で済ませない。** 卓、キャラクター、最終的な牌、主要フレーム、ショーダウン演出は専用制作する。既製アセットは土台・道具・背景小物・制作時間短縮に使う。
4. **動く縦切りを早く作る。** 完成画承認後は、一局全部を薄く作るのではなく「1ストリートの配牌→一巡ベット→+4公開→待ち変化」を製品品質で完成させる。
5. **ゲームルールと描画を分離する。** 数学、牌選択、ベッティング、勝敗は純粋な状態機械にする。HTML、Unity、サーバーは同じルールを利用・照合できなければならない。
6. **比較なしに完成判定しない。** Golden Visualと実機キャプチャを同寸で並べ、Composition / Hierarchy / Material / Lighting / Readability / Motion / Premium Feelを採点する。

## 採用する製品構成（提案・大方向は承認待ち）

### クライアント

- **Unity 6.3 LTS + URP**。2027年12月までLTS対象。iOS / Androidを製品版の主戦場にする。
- **uGUI + TextMeshPro**を対局HUDの第一候補にする。UI Toolkitはロビー、ショップ、運営画面で比較検証する。
- **Addressables**でキャラクター、卓、牌スキン、VFX、音声を分離し、アプリ本体を更新せず差し替えられる構造にする。
- キャラクターは、2D立ち絵なら**SpineまたはLive2D**、3Dなら専用リグ済みモデルを比較する。Golden Visual確定前に決め打ちしない。
- DOTween Pro、Feel、Text Animator、UI Particle系は「描画の主役」ではなく、演出制作を高速化する道具として導入候補にする。

公式根拠:

- [Unity 6.3 LTS（2027年12月までサポート）](https://unity.com/releases/unity-6/support)
- [URP公式マニュアル](https://docs.unity3d.com/cn/6000.0/Manual/universal-render-pipeline.html)
- [Addressables公式マニュアル](https://docs.unity3d.com/ja/6000.0/Manual/com.unity.addressables.html)

### 対局サーバー

- 第一候補は**Nakamaのserver-authoritative match**。牌山、私牌、手番、ベット、POT、ショーダウンをサーバーの正本とし、クライアントを信用しない。
- 本ゲームはactive turn-basedなので、物理ゲーム用の高価な専用Unityサーバーを常時動かす必要はない。低tickまたはイベント駆動に近いmatch handlerでよい。
- 初期はHeroic Cloud等のマネージド運用、規模と費用が見えた時点でセルフホストを比較する。
- PlayFabは、Microsoft基盤・運営機能を優先する場合の対案。最初から両方は入れない。

公式根拠:

- [Nakama Authoritative Multiplayer](https://heroiclabs.com/docs/nakama/concepts/multiplayer/authoritative/)
- [Nakama Unity SDK](https://heroiclabs.com/docs/nakama/client-libraries/unity/)
- [PlayFab Multiplayer](https://learn.microsoft.com/en-us/xbox/playfab/multiplayer/)

### 配信先

- **GitHub Pagesはルール・UX検証版だけ**。製品サーバーにも最終描画基盤にもしない。
- 製品版はApp Store / Google Play。Web版はURL共有できるレビュー版・観戦版・獲得導線として別途用意する。
- Addressablesのリモート素材はCDN、対局状態はNakama、分析基盤は後から独立導入する。静的素材と秘密状態を同じ場所に置かない。

## アセット方針

| 領域 | 方針 | 理由 |
|---|---|---|
| 牌の面・形状 | 専用制作。既存CC0牌はルール検証用 | 最も頻繁に見る商品本体。球体牌を含むブランド資産 |
| 卓・競技場 | 既製3Dキットをkitbashして専用アートパス | 制作短縮はできるが、そのままでは他作品と同じになる |
| キャラクター | 専用キャラ。仮リグ/モーションは購入可 | 顔とシルエットはIPそのもの。待機・勝敗モーションは再利用可能 |
| POT・席・主要ボタン | Golden Visualから9-slice/mesh/VFXへ分解 | 画面の高級感を決める。CSS代替は禁止 |
| チップ・光・火花・トランジション | 高品質購入アセットを積極利用 | 汎用品であり、調整により統一言語へ寄せられる |
| SE/BGM | 仮音源から始め、主要操作音は専用制作 | 賭けの緊張感と牌の重量感に直結 |

購入候補は購入前に必ず Unity 6.3 / URP / mobile compatibility、更新日、ライセンス、ソース編集可否、draw call、実機負荷を確認する。価格だけで選ばない。

現時点で調査済みの制作加速候補:

- [DOTween Pro](https://assetstore.unity.com/packages/tools/visual-scripting/dotween-pro-32416) — UI/カメラ/チップ移動のタイムライン補助
- [Feel](https://assetstore.unity.com/packages/tools/particles-effects/feel-183370) — ヒット感、揺れ、時間制御、フィードバック試作
- [All In 1 VFX Toolkit](https://assetstore.unity.com/packages/vfx/all-in-1-vfx-toolkit-206665) — 汎用VFXの出発点。最終見た目は専用調整必須
- [Text Animator for Unity](https://assetstore.unity.com/packages/tools/gui/text-animator-for-unity-ui-toolkit-and-text-mesh-pro-341308) — ALL-IN、TENPAI、SHOWDOWN等の文字演出

具体的な3D素材の監査結果（**購入決定ではない**）:

- [Poker / Blackjack animation pack](https://assetstore.unity.com/packages/3d/animations/poker-blackjack-and-card-games-animation-pack-311361) — Unity 6.3 / URP対応。3Dキャラ方向を承認した場合、カードを見る・賭ける等の身体演技の土台として有力。
- [Poker Chips](https://assetstore.unity.com/packages/3d/props/poker-chips-208926) — チップ物理とライティング検証用。最終意匠はFuture Mahjong専用マテリアルへ変更する。
- [Casino Essentials Pack](https://assetstore.unity.com/packages/3d/props/casino-essentials-pack-wizards-286126) — URP対応の背景小物候補。主役には使わない。
- [Blackjack Table V2](https://assetstore.unity.com/packages/3d/props/blackjack-table-v2-casino-gambling-game-ready-pbr-built-in-urp-c-327330) — URP対応だが、形と世界観が本作の最終卓ではない。カメラ・尺度・着席確認だけに使うなら可。

公式Asset Store内を「mahjong tiles / Unity 6 / URP」で確認した範囲では、Future Mahjongのブランド中心にそのまま採用できる高品質な牌一式は見つからなかった。したがって牌は、無料SVGを3Dに貼るだけで終えず、専用メッシュ、厚み、面彫り、側面、摩耗、発光、球体版まで一つの制作仕様として外注または専用生成する。

## 現行GitHubの扱い

### 残す

- 116牌仮説と確率検証、役判定、待ち判定
- `betting-engine.js` のような描画非依存の状態機械
- クリック選択、14枚上限、+4公開後も選択維持というUX知見
- Golden Visual、参考画像、アセット仕様、失敗記録

### 製品描画には持ち込まない

- `index.html` のCSS製フレーム、仮アバター、仮ボタン、簡易レイアウト
- 1枚背景の上へ廉価な部品を載せて完成とみなす方法
- クライアント内だけで確定する牌山・勝敗・POT

HTML版の役割は、**高速ルール試験機・数学ラボ・入力UX検証機**である。Unity版の完成度をHTML版へ揃えてはいけない。

## 承認ゲート

1. **GV-0 構図探索** — 製品相当の縦画面を3案。大きさ・割合・視線移動を人間がKEEP / DROP / MIX。
2. **GV-1 Golden Visual** — 通常、TENPAI、ALL-IN、SHOWDOWNの4状態を承認。
3. **GV-2 Asset Breakdown** — 背景、3D、キャラ、9-slice、牌、VFX、文字、音へ分解し、各素材の制作/購入先を確定。
4. **VS-1 Vertical Slice** — Unity実機で1ストリートをGolden Visualと比較。差分採点80点未満なら機能追加を止めて直す。
5. **MP-1 Playable Match** — 6人BOT戦を一局通し、状態機械・演出・テンポ・点棒保存を検証。
6. **NET-1 Authoritative Match** — Nakamaへ正本を移し、切断復帰・不正入力・再接続を検証。

次の大方向の承認対象は、**Unity 6.3 LTS + URP / 専用Golden Visual先行 / Nakama権威型 / HTMLは検証機に限定**の4点である。
