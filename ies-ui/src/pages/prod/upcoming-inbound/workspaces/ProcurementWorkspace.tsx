import React, { useState, useMemo } from 'react';

import {
  Card,
  Typography,
  Button,
  Table,
  Space,
  Row,
  Col,
  Input,
  Select,
  Tag,
  Dropdown,
  DatePicker,
  message,
  Tooltip,
  Segmented,
} from 'antd';
import {
  InboxOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  ExportOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  SyncOutlined,
  RocketOutlined,
  DownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import BreadCrumbCom from '@/pages/prod/shared/BreadCrumbCom';
import { ProdPaths } from '@/pages/prod';

// Modals from procurement feature slice
import { CloseRefundModal, ReissuePOModal, ReleaseWarehouseModal } from '../features/procurement';

const { Text, Title, Paragraph } = Typography;

// Mock Data representing the Procurement Rejected POs
const initialMockData = [
  {
    key: '1',
    poNumber: 'REJ-9921-A',
    supplier: 'Global Logistics Inc.',
    reason: 'DAMAGED PACKAGING',
    reasonColor: 'red',
    rejectionDate: 'Oct 24, 2023 14:20',
    totalValue: 12450.00,
    items: [
      {
        key: '1-1',
        code: 'LG-772-X',
        description: 'Industrial Precision Bearings',
        qty: 450,
        unitPrice: 22.00,
      },
      {
        key: '1-2',
        code: 'LG-881-Z',
        description: 'High-Tensile Steel Cables',
        qty: 120,
        unitPrice: 15.50,
      },
    ],
  },
  {
    key: '2',
    poNumber: 'REJ-8812-C',
    supplier: 'Vertex Components',
    reason: 'INCORRECT SKU',
    reasonColor: 'orange',
    rejectionDate: 'Oct 24, 2023 11:05',
    totalValue: 8900.00,
    items: [
      {
        key: '2-1',
        code: 'MOD-8821-X',
        description: 'Induction Coil L4 (Heavy Duty)',
        qty: 12,
        unitPrice: 500.00,
      },
      {
        key: '2-2',
        code: 'CAS-1120-K',
        description: 'Thermal Casing Seal Gasket',
        qty: 240,
        unitPrice: 12.08,
      },
    ],
  },
  {
    key: '3',
    poNumber: 'REJ-4456-B',
    supplier: 'Titan Sourcing Ltd.',
    reason: 'QUANTITY MISMATCH',
    reasonColor: 'blue',
    rejectionDate: 'Oct 23, 2023 16:45',
    totalValue: 5230.00,
    items: [
      {
        key: '3-1',
        code: 'HYD-990-P',
        description: 'Heavy-Duty Hydraulic Valves',
        qty: 10,
        unitPrice: 523.00,
      },
    ],
  },
  {
    key: '4',
    poNumber: 'REJ-1102-F',
    supplier: 'Blue Horizon Mfg.',
    reason: 'EXPIRED BATCH',
    reasonColor: 'red',
    rejectionDate: 'Oct 23, 2023 09:12',
    totalValue: 25100.00,
    items: [
      {
        key: '4-1',
        code: 'CHE-339-A',
        description: 'Industrial Epoxy Compound Part A',
        qty: 50,
        unitPrice: 502.00,
      },
    ],
  },
];

export function ProcurementWorkspace() {
  const [tableData, setTableData] = useState(initialMockData);
  const [searchQuery, setSearchQuery] = useState('');
  const [businessUnit, setBusinessUnit] = useState('OFL');
  const [periodType, setPeriodType] = useState<'Overall' | 'Daily' | 'Weekly'>('Overall');
  const [dateRange, setDateRange] = useState<any>(null);

  // Modals visibility state
  const [closeRefundOpen, setCloseRefundOpen] = useState(false);
  const [reissuePOOpen, setReissuePOOpen] = useState(false);
  const [releaseWarehouseOpen, setReleaseWarehouseOpen] = useState(false);

  // Modal active row data
  const [selectedPO, setSelectedPO] = useState<any>(null);

  // Breadcrumb routes
  const routes = [
    { path: ProdPaths.prod, label: 'Prod' },
    { path: '', label: 'Procurement Inbound Dashboard' },
  ];

  // Handle Resolution Action
  const handleResolveAction = (po: any, action: 'close' | 'reissue' | 'release') => {
    setSelectedPO(po);
    if (action === 'close') {
      setCloseRefundOpen(true);
    } else if (action === 'reissue') {
      setReissuePOOpen(true);
    } else if (action === 'release') {
      setReleaseWarehouseOpen(true);
    }
  };

  // Filter and Search Mock Logic
  const filteredData = useMemo(() => {
    return tableData.filter((item) => {
      const matchSearch =
        item.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [tableData, searchQuery]);

  // Remove the PO from list on mock resolve confirm
  const handleResolveConfirm = (poNumber: string) => {
    setTableData((prev) => prev.filter((item) => item.poNumber !== poNumber));
  };

  // Menu items creator for actions dropdown
  const getActionMenu = (record: any) => [
    {
      key: 'close',
      label: (
        <div style={{ padding: '4px 8px' }}>
          <div style={{ fontWeight: 'bold', color: '#cf1322', fontSize: 12 }}>Close & Refund</div>
          <div style={{ fontSize: 10, color: '#8c8c8c' }}>Close PO, return items, get refund.</div>
        </div>
      ),
      onClick: () => handleResolveAction(record, 'close'),
    },
    {
      key: 'reissue',
      label: (
        <div style={{ padding: '4px 8px' }}>
          <div style={{ fontWeight: 'bold', color: '#005daa', fontSize: 12 }}>Re-issue PO</div>
          <div style={{ fontSize: 10, color: '#8c8c8c' }}>Close current, create new replacement.</div>
        </div>
      ),
      onClick: () => handleResolveAction(record, 'reissue'),
    },
    {
      key: 'release',
      label: (
        <div style={{ padding: '4px 8px' }}>
          <div style={{ fontWeight: 'bold', color: '#266d00', fontSize: 12 }}>Release to Warehouse</div>
          <div style={{ fontSize: 10, color: '#8c8c8c' }}>Push back for redelivery.</div>
        </div>
      ),
      onClick: () => handleResolveAction(record, 'release'),
    },
  ];

  const columns: ColumnsType<any> = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      render: (text) => (
        <Tooltip title="View Purchase Order Details">
          <a
            onClick={() => message.info(`Navigating to Purchase Order ${text} details...`)}
            style={{ fontWeight: 600, color: '#005daa' }}
          >
            {text}
          </a>
        </Tooltip>
      ),
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (text) => <Text style={{ fontWeight: 500 }}>{text}</Text>,
    },
    {
      title: 'Rejection Reason (QC)',
      dataIndex: 'reason',
      key: 'reason',
      render: (text, record) => {
        let color = 'red';
        if (record.reasonColor === 'orange') color = 'orange';
        if (record.reasonColor === 'blue') color = 'blue';
        return <Tag color={color} style={{ fontWeight: 'bold' }}>{text}</Tag>;
      },
    },
    {
      title: 'Rejection Date',
      dataIndex: 'rejectionDate',
      key: 'rejectionDate',
      render: (text) => <Text type="secondary" style={{ fontSize: 12 }}>{text}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']} placement="bottomRight">
          <Button type="primary" style={{ background: '#795900', borderColor: '#795900' }}>
            Resolve <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Breadcrumb & Actions Bar */}
      <Card bodyStyle={{ padding: '12px 24px' }} bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <BreadCrumbCom separator=">" routes={routes} />
          </Col>
          <Col>
            <Space size={12}>
              <Segmented
                value={periodType}
                onChange={(val: any) => {
                  setPeriodType(val);
                  message.info(`Switched period view to: ${val}`);
                }}
                options={['Overall', 'Daily', 'Weekly']}
              />
              <DatePicker.RangePicker
                placeholder={['Start Date', 'End Date']}
                value={dateRange}
                onChange={(dates: any) => {
                  setDateRange(dates);
                  if (dates) {
                    message.info(`Filtered period from ${dates[0]?.format('YYYY-MM-DD')} to ${dates[1]?.format('YYYY-MM-DD')}`);
                  }
                }}
              />
              <Button
                icon={<ExportOutlined />}
                onClick={() => message.success('Exporting Procurement Rejections Report to CSV...')}
              >
                Export Report
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Dashboard Subheader & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 4px' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
            Procurement Inbound Dashboard
          </Title>
          <Paragraph type="secondary" style={{ margin: 0, marginTop: 4 }}>
            Handle items failed by QC and vendor fulfillment issues.
          </Paragraph>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', border: '1px solid #d9d9d9', padding: '4px 12px', borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: '#595959', marginRight: 8 }}>Business Unit</span>
          <Select
            bordered={false}
            value={businessUnit}
            onChange={(val) => {
              setBusinessUnit(val);
              message.info(`Switched Business Unit to: ${val}`);
            }}
            dropdownMatchSelectWidth={false}
            style={{ fontWeight: 'bold', fontSize: 12 }}
          >
            <Select.Option value="OFL">OFL</Select.Option>
            <Select.Option value="NYD">NYD</Select.Option>
            <Select.Option value="SFC">SFC</Select.Option>
          </Select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text type="secondary" strong style={{ fontSize: 12 }}>
                Total Rejected POs
              </Text>
              <InboxOutlined style={{ fontSize: 20, color: '#005daa' }} />
            </div>
            <Title level={2} style={{ margin: 0, color: '#005daa', fontWeight: 500 }}>
              {tableData.length + 38}
            </Title>
            <Text type="success" style={{ fontSize: 11, fontWeight: 500 }}>
              ↑ 12% vs last month
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text type="secondary" strong style={{ fontSize: 12 }}>
                Pending Resolution
              </Text>
              <WarningOutlined style={{ fontSize: 20, color: '#795900' }} />
            </div>
            <Title level={2} style={{ margin: 0, color: '#795900', fontWeight: 500 }}>
              {tableData.length}
            </Title>
            <Text type="danger" style={{ fontSize: 11, fontWeight: 500 }}>
              Critical focus needed
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text type="secondary" strong style={{ fontSize: 12 }}>
                Resolved Today
              </Text>
              <CheckCircleOutlined style={{ fontSize: 20, color: '#266d00' }} />
            </div>
            <Title level={2} style={{ margin: 0, color: '#266d00', fontWeight: 500 }}>
              9
            </Title>
            <Text type="secondary" style={{ fontSize: 11, color: '#266d00', fontWeight: 500 }}>
              Efficiency: 85%
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text type="secondary" strong style={{ fontSize: 12 }}>
                Awaiting Vendor Response
              </Text>
              <ClockCircleOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            </div>
            <Title level={2} style={{ margin: 0, color: '#1890ff', fontWeight: 500 }}>
              15
            </Title>
            <Text type="secondary" style={{ fontSize: 11, color: '#1890ff', fontWeight: 500 }}>
              Average wait: 1.4 days
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card
        title={
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            Rejected Purchase Orders
          </span>
        }
        extra={
          <Space size={12}>
            <Input
              placeholder="Search PO, Supplier..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 280 }}
              allowClear
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setTableData(initialMockData);
                setSearchQuery('');
                message.success('Data refreshed');
              }}
            />
          </Space>
        }
        bordered
        style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            showSizeChanger: true,
            defaultPageSize: 10,
            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} rejected POs`,
          }}
        />
      </Card>

      {/* Guidance / Information Grid */}
      <Row gutter={[16, 16]} style={{ paddingBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card bordered style={{ height: '100%', background: '#fafafa', borderRadius: 8 }}>
            <Space style={{ marginBottom: 12 }}>
              <InfoCircleOutlined style={{ color: '#cf1322', fontSize: 18 }} />
              <Text strong style={{ fontSize: 14 }}>Close & Refund</Text>
            </Space>
            <Paragraph style={{ margin: 0, fontSize: 12, color: '#595959', lineHeight: '20px' }}>
              Use this if the goods are unusable or no longer needed. This action cancels the PO
              financial liability and triggers a return credit note from the vendor.
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered style={{ height: '100%', background: '#fafafa', borderRadius: 8 }}>
            <Space style={{ marginBottom: 12 }}>
              <SyncOutlined style={{ color: '#005daa', fontSize: 18 }} />
              <Text strong style={{ fontSize: 14 }}>Re-issue PO</Text>
            </Space>
            <Paragraph style={{ margin: 0, fontSize: 12, color: '#595959', lineHeight: '20px' }}>
              Best for damaged goods that need replacement. The system will auto-generate a linked
              PO with a 0-cost line item referencing the original rejection.
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered style={{ height: '100%', background: '#fafafa', borderRadius: 8 }}>
            <Space style={{ marginBottom: 12 }}>
              <RocketOutlined style={{ color: '#266d00', fontSize: 18 }} />
              <Text strong style={{ fontSize: 14 }}>Release to Warehouse</Text>
            </Space>
            <Paragraph style={{ margin: 0, fontSize: 12, color: '#595959', lineHeight: '20px' }}>
              Select if the rejection was a documentation error or if items are now cleared. This
              pushes the items back into the standard receiving inbound queue.
            </Paragraph>
          </Card>
        </Col>
      </Row>

      {/* Resolution Modals */}
      <CloseRefundModal
        open={closeRefundOpen}
        onClose={() => setCloseRefundOpen(false)}
        onConfirm={() => {
          if (selectedPO) {
            handleResolveConfirm(selectedPO.poNumber);
          }
        }}
        poData={
          selectedPO
            ? {
                poNumber: selectedPO.poNumber,
                supplier: selectedPO.supplier,
                totalValue: selectedPO.totalValue,
                items: selectedPO.items.map((item: any) => ({
                  ...item,
                  description: item.description || item.name,
                })),
              }
            : undefined
        }
      />

      <ReissuePOModal
        open={reissuePOOpen}
        onClose={() => setReissuePOOpen(false)}
        onConfirm={() => {
          if (selectedPO) {
            handleResolveConfirm(selectedPO.poNumber);
          }
        }}
        poData={
          selectedPO
            ? {
                poNumber: selectedPO.poNumber,
                supplier: selectedPO.supplier,
                reason: selectedPO.reason,
                items: selectedPO.items.map((item: any) => ({
                  ...item,
                  description: item.description || item.name,
                })),
              }
            : undefined
        }
      />

      <ReleaseWarehouseModal
        open={releaseWarehouseOpen}
        onClose={() => setReleaseWarehouseOpen(false)}
        onConfirm={() => {
          if (selectedPO) {
            handleResolveConfirm(selectedPO.poNumber);
          }
        }}
        poData={
          selectedPO
            ? {
                poNumber: selectedPO.poNumber,
                supplier: selectedPO.supplier,
                status: 'Rejected by QC',
                items: selectedPO.items.map((item: any) => ({
                  ...item,
                  description: item.description || item.name,
                })),
              }
            : undefined
        }
      />
    </div>
  );
}

export default ProcurementWorkspace;
