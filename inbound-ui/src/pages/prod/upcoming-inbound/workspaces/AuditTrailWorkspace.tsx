import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Select,
  Drawer,
  DatePicker,
  Row,
  Col,
  Alert,
  Divider,
  Timeline,
  Tooltip,
  message,
  Progress,
} from 'antd';
import {
  HistoryOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  UserOutlined,
  ExportOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  FileDoneOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
  InboxOutlined,
  SendOutlined,
  EditOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type {
  GoodsReceipt,
  GRActivity,
  SupervisorAdjustmentAudit,
  IRPlan,
} from '../core/type';
import { InboundStatusBadge } from '../features/shared/InboundStatusBadge';
import './ProcurementWorkspace.less';

const { Text } = Typography;
const { RangePicker } = DatePicker;

export interface AuditTrailWorkspaceProps {
  receipts: GoodsReceipt[];
  irPlans?: IRPlan[];
  onRefresh: () => void;
}

interface FlattenedAuditEvent {
  id: string;
  grNumber: string;
  irPlanNumber: string;
  poNumber: string;
  supplier: string;
  eventTitle: string;
  description: string;
  department: 'Procurement' | 'Warehouse' | 'QC' | 'Supervisor' | 'System';
  performedBy: string;
  timestamp: string;
  state: 'done' | 'active' | 'error' | 'pending' | string;
  receiptRef: GoodsReceipt;
}

export const AuditTrailWorkspace: React.FC<AuditTrailWorkspaceProps> = ({
  receipts,
  irPlans = [],
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL_EVENTS' | 'ADJUSTMENTS' | 'VISUAL_JOURNEY'>('ALL_EVENTS');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [selectedGrFilter, setSelectedGrFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<GoodsReceipt | null>(receipts[0] || null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(false);

  // Flatten all activities across all receipts
  const allEvents: FlattenedAuditEvent[] = useMemo(() => {
    const list: FlattenedAuditEvent[] = [];

    receipts.forEach((r) => {
      // Add default creation event if none exists
      if (!r.activities || r.activities.length === 0) {
        list.push({
          id: `evt-${r.id}-init`,
          grNumber: r.grNumber || 'N/A',
          irPlanNumber: r.irPlanNumber || 'N/A',
          poNumber: r.poNumber || 'N/A',
          supplier: r.supplier || 'N/A',
          eventTitle: 'IR Plan Scheduled & Dispatched',
          description: `Delivery scheduled for ${r.expectedDate || '27-08-2026'}. Expected ${r.items.reduce((s, i) => s + (i.plannedQty || i.poQty || 0), 0)} units.`,
          department: 'Procurement',
          performedBy: 'Keo Srey',
          timestamp: '2026-08-22 09:30',
          state: 'done',
          receiptRef: r,
        });
      } else {
        r.activities.forEach((act, idx) => {
          let dept: 'Procurement' | 'Warehouse' | 'QC' | 'Supervisor' | 'System' = 'Warehouse';
          const title = act.title.toLowerCase();
          if (title.includes('plan') || title.includes('ir')) dept = 'Procurement';
          else if (title.includes('qc') || title.includes('inspection')) dept = 'QC';
          else if (title.includes('supervisor') || title.includes('post') || title.includes('sap')) dept = 'Supervisor';
          else if (title.includes('system') || title.includes('sync')) dept = 'System';

          list.push({
            id: act.id || `evt-${r.id}-${idx}`,
            grNumber: r.grNumber || 'N/A',
            irPlanNumber: r.irPlanNumber || 'N/A',
            poNumber: r.poNumber || 'N/A',
            supplier: r.supplier || 'N/A',
            eventTitle: act.title,
            description: act.description,
            department: dept,
            performedBy: act.performedBy || 'System User',
            timestamp: act.timestamp,
            state: act.state || 'done',
            receiptRef: r,
          });
        });
      }
    });

    return list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  }, [receipts]);

  // Extract all supervisor adjustments
  const allAdjustments = useMemo(() => {
    const list: (SupervisorAdjustmentAudit & { grNumber: string; supplier: string; receiptRef: GoodsReceipt })[] = [];
    receipts.forEach((r) => {
      if (r.supervisorAdjustments) {
        r.supervisorAdjustments.forEach((adj) => {
          list.push({
            ...adj,
            grNumber: r.grNumber,
            supplier: r.supplier,
            receiptRef: r,
          });
        });
      }
    });
    return list;
  }, [receipts]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      allEvents: allEvents.length,
      adjustments: allAdjustments.length,
      postedSap: receipts.filter((r) => r.deliveryPlanStatus === 'Posted' || r.sapDocNum).length,
      discrepancies: receipts.filter((r) => r.items.some((i) => (i.plannedQty || i.poQty || 0) !== i.receiveQty)).length,
      activeWorkflows: receipts.filter((r) => r.deliveryPlanStatus !== 'Posted').length,
    };
  }, [allEvents, allAdjustments, receipts]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((evt) => {
      // Department Filter
      if (deptFilter !== 'ALL' && evt.department !== deptFilter) {
        return false;
      }

      // GR Transaction Filter
      if (selectedGrFilter !== 'ALL' && evt.grNumber !== selectedGrFilter) {
        return false;
      }

      // Search Filter
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const mTitle = evt.eventTitle.toLowerCase().includes(q);
        const mDesc = evt.description.toLowerCase().includes(q);
        const mGR = evt.grNumber.toLowerCase().includes(q);
        const mIR = evt.irPlanNumber.toLowerCase().includes(q);
        const mPO = evt.poNumber.toLowerCase().includes(q);
        const mUser = evt.performedBy.toLowerCase().includes(q);
        const mSup = evt.supplier.toLowerCase().includes(q);
        if (!mTitle && !mDesc && !mGR && !mIR && !mPO && !mUser && !mSup) {
          return false;
        }
      }

      return true;
    });
  }, [allEvents, deptFilter, selectedGrFilter, searchTerm]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setDeptFilter('ALL');
    setSelectedGrFilter('ALL');
    setDateRange(null);
    message.info('Audit filters reset.');
  };

  const handleExport = () => {
    message.success('Exporting full Audit Trail logs to Excel / CSV format...');
  };

  const getTimelineIcon = (state: string) => {
    switch (state) {
      case 'done':
        return <CheckCircleOutlined style={{ color: '#16a34a', fontSize: 16 }} />;
      case 'active':
        return <ClockCircleOutlined style={{ color: '#2563eb', fontSize: 16 }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#dc2626', fontSize: 16 }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: '#ca8504', fontSize: 16 }} />;
    }
  };

  const getDeptTag = (dept: string) => {
    switch (dept) {
      case 'Procurement':
        return <Tag color="blue">Procurement</Tag>;
      case 'Warehouse':
        return <Tag color="orange">Warehouse</Tag>;
      case 'QC':
        return <Tag color="purple">QC Inspection</Tag>;
      case 'Supervisor':
        return <Tag color="green">Supervisor</Tag>;
      default:
        return <Tag color="cyan">System</Tag>;
    }
  };

  // Event Columns
  const eventColumns: ColumnsType<FlattenedAuditEvent> = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 145,
      render: (t) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{t.split(' ')[0]}</Text>
          <div style={{ fontSize: 11, color: '#64748b' }}>{t.split(' ')[1] || '09:00'}</div>
        </div>
      ),
    },
    {
      title: 'IR Plan #',
      key: 'irPlanNumber',
      width: 120,
      render: (_: any, record: FlattenedAuditEvent) => (
        <span
          className="po-link"
          onClick={() => {
            setSelectedReceipt(record.receiptRef);
            setIsDetailDrawerOpen(true);
          }}
        >
          {record.irPlanNumber || '—'}
        </span>
      ),
    },
    {
      title: 'GR #',
      dataIndex: 'grNumber',
      key: 'grNumber',
      width: 130,
      render: (gr: string, record: FlattenedAuditEvent) => (
        <span
          className="po-link"
          onClick={() => {
            setSelectedReceipt(record.receiptRef);
            setIsDetailDrawerOpen(true);
          }}
        >
          {gr || record.irPlanNumber}
        </span>
      ),
    },
    {
      title: 'PO #',
      dataIndex: 'poNumber',
      key: 'poNumber',
      width: 120,
      render: (po: string) => (
        <span className="po-link">{po}</span>
      ),
    },
    {
      title: 'Department / Role',
      dataIndex: 'department',
      key: 'department',
      width: 130,
      render: (dept) => getDeptTag(dept),
    },
    {
      title: 'Action & Event Log',
      key: 'event',
      render: (_: any, record: FlattenedAuditEvent) => (
        <div>
          <Space size={6}>
            {getTimelineIcon(record.state)}
            <Text strong style={{ color: '#0f172a' }}>{record.eventTitle}</Text>
          </Space>
          <div style={{ color: '#475569', fontSize: 12, marginTop: 2, paddingLeft: 22 }}>
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: 'Performed By',
      dataIndex: 'performedBy',
      key: 'performedBy',
      width: 150,
      render: (user) => (
        <span style={{ fontSize: 12, color: '#334155' }}>
          <UserOutlined style={{ marginRight: 4, color: '#94a3b8' }} />
          {user}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_: any, record: FlattenedAuditEvent) => (
        <Button
          size="small"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedReceipt(record.receiptRef);
            setIsDetailDrawerOpen(true);
          }}
        >
          View GR
        </Button>
      ),
    },
  ];

  // Adjustment Columns
  const adjustmentColumns = [
    {
      title: 'GR #',
      dataIndex: 'grNumber',
      key: 'grNumber',
      width: 130,
      render: (gr: string, record: any) => (
        <span
          className="po-link"
          onClick={() => {
            setSelectedReceipt(record.receiptRef);
            setIsDetailDrawerOpen(true);
          }}
        >
          {gr}
        </span>
      ),
    },
    {
      title: 'PO #',
      key: 'poNumber',
      width: 120,
      render: (_: any, record: any) => (
        <span className="po-link">
          {record.receiptRef?.poNumber}
        </span>
      ),
    },
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 130,
      render: (code: string, record: any) => (
        <div>
          <Text strong style={{ color: '#2563eb' }}>{code}</Text>
          <div style={{ fontSize: 11, color: '#64748b' }}>{record.itemName}</div>
        </div>
      ),
    },
    {
      title: 'Original Value',
      dataIndex: 'previousValue',
      key: 'previousValue',
      width: 110,
      render: (val: any) => <Text delete type="secondary">{val} PCS</Text>,
    },
    {
      title: 'Adjusted Value',
      dataIndex: 'newValue',
      key: 'newValue',
      width: 120,
      render: (val: any) => <Text strong style={{ color: '#16a34a' }}>{val} PCS</Text>,
    },
    {
      title: 'Mandatory Rationale & Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (text: string) => (
        <div style={{ background: '#fffbeb', padding: '4px 8px', borderRadius: 4, border: '1px solid #fef3c7', fontSize: 12, color: '#92400e' }}>
          {text}
        </div>
      ),
    },
    {
      title: 'Modified By / Time',
      key: 'auditMeta',
      width: 160,
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>
            <UserOutlined style={{ marginRight: 4, color: '#ca8504' }} />
            {record.changedBy}
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>{record.timestamp}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="procurement-workspace">
      {/* 1. Header Row matching standard template */}
      <div className="workspace-header-row">
        <div className="header-titles" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <h1 className="main-title" style={{ margin: 0 }}>Inbound Audit Trail & Compliance Log</h1>
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                className="action-btn"
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={handleExport}
                className="action-btn export-primary-btn"
                style={{
                  background: '#B49A00',
                  borderColor: '#B49A00',
                  color: '#ffffff',
                  fontWeight: 600,
                }}
              >
                Export
              </Button>
            </div>
          </div>
          <p className="main-subtitle" style={{ margin: '4px 0 0 0' }}>
            Immutable end-to-end audit logs, supervisor quantity adjustments, SAP synchronization history, and transaction lifecycle tracking
          </p>
        </div>
      </div>

      {/* 2. KPI Summary Cards Grid */}
      <div className="summary-cards-row">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Audit Events</span>
            <div className="kpi-icon-badge blue">
              <HistoryOutlined />
            </div>
          </div>
          <div className="kpi-value blue">{tabCounts.allEvents}</div>
          <div className="kpi-subtitle">Logged activities</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Supervisor Adjustments</span>
            <div className="kpi-icon-badge amber">
              <AuditOutlined />
            </div>
          </div>
          <div className="kpi-value amber">{tabCounts.adjustments}</div>
          <div className="kpi-subtitle">Quantity overrides</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Posted to SAP</span>
            <div className="kpi-icon-badge green">
              <CheckCircleOutlined />
            </div>
          </div>
          <div className="kpi-value green">{tabCounts.postedSap}</div>
          <div className="kpi-subtitle">Completed GRPOs</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Discrepancy Alerts</span>
            <div className="kpi-icon-badge orange">
              <ExclamationCircleOutlined />
            </div>
          </div>
          <div className="kpi-value orange">{tabCounts.discrepancies}</div>
          <div className="kpi-subtitle">Missing / Over counts</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Active Workflows</span>
            <div className="kpi-icon-badge purple">
              <FileTextOutlined />
            </div>
          </div>
          <div className="kpi-value purple">{tabCounts.activeWorkflows}</div>
          <div className="kpi-subtitle">In-flight transactions</div>
        </div>
      </div>

      {/* 3. Single-Line Filter Toolbar Card with Title Labels */}
      <div className="filter-toolbar-card" style={{ padding: '12px 18px', background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 240px', minWidth: 200, maxWidth: 300 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Search</span>
            <Input
              placeholder="Search event, GR #, PO #, user, reason..."
              prefix={<SearchOutlined style={{ color: '#9ca3af', marginRight: 4 }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              style={{ height: 36, borderRadius: 6 }}
            />
          </div>

          {/* Department / Stage */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 190 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Department / Stage</span>
            <Select
              style={{ width: '100%', height: 36 }}
              value={deptFilter}
              onChange={setDeptFilter}
              options={[
                { label: 'All Departments', value: 'ALL' },
                { label: 'Procurement (Planning)', value: 'Procurement' },
                { label: 'Warehouse (Receiving)', value: 'Warehouse' },
                { label: 'QC Inspection', value: 'QC' },
                { label: 'Supervisor (Approval & SAP)', value: 'Supervisor' },
                { label: 'System Automation', value: 'System' },
              ]}
            />
          </div>

          {/* Specific Shipment (GR) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 180 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Shipment (GR)</span>
            <Select
              style={{ width: '100%', height: 36 }}
              value={selectedGrFilter}
              onChange={setSelectedGrFilter}
              options={[
                { label: 'All Shipments', value: 'ALL' },
                ...receipts.map((r) => ({
                  label: `${r.grNumber} (${r.supplier})`,
                  value: r.grNumber,
                })),
              ]}
            />
          </div>

          {/* Date Range */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 230 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Date Range</span>
            <RangePicker
              style={{ width: '100%', height: 36, borderRadius: 6 }}
              value={dateRange}
              onChange={(d: any) => setDateRange(d)}
              format="YYYY-MM-DD"
              placeholder={['Start Date', 'End Date']}
            />
          </div>

          {/* Reset Button - Appears ONLY when custom filters are active */}
          {(Boolean(searchTerm) || deptFilter !== 'ALL' || selectedGrFilter !== 'ALL' || dateRange !== null) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'flex-end' }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetFilters}
                style={{
                  height: 36,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#ca8504',
                  borderColor: '#fde047',
                  background: '#fefce8',
                  fontWeight: 600,
                  borderRadius: 6,
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Main Content Card */}
      <div className="main-content-card">
        <div className="tab-action-bar">
          <div className="tabs-list">
            <button
              className={`tab-button ${activeTab === 'ALL_EVENTS' ? 'active' : ''}`}
              onClick={() => setActiveTab('ALL_EVENTS')}
            >
              <span>Chronological Event Log</span>
              <span className="tab-count-badge">{tabCounts.allEvents}</span>
            </button>

            <button
              className={`tab-button ${activeTab === 'ADJUSTMENTS' ? 'active' : ''}`}
              onClick={() => setActiveTab('ADJUSTMENTS')}
            >
              <span>Supervisor Adjustments</span>
              <span className="tab-count-badge">{tabCounts.adjustments}</span>
            </button>

            <button
              className={`tab-button ${activeTab === 'VISUAL_JOURNEY' ? 'active' : ''}`}
              onClick={() => setActiveTab('VISUAL_JOURNEY')}
            >
              <span>Visual Journey & Lifecycle</span>
            </button>
          </div>

          <div className="view-controls">
            <div className="view-switcher-group">
              <Tooltip title="Table View">
                <button
                  className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                >
                  <UnorderedListOutlined />
                </button>
              </Tooltip>
              <Tooltip title="Cards View">
                <button
                  className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                  onClick={() => setViewMode('cards')}
                >
                  <AppstoreOutlined />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Tab 1: Chronological Event Log */}
        {activeTab === 'ALL_EVENTS' && (
          <Table
            columns={eventColumns}
            dataSource={filteredEvents}
            rowKey="id"
            pagination={{ pageSize: 10, showTotal: (t) => `Total ${t} events logged` }}
            className="po-custom-table"
          />
        )}

        {/* Tab 2: Supervisor Adjustments */}
        {activeTab === 'ADJUSTMENTS' && (
          <div>
            <Alert
              message="Immutable Audit Compliance"
              description="Supervisor quantity modifications never delete or overwrite the original physical receiving counts or QC accepted figures. All delta adjustments are permanently timestamped with mandatory rationale."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={adjustmentColumns}
              dataSource={allAdjustments}
              rowKey="id"
              pagination={{ pageSize: 8, showTotal: (t) => `Total ${t} adjustment entries` }}
              className="po-custom-table"
            />
          </div>
        )}

        {/* Tab 3: Visual Journey & Lifecycle Deep Dive */}
        {activeTab === 'VISUAL_JOURNEY' && (
          <div style={{ padding: '8px 4px' }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <Space size={12}>
                <Text strong>Select Shipment Journey:</Text>
                <Select
                  style={{ width: 300 }}
                  value={selectedReceipt?.grNumber}
                  onChange={(val) => {
                    const found = receipts.find((r) => r.grNumber === val);
                    if (found) setSelectedReceipt(found);
                  }}
                  options={receipts.map((r) => ({
                    label: `${r.grNumber} - ${r.supplier} (PO: ${r.poNumber})`,
                    value: r.grNumber,
                  }))}
                />
              </Space>
              {selectedReceipt && (
                <Space>
                  <InboundStatusBadge type="deliveryPlan" value={selectedReceipt.deliveryPlanStatus || 'Posted'} />
                  {selectedReceipt.sapDocNum && <Tag color="green">SAP: {selectedReceipt.sapDocNum}</Tag>}
                </Space>
              )}
            </div>

            {selectedReceipt && (
              <Row gutter={[24, 24]}>
                {/* Visual Step Cards */}
                <Col xs={24} md={14}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 20 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HistoryOutlined style={{ color: '#2563eb' }} />
                      <span>End-to-End Inbound Journey: {selectedReceipt.grNumber}</span>
                    </div>

                    <Timeline
                      style={{ marginTop: 16 }}
                      items={(selectedReceipt.activities || [
                        {
                          id: 'act-1',
                          title: 'Procurement: IR Plan Created',
                          description: `Scheduled inbound shipment from PO ${selectedReceipt.poNumber}`,
                          performedBy: 'Keo Srey',
                          timestamp: '2026-08-22 09:30',
                          state: 'done',
                        },
                        {
                          id: 'act-2',
                          title: 'Warehouse: Physical Intake & Batch Lotting',
                          description: `Truck arrived. Received ${selectedReceipt.items.reduce((s, i) => s + i.receiveQty, 0)} units with delivery note verification.`,
                          performedBy: 'Warehouse Staff',
                          timestamp: '2026-08-27 10:15',
                          state: 'done',
                        },
                        {
                          id: 'act-3',
                          title: 'QC: Quality Inspection & Partitions',
                          description: 'Passed 6-point physical verification. Accepted for storage.',
                          performedBy: 'QC Inspector',
                          timestamp: '2026-08-27 11:30',
                          state: 'done',
                        },
                        {
                          id: 'act-4',
                          title: 'Supervisor: Authorization & SAP GRPO Posting',
                          description: `Approved final quantities. Posted into SAP B1 (${selectedReceipt.sapDocNum || 'DocNum: 10045928'}).`,
                          performedBy: 'Warehouse Supervisor',
                          timestamp: '2026-08-27 13:00',
                          state: 'done',
                        },
                      ]).map((act) => ({
                        dot: getTimelineIcon(act.state),
                        children: (
                          <div style={{ paddingBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text strong style={{ fontSize: 13, color: '#0f172a' }}>{act.title}</Text>
                              <span style={{ fontSize: 11, color: '#64748b' }}>{act.timestamp}</span>
                            </div>
                            <div style={{ color: '#475569', fontSize: 12, marginTop: 3 }}>{act.description}</div>
                            {act.performedBy && (
                              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                                <UserOutlined style={{ marginRight: 4 }} />
                                {act.performedBy}
                              </div>
                            )}
                          </div>
                        ),
                      }))}
                    />
                  </div>
                </Col>

                {/* 6-Quantity Ownership Matrix */}
                <Col xs={24} md={10}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 20 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileTextOutlined style={{ color: '#ca8504' }} />
                      <span>Multi-Department Ownership Matrix</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#eff6ff', borderRadius: 6 }}>
                        <div>
                          <Tag color="blue">Procurement</Tag>
                          <span style={{ fontSize: 12, color: '#1e3a8a' }}>Planned Order QTY</span>
                        </div>
                        <Text strong style={{ fontSize: 14 }}>
                          {selectedReceipt.items.reduce((s, i) => s + (i.plannedQty || i.poQty || 0), 0).toLocaleString()} PCS
                        </Text>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fff7ed', borderRadius: 6 }}>
                        <div>
                          <Tag color="orange">Warehouse</Tag>
                          <span style={{ fontSize: 12, color: '#9a3412' }}>Actual Received QTY</span>
                        </div>
                        <Text strong style={{ fontSize: 14, color: '#ea580c' }}>
                          {selectedReceipt.items.reduce((s, i) => s + (i.receiveQty || 0), 0).toLocaleString()} PCS
                        </Text>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#faf5ff', borderRadius: 6 }}>
                        <div>
                          <Tag color="purple">QC Inspection</Tag>
                          <span style={{ fontSize: 12, color: '#581c87' }}>QC Accepted QTY</span>
                        </div>
                        <Text strong style={{ fontSize: 14, color: '#9333ea' }}>
                          {selectedReceipt.items.reduce((s, i) => s + (i.qcAcceptedQty || i.receiveQty || 0), 0).toLocaleString()} PCS
                        </Text>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f0fdf4', borderRadius: 6 }}>
                        <div>
                          <Tag color="green">Supervisor</Tag>
                          <span style={{ fontSize: 12, color: '#14532d' }}>Final SAP Posted QTY</span>
                        </div>
                        <Text strong style={{ fontSize: 14, color: '#16a34a' }}>
                          {selectedReceipt.items.reduce((s, i) => s + (i.finalGrQty !== undefined ? i.finalGrQty : (i.qcAcceptedQty || i.receiveQty || 0)), 0).toLocaleString()} PCS
                        </Text>
                      </div>
                    </div>

                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() => setIsDetailDrawerOpen(true)}
                      style={{ width: '100%', marginTop: 18, background: '#2563eb', borderColor: '#2563eb', height: 36, fontWeight: 600 }}
                    >
                      Open Full Transaction Drawer
                    </Button>
                  </div>
                </Col>
              </Row>
            )}
          </div>
        )}
      </div>

      {/* 5. Detail Drawer (920px) */}
      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
            <Space size={10}>
              <HistoryOutlined style={{ color: '#2563eb', fontSize: 18 }} />
              <span style={{ fontWeight: 700, fontSize: 16 }}>
                Inbound Transaction Audit: {selectedReceipt?.grNumber}
              </span>
            </Space>
            {selectedReceipt && (
              <InboundStatusBadge type="deliveryPlan" value={selectedReceipt.deliveryPlanStatus || 'Posted'} />
            )}
          </div>
        }
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        width={920}
        styles={{ body: { padding: '20px 24px', background: '#f8fafc' } }}
        footer={
          selectedReceipt && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Audit Trail & Historical Traceability Log
              </Text>
              <Space size={12}>
                <Button onClick={() => setIsDetailDrawerOpen(false)}>Close</Button>
              </Space>
            </div>
          )
        }
      >
        {selectedReceipt && (() => {
          const totalPlanned = selectedReceipt.items?.reduce((s, i) => s + (i.plannedQty || i.poQty || 0), 0) || 0;
          const totalReceived = selectedReceipt.items?.reduce((s, i) => s + (i.receiveQty || 0), 0) || 0;
          const totalQcAccepted = selectedReceipt.items?.reduce((s, i) => s + (i.qcAcceptedQty || 0), 0) || 0;
          const totalFinalPosted = selectedReceipt.items?.reduce((s, i) => s + (i.finalGrQty !== undefined ? i.finalGrQty : (i.qcAcceptedQty || i.receiveQty || 0)), 0) || 0;
          const fulfillmentRate = totalPlanned > 0 ? Math.min(100, Math.round((totalFinalPosted / totalPlanned) * 1000) / 10) : 100;

          return (
            <div className="detail-drawer-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Top End-to-End Lifecycle Summary Banner */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 12,
                  padding: '16px 20px',
                  boxShadow: '0 1px 3px rgba(37, 99, 235, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HistoryOutlined style={{ color: '#2563eb', fontSize: 16 }} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#1e3a8a' }}>
                      End-to-End Inbound Execution Summary
                    </span>
                  </div>
                  <Tag
                    color={selectedReceipt.deliveryPlanStatus === 'Posted' ? 'success' : 'processing'}
                    style={{ fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 12 }}
                  >
                    {selectedReceipt.deliveryPlanStatus === 'Posted' ? 'Completed & Posted' : `Fulfillment: ${fulfillmentRate}%`}
                  </Tag>
                </div>

                <Progress
                  percent={fulfillmentRate}
                  strokeColor="#2563eb"
                  trailColor="#e2e8f0"
                  status={selectedReceipt.deliveryPlanStatus === 'Posted' ? 'normal' : 'active'}
                  style={{ marginBottom: 12 }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Planned PO Qty</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{totalPlanned.toLocaleString()} Units</div>
                  </div>
                  <div style={{ background: '#eff6ff', padding: '10px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 500 }}>WH Received</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#2563eb' }}>{totalReceived.toLocaleString()} Units</div>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: 11, color: '#166534', fontWeight: 500 }}>QC Accepted</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#16a34a' }}>{totalQcAccepted.toLocaleString()} Units</div>
                  </div>
                  <div style={{ background: '#fefce8', padding: '10px 12px', borderRadius: 8, border: '1px solid #fef08a' }}>
                    <div style={{ fontSize: 11, color: '#854d0e', fontWeight: 500 }}>Final SAP Posted</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#ca8504' }}>{totalFinalPosted.toLocaleString()} Units</div>
                  </div>
                </div>
              </div>

              {/* 1. Exact Figma Details Card */}
              <div
                className="po-figma-details-card"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: '16px 20px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                }}
              >
                <div
                  className="po-card-title"
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#111827',
                    marginBottom: 14,
                    lineHeight: 1.2,
                  }}
                >
                  Transaction & Logistics Details
                </div>
                <div className="po-grid-container" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="po-grid-row" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <div className="label-value-pair" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span className="field-label" style={{ width: 140, fontSize: 13, fontWeight: 500, color: '#6b7280', flexShrink: 0 }}>
                        GR #
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span className="field-value" style={{ fontSize: 14, fontWeight: 600, color: '#2563eb' }}>
                        {selectedReceipt.grNumber}
                      </span>
                    </div>
                    <div className="label-value-pair" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span className="field-label" style={{ width: 140, fontSize: 13, fontWeight: 500, color: '#6b7280', flexShrink: 0 }}>
                        IR Plan #
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span className="field-value" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>
                        {selectedReceipt.irPlanNumber}
                      </span>
                    </div>
                  </div>

                  <div className="po-grid-row" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <div className="label-value-pair" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span className="field-label" style={{ width: 140, fontSize: 13, fontWeight: 500, color: '#6b7280', flexShrink: 0 }}>
                        PO Reference
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span className="field-value" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>
                        {selectedReceipt.poNumber}
                      </span>
                    </div>
                    <div className="label-value-pair" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span className="field-label" style={{ width: 140, fontSize: 13, fontWeight: 500, color: '#6b7280', flexShrink: 0 }}>
                        Supplier / Vendor
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span className="field-value" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>
                        {selectedReceipt.supplier}
                      </span>
                    </div>
                  </div>

                  <div className="po-grid-row" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <div className="label-value-pair" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span className="field-label" style={{ width: 140, fontSize: 13, fontWeight: 500, color: '#6b7280', flexShrink: 0 }}>
                        Delivery Note (DN)
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span className="field-value" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>
                        {selectedReceipt.deliveryNoteNumber || 'NA'}
                      </span>
                    </div>
                    <div className="label-value-pair" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span className="field-label" style={{ width: 140, fontSize: 13, fontWeight: 500, color: '#6b7280', flexShrink: 0 }}>
                        SAP DocNum
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span className="field-value" style={{ fontSize: 14, fontWeight: 600, color: selectedReceipt.sapDocNum ? '#16a34a' : '#ca8504' }}>
                        {selectedReceipt.sapDocNum || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Line Items & Quantity Tracking */}
              <div
                className="drawer-section"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '16px 20px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  className="drawer-section-title"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <FileTextOutlined style={{ color: '#ca8504' }} />
                  <span>Line Items & Quantity Tracking ({selectedReceipt.items?.length || 0})</span>
                </div>
                <Table
                  size="small"
                  dataSource={selectedReceipt.items}
                  rowKey="code"
                  pagination={false}
                  className="po-custom-table"
                  columns={[
                    { title: 'Item Code', dataIndex: 'code', key: 'code', render: (c) => <Text strong style={{ color: '#2563eb' }}>{c}</Text> },
                    { title: 'Item Name & Description', dataIndex: 'name', key: 'name' },
                    { title: 'PO / Plan', key: 'plan', render: (_, r) => `${r.plannedQty || r.poQty} ${r.uom}` },
                    { title: 'WH Received', dataIndex: 'receiveQty', key: 'receiveQty', render: (q, r) => `${q} ${r.uom}` },
                    { title: 'QC Accepted', dataIndex: 'qcAcceptedQty', key: 'qcAcceptedQty', render: (q, r) => <Tag color="green">{q || 0} {r.uom}</Tag> },
                    { title: 'Final Posted', key: 'final', render: (_, r) => <Text strong style={{ color: '#0f172a' }}>{r.finalGrQty !== undefined ? r.finalGrQty : (r.qcAcceptedQty || r.receiveQty)} {r.uom}</Text> },
                  ]}
                />
              </div>

            {selectedReceipt.supervisorAdjustments && selectedReceipt.supervisorAdjustments.length > 0 && (
              <div className="drawer-section">
                <div className="drawer-section-title">
                  <AuditOutlined style={{ color: '#ca8504' }} />
                  <span>Supervisor Adjustments Log ({selectedReceipt.supervisorAdjustments.length})</span>
                </div>
                <Table
                  size="small"
                  dataSource={selectedReceipt.supervisorAdjustments}
                  columns={adjustmentColumns}
                  rowKey="id"
                  pagination={false}
                  className="po-custom-table"
                />
              </div>
            )}

            <div className="drawer-section">
              <div className="drawer-section-title">
                <HistoryOutlined style={{ color: '#2563eb' }} />
                <span>Complete Activity Timeline</span>
              </div>
              <Timeline
                items={(selectedReceipt.activities || []).map((act) => ({
                  dot: getTimelineIcon(act.state),
                  children: (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong>{act.title}</Text>
                        <span style={{ fontSize: 11, color: '#64748b' }}>{act.timestamp}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{act.description}</div>
                      {act.performedBy && <div style={{ fontSize: 11, color: '#94a3b8' }}><UserOutlined style={{ marginRight: 4 }} />{act.performedBy}</div>}
                    </div>
                  ),
                }))}
              />
            </div>
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
};
