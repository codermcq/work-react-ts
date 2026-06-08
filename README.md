# 工单管理系统

基于 React 18 + Ant Design + ECharts + Axios 的前端 Demo 项目，模拟真实开发环境下的登录鉴权、工单管理、数据可视化及服务端分页。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| UI 组件 | Ant Design 5 |
| 图表 | ECharts + echarts-for-react |
| HTTP | Axios（Vite 中间件 Mock） |
| 路由 | React Router 6（懒加载 + 路由守卫） |
| 构建 | Vite |

## 快速开始

```bash
npm install
npm run dev        # 启动开发服务器 → http://localhost:3000
```

## 功能

- **登录鉴权** — admin 为管理员，其他用户名为普通用户
- **权限控制** — 管理员可删除工单，普通用户只读
- **工单表格** — 服务端分页，翻页发送 HTTP 请求（Network 面板可见）
- **柱状图** — 按项目聚合工时，独立分页查询
- **删除联动** — 删除后表格与图表自动同步更新
- **Mock API** — Vite 开发服务器中间件拦截请求，400ms 模拟延迟

## 项目结构

```
src/
├── api/            # Axios 实例 + 业务接口
├── mock/           # Mock 数据
├── types/          # TypeScript 类型定义
├── context/        # AuthContext 全局用户状态
├── routes/         # 路由配置 + 守卫（React.lazy 懒加载）
├── views/          # 页面组件
├── components/     # 通用组件
└── vite.config.ts  # Mock API 中间件
```

## 脚本

```bash
npm run dev         # 开发模式
npm run build       # 生产构建
npm run preview     # 预览构建产物
```
