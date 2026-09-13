import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Select,
  Modal,
  Drawer,
  Form,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Alert,
  Divider,
  Statistic,
  message,
  Tooltip,
  Progress,
} from 'antd';
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  EyeOutlined,
  SearchOutlined,
  SendOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
  ExportOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type {
  GoodsReceipt,
  GRItem,
  QCInspectionCheck,
  QCResultStatus,
} from '../core/type';
import { InboundStatusBadge } from '../features/shared/InboundStatusBadge';
import { AuditTrailTimeline } from '../features/shared/AuditTrailTimeline';
import './ProcurementWorkspace.less';

const { Text } = Typography;
const { RangePicker } = DatePicker;

export interface QCWorkspaceProps {
  receipts: GoodsReceipt[];
  onSubmitQCReview: (gr: GoodsReceipt) => void;
  onRefresh: () => void;
  onNavigateToRole?: (role: 'PROCUREMENT' | 'WAREHOUSE' | 'QC' | 'SUPERVISOR' | 'AUDIT_TIMELINE') => void;
}

export const QCWorkspace: React.FC<QCWorkspaceProps> = ({
  receipts,
  onSubmitQCReview,
  onRefresh,
  onNavigateToRole,
}) => {
  const [activeTab, setActiveTab] = useState<string>('PENDING');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<GoodsReceipt | null>(null);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState<boolean>(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(false);

  // QC Form state
  const [inspectionItems, setInspectionItems] = useState<GRItem[]>([]);
  const [overallQcRemark, setOverallQcRemark] = useState<string>('');

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: receipts.length,
      pendingQC: receipts.filter((r) => r.deliveryPlanStatus === 'Waiting for QC' || r.processState === 'QC_PENDING').length,
      passed: receipts.filter((r) => r.qcResult === 'Pass' || r.deliveryPlanStatus === 'QC Completed').length,
      rejected: receipts.filter((r) => r.qcResult === 'Fail' || r.items.some((i) => (i.qcRejectedQty || 0) > 0)).length,
      onHold: receipts.filter((r) => r.qcResult === 'Conditional Pass' || r.items.some((i) => (i.qcOnHoldQty || 0) > 0)).length,
    };
  }, [receipts]);

  // Filter receipts for QC Queue
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      // 1. Tab Filter
      if (activeTab === 'PENDING' && !(r.deliveryPlanStatus === 'Waiting for QC' || r.processState === 'QC_PENDING')) {
        return false;
      }
      if (activeTab === 'PASSED' && !(r.qcResult === 'Pass' || r.deliveryPlanStatus === 'QC Completed')) {
        return false;
      }
      if (activeTab === 'REJECTED_HOLD' && !(r.qcResult === 'Fail' || r.qcResult === 'Conditional Pass' || r.items.some((i) => (i.qcRejectedQty || 0) > 0 || (i.qcOnHoldQty || 0) > 0))) {
        return false;
      }

      // 2. Status Dropdown Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'PENDING' && !(r.deliveryPlanStatus === 'Waiting for QC' || r.processState === 'QC_PENDING')) {
          return false;
        }
        if (statusFilter === 'PASSED' && r.qcResult !== 'Pass') {
          return false;
        }
        if (statusFilter === 'REJECTED' && r.qcResult !== 'Fail') {
          return false;
        }
      }

      // 3. Warehouse Filter
      if (warehouseFilter !== 'ALL' && r.receiverWarehouseName && !r.receiverWarehouseName.includes(warehouseFilter)) {
        return false;
      }

      // 4. Search Filter
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const matchesGR = r.grNumber?.toLowerCase().includes(q);
        const matchesIR = r.irPlanNumber?.toLowerCase().includes(q);
        const matchesSupplier = r.supplier?.toLowerCase().includes(q);
        const matchesDN = r.deliveryNoteNumber?.toLowerCase().includes(q);
        const matchesPO = r.poNumber?.toLowerCase().includes(q);
        const matchesItem = r.items?.some(
          (it) =>
            it.code.toLowerCase().includes(q) ||
            it.name.toLowerCase().includes(q) ||
            it.batches?.some((b) => b.batchNumber?.toLowerCase().includes(q)),
        );
        if (!matchesGR && !matchesIR && !matchesSupplier && !matchesDN && !matchesPO && !matchesItem) {
          return false;
        }
      }

      // 5. Date Range Filter
      if (dateRange && dateRange[0] && dateRange[1]) {
        const dateStr = r.actualReceiptDate || r.expectedDate || r.postingDate;
        if (dateStr) {
          const recDate = dayjs(dateStr, ['DD-MM-YYYY', 'YYYY-MM-DD']);
          if (recDate.isValid() && (recDate.isBefore(dateRange[0], 'day') || recDate.isAfter(dateRange[1], 'day'))) {
            return false;
          }
        }
      }

      return true;
    });
  }, [receipts, activeTab, statusFilter, warehouseFilter, searchTerm, dateRange]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setWarehouseFilter('ALL');
    setDateRange(null);
    message.info('Filters reset.');
  };

  // Start Inspection (QC-03)
  const handleStartInspection = (receipt: GoodsReceipt) => {
    setSelectedReceipt(receipt);
    const clonedItems = receipt.items.map((item) => ({
      ...item,
      qcAcceptedQty: item.qcAcceptedQty !== undefined ? item.qcAcceptedQty : item.receiveQty,
      qcRejectedQty: item.qcRejectedQty || 0,
      qcOnHoldQty: item.qcOnHoldQty || 0,
      qcChecks: item.qcChecks || {
        packagingCondition: 'Pass',
        productAppearance: 'Pass',
        quantityVerification: 'Pass',
        batchVerification: 'Pass',
        dateVerification: 'Pass',
        handlingTempCondition: 'Pass',
      },
      qcResult: item.qcResult || 'Pass',
      qcRejectedReason: item.qcRejectedReason || '',
      qcOnHoldReason: item.qcOnHoldReason || '',
      qcRemark: item.qcRemark || '',
    }));

    setInspectionItems(clonedItems);
    setOverallQcRemark(receipt.qcNotes || '');
    setIsInspectionModalOpen(true);
  };

  // Update item QC partition
  const handleUpdatePartition = (
    index: number,
    field: 'qcAcceptedQty' | 'qcRejectedQty' | 'qcOnHoldQty',
    value: number,
  ) => {
    const updated = [...inspectionItems];
    const target = updated[index];
    const received = target.receiveQty;

    (target as any)[field] = value;

    if (field === 'qcRejectedQty' || field === 'qcOnHoldQty') {
      const otherPartitions = (field === 'qcRejectedQty' ? target.qcOnHoldQty : target.qcRejectedQty) || 0;
      target.qcAcceptedQty = Math.max(0, received - value - otherPartitions);
    }

    if (target.qcRejectedQty && target.qcRejectedQty > 0) {
      target.qcResult = 'Fail';
    } else if (target.qcOnHoldQty && target.qcOnHoldQty > 0) {
      target.qcResult = 'Conditional Pass';
    } else {
      target.qcResult = 'Pass';
    }

    setInspectionItems(updated);
  };

  // Update Inspection Checklist
  const handleUpdateCheck = (
    itemIndex: number,
    checkKey: keyof QCInspectionCheck,
    value: 'Pass' | 'Fail' | 'N/A',
  ) => {
    const updated = [...inspectionItems];
    if (!updated[itemIndex].qcChecks) {
      updated[itemIndex].qcChecks = {
        packagingCondition: 'Pass',
        productAppearance: 'Pass',
        quantityVerification: 'Pass',
        batchVerification: 'Pass',
        dateVerification: 'Pass',
        handlingTempCondition: 'Pass',
      };
    }
    updated[itemIndex].qcChecks![checkKey] = value;
    setInspectionItems(updated);
  };

  // Submit QC Result
  const handleSubmitInspection = () => {
    if (!selectedReceipt) return;

    for (const item of inspectionItems) {
      const sum = (item.qcAcceptedQty || 0) + (item.qcRejectedQty || 0) + (item.qcOnHoldQty || 0);
      if (sum !== item.receiveQty) {
        message.error(
          `Item ${item.code}: Accepted (${item.qcAcceptedQty}) + Rejected (${item.qcRejectedQty}) + Hold (${item.qcOnHoldQty}) must equal Actual Received (${item.receiveQty}).`,
        );
        return;
      }
      if (item.qcRejectedQty && item.qcRejectedQty > 0 && !item.qcRejectedReason?.trim()) {
        message.error(`Item ${item.code} has rejected qty. Rejection reason is required.`);
        return;
      }
      if (item.qcOnHoldQty && item.qcOnHoldQty > 0 && !item.qcOnHoldReason?.trim()) {
        message.error(`Item ${item.code} has hold qty. Hold reason is required.`);
        return;
      }
    }

    const hasRejections = inspectionItems.some((i) => (i.qcRejectedQty || 0) > 0);
    const hasHolds = inspectionItems.some((i) => (i.qcOnHoldQty || 0) > 0);
    let overallResult: QCResultStatus = 'Pass';
    if (hasRejections) overallResult = 'Fail';
    else if (hasHolds) overallResult = 'Conditional Pass';

    const updatedReceipt: GoodsReceipt = {
      ...selectedReceipt,
      items: inspectionItems,
      qcResult: overallResult,
      qcInspectedBy: 'QC Inspector (Me)',
      qcInspectionDate: dayjs().format('YYYY-MM-DD HH:mm'),
      qcNotes: overallQcRemark,
      deliveryPlanStatus: 'Pending Supervisor',
      processState: 'PENDING_SUPERVISOR_REVIEW',
      activities: [
        ...(selectedReceipt.activities || []),
        {
          id: `act-qc-${Date.now()}`,
          title: `QC Inspection: ${overallResult}`,
          description: `QC review finalized with result: ${overallResult}. Accepted: ${inspectionItems.reduce((s, i) => s + (i.qcAcceptedQty || 0), 0)}, Rejected: ${inspectionItems.reduce((s, i) => s + (i.qcRejectedQty || 0), 0)}, Hold: ${inspectionItems.reduce((s, i) => s + (i.qcOnHoldQty || 0), 0)}.`,
          performedBy: 'QC Inspector',
          timestamp: dayjs().format('YYYY-MM-DD HH:mm'),
          state: 'done',
        },
      ],
    };

    onSubmitQCReview(updatedReceipt);
    message.success(`QC Result (${overallResult}) submitted! GR ${updatedReceipt.grNumber} routed to Warehouse Supervisor.`);
    setIsInspectionModalOpen(false);
    setSelectedReceipt(updatedReceipt);
  };

  const handleExport = () => {
    message.success('Exporting QC Inspection Queue to Excel format...');
  };

  // QC Queue Columns
  const columns: ColumnsType<GoodsReceipt> = [
    {
      title: 'GR #',
      dataIndex: 'grNumber',
      key: 'grNumber',
      width: 130,
      render: (gr: string, record: GoodsReceipt) => (
        <span
          className="po-link"
          onClick={() => {
            setSelectedReceipt(record);
            setIsDetailDrawerOpen(true);
          }}
        >
          {gr || record.irPlanNumber}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'deliveryPlanStatus',
      key: 'status',
      width: 150,
      render: (status: string, record: GoodsReceipt) => {
        const s = status || 'Waiting for QC';
        let cls = 'waiting-qc';
        if (s === 'QC Completed' || record.qcResult === 'Pass') cls = 'completed';
        if (record.qcResult === 'Fail') cls = 'rejected';

        return <span className={`status-pill ${cls}`}>{s}</span>;
      },
    },
    {
      title: 'IR Plan #',
      dataIndex: 'irPlanNumber',
      key: 'irPlanNumber',
      width: 120,
      render: (ir: string, record: GoodsReceipt) => (
        <span
          className="po-link"
          onClick={() => {
            setSelectedReceipt(record);
            setIsDetailDrawerOpen(true);
          }}
        >
          {ir || '—'}
        </span>
      ),
    },
    {
      title: 'PO #',
      key: 'poNumber',
      width: 130,
      render: (_: any, record: GoodsReceipt) => (
        <span className="po-link">
          {record.poNumber}
        </span>
      ),
    },
    {
      title: 'Vendor',
      dataIndex: 'supplier',
      key: 'vendor',
      render: (sup: string) => <span className="vendor-name">{sup}</span>,
    },
    {
      title: 'Received Qty (WH)',
      key: 'whReceived',
      width: 160,
      render: (_: any, record: GoodsReceipt) => {
        const totalReceived = record.items.reduce((s, i) => s + (i.receiveQty || 0), 0);
        return (
          <div>
            <Text strong style={{ color: '#2563eb' }}>{totalReceived.toLocaleString()}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}> PCS ({record.items.length} items)</Text>
          </div>
        );
      },
    },
    {
      title: 'QC Partition (Acc / Rej / Hold)',
      key: 'qcPartition',
      width: 200,
      render: (_: any, record: GoodsReceipt) => {
        const acc = record.items.reduce((s, i) => s + (i.qcAcceptedQty || 0), 0);
        const rej = record.items.reduce((s, i) => s + (i.qcRejectedQty || 0), 0);
        const hold = record.items.reduce((s, i) => s + (i.qcOnHoldQty || 0), 0);

        if (record.deliveryPlanStatus === 'Waiting for QC' || record.processState === 'QC_PENDING') {
          return <Tag color="purple">Awaiting Inspection</Tag>;
        }

        return (
          <Space size={4}>
            <Tag color="green">Acc: {acc}</Tag>
            {rej > 0 && <Tag color="red">Rej: {rej}</Tag>}
            {hold > 0 && <Tag color="gold">Hold: {hold}</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'QC Result',
      key: 'qcResult',
      width: 120,
      render: (_: any, record: GoodsReceipt) => {
        if (!record.qcResult || record.deliveryPlanStatus === 'Waiting for QC') {
          return <Tag color="purple">Pending</Tag>;
        }
        return <InboundStatusBadge type="qc" value={record.qcResult} />;
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 140,
      render: (_: any, record: GoodsReceipt) => {
        const isPending = record.deliveryPlanStatus === 'Waiting for QC' || record.processState === 'QC_PENDING';
        return (
          <Space>
            {isPending ? (
              <Button
                size="small"
                type="primary"
                icon={<SafetyCertificateOutlined />}
                onClick={() => handleStartInspection(record)}
                style={{ background: '#722ed1', borderColor: '#722ed1', fontWeight: 500 }}
              >
                Inspect Goods
              </Button>
            ) : (
              <Button
                size="small"
                type="link"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedReceipt(record);
                  setIsDetailDrawerOpen(true);
                }}
              >
                View Result
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="procurement-workspace">
      {/* 1. Header Row */}
      <div className="workspace-header-row">
        <div className="header-titles" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <h1 className="main-title" style={{ margin: 0 }}>Quality Control & Inspection</h1>
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
            Inspect physically received shipments, record multi-parameter quality checks, and route approved partitions to Supervisor
          </p>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="summary-cards-row">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Awaiting QC</span>
            <div className="kpi-icon-badge purple">
              <SafetyCertificateOutlined />
            </div>
          </div>
          <div className="kpi-value purple">{tabCounts.pendingQC}</div>
          <div className="kpi-subtitle">Pending inspection</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">QC Passed</span>
            <div className="kpi-icon-badge green">
              <CheckCircleOutlined />
            </div>
          </div>
          <div className="kpi-value green">{tabCounts.passed}</div>
          <div className="kpi-subtitle">Accepted goods</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Rejected Goods</span>
            <div className="kpi-icon-badge orange">
              <CloseCircleOutlined />
            </div>
          </div>
          <div className="kpi-value orange">{tabCounts.rejected}</div>
          <div className="kpi-subtitle">Defective items</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Quarantine / Hold</span>
            <div className="kpi-icon-badge amber">
              <StopOutlined />
            </div>
          </div>
          <div className="kpi-value amber">{tabCounts.onHold}</div>
          <div className="kpi-subtitle">Requires retest</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Processed</span>
            <div className="kpi-icon-badge blue">
              <FileDoneOutlined />
            </div>
          </div>
          <div className="kpi-value blue">{tabCounts.all}</div>
          <div className="kpi-subtitle">All QC transactions</div>
        </div>
      </div>

      {/* 3. Single-Line Filter Toolbar Card with Title Labels */}
      <div className="filter-toolbar-card" style={{ padding: '12px 18px', background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 240px', minWidth: 200, maxWidth: 300 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Search</span>
            <Input
              placeholder="Search GR #, IR Plan, vendor..."
              prefix={<SearchOutlined style={{ color: '#9ca3af', marginRight: 4 }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              style={{ height: 36, borderRadius: 6 }}
            />
          </div>

          {/* QC Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 160 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>QC Status</span>
            <Select
              style={{ width: '100%', height: 36 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: 'All Status', value: 'ALL' },
                { label: 'Awaiting QC', value: 'PENDING' },
                { label: 'QC Passed', value: 'PASSED' },
                { label: 'QC Rejected', value: 'REJECTED' },
              ]}
            />
          </div>

          {/* Warehouse */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 170 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Warehouse</span>
            <Select
              style={{ width: '100%', height: 36 }}
              value={warehouseFilter}
              onChange={setWarehouseFilter}
              options={[
                { label: 'All Warehouses', value: 'ALL' },
                { label: 'WHM1 - Raw Materials', value: 'WHM1' },
                { label: 'WHM2 - Packaging', value: 'WHM2' },
                { label: 'WHM3 - Finished Goods', value: 'WHM3' },
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
          {(Boolean(searchTerm) || statusFilter !== 'ALL' || warehouseFilter !== 'ALL' || dateRange !== null) && (
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
              className={`tab-button ${activeTab === 'PENDING' ? 'active' : ''}`}
              onClick={() => setActiveTab('PENDING')}
            >
              <span>Awaiting QC</span>
              <span className="tab-count-badge">{tabCounts.pendingQC}</span>
            </button>

            <button
              className={`tab-button ${activeTab === 'PASSED' ? 'active' : ''}`}
              onClick={() => setActiveTab('PASSED')}
            >
              <span>QC Passed</span>
              <span className="tab-count-badge">{tabCounts.passed}</span>
            </button>

            <button
              className={`tab-button ${activeTab === 'REJECTED_HOLD' ? 'active' : ''}`}
              onClick={() => setActiveTab('REJECTED_HOLD')}
            >
              <span>Rejected / Hold</span>
              <span className="tab-count-badge">{tabCounts.rejected + tabCounts.onHold}</span>
            </button>

            <button
              className={`tab-button ${activeTab === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveTab('ALL')}
            >
              <span>All QC Records</span>
              <span className="tab-count-badge">{tabCounts.all}</span>
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

        {/* Table View */}
        <Table
          columns={columns}
          dataSource={filteredReceipts}
          rowKey="grNumber"
          pagination={{ pageSize: 8, showTotal: (t) => `Total ${t} items` }}
          className="po-custom-table"
        />
      </div>

      {/* 5. Detail / QC Inspection Drawer (920px) */}
      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
            <Space size={10}>
              <SafetyCertificateOutlined style={{ color: '#722ed1', fontSize: 18 }} />
              <span style={{ fontWeight: 700, fontSize: 16 }}>
                QC Inspection Details: {selectedReceipt?.grNumber}
              </span>
            </Space>
            {selectedReceipt && <InboundStatusBadge type="qc" value={selectedReceipt.qcResult || 'Pending'} />}
          </div>
        }
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        width={920}
        styles={{ body: { padding: '20px 24px', background: '#f8fafc' } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Quality Control Inspection Record • Linked to GR {selectedReceipt?.grNumber}
            </Text>
            <Space size={12}>
              <Button onClick={() => setIsDetailDrawerOpen(false)}>Close</Button>
              {selectedReceipt && (selectedReceipt.deliveryPlanStatus === 'Waiting for QC' || !selectedReceipt.qcResult) && (
                <Button
                  type="primary"
                  icon={<SafetyCertificateOutlined />}
                  onClick={() => {
                    setIsDetailDrawerOpen(false);
                    handleStartInspection(selectedReceipt);
                  }}
                  style={{ background: '#722ed1', borderColor: '#722ed1', fontWeight: 600 }}
                >
                  Conduct QC Inspection
                </Button>
              )}
            </Space>
          </div>
        }
      >
        {(() => {
          if (!selectedReceipt) return null;

          const totalReceivedQty = selectedReceipt.items.reduce((s, i) => s + (i.receiveQty || 0), 0);
          const totalAcceptedQty = selectedReceipt.items.reduce((s, i) => s + (i.qcAcceptedQty || 0), 0);
          const totalRejectedQty = selectedReceipt.items.reduce((s, i) => s + (i.qcRejectedQty || 0), 0);
          const totalOnHoldQty = selectedReceipt.items.reduce((s, i) => s + (i.qcOnHoldQty || 0), 0);
          const passRate = totalReceivedQty > 0 ? Math.min(100, Math.round((totalAcceptedQty / totalReceivedQty) * 1000) / 10) : 0;

          return (
            <div className="detail-drawer-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Dynamic QC Progress Banner */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e9d5ff',
                  borderRadius: 12,
                  padding: '16px 20px',
                  boxShadow: '0 1px 3px rgba(114, 46, 209, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SafetyCertificateOutlined style={{ color: '#722ed1', fontSize: 16 }} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#581c87' }}>
                      QC Inspection Verification & Disposition
                    </span>
                  </div>
                  <Tag color={selectedReceipt.qcResult === 'Pass' ? 'green' : selectedReceipt.qcResult === 'Fail' ? 'red' : 'purple'} style={{ fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 12 }}>
                    {selectedReceipt.qcResult ? `QC ${selectedReceipt.qcResult} (${passRate}%)` : 'Pending Inspection'}
                  </Tag>
                </div>

                <Progress
                  percent={passRate}
                  strokeColor="#722ed1"
                  trailColor="#e2e8f0"
                  status={selectedReceipt.qcResult === 'Fail' ? 'exception' : 'active'}
                  style={{ marginBottom: 12 }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>WH Received</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{totalReceivedQty.toLocaleString()} Units</div>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 500 }}>Accepted Qty</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#16a34a' }}>{totalAcceptedQty.toLocaleString()} Units</div>
                  </div>
                  <div style={{ background: totalRejectedQty > 0 ? '#fef2f2' : '#f8fafc', padding: '10px 12px', borderRadius: 8, border: totalRejectedQty > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, color: totalRejectedQty > 0 ? '#dc2626' : '#64748b', fontWeight: 500 }}>Rejected Qty</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: totalRejectedQty > 0 ? '#dc2626' : '#0f172a' }}>{totalRejectedQty.toLocaleString()} Units</div>
                  </div>
                  <div style={{ background: totalOnHoldQty > 0 ? '#fefce8' : '#f8fafc', padding: '10px 12px', borderRadius: 8, border: totalOnHoldQty > 0 ? '1px solid #fef08a' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, color: totalOnHoldQty > 0 ? '#854d0e' : '#64748b', fontWeight: 500 }}>On Hold Qty</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: totalOnHoldQty > 0 ? '#ca8504' : '#0f172a' }}>{totalOnHoldQty.toLocaleString()} Units</div>
                  </div>
                </div>
              </div>

              {/* 1. Exact Figma Inspection Details Card */}
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
                  QC Inspection & Logistics Header
                </div>
                <div className="po-grid-container" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Row 1: GR # vs IR Plan # */}
                  <div className="po-grid-row" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <div className="label-value-pair" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span className="field-label" style={{ width: 140, fontSize: 13, fontWeight: 500, color: '#6b7280', flexShrink: 0 }}>
                        Goods Receipt #
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span className="field-value" style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.85)' }}>
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
                      <span className="field-value po-link" style={{ fontSize: 14, fontWeight: 600, color: '#2563eb' }}>
                        {selectedReceipt.irPlanNumber}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Vendor vs Delivery Note */}
                  <div className="po-grid-row" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <div className="label-value-pair" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span className="field-label" style={{ width: 140, fontSize: 13, fontWeight: 500, color: '#6b7280', flexShrink: 0 }}>
                        Vendor / Supplier
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span className="field-value" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>
                        {selectedReceipt.supplier}
                      </span>
                    </div>
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
                  </div>

                  {/* Row 3: QC Inspector vs Inspection Date */}
                  <div className="po-grid-row" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <div className="label-value-pair" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span className="field-label" style={{ width: 140, fontSize: 13, fontWeight: 500, color: '#6b7280', flexShrink: 0 }}>
                        QC Inspector
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span className="field-value" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>
                        {selectedReceipt.qcInspectedBy || 'QC Inspector (Chantrea)'}
                      </span>
                    </div>
                    <div className="label-value-pair" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span className="field-label" style={{ width: 140, fontSize: 13, fontWeight: 500, color: '#6b7280', flexShrink: 0 }}>
                        Inspection Date
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span className="field-value" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>
                        {selectedReceipt.qcInspectionDate || selectedReceipt.expectedDate || '2026-08-27'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Line Items & Inspection Disposition Breakdown */}
              <div
                className="drawer-section"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '16px 20px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
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
                  <SafetyCertificateOutlined style={{ color: '#722ed1' }} />
                  <span>Inspection Line Items & Disposition Breakdown ({selectedReceipt.items.length})</span>
                </div>
                <Table
                  size="small"
                  dataSource={selectedReceipt.items}
                  rowKey="code"
                  pagination={false}
                  className="po-custom-table"
                  columns={[
                    { title: 'Item Code', dataIndex: 'code', key: 'code', width: 120, render: (c) => <Text strong style={{ color: '#2563eb' }}>{c}</Text> },
                    { title: 'Item Name', dataIndex: 'name', key: 'name', render: (n) => <span style={{ fontWeight: 500 }}>{n}</span> },
                    { title: 'WH Received', dataIndex: 'receiveQty', key: 'receiveQty', width: 120, render: (q, r) => `${(q || 0).toLocaleString()} ${r.uom}` },
                    { title: 'Accepted', dataIndex: 'qcAcceptedQty', key: 'qcAcceptedQty', width: 110, render: (q, r) => <Tag color="green">{(q || 0).toLocaleString()} {r.uom}</Tag> },
                    { title: 'Rejected', dataIndex: 'qcRejectedQty', key: 'qcRejectedQty', width: 110, render: (q, r) => <Tag color={q > 0 ? 'red' : 'default'}>{(q || 0).toLocaleString()} {r.uom}</Tag> },
                    { title: 'On Hold', dataIndex: 'qcOnHoldQty', key: 'qcOnHoldQty', width: 110, render: (q, r) => <Tag color={q > 0 ? 'gold' : 'default'}>{(q || 0).toLocaleString()} {r.uom}</Tag> },
                    { title: 'Result', dataIndex: 'qcResult', key: 'qcResult', width: 110, render: (r) => <InboundStatusBadge type="qc" value={r || 'Pass'} /> },
                  ]}
                />
              </div>

              {/* 3. Audit Trail Card */}
              <div
                className="drawer-section"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '16px 20px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
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
                  <ClockCircleOutlined style={{ color: '#2563eb' }} />
                  <span>Audit Trail & Activity Log</span>
                </div>
                <AuditTrailTimeline
                  activities={selectedReceipt.activities}
                  adjustments={selectedReceipt.supervisorAdjustments}
                />
              </div>
            </div>
          );
        })()}
      </Drawer>

      {/* QC-03 Multi-Parameter Inspection Modal */}
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#722ed1', fontSize: 18 }} />
            <span style={{ fontWeight: 600 }}>QC Inspection: {selectedReceipt?.grNumber} ({selectedReceipt?.supplier})</span>
          </Space>
        }
        open={isInspectionModalOpen}
        onCancel={() => setIsInspectionModalOpen(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setIsInspectionModalOpen(false)}>Cancel</Button>,
          <Button
            key="submit"
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmitInspection}
            style={{ background: '#722ed1', borderColor: '#722ed1' }}
          >
            Submit QC Decision & Route to Supervisor
          </Button>,
        ]}
      >
        <Alert
          message="Quality Control Checklist & Partition Rules"
          description="Warehouse physically accepted the shipment. QC determines the usable balance by splitting Received QTY into Accepted, Rejected, and On-Hold."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {inspectionItems.map((item, itemIdx) => {
          const checks = item.qcChecks || {
            packagingCondition: 'Pass',
            productAppearance: 'Pass',
            quantityVerification: 'Pass',
            batchVerification: 'Pass',
            dateVerification: 'Pass',
            handlingTempCondition: 'Pass',
          };
          const totalPartition = (item.qcAcceptedQty || 0) + (item.qcRejectedQty || 0) + (item.qcOnHoldQty || 0);
          const isMatched = totalPartition === item.receiveQty;

          return (
            <div
              key={item.code}
              style={{
                background: '#ffffff',
                border: !isMatched ? '1px solid #dc2626' : '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Row gutter={[16, 8]} align="middle" justify="space-between">
                <Col xs={24} md={10}>
                  <Space direction="vertical" size={2}>
                    <Space>
                      <Tag color="cyan">PO: {item.poNumber}</Tag>
                      <Text strong style={{ fontSize: 14, color: '#2563eb' }}>{item.code}</Text>
                    </Space>
                    <Text style={{ fontSize: 13, color: '#1e293b' }}>{item.name}</Text>
                  </Space>
                </Col>

                <Col xs={24} md={14} style={{ textAlign: 'right' }}>
                  <Space wrap size={12}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>WH Received</Text>
                      <Text strong>{item.receiveQty} {item.uom}</Text>
                    </div>

                    <div>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', color: '#16a34a' }}>Accepted</Text>
                      <InputNumber
                        min={0}
                        max={item.receiveQty}
                        value={item.qcAcceptedQty}
                        onChange={(val) => handleUpdatePartition(itemIdx, 'qcAcceptedQty', val || 0)}
                        style={{ width: 85, height: 32 }}
                      />
                    </div>

                    <div>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', color: '#dc2626' }}>Rejected</Text>
                      <InputNumber
                        min={0}
                        max={item.receiveQty}
                        value={item.qcRejectedQty}
                        onChange={(val) => handleUpdatePartition(itemIdx, 'qcRejectedQty', val || 0)}
                        style={{ width: 85, height: 32 }}
                      />
                    </div>

                    <div>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', color: '#d97706' }}>On Hold</Text>
                      <InputNumber
                        min={0}
                        max={item.receiveQty}
                        value={item.qcOnHoldQty}
                        onChange={(val) => handleUpdatePartition(itemIdx, 'qcOnHoldQty', val || 0)}
                        style={{ width: 85, height: 32 }}
                      />
                    </div>

                    <div>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Validation</Text>
                      <Tag color={isMatched ? 'green' : 'red'}>
                        {totalPartition}/{item.receiveQty} {isMatched ? 'Matched' : 'Unmatched'}
                      </Tag>
                    </div>
                  </Space>
                </Col>
              </Row>

              {/* 6-Point Inspection Checklist */}
              <div style={{ marginTop: 12, background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #f1f5f9' }}>
                <Text strong style={{ fontSize: 12, color: '#475569', display: 'block', marginBottom: 8 }}>
                  6-Point Physical Quality Checks
                </Text>
                <Row gutter={[12, 8]}>
                  {[
                    { key: 'packagingCondition', label: '1. Packaging Condition' },
                    { key: 'productAppearance', label: '2. Product Appearance' },
                    { key: 'quantityVerification', label: '3. Quantity Verification' },
                    { key: 'batchVerification', label: '4. Batch & Lot No.' },
                    { key: 'dateVerification', label: '5. Date (Mfg/Exp)' },
                    { key: 'handlingTempCondition', label: '6. Storage Temp & Seal' },
                  ].map((chk) => (
                    <Col xs={12} sm={8} md={4} key={chk.key}>
                      <Text style={{ fontSize: 11, display: 'block', color: '#64748b' }}>{chk.label}</Text>
                      <Select
                        size="small"
                        style={{ width: '100%', marginTop: 2 }}
                        value={(checks as any)[chk.key] || 'Pass'}
                        onChange={(v) => handleUpdateCheck(itemIdx, chk.key as any, v)}
                        options={[
                          { label: 'Pass', value: 'Pass' },
                          { label: 'Fail', value: 'Fail' },
                          { label: 'N/A', value: 'N/A' },
                        ]}
                      />
                    </Col>
                  ))}
                </Row>
              </div>

              {/* Rejection / Hold Reasons */}
              {(item.qcRejectedQty || 0) > 0 && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef2f2', borderRadius: 6, border: '1px solid #fee2e2' }}>
                  <Text strong style={{ color: '#dc2626', fontSize: 12 }}>Rejection Reason *</Text>
                  <Input
                    placeholder="Describe defect e.g. Torn bag, foreign contamination, label unreadable"
                    value={item.qcRejectedReason}
                    onChange={(e) => {
                      const updated = [...inspectionItems];
                      updated[itemIdx].qcRejectedReason = e.target.value;
                      setInspectionItems(updated);
                    }}
                    style={{ marginTop: 4, height: 32 }}
                  />
                </div>
              )}

              {(item.qcOnHoldQty || 0) > 0 && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: '#fffbeb', borderRadius: 6, border: '1px solid #fef3c7' }}>
                  <Text strong style={{ color: '#d97706', fontSize: 12 }}>Quarantine / Hold Reason *</Text>
                  <Input
                    placeholder="Describe reason e.g. Awaiting lab microbiology test results (48h incubation)"
                    value={item.qcOnHoldReason}
                    onChange={(e) => {
                      const updated = [...inspectionItems];
                      updated[itemIdx].qcOnHoldReason = e.target.value;
                      setInspectionItems(updated);
                    }}
                    style={{ marginTop: 4, height: 32 }}
                  />
                </div>
              )}
            </div>
          );
        })}

        <div style={{ marginTop: 12 }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
            Overall QC Summary Remarks
          </Text>
          <Input.TextArea
            rows={2}
            value={overallQcRemark}
            onChange={(e) => setOverallQcRemark(e.target.value)}
            placeholder="Optional summary remarks for Warehouse Supervisor"
          />
        </div>
      </Modal>
    </div>
  );
};
