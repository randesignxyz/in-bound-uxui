import { EyeOutlined, FileExcelOutlined, ReloadOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Card, DatePicker, Input, Select, Tag, Typography, message } from 'antd';
import { Space } from 'antd/lib';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { downloadGenericReport, RequestActions } from '@/services/apiGateway';
import { SparePartRequestAPI } from '../spare-part-request/service.api';
import { SparePartWarehouseReturnAPI } from './service.return';
import type { RequestDetailData, ReturnStatus } from '../spare-part-return/data';
import ReturnsListDrawer from './ReturnsListDrawer';
import { formatSpfDateTime } from '../shared/dateTime';
import RequestsWarehouseExportExcel, {
  type RequestsWarehouseExportValues,
} from './RequestsWarehouseExportExcel';

const { RangePicker } = DatePicker;

// ─── API response row type ─────────────────────────────────────────────────────

export type WarehouseReturnRow = {
  returnId: number;
  returnNo: string;
  returnStatus: string;          // "APPROVED" | "REJECTED" | "PENDING" | "COMPLETED" | "PARTIAL_RETURN"
  returnByUser: string;
  returnDate: string;
  remark?: string;
  approvedByUser?: string | null;
  approvedDate?: string | null;
  rejectedByUser?: string | null;
  rejectedDate?: string | null;
  totalItems: number;
};

// ─── Status display helpers ───────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  PENDING:    'default',
  APPROVED:   'default',
  REJECTED:   'error',
  RECEIVING:  'processing',
  COMPLETED:  'success',
  COMPLETE:   'success',
  PARTIAL_RETURN: 'processing',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING:   'Pending',
  APPROVED:  'Pending',
  REJECTED:  'Rejected',
  RECEIVING: 'Receiving',
  COMPLETED: 'Completed',
  COMPLETE:  'Completed',
  PARTIAL_RETURN: 'Partially Returned',
};

const mapReturnStatusToUiStatus = (status?: string): ReturnStatus => {
  const normalized = String(status ?? '').trim().toUpperCase();

  if (normalized === 'APPROVED') return 'Approved';
  if (normalized === 'REJECTED') return 'Rejected';
  if (normalized === 'RECEIVING') return 'Receiving';
  if (normalized === 'COMPLETE' || normalized === 'COMPLETED') return 'Completed';
  if (normalized === 'PARTIAL_RETURN') return 'Partially Returned';
  return 'Pending';
};

const normalizeWarehouseReturnStatus = (status?: string) => {
  const normalized = String(status ?? '').trim().toUpperCase();
  if (normalized === 'COMPLETE') return 'COMPLETED';
  return normalized;
};

const formatDate = (iso?: string | null) =>
  formatSpfDateTime(iso);

// ─── Component ────────────────────────────────────────────────────────────────

interface ReturnsListWarehouseProps {
  onUpdate?: () => void;
}

export default function ReturnsListWarehouse({ onUpdate }: ReturnsListWarehouseProps = {}) {
  const actionRef = useRef<ActionType>();
  const [selectedReturn, setSelectedReturn] = useState<WarehouseReturnRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [knownBusinessUnits, setKnownBusinessUnits] = useState<string[]>([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const exportInFlightRef = useRef(false);

  const requestAction: RequestActions = useMemo(
    () => ({
      start: (name) => console.log(`Loading: ${name}`),
      end: (status) => console.log(status),
    }),
    [],
  );

  const openDrawer = (record: WarehouseReturnRow) => {
    setSelectedReturn(record);
    setDetailOpen(true);
  };

  const loadBusinessUnits = useCallback(async () => {
    try {
      const sparePartServices = SparePartRequestAPI(requestAction);
      const response = await sparePartServices.page({
        criteria: {
          searchValue: '',
          category: '',
          status: 'All',
          warehouse: '',
        },
        pagination: {
          current: 1,
          pageSize: 20,
        },
      });

      const businessUnits = Array.from(
        new Set(
          (response.items || [])
            .map((item) => item.businessUnit)
            .filter((item): item is string => Boolean(item && item !== '-')),
        ),
      ).sort();

      setKnownBusinessUnits(businessUnits);
    } catch (error) {
      message.error('Failed to load business units.');
    }
  }, [requestAction]);

  useEffect(() => {
    loadBusinessUnits();
  }, [loadBusinessUnits]);

  const exportRequests = useCallback(
    async ({ dateRange, businessUnits }: RequestsWarehouseExportValues) => {
      if (exportInFlightRef.current) return;

      if (!dateRange?.[0] || !dateRange?.[1]) {
        message.error('Please select a date range.');
        return;
      }

      exportInFlightRef.current = true;
      setExportLoading(true);
      try {
        await downloadGenericReport(requestAction)({
          fileName: `spare-part-returns-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}`,
          type: 'EXCEL',
          data: {
            reportName: 'spare_parts_returns',
            reportPath: '',
            data: [
              {
                key: 'StartDate',
                value: dateRange[0].startOf('day').toISOString(),
                type: 'dateTime',
                
              },
              {
                key: 'EndDate',
                value: dateRange[1].endOf('day').toISOString(),
                type: 'dateTime',
              },
              {
                key: 'BusinessUnit',
                value: businessUnits.length > 0 ? businessUnits.join(',') : 'All',
                type: 'string',
              },
            ],
          },
        });
        setExportModalOpen(false);
      } catch (error) {
        message.error('Failed to export Excel.');
      } finally {
        exportInFlightRef.current = false;
        setExportLoading(false);
      }
    },
    [requestAction],
  );

  const fetchData = async (params: { current?: number; pageSize?: number }) => {
    const page = params.current ?? 0;
    const size = params.pageSize ?? 20;
    setCurrentPage(page);
    setPageSize(size);

    const res = await SparePartWarehouseReturnAPI(requestAction)
      .paga_fetch_spare_parts_return_by_status_approved(
        page, 
        size, 
        dateRangeFilter ? dateRangeFilter[0].toISOString() : undefined, 
        dateRangeFilter ? dateRangeFilter[1].toISOString() : undefined
      );

    const items: WarehouseReturnRow[] = (res as any)?.items ?? [];
    const total: number = (res as any)?.total ?? items.length;

    // client-side status filter
    const filtered = statusFilter === 'all'
      ? items
      : items.filter((r) => normalizeWarehouseReturnStatus(r.returnStatus) === statusFilter);

    return { data: filtered, success: true, total };
  };

  const columns: ProColumns<WarehouseReturnRow>[] = [
    {
      title: 'No',
      width: 52,
      render: (_, __, index) => (
        <span style={{ fontWeight: 'bold' }}>{(currentPage - 1) * pageSize + index + 1}</span>
      ),
    },
    {
      title: 'Return No',
      dataIndex: 'returnNo',
      key: 'returnNo',
      render: (value, record) => (
        <Typography.Link onClick={() => { setSelectedReturn(record); setDetailOpen(true); }}>
          {value}
        </Typography.Link>
      ),
    },
    {
      title: 'Return Date',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (_dom, record) => formatSpfDateTime(record.returnDate),
    },
    {
      title: 'Requested By',
      dataIndex: 'returnByUser',
      key: 'returnByUser',
    },
    {
      title: 'Approved By',
      dataIndex: 'approvedByUser',
      key: 'approvedByUser',
      render: (_dom, record) => record.approvedByUser ?? '—',
    },
    {
      title: 'Total Items',
      dataIndex: 'totalItems',
      key: 'totalItems',
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'returnStatus',
      key: 'returnStatus',
      render: (_dom, record) => {
        const statusKey = normalizeWarehouseReturnStatus(record.returnStatus);
        return (
          <Tag bordered={false} color={STATUS_COLOR[statusKey] ?? 'success'}>
            {STATUS_LABEL[statusKey] ?? record.returnStatus}
          </Tag>
        );
      },
    },
    // {
    //   title: 'Action',
    //   key: 'action',
    //   align: 'center',
      
    //   width: 110,
    //   render: (_dom, record) => (
    //     <Button
    //       size="small"
    //       icon={<EyeOutlined />}
    //       onClick={() => { setSelectedReturn(record); setDetailOpen(true); }}
    //     >
         
    //     </Button>
    //   ),
    // },
  ];

  return (
    <>
      {/* ── Filters ── */}
      <div
        style={{
          marginBottom: 10,
          background: '#fff',
          borderRadius: 10,
          border: '1px solid #f0f0f0',
          padding: 12,
        }}
      >
        <Space wrap size="middle">
          <Input.Search
            placeholder="Search by return no…"
            allowClear
            enterButton
            style={{ width: 280 }}
            onSearch={() => actionRef.current?.reloadAndRest?.()}
          />
          <Select
            placeholder="All Status"
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); actionRef.current?.reloadAndRest?.(); }}
            style={{ width: 180 }}
            options={[
              { value: 'all',       label: 'All Status' },
              { value: 'APPROVED',  label: 'Approved' },
              { value: 'PARTIAL_RETURN', label: 'Partially Returned' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
          />
          <RangePicker 
            style={{ width: 280 }} 
            value={dateRangeFilter}
            onChange={(dates) => {
              setDateRangeFilter(dates?.[0] && dates?.[1] ? [dates[0], dates[1]] : null);
              actionRef.current?.reloadAndRest?.();
            }}
          />
          <Button icon={<FileExcelOutlined />} onClick={() => setExportModalOpen(true)}>
            Export Excel
          </Button>
        </Space>
      </div>

      {/* ── Table ── */}
      <Card>
        <ProTable<WarehouseReturnRow>
          actionRef={actionRef}
          columns={columns}
          rowKey="returnId"
          request={fetchData}
          tableLayout="auto"
          size="small"
          bordered
            toolBarRender={() => [
            <Space key="toolbar" size="small">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => actionRef.current?.reloadAndRest?.()}
              >
                Refresh
              </Button>
            </Space>,
          ]}
          search={false}
          options={false}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
              onRow={(record) => ({
                      onClick: (event) => {
                        const target = event.target;
                        if (
                          target instanceof HTMLElement &&
                          target.closest('a, button, input, textarea, .ant-select, .ant-picker')
                        ) {
                          return;
                        }
                        openDrawer(record as WarehouseReturnRow);
                      },
                      style: { cursor: 'pointer' },
          })}
        />
      </Card>

      {/* ── Detail Drawer ── */}
      <ReturnsListDrawer
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedReturn(null); }}
        onSuccess={() => {
          actionRef.current?.reload?.();
          onUpdate?.();
        }}
        data={selectedReturn ? {
          no: selectedReturn.returnId,
          request_id: selectedReturn.returnNo,
          total_items: selectedReturn.totalItems,
          request_date: selectedReturn.returnDate,
          status: mapReturnStatusToUiStatus(selectedReturn.returnStatus),
          remarks: selectedReturn.remark,
          items: [],
          activities: [],
        } : null}
        returnId={selectedReturn?.returnId}
      />
      <RequestsWarehouseExportExcel
        open={exportModalOpen}
        loading={exportLoading}
        businessUnitOptions={knownBusinessUnits}
        reportName="return_by_date_range(default_today_7dayts)_promt_by_BU"
        onCancel={() => setExportModalOpen(false)}
        onSave={exportRequests}
      />
    </>
  );
}
