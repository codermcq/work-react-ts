import request from './request';
import type { ApiResponse, UserInfo } from '../types';

interface LoginResult {
  username: string;
  role: string;
}

/** 登录 */
export async function login(username: string, password: string): Promise<UserInfo> {
  // password 在当前需求中不参与判断，但保留以模拟真实 API
  const res = await request.post<ApiResponse<LoginResult>>('/login', {
    username,
    password,
  });
  return res.data.data as UserInfo;
}
