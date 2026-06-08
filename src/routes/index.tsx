import { useRoutes } from 'react-router-dom';
import routes from './routes';

/**
 * 路由渲染组件
 * 使用 useRoutes 将 RouteObject[] 配置表渲染为路由树
 */
export function AppRoutes() {
  return useRoutes(routes);
}
