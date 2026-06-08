/** 用户角色 */
export type UserRole = 'admin' | 'user';

/** 用户信息 */
export interface UserInfo {
  username: string;
  role: UserRole;
}

/** 工单记录 */
export interface WorkOrder {
  id: string;
  project: string;
  overtime: boolean;
  hours: number;
  created_at: string;
}

/** 分页查询参数 */
export interface PageParams {
  page: number;
  pageSize: number;
}

/** 分页数据 */
export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** 项目工时聚合 */
export interface ProjectHours {
  project: string;
  totalHours: number;
}

/** API 通用响应 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}
