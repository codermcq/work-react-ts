import axios from 'axios';

/**
 * Axios 实例 — 所有 API 请求通过此实例发出
 *
 * 开发环境下，Vite 的 mock 插件拦截 /api/* 请求并返回 mock 数据。
 * axios 发出的是真实 HTTP 请求，可在浏览器 Network 面板中完整追踪。
 */
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export default request;

// 下面为真实项目中有token认证时的示例，当前项目不需要，暂时注释掉
// const instance = axios.create({
//   baseURL: '/',
//   timeout: 10000,
// });

// const request = axios.create({
//   baseURL: '/api',
//   timeout: 10000,
// });

// export default request;

// instance.interceptors.request.use((config) => {
//   const token = getAccessToken();
//   if (token) {
//     // eslint-disable-next-line no-param-reassign
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// instance.interceptors.response.use(
//   (response) => {
//     const data = response.data;
//     if (typeof data === 'object' && data !== null && 'code' in data) {
//       if (data.code === 200) {
//         return data;
//       }
//       // 后端返回业务错误（code !== 200），统一弹出错误提示
//       ElMessage.error(data.message || '请求失败');
//       return Promise.reject(data);
//     }
//     return data;
//   },
//   (error) => {
//     const { response } = error;

//     // 401：区分是"登录时输错密码"（后端有 message）还是"Token 失效"（无业务 message）
//     if (response && response.status === 401) {
//       const backendMsg = response.data?.message;
//       if (backendMsg) {
//         // 登录/注册时后端返回的 401 + 业务 message（如"密码错误"），只提示不跳转
//         ElMessage.error(backendMsg);
//       } else {
//         // Token 失效或未认证，清除登录态并跳转登录页
//         clearTokens();
//         router.push({ path: '/login' });
//         ElMessage.error('登录已过期，请重新登录');
//       }
//       return Promise.reject(error);
//     }

//     // 网络错误（无响应）
//     if (!response) {
//       ElMessage.error('网络连接失败，请检查网络后重试');
//       return Promise.reject(error);
//     }

//     // 其他 HTTP 错误（4xx / 5xx）
//     const backendMsg =
//       response.data?.message ||
//       response.data?.msg ||
//       response.data?.error ||
//       `请求失败（${response.status}）`;
//     ElMessage.error(backendMsg);

//     return Promise.reject(error);
//   },
// );

// export default instance;