import { McpServer, type CallToolResult } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

const API_URL = "http://localhost:3000";

const statusSchema = z
  .enum(["open", "in_progress", "closed"])
  .describe("open: 未対応 / in_progress: 対応中 / closed: 完了");

const callApi = async (path: string, init?: RequestInit): Promise<CallToolResult> => {
  const res = await fetch(`${API_URL}${path}`, init);
  const text = await res.text();

  return {
    content: [{ type: "text", text }],
    isError: !res.ok,
  };
};

serveStdio(() => {
  const server = new McpServer({ name: "inquiry-system", version: "1.0.0" });

  server.registerTool(
    "list_inquiries",
    {
      description:
        "問い合わせの一覧を取得する。status を指定すると絞り込める。本文は含まないので、本文が必要なときは get_inquiry を使う。",
      inputSchema: z.object({
        status: statusSchema.optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ status }) => {
      return callApi(status ? `/inquiries?status=${status}` : "/inquiries");
    },
  );

  server.registerTool(
    "get_inquiry",
    {
      description: "IDを指定して、問い合わせ1件の内容を本文まで含めて取得する。",
      inputSchema: z.object({
        id: z.number(),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ id }) => {
      return callApi(`/inquiries/${id}`);
    },
  );

  server.registerTool(
    "update_status",
    {
      description: "IDを指定して、問い合わせのステータスを更新する。",
      inputSchema: z.object({
        id: z.number(),
        status: statusSchema,
      }),
    },
    async ({ id, status }) => {
      return callApi(`/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    },
  );

  return server;
});
