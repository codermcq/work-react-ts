import type { IncomingMessage, ServerResponse } from 'http';

// ══════════════════════════════════════════════════════════════
// Mock 数据 & 逻辑（自包含，无外部依赖，确保 Vercel 打包可靠）
// ══════════════════════════════════════════════════════════════

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

async function handleApiRequest(
  method: string,
  path: string,
  body: Record<string, unknown>,
  query: Record<string, string>,
): Promise<{ status: number; body: unknown }> {
  // 模拟网络延迟
  await new Promise((r) => setTimeout(r, 400));

  // POST /login
  if (method === 'POST' && path === '/login') {
    const username = String(body.username ?? '');
    const role = username === 'admin' ? 'admin' : 'user';
    return { status: 200, body: { code: 0, message: 'ok', data: { username, role } } };
  }

  // GET /orders
  if (method === 'GET' && path === '/orders') {
    const page = parseInt(query.page, 10) || 1;
    const pageSize = parseInt(query.pageSize, 10) || orders.length;
    const total = orders.length;
    const start = (page - 1) * pageSize;
    const list = orders.slice(start, start + pageSize);
    return { status: 200, body: { code: 0, message: 'ok', data: { list, total, page, pageSize } } };
  }

  // DELETE /orders/:id
  if (method === 'DELETE') {
    const params = matchPath('/orders/:id', path);
    if (params) {
      orders = orders.filter((o) => o.id !== params.id);
      return { status: 200, body: { code: 0, message: 'ok', data: null } };
    }
  }

  return { status: 404, body: { code: 404, message: `No mock for ${method} ${path}`, data: null } };
}

// ══════════════════════════════════════════════════════════════
// HTTP 工具
// ══════════════════════════════════════════════════════════════

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
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

// ══════════════════════════════════════════════════════════════
// Vercel Serverless Function 入口
// ══════════════════════════════════════════════════════════════

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const method = req.method?.toUpperCase() ?? 'GET';
  // Vercel 函数拿到的 req.url 是完整路径（如 /api/login），
  // 需要去掉 /api 前缀，得到 mock handler 期望的路径（如 /login）
  const rawPath = req.url?.split('?')[0] ?? '/';
  const path = rawPath.replace(/^\/api/, '') || '/';
  const body = await parseBody(req);
  const query = parseQuery(req.url ?? '');

  const result = await handleApiRequest(method, path, body, query);

  sendJson(res, result.status, result.body);
}
