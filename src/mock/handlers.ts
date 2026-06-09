import type { WorkOrder } from '../types';

// ── Mock 数据 ──────────────────────────────────────────────

const initialOrders: WorkOrder[] = [
  { id: '001', project: 'Road Project A', overtime: true, hours: 3.5, created_at: '2024-04-10 10:30' },
  { id: '002', project: 'Bridge Maintenance B', overtime: false, hours: 2, created_at: '2024-04-09 13:00' },
  { id: '003', project: 'Pipeline Fix C', overtime: true, hours: 4.5, created_at: '2024-04-08 08:00' },
  { id: '004', project: 'Bridge Maintenance B', overtime: true, hours: 3, created_at: '2024-04-07 16:45' },
  { id: '005', project: 'Tunnel Cleaning D', overtime: false, hours: 8.1, created_at: '2024-04-03 11:43' },
];

let orders = [...initialOrders];

// ── 工具函数 ──────────────────────────────────────────────

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

// ── 响应类型 ──────────────────────────────────────────────

export interface MockResponse {
  status: number;
  body: unknown;
}

// ── 核心处理器（框架无关）──────────────────────────────────

/**
 * 处理 mock API 请求
 *
 * @param method  HTTP 方法 (GET/POST/PUT/DELETE)
 * @param path    URL 路径，如 '/login'、'/orders'、'/orders/001'
 * @param body    已解析的请求体（POST/PUT）
 * @param query  已解析的 query string
 */
export async function handleApiRequest(
  method: string,
  path: string,
  body: Record<string, unknown>,
  query: Record<string, string>,
): Promise<MockResponse> {
  // 模拟网络延迟
  await new Promise((r) => setTimeout(r, 400));

  // ── POST /login ──
  if (method === 'POST' && path === '/login') {
    const username = String(body.username ?? '');
    const role = username === 'admin' ? 'admin' : 'user';
    return { status: 200, body: { code: 0, message: 'ok', data: { username, role } } };
  }

  // ── GET /orders（支持分页 ?page=1&pageSize=N）──
  if (method === 'GET' && path === '/orders') {
    const page = parseInt(query.page, 10) || 1;
    const pageSize = parseInt(query.pageSize, 10) || orders.length;
    const total = orders.length;
    const start = (page - 1) * pageSize;
    const list = orders.slice(start, start + pageSize);
    return {
      status: 200,
      body: { code: 0, message: 'ok', data: { list, total, page, pageSize } },
    };
  }

  // ── DELETE /orders/:id ──
  if (method === 'DELETE') {
    const params = matchPath('/orders/:id', path);
    if (params) {
      orders = orders.filter((o) => o.id !== params.id);
      return { status: 200, body: { code: 0, message: 'ok', data: null } };
    }
  }

  // 未匹配
  return { status: 404, body: { code: 404, message: `No mock for ${method} ${path}`, data: null } };
}
