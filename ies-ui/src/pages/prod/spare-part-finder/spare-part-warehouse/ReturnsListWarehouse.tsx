import { EyeOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Card, DatePicker, Input, Select, Tag, Typography } from 'antd';
import { Space } from 'antd/lib';
import { useState } from 'react';
import ReturnsListDrawer, { type ReturnStatus } from './ReturnsListDrawer';

const { RangePicker } = DatePicker;

// ─── Row type ─────────────────────────────────────────────────────────────────

type MockRow = {
  id: string;
  requestId: string;
  requestDate: string;
  type: string;
  status: ReturnStatus;
  totalItems: number;
  approvedBy?: string;
  priority: number;
  items: {
    id: number;
    productId: string;
    name: string;
    usedQty: number;
    qtyToReturn: number;
  }[];
};

// ─── Status display helpers ───────────────────────────────────────────────────

const statusColorMap: Record<ReturnStatus, { color: string; background: string }> = {
  pending: { color: '#1677ff', background: '#e6f4ff' },
  approved: { color: '#52c41a', background: '#f6ffed' },
  rejected: { color: '#ff4d4f', background: '#fff2f0' },
  in_progress: { color: '#1677ff', background: '#e6f4ff' },
  completed: { color: '#52c41a', background: '#f6ffed' },
  partially_returned: { color: '#d48806', background: '#fffbe6' },
};

const statusLabelMap: Record<ReturnStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  in_progress: 'In Progress',
  completed: 'Completed',
  partially_returned: 'Partially Returned',
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockData = [
  {
    id: '1',
    requestId: 'RTN-2025-001',
    requestDate: '2025-03-01T08:00:00',
    type: 'Spare Part Return',
    status: 'pending' as ReturnStatus,
    totalItems: 3,
    approvedBy: undefined,
    priority: 3,
    items: [
      { id: 1, productId: 'SP-001', name: 'Hydraulic Pump Seal', usedQty: 5, qtyToReturn: 2 },
      { id: 2, productId: 'SP-002', name: 'Oil Filter Cartridge', usedQty: 10, qtyToReturn: 4 },
      { id: 3, productId: 'SP-003', name: 'Bearing Housing Cap', usedQty: 2, qtyToReturn: 2 },
    ],
  },
  {
    id: '2',
    requestId: 'RTN-2025-002',
    requestDate: '2025-03-03T09:30:00',
    type: 'Spare Part Return',
    status: 'approved' as ReturnStatus,
    totalItems: 2,
    approvedBy: 'John Doe',
    priority: 2,
    items: [
      { id: 1, productId: 'SP-004', name: 'Drive Belt (6PK1550)', usedQty: 1, qtyToReturn: 1 },
      { id: 2, productId: 'SP-005', name: 'Coolant Hose Assembly', usedQty: 3, qtyToReturn: 2 },
    ],
  },
  {
    id: '3',
    requestId: 'RTN-2025-003',
    requestDate: '2025-03-05T11:00:00',
    type: 'Spare Part Return',
    status: 'rejected' as ReturnStatus,
    totalItems: 1,
    approvedBy: 'Jane Smith',
    priority: 1,
    items: [
      { id: 1, productId: 'SP-006', name: 'Timing Chain Kit', usedQty: 1, qtyToReturn: 1 },
    ],
  },
  {
    id: '4',
    requestId: 'RTN-2025-004',
    requestDate: '2025-03-08T14:00:00',
    type: 'Spare Part Return',
    status: 'in_progress' as ReturnStatus,
    totalItems: 4,
    approvedBy: 'John Doe',
    priority: 4,
    items: [
      { id: 1, productId: 'SP-007', name: 'Alternator Brush Set', usedQty: 6, qtyToReturn: 3 },
      { id: 2, productId: 'SP-008', name: 'Fuel Injector Nozzle', usedQty: 4, qtyToReturn: 2 },
      { id: 3, productId: 'SP-009', name: 'Air Filter Element', usedQty: 8, qtyToReturn: 4 },
      { id: 4, productId: 'SP-010', name: 'Crankshaft Position Sensor', usedQty: 1, qtyToReturn: 1 },
    ],
  },
  {
    id: '5',
    requestId: 'RTN-2025-005',
    requestDate: '2025-03-10T09:00:00',
    type: 'Spare Part Return',
    status: 'completed' as ReturnStatus,
    totalItems: 2,
    approvedBy: 'Jane Smith',
    priority: 2,
    items: [
      { id: 1, productId: 'SP-011', name: 'Water Pump Impeller', usedQty: 2, qtyToReturn: 2 },
      { id: 2, productId: 'SP-012', name: 'Thermostat Valve', usedQty: 3, qtyToReturn: 3 },
    ],
  },
  {
    id: '6',
    requestId: 'RTN-2025-006',
    requestDate: '2025-03-12T10:30:00',
    type: 'Spare Part Return',
    // ← KEY: partially_returned sits at step 3 (same as completed) but shown as "warning"
    status: 'partially_returned' as ReturnStatus,
    totalItems: 5,
    approvedBy: 'John Doe',
    priority: 5,
    items: [
      { id: 1, productId: 'SP-013', name: 'Exhaust Manifold Gasket', usedQty: 3, qtyToReturn: 2 },
      { id: 2, productId: 'SP-014', name: 'Spark Plug (NGK BKR6E)', usedQty: 8, qtyToReturn: 3 },
      { id: 3, productId: 'SP-015', name: 'Camshaft Oil Seal', usedQty: 2, qtyToReturn: 1 },
      { id: 4, productId: 'SP-016', name: 'Rocker Cover Gasket', usedQty: 4, qtyToReturn: 2 },
      { id: 5, productId: 'SP-017', name: 'Throttle Body Seal', usedQty: 1, qtyToReturn: 1 },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReturnsListWarehouse() {
  const [selectedReturn, setSelectedReturn] = useState<MockRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredData: MockRow[] =
    statusFilter === 'all'
      ? mockData
      : mockData.filter((r) => r.status === statusFilter);

  const columns: ProColumns<MockRow>[] = [
    {
      title: 'Request ID',
      dataIndex: 'requestId',
      key: 'requestId',
      render: (value, record) => (
        <Typography.Link
         onClick={() => {
            setSelectedReturn(record);
            setDetailOpen(true);
          }}
        >
          {value}
        </Typography.Link>
      )
    },
    {
      title: 'Request Date',
      dataIndex: 'requestDate',
      key: 'requestDate',
      // ProTable render: (dom, entity, index) — use entity to avoid ReactNode→string mismatch
      render: (_dom, record) => new Date(record.requestDate).toLocaleDateString(),
    },
    {
      title: 'Amount Items',
      dataIndex: 'priority',
      key: 'priority',
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_dom, record) => {
        const status = record.status;
        const pill = statusColorMap[status] ?? { color: '#595959', background: '#f5f5f5' };
        return (
          <Tag
            bordered={false}
            style={{
              marginInlineEnd: 0,
              color: pill.color,
              background: pill.background,
            }}
          >
            {statusLabelMap[status] ?? status}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_dom, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          style={{
            background: '#b59a30',
            borderColor: '#b59a30',
            color: '#fff',
            minWidth: 84,
          }}
          onClick={() => {
            setSelectedReturn(record);
            setDetailOpen(true);
          }}
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
            placeholder="Search by ID or type…"
            allowClear
            enterButton
            style={{ width: 280 }}
          />
          <Select
            placeholder="All Status"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'return', label: 'Return' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'partially_returned', label: 'Partially Returned' },
            ]}
          />
          <RangePicker style={{ width: 280 }} />
        </Space>
      </div>

      {/* ── Table ── */}
      <Card>
        <ProTable
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          tableLayout="fixed"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          search={false}
          options={false}
        />
      </Card>

      {/* ── Detail Drawer ── */}
      <ReturnsListDrawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        data={selectedReturn}
        onRefresh={() => {
          // re-fetch from server here
        }}
      />
    </>
  );
}
