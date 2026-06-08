import type { WorkOrder } from '../types';

/**
 * 硬编码的工单 mock 数据
 * 作为"数据库"存在，运行时可能被逻辑删除修改
 */
export const mockOrders: WorkOrder[] = [
  {
    id: '001',
    project: 'Road Project A',
    overtime: true,
    hours: 3.5,
    created_at: '2024-04-10 10:30',
  },
  {
    id: '002',
    project: 'Bridge Maintenance B',
    overtime: false,
    hours: 2,
    created_at: '2024-04-09 13:00',
  },
  {
    id: '003',
    project: 'Pipeline Fix C',
    overtime: true,
    hours: 4.5,
    created_at: '2024-04-08 08:00',
  },
  {
    id: '004',
    project: 'Bridge Maintenance B',
    overtime: true,
    hours: 3,
    created_at: '2024-04-07 16:45',
  },
  {
    id: '005',
    project: 'Tunnel Cleaning D',
    overtime: false,
    hours: 8.1,
    created_at: '2024-04-03 11:43',
  },
];
