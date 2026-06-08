import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { WorkOrder, ProjectHours } from '../types';

interface Props {
  orders: WorkOrder[];
}

/**
 * 按项目名称聚合工时 → ECharts 柱状图
 */
export function ProjectChart({ orders }: Props) {
  const aggregated = useMemo<ProjectHours[]>(() => {
    const map = new Map<string, number>();
    for (const o of orders) {
      map.set(o.project, (map.get(o.project) ?? 0) + o.hours);
    }
    return Array.from(map.entries())
      .map(([project, totalHours]) => ({ project, totalHours }))
      .sort((a, b) => b.totalHours - a.totalHours);
  }, [orders]);

  const option = useMemo(() => {
    if (aggregated.length === 0) {
      return {
        title: { text: 'Project Hours Distribution', left: 'center' },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'center',
          style: { text: '暂无数据', fontSize: 16, fill: '#999' },
        },
      };
    }

    return {
      title: { text: 'Project Hours Distribution', left: 'center' },
      tooltip: {
        trigger: 'axis' as const,
        formatter: '{b}<br/>工时: {c} h',
      },
      xAxis: {
        type: 'category' as const,
        data: aggregated.map((d) => d.project),
        axisLabel: {
          rotate: 0,
          interval: 0,
        },
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: 'value' as const,
        name: 'Hours',
        minInterval: 1,
      },
      series: [
        {
          type: 'bar',
          data: aggregated.map((d) => d.totalHours),
          itemStyle: {
            color: '#1890ff',
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: true,
            position: 'top' as const,
            formatter: '{c} h',
          },
        },
      ],
      grid: {
        bottom: 60,
        containLabel: true,
      },
    };
  }, [aggregated]);

  if (aggregated.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
        暂无工单数据
      </div>
    );
  }

  return <ReactECharts option={option} style={{ height: 400 }} notMerge />;
}
