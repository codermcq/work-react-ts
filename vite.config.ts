import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'http';

// ── Mock 数据 ──────────────────────────────────────────────

interface WorkOrder {
  id: string;
  project: string;
  overtime: boolean;
  hours: number;
  created_at: string;
}

const initialOrders: WorkOrder[] = [
  { id: '001', project: 'Road Project A', overtime: true, hours: 3.5, created_at: '2024-04-10 10:30' },
  { id: '002', project: 'Bridge Maintenance B', overtime: false, hours: 2, created_at: '2024-04-09 13:00' },
  { id: '003', project: 'Pipeline Fix C', overtime: true, hours: 4.5, created_at: '2024-04-08 08:00' },
  { id: '004', project: 'Bridge Maintenance B', overtime: true, hours: 3, created_at: '2024-04-07 16:45' },
  { id: '005', project: 'Tunnel Cleaning D', overtime: false, hours: 8.1, created_at: '2024-04-03 11:43' },
];

let orders = [...initialOrders];

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

/** 简单路径匹配（支持 :id 占位） */
function matchPath(pattern: string, actual: string): Record<string, string> | null {
  const pp = pattern.split('/');
  const ap = actual.split('/');
  if (pp.length !== ap.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) {
      params[pp[i].slice(1)] = ap[i];
    } else if (pp[i] !== ap[i]) {
      return null;
    }
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

      // 统一 API 路由处理
      server.middlewares.use('/api', async (req, res) => {
        const method = req.method?.toUpperCase() ?? 'GET';
        const url = req.url?.split('?')[0] ?? '/';

        // 模拟网络延迟
        await new Promise((r) => setTimeout(r, 400));

        // ── POST /api/login ──
        if (method === 'POST' && url === '/login') {
          const body = await parseBody(req);
          const username = String(body.username ?? '');
          const role = username === 'admin' ? 'admin' : 'user';
          return sendJson(res, 200, { code: 0, message: 'ok', data: { username, role } });
        }

        // ── GET /api/orders（支持分页 ?page=1&pageSize=N）──
        if (method === 'GET' && url === '/orders') {
          const query = parseQuery(req.url ?? '');
          const page = parseInt(query.page, 10) || 1;
          const pageSize = parseInt(query.pageSize, 10) || orders.length;
          const total = orders.length;
          const start = (page - 1) * pageSize;
          const list = orders.slice(start, start + pageSize);
          return sendJson(res, 200, {
            code: 0,
            message: 'ok',
            data: { list, total, page, pageSize },
          });
        }

        // ── DELETE /api/orders/:id ──
        if (method === 'DELETE') {
          const params = matchPath('/orders/:id', url);
          if (params) {
            const { id } = params;
            orders = orders.filter((o) => o.id !== id);
            return sendJson(res, 200, { code: 0, message: 'ok', data: null });
          }
        }

        // 未匹配
        sendJson(res, 404, { code: 404, message: `No mock for ${method} ${url}`, data: null });
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
