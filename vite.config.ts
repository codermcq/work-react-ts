import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'http';
import { handleApiRequest } from './src/mock/handlers';

// ── 工具函数 ──────────────────────────────────────────────

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

/** 读取 POST/PUT body */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: Buffer) => (body += chunk.toString()));
    req.on('end', () => resolve(body));
  });
}

async function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const raw = await readBody(req);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** 解析 query string */
function parseQuery(url: string): Record<string, string> {
  const idx = url.indexOf('?');
  if (idx === -1) return {};
  const qs = url.slice(idx + 1);
  const params: Record<string, string> = {};
  for (const pair of qs.split('&')) {
    const [k, v] = pair.split('=');
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
  }
  return params;
}

// ── CORS 预检 ──────────────────────────────────────────────

function setCors(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ── Vite Mock 插件 ─────────────────────────────────────────

function mockApiPlugin(): Plugin {
  return {
    name: 'mock-api',
    configureServer(server) {
      // 全局 CORS + OPTIONS 处理
      server.middlewares.use('/api', (req, res, next) => {
        setCors(res);
        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }
        next();
      });

      // 统一 API 路由处理 — 委托给共享 mock 处理器
      server.middlewares.use('/api', async (req, res) => {
        const method = req.method?.toUpperCase() ?? 'GET';
        const path = req.url?.split('?')[0] ?? '/';
        const body = await parseBody(req);
        const query = parseQuery(req.url ?? '');

        const result = await handleApiRequest(method, path, body, query);

        sendJson(res, result.status, result.body);
      });
    },
  };
}

// ── 导出配置 ───────────────────────────────────────────────

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  server: {
    port: 3000,
    open: true,
  },
});
