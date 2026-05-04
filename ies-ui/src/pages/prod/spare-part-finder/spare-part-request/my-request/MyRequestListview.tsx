import { EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
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
import type { MyRequestItem, RequestPriority, RequestStatus } from '../data';
import RequestedBatchDrawer from '../RequestedBatchDrawer';
import type { RequestDetailData } from '../RequestedBatchDrawer';
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

interface MyRequestListviewProps {
  onResubmitRequest?: (detail: RequestDetailData) => void;
}

const clampNonNegativeInt = (value: unknown): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
};

const deriveDisplayStatus = (
  row: Pick<MyRequestItem, 'requestStatus' | 'totalItems' | 'totalApprovedQty' | 'receivedItems'>,
): RequestStatus => {
  const approved = clampNonNegativeInt(row.totalApprovedQty);
  const received = clampNonNegativeInt(row.receivedItems);

  if (row.requestStatus === 'ready_to_Pickup') return 'ready_to_Pickup';
  if (approved > 0 && received >= approved) return 'completed';
  if (approved > 0 && received > 0 && received < approved) return 'partial';
  return row.requestStatus;
};

const deriveDisplayReceived = (
  row: Pick<MyRequestItem, 'requestStatus' | 'totalItems' | 'totalApprovedQty' | 'receivedItems'>,
): number => {
  const status = deriveDisplayStatus(row);
  const approved = clampNonNegativeInt(row.totalApprovedQty);
  const received = clampNonNegativeInt(row.receivedItems);

  if (status === 'partial' || status === 'ready_to_Pickup' || status === 'completed')
    return approved > 0 ? Math.min(received, approved) : received;
  return 0;
};

export default function MyRequestListview({ onResubmitRequest }: MyRequestListviewProps) {
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const requestActions = simpleRequestActions();
  const services = SparePartRequestService(requestActions);

  const [searchInputValue, setSearchInputValue] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MyRequestItem | null>(null);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState<RequestDetailData | null>(null);
  const [filters, setFilters] = useState<{
    status: 'ALL' | RequestStatus;
    priority: 'ALL' | RequestPriority;
    dateRange?: [string, string];
  }>({
    status: 'ALL',
    priority: 'ALL',
  });

  const reloadTable = () => {
    actionRef.current?.setPageInfo?.({ current: 1 });
    actionRef.current?.reload?.();
  };

  const refreshTable = () => {
    actionRef.current?.reload?.();
  };

  const openDetail = async (record: MyRequestItem) => {
    setSelectedRequest(record);
    setSelectedRequestDetail(buildRequestDetailData(record));
    setDetailOpen(true);
    try {
      const detail = await services.getRequestDetail(record.id);
      setSelectedRequestDetail(detail);
    } catch {
      setSelectedRequestDetail(buildRequestDetailData(record));
    }
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
          dateRange: filters.dateRange,
        },
      },
      pagination: {
        current: pagination.current ?? 0,
        pageSize: pagination.pageSize ?? 20,
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <Space wrap size="middle">
                <Input.Search
                  allowClear
                  style={{ width: 300 }}
                  placeholder="Search Request ID or Remark"
                  value={searchInputValue}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setSearchInputValue(nextValue);
                    if (!nextValue) {
                      setSearchValue('');
                      reloadTable();
                    }
                  }}
                  onSearch={(v) => {
                    setSearchInputValue(v || '');
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

                <DatePicker
                  allowClear
                  style={{ width: 180 }}
                  value={filters.dateRange ? dayjs(filters.dateRange[0]) : null}
                  onChange={(value) => {
                    if (value) {
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: [value.startOf('day').toISOString(), value.endOf('day').toISOString()],
                      }));
                    } else {
                      setFilters((prev) => ({ ...prev, dateRange: undefined }));
                    }
                    reloadTable();
                  }}
                />

                {/*
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
                */}
              </Space>

              {/* <Button icon={<ReloadOutlined />} onClick={refreshTable}>
                Refresh
              </Button> */}
            </div>
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

              toolBarRender={() => [
                <Space key="spr-action-bar" size="small">
                  <Button icon={<ReloadOutlined />} onClick={refreshTable}>
                    Refresh
                  </Button>
                </Space>,
              ]}
              
              columns={
                [
                
                {
                  title: 'Request ID',
                  dataIndex: 'requestId',
                  width: 130,
                  render: (dom, r) => (
                    <a
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        openDetail(r);
                      }}
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
                  title: 'Requested QTY',
                  dataIndex: 'totalItems',
                  width: 130,
                  align: 'center',
                  sorter: true,
                },
                {
                  title: 'Approved QTY',
                  dataIndex: 'totalApprovedQty',
                  width: 130,
                  align: 'center',
                  sorter: true,
                  render: (_: unknown, r) => clampNonNegativeInt(r.totalApprovedQty),
                },
                {
                  title: 'Received QTY',
                  dataIndex: 'receivedItems',
                  width: 130,
                  align: 'center',
                  sorter: true,
                  render: (_: unknown, r) => deriveDisplayReceived(r),
                },
                {
                  title: 'Status',
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

                // ...(access.canSpfApprover ? [
                //   {
                //   title: 'Action',
                //   key: 'action',
                //   width: 120,
                //   render: (_: unknown, record: MyRequestItem) => (
                //     <Button
                //       size="small"
                //       style={{
                //         background: '#b59a30',
                //         borderColor: '#b59a30',
                //         color: '#fff',
                //         minWidth: 84,
                //       }}
                //       onClick={() => openDetail(record)}
                //     >
                //       View Detail
                //     </Button>
                //   ),
                  
                // },
                // ]: []),

                ...(access.canSpfRequester || access.canSpfApprover ? [
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
                        onClick={() => openDetail(r)}
                      />
                    </Tooltip>
                  ),
                }
                ]: []),
                
              ] as import('@ant-design/pro-components').ProColumns<MyRequestItem>[]
              }
              onRow={(record) => ({
                onClick: (event) => {
                  const target = event.target;
                  if (
                    target instanceof HTMLElement &&
                    target.closest('a, button, input, textarea, .ant-select, .ant-picker')
                  ) {
                    return;
                  }
                  openDetail(record);
                },
                style: { cursor: 'pointer' },
              })}
              request={async (params, sort) => requestData(params, sort)}
            />
          </Card>
        </>
      )}

      <RequestedBatchDrawer
        open={detailOpen}
        request={selectedRequest}
        data={selectedRequestDetail || (selectedRequest ? buildRequestDetailData(selectedRequest) : undefined)}
        onApprove={async (payload) => {
          await services.approveRequest(payload);
          setSelectedRequest((prev) =>
            prev && prev.id === payload.id
              ? { ...prev, requestStatus: 'approved' }
              : prev,
          );
          if (selectedRequest?.id === payload.id) {
            setSelectedRequestDetail(await services.getRequestDetail(payload.id));
          }
          reloadTable();
        }}
        onReject={async ({ id, remark }) => {
          await services.rejectRequest({ id, remark });
          setSelectedRequest((prev) =>
            prev && prev.id === id
              ? { ...prev, requestStatus: 'rejected' }
              : prev,
          );
          if (selectedRequest?.id === id) {
            setSelectedRequestDetail(await services.getRequestDetail(id));
          }
          reloadTable();
        }}
        onConfirmPickup={async (id) => {
          await services.confirmPickup(id);
          if (selectedRequest?.id === id) {
            setSelectedRequestDetail(await services.getRequestDetail(id));
          }
          reloadTable();
        }}
        onResubmitRequest={(detail) => {
          onResubmitRequest?.(detail);
          setDetailOpen(false);
          setSelectedRequest(null);
          setSelectedRequestDetail(null);
        }}
        onClose={() => {
          setDetailOpen(false);
          setSelectedRequest(null);
          setSelectedRequestDetail(null);
        }}
      />
    </>
  );
}
