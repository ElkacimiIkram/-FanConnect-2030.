/**
 * MCP stdio server + startup generator for the FanConnect jury PPTX.
 * Spawning this process runs presentation-soutenance-jury.js, then stays
 * alive so Grok can call generate_jury_pptx again.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const NODE = "C:\\Program Files\\nodejs\\node.exe";
const ROOT = "C:\\Users\\kassimi\\Downloads\\FanConnect-2030 (1)\\FanConnect-2030";
const SCRIPT = path.join(ROOT, "docs", "rapport", "presentation-soutenance-jury.js");
const SRC = path.join(ROOT, "docs", "rapport", "Presentation_Soutenance_Jury_FanConnect_2030.pptx");
const ALIAS = path.join(ROOT, "docs", "rapport", "Presentation_Soutenance_FanConnect_2030.pptx");
const DEST = path.join(ROOT, "Presentation_Soutenance_Jury_FanConnect_2030.pptx");
const STATUS = path.join(ROOT, "docs", "rapport", "jury-pptx-status.json");
const LOG = path.join(ROOT, "docs", "rapport", "jury-pptx-mcp.log");

function log(msg) {
  try {
    fs.appendFileSync(LOG, new Date().toISOString() + " " + msg + "\n");
  } catch (_) {}
}

function sizes() {
  const srcSize = fs.existsSync(SRC) ? fs.statSync(SRC).size : 0;
  const aliasSize = fs.existsSync(ALIAS) ? fs.statSync(ALIAS).size : 0;
  const destSize = fs.existsSync(DEST) ? fs.statSync(DEST).size : 0;
  return { srcSize, aliasSize, destSize };
}

function generate() {
  log("generate start");
  const r = spawnSync(NODE, [SCRIPT], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 120000,
    windowsHide: true,
    env: process.env,
  });
  const out = {
    ok: false,
    stdout: r.stdout || "",
    stderr: r.stderr || "",
    status: r.status,
    error: r.error ? r.error.message : null,
    src: SRC,
    alias: ALIAS,
    dest: DEST,
    ...sizes(),
    at: new Date().toISOString(),
  };
  out.ok = out.status === 0 && out.srcSize > 500000 && out.destSize > 500000;
  try {
    fs.writeFileSync(STATUS, JSON.stringify(out, null, 2));
  } catch (_) {}
  log("generate done ok=" + out.ok + " srcSize=" + out.srcSize + " destSize=" + out.destSize);
  return out;
}

const boot = generate();

function send(msg) {
  const json = JSON.stringify(msg);
  const payload = Buffer.from(json, "utf8");
  process.stdout.write("Content-Length: " + payload.length + "\r\n\r\n");
  process.stdout.write(payload);
}

function handle(msg) {
  if (!msg || typeof msg !== "object") return;
  const { id, method } = msg;
  if (method === "initialize") {
    send({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "jury_pptx", version: "1.0.0" },
      },
    });
    return;
  }
  if (method === "notifications/initialized" || method === "initialized") return;
  if (method === "ping") {
    if (id !== undefined) send({ jsonrpc: "2.0", id, result: {} });
    return;
  }
  if (method === "tools/list") {
    send({
      jsonrpc: "2.0",
      id,
      result: {
        tools: [
          {
            name: "generate_jury_pptx",
            description: "Generate FanConnect 2030 jury PowerPoint files via presentation-soutenance-jury.js",
            inputSchema: { type: "object", properties: {}, additionalProperties: false },
          },
        ],
      },
    });
    return;
  }
  if (method === "tools/call") {
    const result = generate();
    send({
      jsonrpc: "2.0",
      id,
      result: {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        isError: !result.ok,
      },
    });
    return;
  }
  if (id !== undefined) {
    send({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: "Method not found: " + String(method) },
    });
  }
}

let buf = Buffer.alloc(0);
process.stdin.on("data", (chunk) => {
  buf = Buffer.concat([buf, chunk]);
  while (true) {
    const asText = buf.toString("utf8");
    if (asText.startsWith("{")) {
      const nl = buf.indexOf(10);
      if (nl === -1) break;
      const line = buf.slice(0, nl).toString("utf8").replace(/\r$/, "");
      buf = buf.slice(nl + 1);
      if (line.trim()) {
        try {
          handle(JSON.parse(line));
        } catch (e) {
          log("json line error " + e.message);
        }
      }
      continue;
    }
    const headerEnd = buf.indexOf("\r\n\r\n");
    if (headerEnd === -1) break;
    const header = buf.slice(0, headerEnd).toString("utf8");
    const m = header.match(/Content-Length:\s*(\d+)/i);
    if (!m) {
      buf = buf.slice(headerEnd + 4);
      continue;
    }
    const len = parseInt(m[1], 10);
    const start = headerEnd + 4;
    if (buf.length < start + len) break;
    const body = buf.slice(start, start + len).toString("utf8");
    buf = buf.slice(start + len);
    try {
      handle(JSON.parse(body));
    } catch (e) {
      log("json body error " + e.message);
    }
  }
});

process.stdin.on("end", () => process.exit(boot.ok ? 0 : 1));
process.stdin.resume();
log("mcp listening boot.ok=" + boot.ok);
