import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components'; 
import type { ActionType } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { useRef, useState } from 'react';
import { Button, Card, DatePicker, Input, Select, Space, Tag, Tooltip, Typography } from 'antd';
import type { SortOrder } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import type { MyRequestItem, RequestPriority, RequestStatus, SparePartType } from '../data';

const { RangePicker } = DatePicker;

// Filter options
const statusFilterOptions: { label: string; value: 'ALL' | RequestStatus }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Ready to Pickup', value: 'ready_to_Pickup' },
  { label: 'Partial', value: 'partial' },
  { label: 'Completed', value: 'completed' },
];

const priorityOptions: { label: string; value: 'ALL' | RequestPriority }[] = [
  { label: 'All Priority', value: 'ALL' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'High', value: 'high' },
  { label: 'Normal', value: 'normal' },
  { label: 'Low', value: 'low' },
];

const typeOptions: { label: string; value: 'ALL' | SparePartType }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'MRO-W', value: 'MRO-W' },
  { label: 'MRO-S', value: 'MRO-S' },
  { label: 'MRO-G', value: 'MRO-G' },
];

// Colors & labels
const priorityColorMap: Record<RequestPriority, string> = {
  urgent: '#f5222d',
  high: '#fa8c16',
  normal: '#52c41a',
  low: '#1890ff',
};

const priorityLabelMap: Record<RequestPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
};

const statusColorMap: Record<RequestStatus, string> = {
  pending: 'default',
  approved: 'warning',
  rejected: 'error',
  'in-progress': 'processing',
  partial: 'gold',
  'ready_to_Pickup': 'success',
  completed: 'success',
};

const statusLabelMap: Record<RequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  'in-progress': 'In Progress',
  partial: 'Partial',
  'ready_to_Pickup': 'Ready to Pickup',
  completed: 'Completed',
};

// --- Mock data generator ---
const mockRequests: MyRequestItem[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  requestId: `REQ-${1000 + i}`,
  priority: ['low', 'normal', 'high', 'urgent'][Math.floor(Math.random() * 4)] as RequestPriority,
  requestDate: dayjs().subtract(Math.floor(Math.random() * 30), 'day').toISOString(),
  totalItems: Math.floor(Math.random() * 10) + 1,
  receivedItems: Math.floor(Math.random() * 5),
  requestStatus: [
    'pending',
    'approved',
    'rejected',
    'in-progress',
    'partial',
    'ready_to_Pickup',
    'completed',
  ][Math.floor(Math.random() * 7)] as RequestStatus,
  remark: ['Urgent order', 'Check availability', 'For maintenance', 'Regular request'][Math.floor(Math.random() * 4)],
  type: ['MRO-W', 'MRO-S', 'MRO-G'][Math.floor(Math.random() * 3)] as SparePartType,
}));

export default function MyRequestListview() {
  const access = useAccess();
  const actionRef = useRef<ActionType>();

  const [searchValue, setSearchValue] = useState<string>('');
  const [filters, setFilters] = useState<{
    status: 'ALL' | RequestStatus;
    priority: 'ALL' | RequestPriority;
    type: 'ALL' | SparePartType;
    dateRange?: [string, string];
  }>({
    status: 'ALL',
    priority: 'ALL',
    type: 'ALL',
  });

  const reloadTable = () => {
    actionRef.current?.setPageInfo?.({ current: 1 });
    actionRef.current?.reload?.();
  };

  const formatDate = (dateStr: string) => {
    const d = dayjs(dateStr);
    return d.format('YYYY-MMM-DD, h:mm A');
  };

  // --- Mock requestData function with search & filters ---
  const requestData = async (
    pagination: { current?: number; pageSize?: number },
    _sort?: Record<string, SortOrder>,
  ) => {
    let filtered = [...mockRequests];

    // Filter by search
    if (searchValue?.trim()) {
      const v = searchValue.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.requestId.toLowerCase().includes(v) ||
          r.remark.toLowerCase().includes(v) ||
          r.type?.toLowerCase().includes(v),
      );
    }

    // Filter by priority
    if (filters.priority !== 'ALL') {
      filtered = filtered.filter((r) => r.priority === filters.priority);
    }

    // Filter by status
    if (filters.status !== 'ALL') {
      filtered = filtered.filter((r) => r.requestStatus === filters.status);
    }

    // Filter by type
    if (filters.type !== 'ALL') {
      filtered = filtered.filter((r) => r.type === filters.type);
    }

    // Filter by date range
    if (filters.dateRange) {
      const [start, end] = filters.dateRange.map((d) => dayjs(d));
      const startAt = start.startOf('day');
      const endAt = end.endOf('day');
      filtered = filtered.filter((r) => {
        const d = dayjs(r.requestDate);
        return d.isSameOrAfter(startAt) && d.isSameOrBefore(endAt);
      });
    }

    // Pagination
    const current = pagination.current || 1;
    const pageSize = pagination.pageSize || 10;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      success: true,
    };
  };

  return (
    <>
      {!access.canSpfRequester && !access.canSpfApprover ? (
        <Card>
          <Typography.Text type="danger">
            You do not have permission to access My Requests.
          </Typography.Text>
        </Card>
      ) : (
        <>
          <Card size="small" style={{ marginBottom: 10 }}>
            <Space wrap size="middle">
              <Input.Search
                allowClear
                style={{ width: 300 }}
                placeholder="Search Request ID or Remark"
                value={searchValue}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setSearchValue(nextValue);
                  reloadTable();
                }}
                onSearch={(v) => {
                  setSearchValue(v || '');
                  reloadTable();
                }}
                enterButton={<SearchOutlined />}
              />

              <Select
                style={{ minWidth: 180 }}
                value={filters.status}
                options={statusFilterOptions}
                onChange={(value) => {
                  setFilters((prev) => ({ ...prev, status: value }));
                  reloadTable();
                }}
              />

              <Select
                style={{ minWidth: 140 }}
                value={filters.priority}
                options={priorityOptions}
                onChange={(value) => {
                  setFilters((prev) => ({ ...prev, priority: value }));
                  reloadTable();
                }}
              />

              <Select
                style={{ minWidth: 120 }}
                value={filters.type}
                options={typeOptions}
                onChange={(value) => {
                  setFilters((prev) => ({ ...prev, type: value }));
                  reloadTable();
                }}
              />

              <RangePicker
                placeholder={['Filter Date', 'End date']}
                value={
                  filters.dateRange
                    ? [dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])]
                    : null
                }
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: [dates[0]!.toISOString(), dates[1]!.toISOString()],
                    }));
                  } else {
                    setFilters((prev) => ({ ...prev, dateRange: undefined }));
                  }
                  reloadTable();
                }}
              />
            </Space>
          </Card>

          <Card size="small">
            <ProTable<MyRequestItem>
              actionRef={actionRef}
              size="small"
              rowKey="id"
              search={false}
              options={false}
              bordered
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50],
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }}
              columns={[
                {
                  title: '',
                  dataIndex: 'action',
                  width: 48,
                  align: 'center',
                  render: (_, r) => (
                    <Tooltip title="View details">
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined style={{ color: '#999' }} />}
                        onClick={() => {
                          // TODO: wire detail view
                        }}
                      />
                    </Tooltip>
                  ),
                },
                {
                  title: 'Request ID',
                  dataIndex: 'requestId',
                  width: 130,
                },
                {
                  title: 'Priority',
                  dataIndex: 'priority',
                  width: 100,
                  render: (_, r) => (
                    <span style={{ color: priorityColorMap[r.priority], fontWeight: 500 }}>
                      {priorityLabelMap[r.priority]}
                    </span>
                  ),
                },
                {
                  title: 'Request date',
                  dataIndex: 'requestDate',
                  width: 200,
                  render: (_, r) => formatDate(r.requestDate),
                },
                {
                  title: 'Total Items',
                  dataIndex: 'totalItems',
                  width: 110,
                  align: 'center',
                  sorter: true,
                },
                {
                  title: 'Received Items',
                  dataIndex: 'receivedItems',
                  width: 130,
                  align: 'center',
                  sorter: true,
                },
                {
                  title: 'Request Status',
                  dataIndex: 'requestStatus',
                  width: 140,
                  align: 'center',
                  render: (_, r) => (
                    <Tag
                      color={statusColorMap[r.requestStatus]}
                      style={{ minWidth: 80, textAlign: 'center' }}
                    >
                      {statusLabelMap[r.requestStatus]}
                    </Tag>
                  ),
                },
                {
                  title: 'Remark',
                  dataIndex: 'remark',
                  ellipsis: true,
                },
              ]}
              request={async (params, sort) => requestData(params, sort)}
            />
          </Card>
        </>
      )}
    </>
  );
}
