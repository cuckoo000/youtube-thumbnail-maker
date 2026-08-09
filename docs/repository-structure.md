# リポジトリ構造定義書

## 基本方針

- 小規模な単機能Webアプリとして開始し、必要になる前にレイヤーや設定を増やさない
- UI、レイアウト計算、Canvas依存を分離する
- 空ディレクトリや将来用のプレースホルダーファイルは作らない
- 生成物と依存パッケージはGit管理しない

## 現在の構造

```text
youtube-thumbnail-maker/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── deploy/
│   └── host-root/
│       ├── .htaccess
│       ├── index.html
│       ├── robots.txt
│       └── sitemap.xml
├── docs/
│   ├── architecture.md
│   ├── development-guidelines.md
│   ├── functional-design.md
│   ├── product-requirements.md
│   └── repository-structure.md
├── public/
│   ├── .htaccess
│   ├── favicon.svg
│   ├── ogp.jpg
│   ├── pages.css
│   ├── privacy.html
│   └── terms.html
├── src/
│   ├── editor/
│   │   ├── app.ts
│   │   └── state.ts
│   ├── image/
│   │   ├── imageLoader.ts
│   │   └── imagePlacement.ts
│   ├── rendering/
│   │   ├── canvasRenderer.ts
│   │   ├── exporter.ts
│   │   ├── renderConfig.ts
│   │   └── textLayout.ts
│   ├── share/
│   │   └── shareToX.ts
│   ├── types/
│   │   └── editor.ts
│   ├── main.ts
│   └── style.css
├── tests/
│   └── unit/
│       ├── imagePlacement.test.ts
│       ├── shareToX.test.ts
│       └── textLayout.test.ts
├── .gitignore
├── LICENSE
├── README.md
├── index.html
├── package-lock.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

`node_modules/` と `dist/` はローカルに生成されるが、構造の正本に含めずGit管理しない。
運用上のメモや公開手順など、リポジトリへ含めない文書は `.gitignore` で除外する。

## 実装時の拡張先

E2Eテストを導入する時点で `tests/e2e/` を追加する。導入するまでは作成しない。
CSSが大きくなった場合だけ、コンポーネント単位ではなく責務単位で `src/styles/` へ分割する。

## ディレクトリの責務

### `src/editor/`

- DOMの取得、イベント購読、状態更新、再描画要求を扱う
- 画像デコードや描画計算を直接実装しない
- ファイル名はcamelCaseとする

### `src/image/`

- 入力画像の検証、デコード、解放を扱う
- 背景のcover配置を純粋関数として計算する
- UI文言やDOMへ依存しない

### `src/rendering/`

- 文字レイアウト、Canvas描画、PNG書き出しを扱う
- `textLayout.ts` はDOMへ依存しない
- `canvasRenderer.ts` は状態を変更しない

### `src/types/`

- 複数モジュールで共有する型だけを置く
- 1モジュールでしか使わない型は利用箇所に置く
- 実行時定数やロジックを置かない

### `tests/`

- `unit/` は `src/` と同じ責務単位で配置する
- `e2e/` はユーザー操作のシナリオ単位で配置する
- テスト名は期待する振る舞いが読める日本語または英語で記述する

### `public/`

- ビルドを介さずそのまま `dist/` へコピーされるファイルを置く
- アプリ固有の配信ヘッダ（`.htaccess`）、ポリシーページ、アイコン、OGP画像が対象
- Vite の `base` が適用されないため、HTML内の参照は必ず相対パスで書く
- `src/` からimportするアセットはここに置かない

### `deploy/host-root/`

- `tools.vrceve.com` のドキュメントルートへ配置するファイルを置く
- ツール一覧ページ、共通ヘッダ、`robots.txt`、`sitemap.xml` が対象
- ホスト単位でしか効かないファイルのため、`dist/` へは含めない
- 本アプリ固有の内容は置かず、`public/` へ分ける

### `docs/`

- `product-requirements.md`: 何を作るか
- `functional-design.md`: どう振る舞うか
- `architecture.md`: 何で構成するか
- `repository-structure.md`: どこへ置くか
- `development-guidelines.md`: どう変更・検証するか

## 依存方向

```text
main.ts
  ↓
editor
  ├─→ image
  └─→ rendering

image ─→ shared types
rendering ─→ shared types
```

禁止する依存:

- `image` または `rendering` から `editor` への依存
- ドメイン計算からDOM、ネットワーク、Local Storageへの依存
- 循環依存
- `main.ts` への機能ロジック集約

## ファイル命名

| 対象 | 規則 | 例 |
| --- | --- | --- |
| TypeScript | camelCase | `textLayout.ts` |
| 型・クラス | PascalCase | `TextLayout` |
| CSSクラス | kebab-case | `.editor-toolbar` |
| テスト | 対象名＋`.test.ts` | `textLayout.test.ts` |

## 除外設定

`.gitignore` には最低限、次を含める。

- `node_modules/`
- `dist/`
- `*.log`
- `.env` と `*.local`
- IDE固有の一時ファイル
- 公開リポジトリへ含めない運用文書

## 更新ルール

ディレクトリを新設・削除・改名した場合は、本書の「現在の構造」とREADME.mdの正本索引を同じ変更で更新する。ただし、ファイル単位の変動をREADMEへ列挙しない。