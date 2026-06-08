import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Card,
  Space,
  Tag,
  Typography,
  Popconfirm,
  message,
  Spin,
  Pagination,
} from 'antd';
import { DeleteOutlined, LogoutOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import { useAuth } from '../context/AuthContext';
import { fetchOrders, deleteOrder } from '../api/orders';
import { ProjectChart } from '../components/ProjectChart';
import type { WorkOrder } from '../types';

const { Title } = Typography;

const DEFAULT_PAGE_SIZE = 5;

export function DashboardPage() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // ── 表格分页状态 ──
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  // ── 图表独立分页状态 ──
  const [chartOrders, setChartOrders] = useState<WorkOrder[]>([]);
  const [chartTotal, setChartTotal] = useState(0);
  const [chartPage, setChartPage] = useState(1);
  const [chartPageSize, setChartPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [chartLoading, setChartLoading] = useState(true);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const initialized = useRef(false);

  // ── 数据加载 ──────────────────────────────────────────

  /** 加载表格分页数据 */
  const loadOrders = useCallback(async (p: number, ps: number) => {
    setLoading(true);
    try {
      const result = await fetchOrders({ page: p, pageSize: ps });
      setOrders(result.list);
      setTotal(result.total);
      setPage(result.page);
      setPageSize(result.pageSize);
    } catch {
      message.error('加载工单列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  /** 加载图表分页数据 */
  const loadChartData = useCallback(async (p: number, ps: number) => {
    setChartLoading(true);
    try {
      const result = await fetchOrders({ page: p, pageSize: ps });
      setChartOrders(result.list);
      setChartTotal(result.total);
      setChartPage(result.page);
      setChartPageSize(result.pageSize);
    } catch {
      message.error('加载图表数据失败');
    } finally {
      setChartLoading(false);
    }
  }, []);

  // 首次加载
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      loadOrders(1, DEFAULT_PAGE_SIZE);
      loadChartData(1, DEFAULT_PAGE_SIZE);
    }
  }, [loadOrders, loadChartData]);

  // ── 表格翻页 ──────────────────────────────────────────

  const handleTableChange = useCallback(
    (
      pagination: TablePaginationConfig,
      _filters: Record<string, FilterValue | null>,
      _sorter: SorterResult<WorkOrder> | SorterResult<WorkOrder>[],
    ) => {
      const p = pagination.current ?? 1;
      const ps = pagination.pageSize ?? DEFAULT_PAGE_SIZE;
      loadOrders(p, ps);
    },
    [loadOrders],
  );

  // ── 图表翻页 ──────────────────────────────────────────

  const handleChartPageChange = useCallback(
    (p: number, ps: number) => {
      loadChartData(p, ps);
    },
    [loadChartData],
  );

  // ── 删除 ──────────────────────────────────────────────

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await deleteOrder(id);

        // 更新表格
        setOrders((prev) => {
          const next = prev.filter((o) => o.id !== id);
          if (next.length === 0 && page > 1) {
            loadOrders(page - 1, pageSize);
          }
          return next;
        });
        setTotal((prev) => prev - 1);

        // 更新图表
        setChartOrders((prev) => {
          const next = prev.filter((o) => o.id !== id);
          if (next.length === 0 && chartPage > 1) {
            loadChartData(chartPage - 1, chartPageSize);
          }
          return next;
        });
        setChartTotal((prev) => prev - 1);

        message.success(`工单 ${id} 已删除`);
      } catch {
        message.error('删除失败');
      } finally {
        setDeletingId(null);
      }
    },
    [page, pageSize, chartPage, chartPageSize, loadOrders, loadChartData],
  );

  // ── 刷新 ──────────────────────────────────────────────

  const handleRefresh = useCallback(() => {
    loadOrders(page, pageSize);
    loadChartData(chartPage, chartPageSize);
  }, [page, pageSize, chartPage, chartPageSize, loadOrders, loadChartData]);

  // ── 退出 ──────────────────────────────────────────────

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  // ── 表格列定义 ────────────────────────────────────────

  const columns: ColumnsType<WorkOrder> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Project', dataIndex: 'project', key: 'project' },
    {
      title: 'Overtime',
      dataIndex: 'overtime',
      key: 'overtime',
      width: 100,
      render: (val: boolean) =>
        val ? <Tag color="red">Yes</Tag> : <Tag color="green">No</Tag>,
    },
    {
      title: 'Hours',
      dataIndex: 'hours',
      key: 'hours',
      width: 80,
      sorter: true,
    },
    { title: 'Created At', dataIndex: 'created_at', key: 'created_at', width: 180 },
    ...(isAdmin
      ? [
          {
            title: 'Action',
            key: 'action',
            width: 100,
            render: (_: unknown, record: WorkOrder) => (
              <Popconfirm
                title="确认删除"
                description={`确定要删除工单 ${record.id} 吗？`}
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deletingId === record.id}
                >
                  Delete
                </Button>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* 顶栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          工单管理
          <Tag color={isAdmin ? 'blue' : 'default'} style={{ marginLeft: 12 }}>
            {user?.username}（{isAdmin ? '管理员' : '普通用户'}）
          </Tag>
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            退出登录
          </Button>
        </Space>
      </div>

      {/* 工单表格（服务端分页） */}
      <Card title="工单列表" style={{ marginBottom: 24 }}>
        <Spin spinning={loading}>
          <Table<WorkOrder>
            rowKey="id"
            columns={columns}
            dataSource={orders}
            size="middle"
            locale={{ emptyText: '暂无工单数据' }}
            onChange={handleTableChange}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              pageSizeOptions: ['2', '3', '5', '10'],
              showTotal: (t) => `共 ${t} 条`,
            }}
          />
        </Spin>
      </Card>

      {/* 图表（独立分页查询） */}
      <Card
        title="Project Hours Distribution"
        extra={
          <Pagination
            current={chartPage}
            pageSize={chartPageSize}
            total={chartTotal}
            showSizeChanger
            pageSizeOptions={['2', '3', '5', '10']}
            showTotal={(t) => `共 ${t} 条`}
            onChange={handleChartPageChange}
            size="small"
            simple={false}
          />
        }
      >
        <Spin spinning={chartLoading}>
          <ProjectChart orders={chartOrders} />
        </Spin>

        {/* 当页聚合信息 */}
        {!chartLoading && chartOrders.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 8, color: '#888', fontSize: 12 }}>
            当前页 {chartOrders.length} 条工单 · 共 {chartTotal} 条
          </div>
        )}
      </Card>
    </div>
  );
}
