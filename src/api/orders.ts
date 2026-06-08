import request from './request';
import type { ApiResponse, WorkOrder, PaginatedData, PageParams } from '../types';

/** 获取工单列表（分页） */
export async function fetchOrders(params: PageParams): Promise<PaginatedData<WorkOrder>> {
  const res = await request.get<ApiResponse<PaginatedData<WorkOrder>>>('/orders', { params });
  return res.data.data as PaginatedData<WorkOrder>;
}

/** 删除工单 */
export async function deleteOrder(id: string): Promise<void> {
  await request.delete<ApiResponse>(`/orders/${id}`);
}
