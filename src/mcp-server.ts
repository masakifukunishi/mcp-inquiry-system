import { McpServer, type CallToolResult } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";

const API_URL = "http://localhost:3000";

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

  return server;
});
