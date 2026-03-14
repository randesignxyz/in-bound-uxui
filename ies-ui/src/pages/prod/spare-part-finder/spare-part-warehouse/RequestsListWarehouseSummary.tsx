import { EyeOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Progress, Tag, Typography } from 'antd';
import {
  calcRequestTotals,
  getStatusPill,
  getWarehouseRequestStatus,
  priorityColorMap,
  type WarehouseRequestRecord,
} from './requestsWarehouse.shared';

export const buildSummaryColumns = (options: {
  onViewRequest?: (request: WarehouseRequestRecord) => void;
}): ProColumns<WarehouseRequestRecord>[] => [
  {
    title: '',
    key: 'view',
    width: 42,
    render: (_, record) => (
      <Button
        type="text"
        icon={<EyeOutlined />}
        onClick={() => options.onViewRequest?.(record)}
        style={{ color: '#1677ff' }}
      />
    ),
  },
  {
    title: 'Request ID',
    dataIndex: 'requestId',
    key: 'requestId',
    width: 120,
    render: (value) => <Typography.Link>{value}</Typography.Link>,
  },
  {
    title: 'Priority',
    dataIndex: 'priority',
    key: 'priority',
    width: 90,
    render: (_, record) => (
      <span style={{ color: priorityColorMap[record.priority] }}>{record.priority}</span>
    ),
  },
  {
    title: 'Amount Items',
    key: 'amount',
    width: 100,
    render: (_, record) => record.items.reduce((sum, item) => sum + item.quantity, 0),
  },
  {
    title: 'Fulfillment Progress',
    key: 'progress',
    width: 200,
    render: (_, record) => {
      const { total, received, percent } = calcRequestTotals(record);
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c' }}>
            <span>
              {received}/{total} RECEIVED
            </span>
            <span>{percent}%</span>
          </div>
          <Progress
            percent={percent}
            showInfo={false}
            size={[148, 6]}
            strokeColor={percent === 100 ? '#52c41a' : '#b59a30'}
            trailColor="#d9dfe7"
          />
        </div>
      );
    },
  },
  { title: 'BU', key: 'bu', width: 80, render: (_, record) => record.items[0]?.businessUnit || '-' },
  { title: 'Created By', dataIndex: 'requester', key: 'requester', width: 130 },
  { title: 'Created Date', dataIndex: 'requestDate', key: 'requestDate', width: 170 },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (_, record) => {
      const displayValue = getWarehouseRequestStatus(record.status);
      const pill = getStatusPill(displayValue);
      return (
        <Tag
          bordered={false}
          style={{ marginInlineEnd: 0, color: pill.color, background: pill.background }}
        >
          {displayValue}
        </Tag>
      );
    },
  },
];
