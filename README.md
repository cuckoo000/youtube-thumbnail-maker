# YouTube Thumbnail Maker

画像と短い見出しから、YouTube向けの1280×720サムネイルをブラウザ内で生成するWebアプリ。

## 目的

- 白文字＋黒縁、黄文字＋赤縁の大見出しを迷わず作れるようにする
- 文字数に応じて文字サイズを自動調整し、占有率だけをスライダーで微調整できるようにする
- 入力画像を端末外へ送信・保存せず、静的ホスティングだけで提供できるようにする

現在は編集UI（背景画像の読み込み、見出し入力、文字スタイル・占有率の切り替え、Canvasプレビュー、PNG書き出し）と、レイアウト計算の単体テストまで実装済み。E2Eテストは未導入。

## セットアップ

前提: Node.js 20.19以上、または22.12以上。

```powershell
npm install
npm run dev
```

検証:

```powershell
npm run typecheck
npm test
npm run build
```

## 公開

ビルド成果物 `dist/` を Xserver のサブドメイン `tools.vrceve.com` の
`/thumbnail/` 配下へ FTP で配置する。公開URLは `https://tools.vrceve.com/thumbnail/`。
サーバー処理は持たず、静的ファイルのみを配信する。

サブディレクトリ配信のため `vite.config.ts` で `base: '/thumbnail/'` を指定している。
手順と注意点は `docs/deployment.md` を参照する。

## 正本の所在

ディレクトリ構成が必要な場合は `docs/repository-structure.md` を参照する。

### ルールと方針

| 文書 | 正本とする内容 |
| --- | --- |
| `docs/development-guidelines.md` | コーディング・検証・Git運用のルール |

### 設計ドキュメント

| 文書 | 正本とする内容 | 更新タイミング |
| --- | --- | --- |
| `docs/product-requirements.md` | プロダクトの目的、機能要件、受け入れ条件 | 要件やMVP範囲の変更時 |
| `docs/functional-design.md` | 操作フロー、描画仕様、自動レイアウト | 画面・アルゴリズム変更時 |
| `docs/architecture.md` | クライアント完結構成、技術選定、品質要件 | 技術構成や非機能要件の変更時 |
| `docs/repository-structure.md` | ディレクトリと依存方向 | 構成変更時 |

### コードと配信物

| 対象 | 正本とする内容 | 注意点 |
| --- | --- | --- |
| `src/` | Webアプリの実装 | ユーザー画像を通信・永続化する処理を追加しない |
| `tests/` | 単体テスト | `src/` と同じ責務単位で配置する |
| `public/` | ビルドを介さず配信するファイル | アプリ固有の配信ヘッダは `public/.htaccess` が正本 |
| `deploy/host-root/` | `tools.vrceve.com` のドキュメントルートへ置くファイル | ツール一覧ページ、共通ヘッダ、`robots.txt`、`sitemap.xml`。ホスト単位でしか効かないため `dist/` には含めない |
| `LICENSE` | ソースコードの利用条件（MIT） | 利用規約の記述と矛盾させない |
| `package-lock.json` | npm依存関係の解決結果 | `package.json` と同じ変更で更新する |
| `dist/` | ビルド生成物 | Git管理せず、直接編集しない |

## 運用ルール

- ディレクトリ構成や正本の所在が変わったら、同じ作業で本READMEを更新する
- 認証情報、APIキー、個人情報、入力画像をコミットしない