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
  InputNumber,
  Row,
  Col,
  Alert,
  Divider,
  Statistic,
  message,
  Tooltip,
  DatePicker,
  Progress,
} from 'antd';
import {
  AuditOutlined,
  CheckCircleOutlined,
  RollbackOutlined,
  SendOutlined,
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  CloudSyncOutlined,
  HistoryOutlined,
  ExportOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  FileDoneOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type {
  GoodsReceipt,
  GRItem,
  SupervisorAdjustmentAudit,
  SupervisorDecision,
  SapPostingStatus,
} from '../core/type';
import { InboundStatusBadge } from '../features/shared/InboundStatusBadge';
import { AuditTrailTimeline } from '../features/shared/AuditTrailTimeline';
import './ProcurementWorkspace.less';

const { Text } = Typography;
const { RangePicker } = DatePicker;

export interface SupervisorWorkspaceProps {
  receipts: GoodsReceipt[];
  onApproveAndPostSAP: (gr: GoodsReceipt) => void;
  onSendBack: (gr: GoodsReceipt, target: 'WAREHOUSE' | 'QC', reason: string) => void;
  onAdjustGR: (gr: GoodsReceipt, adjustment: SupervisorAdjustmentAudit) => void;
  onRetrySAPPosting: (gr: GoodsReceipt) => void;
  onManualSAPSync: (gr: GoodsReceipt, sapDocNum: string) => void;
  onRefresh: () => void;
  onNavigateToRole?: (role: 'PROCUREMENT' | 'WAREHOUSE' | 'QC' | 'SUPERVISOR' | 'AUDIT_TIMELINE') => void;
}

export const SupervisorWorkspace: React.FC<SupervisorWorkspaceProps> = ({
  receipts,
  onApproveAndPostSAP,
  onSendBack,
  onAdjustGR,
  onRetrySAPPosting,
  onManualSAPSync,
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
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);
  const [isSendBackModalOpen, setIsSendBackModalOpen] = useState<boolean>(false);
  const [isManualSyncModalOpen, setIsManualSyncModalOpen] = useState<boolean>(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(false);

  // Forms
  const [adjustForm] = Form.useForm();
  const [sendBackForm] = Form.useForm();
  const [syncForm] = Form.useForm();
  const [targetAdjustItem, setTargetAdjustItem] = useState<GRItem | null>(null);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: receipts.length,
      pending: receipts.filter((r) => r.deliveryPlanStatus === 'Pending Supervisor' || r.processState === 'PENDING_SUPERVISOR_REVIEW').length,
      posted: receipts.filter((r) => r.deliveryPlanStatus === 'Posted' || r.processState === 'SAP_POSTED').length,
      failed: receipts.filter((r) => r.sapPostingStatus === 'Posting Failed' || r.processState === 'SAP_POSTING_FAILED').length,
      adjusted: receipts.filter((r) => (r.supervisorAdjustments && r.supervisorAdjustments.length > 0) || r.processState === 'SUPERVISOR_ADJUSTED').length,
    };
  }, [receipts]);

  // Filter receipts for Supervisor Queue
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      // 1. Tab Filter
      if (activeTab === 'PENDING' && !(r.deliveryPlanStatus === 'Pending Supervisor' || r.processState === 'PENDING_SUPERVISOR_REVIEW' || r.processState === 'SAP_POSTING_FAILED')) {
        return false;
      }
      if (activeTab === 'POSTED' && !(r.deliveryPlanStatus === 'Posted' || r.processState === 'SAP_POSTED')) {
        return false;
      }
      if (activeTab === 'FAILED' && !(r.sapPostingStatus === 'Posting Failed' || r.processState === 'SAP_POSTING_FAILED')) {
        return false;
      }

      // 2. Status Dropdown Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'PENDING' && !(r.deliveryPlanStatus === 'Pending Supervisor' || r.processState === 'PENDING_SUPERVISOR_REVIEW')) {
          return false;
        }
        if (statusFilter === 'POSTED' && !(r.deliveryPlanStatus === 'Posted' || r.processState === 'SAP_POSTED')) {
          return false;
        }
        if (statusFilter === 'FAILED' && !(r.sapPostingStatus === 'Posting Failed' || r.processState === 'SAP_POSTING_FAILED')) {
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
        const matchesPO = r.poNumber?.toLowerCase().includes(q);
        const matchesSAP = r.sapDocNum?.toLowerCase().includes(q);
        const matchesDN = r.deliveryNoteNumber?.toLowerCase().includes(q);
        const matchesItem = r.items?.some(
          (it) =>
            it.code.toLowerCase().includes(q) ||
            it.name.toLowerCase().includes(q) ||
            it.batches?.some((b) => b.batchNumber?.toLowerCase().includes(q)),
        );
        if (!matchesGR && !matchesIR && !matchesSupplier && !matchesPO && !matchesSAP && !matchesDN && !matchesItem) {
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

  // Open SV-02 Comparison Matrix Review
  const handleOpenReview = (receipt: GoodsReceipt) => {
    setSelectedReceipt(receipt);
    setIsReviewModalOpen(true);
  };

  // Open SV-03 Adjust Quantity Modal
  const handleOpenAdjust = (item: GRItem) => {
    setTargetAdjustItem(item);
    adjustForm.setFieldsValue({
      previousValue: item.finalGrQty !== undefined ? item.finalGrQty : (item.qcAcceptedQty || item.receiveQty),
      newValue: item.finalGrQty !== undefined ? item.finalGrQty : (item.qcAcceptedQty || item.receiveQty),
      reason: '',
    });
    setIsAdjustModalOpen(true);
  };

  // Save Quantity Adjustment with mandatory audit log
  const handleConfirmAdjust = () => {
    if (!selectedReceipt || !targetAdjustItem) return;

    adjustForm.validateFields().then((vals) => {
      const newAudit: SupervisorAdjustmentAudit = {
        id: `adj-${Date.now()}`,
        itemCode: targetAdjustItem.code,
        itemName: targetAdjustItem.name,
        fieldName: 'Final GR Quantity',
        previousValue: vals.previousValue,
        newValue: vals.newValue,
        changedBy: 'Vannak Heng (WH Supervisor)',
        timestamp: dayjs().format('YYYY-MM-DD HH:mm'),
        reason: vals.reason,
      };

      const updatedItems = selectedReceipt.items.map((i) => {
        if (i.code === targetAdjustItem.code) {
          return { ...i, finalGrQty: vals.newValue };
        }
        return i;
      });

      const updatedReceipt: GoodsReceipt = {
        ...selectedReceipt,
        items: updatedItems,
        supervisorAdjustments: [...(selectedReceipt.supervisorAdjustments || []), newAudit],
      };

      onAdjustGR(updatedReceipt, newAudit);
      message.success(`Quantity for ${targetAdjustItem.code} adjusted to ${vals.newValue}. Audit log updated.`);
      setIsAdjustModalOpen(false);
      setSelectedReceipt(updatedReceipt);
    });
  };

  // Handle Send Back (SV-04)
  const handleConfirmSendBack = () => {
    if (!selectedReceipt) return;

    sendBackForm.validateFields().then((vals) => {
      const target = vals.target as 'WAREHOUSE' | 'QC';
      const reason = vals.reason;

      const updatedReceipt: GoodsReceipt = {
        ...selectedReceipt,
        deliveryPlanStatus: target === 'WAREHOUSE' ? 'In Progress' : 'Waiting for QC',
        processState: target === 'WAREHOUSE' ? 'SENT_BACK_TO_WH' : 'SENT_BACK_TO_QC',
        displayStatus: `Sent Back to ${target === 'WAREHOUSE' ? 'Warehouse' : 'QC'}`,
        sendBackTarget: target,
        sendBackReason: reason,
        activities: [
          ...(selectedReceipt.activities || []),
          {
            id: `act-sb-${Date.now()}`,
            title: `Supervisor Sent Back to ${target === 'WAREHOUSE' ? 'Warehouse' : 'QC'}`,
            description: `Reason: ${reason}`,
            performedBy: 'Vannak Heng (WH Supervisor)',
            timestamp: dayjs().format('YYYY-MM-DD HH:mm'),
            state: 'done',
          },
        ],
      };

      onSendBack(updatedReceipt, target, reason);
      message.warning(`GR ${updatedReceipt.grNumber} returned to ${target === 'WAREHOUSE' ? 'Warehouse' : 'QC'} for re-verification.`);
      setIsSendBackModalOpen(false);
      setIsReviewModalOpen(false);
    });
  };

  // Approve & Post to SAP
  const handleConfirmApproveAndPost = () => {
    if (!selectedReceipt) return;

    const updatedReceipt: GoodsReceipt = {
      ...selectedReceipt,
      deliveryPlanStatus: 'Posted',
      processState: 'SAP_POSTED',
      sapPostingStatus: 'Posted',
      sapDocNum: `SAP-GRPO-${Math.floor(100000 + Math.random() * 900000)}`,
      postingDate: dayjs().format('YYYY-MM-DD HH:mm'),
      activities: [
        ...(selectedReceipt.activities || []),
        {
          id: `act-post-${Date.now()}`,
          title: 'Supervisor Approved & Posted to SAP',
          description: `GRPO document posted to SAP Business One.`,
          performedBy: 'Vannak Heng (WH Supervisor)',
          timestamp: dayjs().format('YYYY-MM-DD HH:mm'),
          state: 'done',
        },
      ],
    };

    onApproveAndPostSAP(updatedReceipt);
    message.success(`GR ${updatedReceipt.grNumber} approved! Posted to SAP as DocNum ${updatedReceipt.sapDocNum}.`);
    setIsReviewModalOpen(false);
  };

  // Handle Manual SAP Sync
  const handleConfirmManualSync = () => {
    if (!selectedReceipt) return;

    syncForm.validateFields().then((vals) => {
      onManualSAPSync(selectedReceipt, vals.sapDocNum);
      message.success(`GR ${selectedReceipt.grNumber} linked to SAP DocNum: ${vals.sapDocNum}`);
      setIsManualSyncModalOpen(false);
      setIsReviewModalOpen(false);
    });
  };

  const handleExport = () => {
    message.success('Exporting Supervisor Inbound Audit to Excel format...');
  };

  // Supervisor Columns
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
      width: 165,
      render: (status: string, record: GoodsReceipt) => {
        const s = status || 'Pending Supervisor';
        let cls = 'open';
        if (s === 'Pending Supervisor') cls = 'in-progress';
        if (s === 'Posted') cls = 'completed';
        if (record.sapPostingStatus === 'Posting Failed') cls = 'rejected';

        return <span className={`status-pill ${cls}`}>{s}</span>;
      },
    },
    {
      title: 'SAP Doc #',
      key: 'sapDoc',
      width: 140,
      render: (_: any, record: GoodsReceipt) => {
        if (record.sapDocNum) {
          return <Tag color="green">{record.sapDocNum}</Tag>;
        }
        if (record.sapPostingStatus === 'Posting Failed') {
          return <Tag color="red">Failed</Tag>;
        }
        return <Tag color="gold">Pending Post</Tag>;
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
      title: 'Received vs Accepted',
      key: 'qtyComparison',
      width: 160,
      render: (_: any, record: GoodsReceipt) => {
        const received = record.items.reduce((s, i) => s + (i.receiveQty || 0), 0);
        const accepted = record.items.reduce((s, i) => s + (i.qcAcceptedQty || i.receiveQty || 0), 0);

        return (
          <div>
            <Text strong style={{ color: '#16a34a' }}>{accepted.toLocaleString()}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}> / {received.toLocaleString()} PCS</Text>
          </div>
        );
      },
    },
    {
      title: 'Adjustments',
      key: 'adjustments',
      width: 120,
      render: (_: any, record: GoodsReceipt) => {
        const count = record.supervisorAdjustments?.length || 0;
        if (count > 0) {
          return <Tag color="warning">{count} Adjusted</Tag>;
        }
        return <span style={{ color: '#94a3b8' }}>None</span>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 140,
      render: (_: any, record: GoodsReceipt) => {
        const isPending = record.deliveryPlanStatus === 'Pending Supervisor' || record.processState === 'PENDING_SUPERVISOR_REVIEW';
        const isFailed = record.sapPostingStatus === 'Posting Failed' || record.processState === 'SAP_POSTING_FAILED';

        return (
          <Space>
            {isPending ? (
              <Button
                size="small"
                type="primary"
                icon={<SendOutlined />}
                onClick={() => handleOpenReview(record)}
                style={{ background: '#16a34a', borderColor: '#16a34a', fontWeight: 500 }}
              >
                Review & Post
              </Button>
            ) : isFailed ? (
              <Button
                size="small"
                danger
                icon={<RollbackOutlined />}
                onClick={() => onRetrySAPPosting(record)}
              >
                Retry SAP
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
                View Audit
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
            <h1 className="main-title" style={{ margin: 0 }}>Supervisor Inbound Audit & SAP Posting</h1>
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
            Review verified shipments, manage quantity adjustments with audit trail, and authorize direct SAP Goods Receipt PO postings
          </p>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="summary-cards-row">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Pending Final Approval</span>
            <div className="kpi-icon-badge blue">
              <AuditOutlined />
            </div>
          </div>
          <div className="kpi-value blue">{tabCounts.pending}</div>
          <div className="kpi-subtitle">Ready for SAP post</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Posted to SAP</span>
            <div className="kpi-icon-badge green">
              <CheckCircleOutlined />
            </div>
          </div>
          <div className="kpi-value green">{tabCounts.posted}</div>
          <div className="kpi-subtitle">Synced with SAP B1</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Posting Exceptions</span>
            <div className="kpi-icon-badge orange">
              <ExclamationCircleOutlined />
            </div>
          </div>
          <div className="kpi-value orange">{tabCounts.failed}</div>
          <div className="kpi-subtitle">SAP error queue</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Adjusted Records</span>
            <div className="kpi-icon-badge amber">
              <EditOutlined />
            </div>
          </div>
          <div className="kpi-value amber">{tabCounts.adjusted}</div>
          <div className="kpi-subtitle">With audit reasons</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Processed</span>
            <div className="kpi-icon-badge purple">
              <HistoryOutlined />
            </div>
          </div>
          <div className="kpi-value purple">{tabCounts.all}</div>
          <div className="kpi-subtitle">All supervisor logs</div>
        </div>
      </div>

      {/* 3. Single-Line Filter Toolbar Card with Title Labels */}
      <div className="filter-toolbar-card" style={{ padding: '12px 18px', background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 240px', minWidth: 200, maxWidth: 300 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Search</span>
            <Input
              placeholder="Search GR #, PO #, vendor, SAP..."
              prefix={<SearchOutlined style={{ color: '#9ca3af', marginRight: 4 }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              style={{ height: 36, borderRadius: 6 }}
            />
          </div>

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 170 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Status</span>
            <Select
              style={{ width: '100%', height: 36 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: 'All Status', value: 'ALL' },
                { label: 'Pending Approval', value: 'PENDING' },
                { label: 'Posted to SAP', value: 'POSTED' },
                { label: 'Posting Exceptions', value: 'FAILED' },
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
              <span>Pending Review</span>
              <span className="tab-count-badge">{tabCounts.pending}</span>
            </button>

            <button
              className={`tab-button ${activeTab === 'POSTED' ? 'active' : ''}`}
              onClick={() => setActiveTab('POSTED')}
            >
              <span>SAP Posted</span>
              <span className="tab-count-badge">{tabCounts.posted}</span>
            </button>

            <button
              className={`tab-button ${activeTab === 'FAILED' ? 'active' : ''}`}
              onClick={() => setActiveTab('FAILED')}
            >
              <span>Posting Exceptions</span>
              <span className="tab-count-badge">{tabCounts.failed}</span>
            </button>

            <button
              className={`tab-button ${activeTab === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveTab('ALL')}
            >
              <span>All Records</span>
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

      {/* 5. Detail Drawer (920px) */}
      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
            <Space size={10}>
              <AuditOutlined style={{ color: '#16a34a', fontSize: 18 }} />
              <span style={{ fontWeight: 700, fontSize: 16 }}>
                Supervisor Inbound Audit: {selectedReceipt?.grNumber}
              </span>
            </Space>
            {selectedReceipt && (
              <InboundStatusBadge type="deliveryPlan" value={selectedReceipt.deliveryPlanStatus || 'Pending Supervisor'} />
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
                Supervisor Verification & SAP B1 Direct Posting Matrix
              </Text>
              <Space size={12}>
                <Button onClick={() => setIsDetailDrawerOpen(false)}>Close</Button>
                {selectedReceipt.sapPostingStatus !== 'Posted' && (
                  <Button
                    type="primary"
                    icon={<AuditOutlined />}
                    onClick={() => {
                      setIsDetailDrawerOpen(false);
                      handleOpenReview(selectedReceipt);
                    }}
                    style={{ background: '#16a34a', borderColor: '#16a34a', fontWeight: 600 }}
                  >
                    Review & Post to SAP (SV-02)
                  </Button>
                )}
              </Space>
            </div>
          )
        }
      >
        {selectedReceipt && (() => {
          const totalPlanned = selectedReceipt.items?.reduce((s, i) => s + (i.plannedQty || i.poQty || 0), 0) || 0;
          const totalReceived = selectedReceipt.items?.reduce((s, i) => s + (i.receiveQty || 0), 0) || 0;
          const totalQcAccepted = selectedReceipt.items?.reduce((s, i) => s + (i.qcAcceptedQty || 0), 0) || 0;
          const totalFinalGr = selectedReceipt.items?.reduce((s, i) => s + (i.finalGrQty !== undefined ? i.finalGrQty : (i.qcAcceptedQty || i.receiveQty || 0)), 0) || 0;
          const approvalPercent = totalReceived > 0 ? Math.min(100, Math.round((totalFinalGr / totalReceived) * 1000) / 10) : 100;

          return (
            <div className="detail-drawer-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Top Supervisor Review & SAP Posting Banner */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #bbf7d0',
                  borderRadius: 12,
                  padding: '16px 20px',
                  boxShadow: '0 1px 3px rgba(22, 163, 74, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircleOutlined style={{ color: '#16a34a', fontSize: 16 }} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#14532d' }}>
                      Supervisor Audit & Reconciliation Status
                    </span>
                  </div>
                  <Tag
                    color={selectedReceipt.sapPostingStatus === 'Posted' ? 'success' : 'warning'}
                    style={{ fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 12 }}
                  >
                    {selectedReceipt.sapPostingStatus === 'Posted' ? 'SAP Posted' : `Approval Rate: ${approvalPercent}%`}
                  </Tag>
                </div>

                <Progress
                  percent={approvalPercent}
                  strokeColor="#16a34a"
                  trailColor="#e2e8f0"
                  status={selectedReceipt.sapPostingStatus === 'Posted' ? 'normal' : 'active'}
                  style={{ marginBottom: 12 }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Planned Qty</div>
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
                    <div style={{ fontSize: 11, color: '#854d0e', fontWeight: 500 }}>Final Approved GR</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#ca8504' }}>{totalFinalGr.toLocaleString()} Units</div>
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
                  Supervisor Receipt & SAP Audit Details
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
                        SAP PO #
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
                        {selectedReceipt.sapDocNum || 'Pending Posting'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 6-Quantity Breakdown Table */}
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
                  <span>6-Quantity Breakdown per Item ({selectedReceipt.items?.length || 0})</span>
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
                    { title: 'PO Qty', key: 'poQty', render: (_, r) => `${r.poQty || r.plannedQty} ${r.uom}` },
                    { title: 'Planned', key: 'planned', render: (_, r) => `${r.plannedQty || r.poQty} ${r.uom}` },
                    { title: 'WH Received', dataIndex: 'receiveQty', key: 'receiveQty', render: (q, r) => `${q} ${r.uom}` },
                    { title: 'QC Accepted', dataIndex: 'qcAcceptedQty', key: 'qcAcceptedQty', render: (q, r) => <Tag color="green">{q || 0} {r.uom}</Tag> },
                    { title: 'Final GR Qty', key: 'final', render: (_, r) => <Text strong style={{ color: '#0f172a' }}>{r.finalGrQty !== undefined ? r.finalGrQty : (r.qcAcceptedQty || r.receiveQty)} {r.uom}</Text> },
                  ]}
                />
              </div>

              {/* 3. Supervisor Adjustment History & Audit Trail */}
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
                  <HistoryOutlined style={{ color: '#2563eb' }} />
                  <span>Supervisor Adjustment History & Audit Trail</span>
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

      {/* SV-02 Comparison Matrix & Action Modal */}
      <Modal
        title={
          <Space>
            <AuditOutlined style={{ color: '#16a34a', fontSize: 18 }} />
            <span style={{ fontWeight: 600 }}>Supervisor Review & SAP Posting: {selectedReceipt?.grNumber}</span>
          </Space>
        }
        open={isReviewModalOpen}
        onCancel={() => setIsReviewModalOpen(false)}
        width={1000}
        footer={[
          <Button
            key="sendBack"
            danger
            icon={<RollbackOutlined />}
            onClick={() => setIsSendBackModalOpen(true)}
          >
            Send Back to WH / QC
          </Button>,
          <Button
            key="manualSync"
            icon={<CloudSyncOutlined />}
            onClick={() => setIsManualSyncModalOpen(true)}
          >
            Manual SAP Sync
          </Button>,
          <Button
            key="approve"
            type="primary"
            icon={<SendOutlined />}
            onClick={handleConfirmApproveAndPost}
            style={{ background: '#16a34a', borderColor: '#16a34a' }}
          >
            Authorize & Post SAP GRPO
          </Button>,
        ]}
      >
        <Alert
          message="Final Inbound Verification (SV-02)"
          description="Confirm quantities before posting. If discrepancy exists, you may adjust with a mandatory reason, or send back to Warehouse/QC."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {selectedReceipt && (
          <Table
            size="small"
            dataSource={selectedReceipt.items}
            rowKey="code"
            pagination={false}
            className="po-custom-table"
            columns={[
              { title: 'Item Code', dataIndex: 'code', key: 'code', render: (c) => <Text strong style={{ color: '#2563eb' }}>{c}</Text> },
              { title: 'Item Name', dataIndex: 'name', key: 'name' },
              { title: 'Planned', key: 'planned', render: (_, r) => `${r.plannedQty || r.poQty} ${r.uom}` },
              { title: 'WH Received', dataIndex: 'receiveQty', key: 'receiveQty', render: (q, r) => `${q} ${r.uom}` },
              { title: 'QC Accepted', dataIndex: 'qcAcceptedQty', key: 'qcAcceptedQty', render: (q, r) => <Tag color="green">{q || 0} ${r.uom}</Tag> },
              {
                title: 'Final Post Qty',
                key: 'final',
                render: (_, r) => (
                  <Space>
                    <Text strong>{r.finalGrQty !== undefined ? r.finalGrQty : (r.qcAcceptedQty || r.receiveQty)}</Text>
                    <Button
                      size="small"
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => handleOpenAdjust(r)}
                    >
                      Adjust
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        )}
      </Modal>

      {/* SV-03 Adjust Quantity Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#ca8504' }} />
            <span>Adjust Final GR Quantity: {targetAdjustItem?.code}</span>
          </Space>
        }
        open={isAdjustModalOpen}
        onCancel={() => setIsAdjustModalOpen(false)}
        onOk={handleConfirmAdjust}
        okText="Save Adjustment & Log Audit"
      >
        <Alert
          message="Mandatory Audit Requirement"
          description="Any modification to the verified QC/WH quantity will be logged in the immutable audit trail with your name and mandatory rationale."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={adjustForm} layout="vertical">
          <Form.Item label="Previous Verified QTY" name="previousValue">
            <InputNumber disabled style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="New Final GR QTY *" name="newValue" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%', height: 32 }} />
          </Form.Item>
          <Form.Item label="Adjustment Reason & Rationale *" name="reason" rules={[{ required: true, message: 'Reason is strictly required' }]}>
            <Input.TextArea rows={3} placeholder="Explain why quantity is modified (e.g. Approved supplier concession, packaging weight compensation)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* SV-04 Send Back Modal */}
      <Modal
        title={
          <Space>
            <RollbackOutlined style={{ color: '#dc2626' }} />
            <span>Send Back Shipment: {selectedReceipt?.grNumber}</span>
          </Space>
        }
        open={isSendBackModalOpen}
        onCancel={() => setIsSendBackModalOpen(false)}
        onOk={handleConfirmSendBack}
        okText="Confirm Return"
        okButtonProps={{ danger: true }}
      >
        <Form form={sendBackForm} layout="vertical">
          <Form.Item label="Send Back Target *" name="target" initialValue="WAREHOUSE" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Warehouse (Physical Re-count / Re-scan)', value: 'WAREHOUSE' },
                { label: 'QC (Re-inspect / Re-test Lot)', value: 'QC' },
              ]}
            />
          </Form.Item>
          <Form.Item label="Reason for Send Back *" name="reason" rules={[{ required: true, message: 'Reason is required' }]}>
            <Input.TextArea rows={3} placeholder="Explain what requires correction by the target department" />
          </Form.Item>
        </Form>
      </Modal>

      {/* SV-05 Manual SAP Sync Modal */}
      <Modal
        title={
          <Space>
            <CloudSyncOutlined style={{ color: '#2563eb' }} />
            <span>Manual SAP Goods Receipt PO Sync</span>
          </Space>
        }
        open={isManualSyncModalOpen}
        onCancel={() => setIsManualSyncModalOpen(false)}
        onOk={handleConfirmManualSync}
        okText="Link SAP DocNum"
      >
        <Alert
          message="Manual Integration Fallback"
          description="If automated SAP B1 DI API was bypassed or posted directly in SAP client, enter the SAP Goods Receipt PO DocNum here to reconcile."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={syncForm} layout="vertical">
          <Form.Item label="SAP GRPO Document Number *" name="sapDocNum" rules={[{ required: true }]}>
            <Input placeholder="e.g. 10045928" style={{ height: 32 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
