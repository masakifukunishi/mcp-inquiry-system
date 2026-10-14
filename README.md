# inquiry-system

問い合わせ管理システムのAPIです。MCPサーバーの動作確認用に作った、テスト用の簡易なものです。

- TypeScript + Express
- データは `data/inquiries.json` に保存（データベースなし）
- 画面・認証はなし

## 必要なもの

- Node.js 20 以上

## 起動

```sh
git clone https://github.com/masakifukunishi/inquiry-system.git
cd inquiry-system
npm install
npm run dev
```

`http://localhost:3000` で起動します。

## エンドポイント

ステータスは `open`（未対応）/ `in_progress`（対応中）/ `closed`（完了）の3種類です。

以下の例では、レスポンスを見やすくするために [jq](https://jqlang.org/) で整形しています。jq がない場合は `| jq` を外してください。

### 一覧取得

```sh
curl -s localhost:3000/inquiries | jq
curl -s "localhost:3000/inquiries?status=open" | jq
```

本文（`body`）は含みません。

### 詳細取得

```sh
curl -s localhost:3000/inquiries/1 | jq
```

### ステータス更新

```sh
curl -s -X PATCH localhost:3000/inquiries/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"closed"}' | jq
```

## MCPサーバー

APIを起動した状態で、別のターミナルからリポジトリのディレクトリで実行します。

### MCP Inspector で動作確認

```sh
npx @modelcontextprotocol/inspector npx tsx src/mcp-server.ts
```

### Claude Code に登録

```sh
claude mcp add inquiry-system -- npx tsx src/mcp-server.ts
```

## データを元に戻す

ステータス更新で `data/inquiries.json` が書き換わります。元に戻すには次を実行します。

```sh
git checkout data/inquiries.json
```
