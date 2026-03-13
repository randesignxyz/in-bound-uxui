import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Button, Card, DatePicker, Input, Select, Space, Tag, Tooltip, Typography } from 'antd';
import type { SortOrder } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useRef, useState } from 'react';
import type { MyRequestItem, RequestPriority, RequestStatus, SparePartType } from '../data';
import RequestedBatchDrawer from '../RequestedBatchDrawer';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

// Filter options
const statusFilterOptions: { label: string; value: 'ALL' | RequestStatus }[] = [
  { label: 'All Status', value: 'ALL' },
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
  ready_to_Pickup: 'success',
  completed: 'success',
};

const statusLabelMap: Record<RequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  'in-progress': 'In Progress',
  partial: 'Partial',
  ready_to_Pickup: 'Ready to Pickup',
  completed: 'Completed',
};

const clampNonNegativeInt = (value: unknown): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
};

const deriveDisplayStatus = (row: Pick<MyRequestItem, 'requestStatus' | 'totalItems' | 'receivedItems'>): RequestStatus => {
  const total = clampNonNegativeInt(row.totalItems);
  const received = clampNonNegativeInt(row.receivedItems);

  if (total > 0 && received >= total) return 'completed';
  if (row.requestStatus === 'ready_to_Pickup') return 'ready_to_Pickup';
  if (received > 0) return 'partial';
  return row.requestStatus;
};

const deriveDisplayReceived = (row: Pick<MyRequestItem, 'requestStatus' | 'totalItems' | 'receivedItems'>): number => {
  const status = deriveDisplayStatus(row);
  const total = clampNonNegativeInt(row.totalItems);
  const received = clampNonNegativeInt(row.receivedItems);

  if (status === 'partial' || status === 'ready_to_Pickup' || status === 'completed')
    return total > 0 ? Math.min(received, total) : received;
  return 0;
};

// --- Mock data generator ---
const mockRequests: MyRequestItem[] = Array.from({ length: 50 }, (_, i) => {
  const requestStatus = [
    'pending',
    'approved',
    'rejected',
    'in-progress',
    'partial',
    'ready_to_Pickup',
    'completed',
  ][Math.floor(Math.random() * 7)] as RequestStatus;

  const totalItems = Math.floor(Math.random() * 10) + 1;

  const receivedItems =
    requestStatus === 'completed'
      ? totalItems
      : requestStatus === 'partial'
        ? Math.min(totalItems - 1, Math.floor(Math.random() * totalItems) + 1)
        : requestStatus === 'ready_to_Pickup'
          ? Math.min(totalItems - 1, Math.floor(Math.random() * totalItems))
          : 0;

  return {
    id: i + 1,
    requestId: `REQ-${1000 + i}`,
    priority: ['low', 'normal', 'high', 'urgent'][Math.floor(Math.random() * 4)] as RequestPriority,
    requestDate: dayjs()
      .subtract(Math.floor(Math.random() * 30), 'day')
      .toISOString(),
    totalItems,
    receivedItems,
    requestStatus,
    remark: ['Urgent order', 'Check availability', 'For maintenance', 'Regular request'][
      Math.floor(Math.random() * 4)
    ],
    type: ['MRO-W', 'MRO-S', 'MRO-G'][Math.floor(Math.random() * 3)] as SparePartType,
  };
});

export default function MyRequestListview() {
  const access = useAccess();
  const actionRef = useRef<ActionType>();

  const [searchValue, setSearchValue] = useState<string>('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MyRequestItem | null>(null);
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
              columns={
                [
                ...(access.canSpfRequester ? [
                {
                  title: '',
                  dataIndex: 'action',
                  width: 48,
                  align: 'center' as const,
                  render: (_: unknown,r: MyRequestItem) => (
                    <Tooltip title="View details">
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined style={{ color: '#999' }} />}
                        onClick={() => {
                          setSelectedRequest(r);
                          setDetailOpen(true);
                        }}
                      />
                    </Tooltip>
                  ),
                }
                ]: []),
                {
                  title: 'Request ID',
                  dataIndex: 'requestId',
                  width: 130,
                  render: (dom, r) => (
                    <a
                      onClick={() => {}}
                    >
                      {dom}
                    </a>
                  ),
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
                  render: (_: unknown, r) => deriveDisplayReceived(r),
                },
                {
                  title: 'Request Status',
                  dataIndex: 'requestStatus',
                  width: 140,
                  align: 'center',
                  render: (_, r) => (
                    <Tag
                      color={statusColorMap[deriveDisplayStatus(r)]}
                      style={{ minWidth: 80, textAlign: 'center' }}
                    >
                      {statusLabelMap[deriveDisplayStatus(r)]}
                    </Tag>
                  ),
                },
                {
                  title: 'Remark',
                  dataIndex: 'remark',
                  ellipsis: true,
                  width: 'fit-content',
                },

                ...(access.canSpfApprover ? [
                  {
                  title: 'Action',
                  key: 'action',
                  width: 120,
                  render: (_: unknown, record: MyRequestItem) => (
                    <Button
                      size="small"
                      style={{
                        background: '#b59a30',
                        borderColor: '#b59a30',
                        color: '#fff',
                        minWidth: 84,
                      }}
                      onClick={() => {
                        setSelectedRequest(record);
                        setDetailOpen(true);
                      }}
                    >
                      View Detail
                    </Button>
                  ),
                },
                ]: []),
              ] as import('@ant-design/pro-components').ProColumns<MyRequestItem>[]
              }
              request={async (params, sort) => requestData(params, sort)}
            />
          </Card>
        </>
      )}

      <RequestedBatchDrawer
        open={detailOpen}
        request={selectedRequest}
        onClose={() => {
          setDetailOpen(false);
          setSelectedRequest(null);
        }}
      />
    </>
  );
}
