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
import { simpleRequestActions } from '@/services/model';
import { formatSpfDateTime } from '../../shared/dateTime';
import type { MyRequestItem, RequestPriority, RequestStatus, SparePartType } from '../data';
import RequestedBatchDrawer from '../RequestedBatchDrawer';
import { buildRequestDetailData, SparePartRequestService } from '../service';

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
  urgent: 'error',
  high: 'warning',
  normal: 'success',
  low: 'default',
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

export default function MyRequestListview() {
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const requestActions = simpleRequestActions();
  const services = SparePartRequestService(requestActions);

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

  const requestData = async (
    pagination: { current?: number; pageSize?: number },
    _sort?: Record<string, SortOrder>,
  ) => {
    const response = await services.pageMyRequests({
      criteria: {
        searchValue,
        advanceSearch: {
          priority: filters.priority,
          status: filters.status,
          type: filters.type,
          dateRange: filters.dateRange,
        },
      },
      pagination: {
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
    });

    return {
      data: response.items || [],
      total: response.total || 0,
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
                    <Tag color={priorityColorMap[r.priority]} style={{ fontWeight: 500 , width: '100%'}}>
                      {priorityLabelMap[r.priority]}
                    </Tag>
                  ),
                },
                {
                  title: 'Request date',
                  dataIndex: 'requestDate',
                  width: 200,
                  render: (_, r) => formatSpfDateTime(r.requestDate),
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
                      style={{ width: '100%', textAlign: 'center' }}
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
        data={selectedRequest ? buildRequestDetailData(selectedRequest) : undefined}
        onApprove={async (payload) => {
          await services.approveRequest(payload);
          setSelectedRequest((prev) =>
            prev && prev.id === payload.id
              ? { ...prev, requestStatus: 'approved' }
              : prev,
          );
          reloadTable();
        }}
        onReject={async ({ id }) => {
          await services.rejectRequest({ id });
          setSelectedRequest((prev) =>
            prev && prev.id === id
              ? { ...prev, requestStatus: 'rejected' }
              : prev,
          );
          reloadTable();
        }}
        onConfirmPickup={async (id) => {
          await services.confirmPickup(id);
          reloadTable();
        }}
        onClose={() => {
          setDetailOpen(false);
          setSelectedRequest(null);
        }}
      />
    </>
  );
}
