import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Card, DatePicker, Input, Select, Tag, Typography } from 'antd';
import { Space } from 'antd/lib';
import { useRef, useState } from 'react';
import { RequestActions } from '@/services/apiGateway';
import { SparePartWarehouseReturnAPI } from './service.return';
import ReturnsListDrawer, { type ReturnStatus } from './ReturnsListDrawer';
import { formatSpfDateTime } from '../shared/dateTime';

const { RangePicker } = DatePicker;

// ─── API response row type ─────────────────────────────────────────────────────

export type WarehouseReturnRow = {
  returnId: number;
  returnNo: string;
  returnStatus: string;          // "APPROVED" | "REJECTED" | "PENDING" | "COMPLETED"
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
  PENDING:    'processing',
  APPROVED:   'warning',
  REJECTED:   'error',
  RECEIVING:  'processing',
  COMPLETED:  'success',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING:   'Pending',
  APPROVED:  'Approved',
  REJECTED:  'Rejected',
  RECEIVING: 'Receiving',
  COMPLETED: 'Completed',
};

const formatDate = (iso?: string | null) =>
  formatSpfDateTime(iso);

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReturnsListWarehouse() {
  const actionRef = useRef<ActionType>();
  const [selectedReturn, setSelectedReturn] = useState<WarehouseReturnRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const requestAction: RequestActions = {
    start: (name) => console.log(`Loading: ${name}`),
    end: (status) => console.log(status),
  };

  const fetchData = async (params: { current?: number; pageSize?: number }) => {
    const page = params.current ?? 1;
    const size = params.pageSize ?? 20;
    setCurrentPage(page);
    setPageSize(size);

    const res = await SparePartWarehouseReturnAPI(requestAction)
      .paga_fetch_spare_parts_return_by_status_approved(page, size);

    const items: WarehouseReturnRow[] = (res as any)?.items ?? [];
    const total: number = (res as any)?.total ?? items.length;

    // client-side status filter
    const filtered = statusFilter === 'all'
      ? items
      : items.filter((r) => r.returnStatus === statusFilter);

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
        const statusKey = record.returnStatus?.toUpperCase() || '';
        return (
          <Tag bordered={false} color={STATUS_COLOR[statusKey] ?? 'success'}>
            {STATUS_LABEL[statusKey] ?? record.returnStatus}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 110,
      render: (_dom, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => { setSelectedReturn(record); setDetailOpen(true); }}
        >
          View Detail
        </Button>
      ),
    },
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
              { value: 'PENDING',   label: 'Pending' },
              { value: 'APPROVED',  label: 'Approved' },
              { value: 'REJECTED',  label: 'Rejected' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
          />
          <RangePicker style={{ width: 280 }} />
        </Space>
      </div>

      {/* ── Table ── */}
      <Card>
        <ProTable<WarehouseReturnRow>
          actionRef={actionRef}
          columns={columns}
          rowKey="returnId"
          request={fetchData}
          tableLayout="fixed"
          size="small"
          bordered
          search={false}
          options={false}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>

      {/* ── Detail Drawer ── */}
      <ReturnsListDrawer
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedReturn(null); }}
        onSuccess={() => actionRef.current?.reload()}
        data={selectedReturn as any}
        returnId={selectedReturn?.returnId}
      />
    </>
  );
}
