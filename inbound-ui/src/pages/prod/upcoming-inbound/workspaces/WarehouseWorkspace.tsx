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
  TimePicker,
  InputNumber,
  Row,
  Col,
  Alert,
  Divider,
  message,
  Statistic,
  Tooltip,
  Progress,
} from 'antd';
import {
  InboxOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
  CarOutlined,
  PhoneOutlined,
  FileDoneOutlined,
  SendOutlined,
  SaveOutlined,
  EditOutlined,
  WarningOutlined,
  BarcodeOutlined,
  SyncOutlined,
  ExportOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type {
  GoodsReceipt,
  GRItem,
  ItemBatch,
  IRPlan,
} from '../core/type';
import { InboundStatusBadge } from '../features/shared/InboundStatusBadge';
import { AuditTrailTimeline } from '../features/shared/AuditTrailTimeline';
import './ProcurementWorkspace.less';

const { Text } = Typography;
const { RangePicker } = DatePicker;

export interface WarehouseWorkspaceProps {
  receipts: GoodsReceipt[];
  irPlans: IRPlan[];
  onSaveGR: (gr: GoodsReceipt) => void;
  onSubmitToQC: (gr: GoodsReceipt) => void;
  onRefresh: () => void;
  onNavigateToRole?: (role: 'PROCUREMENT' | 'WAREHOUSE' | 'QC' | 'SUPERVISOR' | 'AUDIT_TIMELINE') => void;
}

export const WarehouseWorkspace: React.FC<WarehouseWorkspaceProps> = ({
  receipts,
  irPlans,
  onSaveGR,
  onSubmitToQC,
  onRefresh,
  onNavigateToRole,
}) => {
  const [activeTab, setActiveTab] = useState<string>('TO_RECEIVE');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<GoodsReceipt | null>(null);
  const [selectedIRPlan, setSelectedIRPlan] = useState<IRPlan | null>(null);
  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isTempGrModalOpen, setIsTempGrModalOpen] = useState<boolean>(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(false);
  const [isIRPlanDrawerOpen, setIsIRPlanDrawerOpen] = useState<boolean>(false);

  // Open IR Plan Drawer with dynamic fallback if not found in irPlans
  const handleOpenIRPlan = (irNumber?: string, fallbackReceipt?: GoodsReceipt) => {
    if (!irNumber && !fallbackReceipt) return;
    const plan = irPlans.find((p) => p.irPlanNumber === irNumber || p.id === irNumber);
    if (plan) {
      setSelectedIRPlan(plan);
      const linkedReceipt = fallbackReceipt || receipts.find((r) => r.irPlanNumber === plan.irPlanNumber || r.id === (plan as any).id || (plan.poNumbers && plan.poNumbers.includes(r.poNumber)));
      if (linkedReceipt) {
        setSelectedReceipt(linkedReceipt);
      }
      setIsIRPlanDrawerOpen(true);
    } else if (fallbackReceipt) {
      const isCompleted = fallbackReceipt.deliveryPlanStatus === 'Received' || fallbackReceipt.deliveryPlanStatus === 'Posted' || fallbackReceipt.deliveryPlanStatus === 'QC Completed';
      const fallbackPlan: IRPlan = {
        id: fallbackReceipt.irPlanNumber || irNumber || 'IR-TEMP',
        irPlanNumber: fallbackReceipt.irPlanNumber || irNumber || 'IR-TEMP',
        deliveryPlanNumber: fallbackReceipt.deliveryPlanNumber || 'Plan 1',
        vendor: fallbackReceipt.supplier || 'Vendor',
        poNumbers: fallbackReceipt.poReferences?.map((p) => p.poNumber) || (fallbackReceipt.poNumber ? [fallbackReceipt.poNumber] : []),
        deliveryDate: fallbackReceipt.expectedDate || '2026-08-27',
        status: (isCompleted ? 'Completed' : fallbackReceipt.deliveryPlanStatus === 'In Progress' ? 'In Progress' : 'Confirmed') as any,
        items: fallbackReceipt.items.map((it, idx) => ({
          id: `item-${idx}`,
          poNumber: it.poNumber || fallbackReceipt.poNumber || '',
          itemCode: it.code,
          itemName: it.name,
          uom: it.uom,
          totalPoQty: it.poQty || it.plannedQty || 0,
          allocatedQty: it.plannedQty || it.poQty || 0,
          remainingQty: 0,
          schedules: [],
        })),
        totalPlannedQty: fallbackReceipt.items.reduce((s, i) => s + (i.plannedQty || i.poQty || 0), 0),
        totalItems: fallbackReceipt.items.length,
        createdBy: 'Keo Srey',
        createdAt: '2026-08-22',
        notes: fallbackReceipt.deliveryNoteRemark || 'Standard Delivery Plan',
      };
      setSelectedIRPlan(fallbackPlan);
      setSelectedReceipt(fallbackReceipt);
      setIsIRPlanDrawerOpen(true);
    }
  };

  // Active Receiving State
  const [receivingForm] = Form.useForm();
  const [activeItems, setActiveItems] = useState<GRItem[]>([]);
  const [dnValue, setDnValue] = useState<string>('');

  // Temp GR Form
  const [tempGrForm] = Form.useForm();

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: receipts.length,
      toReceive: receipts.filter((r) => r.deliveryPlanStatus === 'To Receive' || !r.deliveryPlanStatus).length,
      inProgress: receipts.filter((r) => r.deliveryPlanStatus === 'In Progress' || r.processState === 'RECEIVED_CHECKING').length,
      waitingQC: receipts.filter((r) => r.deliveryPlanStatus === 'Waiting for QC' || r.processState === 'QC_PENDING').length,
      completed: receipts.filter((r) => r.deliveryPlanStatus === 'Received' || r.deliveryPlanStatus === 'Posted' || r.deliveryPlanStatus === 'QC Completed').length,
      today: receipts.filter((r) => r.expectedDate?.includes('27-08-2026') || r.actualReceiptDate?.includes('27-08-2026')).length,
      overdue: receipts.filter((r) => r.expectedDate?.includes('26-08-2026') || r.irPlanNumber === 'IR0002').length,
    };
  }, [receipts]);

  // Filter receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      // 1. Tab Filter
      if (activeTab === 'TO_RECEIVE' && !(r.deliveryPlanStatus === 'To Receive' || !r.deliveryPlanStatus)) {
        return false;
      }
      if (activeTab === 'IN_PROGRESS' && !(r.deliveryPlanStatus === 'In Progress' || r.processState === 'RECEIVED_CHECKING')) {
        return false;
      }
      if (activeTab === 'WAITING_QC' && !(r.deliveryPlanStatus === 'Waiting for QC' || r.processState === 'QC_PENDING')) {
        return false;
      }
      if (activeTab === 'COMPLETED' && !(r.deliveryPlanStatus === 'Received' || r.deliveryPlanStatus === 'Posted' || r.deliveryPlanStatus === 'QC Completed')) {
        return false;
      }

      // 2. Status Dropdown Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'OVERDUE' && !(r.expectedDate?.includes('26-08-2026') || r.irPlanNumber === 'IR0002')) {
          return false;
        }
        if (statusFilter !== 'OVERDUE' && r.deliveryPlanStatus !== statusFilter) {
          return false;
        }
      }

      // 3. Warehouse Filter
      if (warehouseFilter !== 'ALL') {
        const whMatch = (r.receiverWarehouseName && r.receiverWarehouseName.includes(warehouseFilter)) ||
          r.items?.some((it: any) => it.warehouseCode === warehouseFilter);
        if (!whMatch) return false;
      }

      // 4. Search Filter
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const matchesGR = r.grNumber?.toLowerCase().includes(q);
        const matchesIR = r.irPlanNumber?.toLowerCase().includes(q);
        const matchesSupplier = r.supplier?.toLowerCase().includes(q);
        const matchesDN = r.deliveryNoteNumber?.toLowerCase().includes(q);
        const matchesPO = r.poNumber?.toLowerCase().includes(q);
        const matchesDriver = r.driverName?.toLowerCase().includes(q);
        const matchesTruck = r.truckPlateNumber?.toLowerCase().includes(q);
        const matchesItem = r.items?.some(
          (it) =>
            it.code.toLowerCase().includes(q) ||
            it.name.toLowerCase().includes(q) ||
            it.batches?.some((b) => b.batchNumber?.toLowerCase().includes(q)),
        );
        if (!matchesGR && !matchesIR && !matchesSupplier && !matchesDN && !matchesPO && !matchesDriver && !matchesTruck && !matchesItem) {
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

  // Start physical receiving from an IR Plan or existing GR
  const handleStartReceiving = (receipt: GoodsReceipt) => {
    setSelectedReceipt(receipt);
    setActiveItems(JSON.parse(JSON.stringify(receipt.items)));
    setDnValue(receipt.deliveryNoteNumber || '');

    receivingForm.setFieldsValue({
      deliveryNoteNumber: receipt.deliveryNoteNumber || '',
      deliveryNoteRemark: receipt.deliveryNoteRemark || '',
      truckPlateNumber: receipt.truckPlateNumber || 'PP-2AB-9988',
      driverName: receipt.driverName || 'Sokha Men',
      driverContact: receipt.driverContact || '+855 12 889 001',
      receiverWarehouseName: receipt.receiverWarehouseName || 'WHM1 - Main Raw Materials',
      actualArrivalDate: receipt.actualArrivalDate ? dayjs(receipt.actualArrivalDate) : dayjs('2026-08-27'),
      actualArrivalTime: receipt.actualArrivalTime ? dayjs(receipt.actualArrivalTime, 'HH:mm') : dayjs('09:15', 'HH:mm'),
    });

    setIsReceivingModalOpen(true);
  };

  // Add batch to item
  const handleAddBatch = (itemIndex: number) => {
    const updated = [...activeItems];
    const targetItem = updated[itemIndex];
    if (!targetItem.batches) targetItem.batches = [];

    const totalBatchQty = targetItem.batches.reduce((sum, b) => sum + (b.batchQty || 0), 0);
    const remainingQty = Math.max(0, targetItem.receiveQty - totalBatchQty);

    targetItem.batches.push({
      id: `batch-${Date.now()}-${targetItem.batches.length + 1}`,
      batchNumber: `LOT-${dayjs().format('YYYYMM')}-${targetItem.batches.length + 1}`,
      batchQty: remainingQty > 0 ? remainingQty : 50,
      productionDate: '2026-08-15',
      expiryDate: '2028-08-15',
      bestBeforeDate: '2028-08-15',
      remark: 'New batch',
    });

    setActiveItems(updated);
  };

  // Remove batch
  const handleRemoveBatch = (itemIndex: number, batchIndex: number) => {
    const updated = [...activeItems];
    if (updated[itemIndex].batches && updated[itemIndex].batches!.length > 1) {
      updated[itemIndex].batches!.splice(batchIndex, 1);
      setActiveItems(updated);
    } else {
      message.warning('At least one batch record is required for received item.');
    }
  };

  // Update item field
  const handleUpdateItemField = (itemIndex: number, field: keyof GRItem, value: any) => {
    const updated = [...activeItems];
    (updated[itemIndex] as any)[field] = value;
    if (field === 'receiveQty') {
      updated[itemIndex].actualReceivedQty = value;
      const planned = updated[itemIndex].plannedQty || updated[itemIndex].poQty || 0;
      if (value < planned) {
        updated[itemIndex].isMissing = true;
      } else {
        updated[itemIndex].isMissing = false;
        updated[itemIndex].missingRemark = '';
      }
    }
    setActiveItems(updated);
  };

  // Update batch field
  const handleUpdateBatchField = (
    itemIndex: number,
    batchIndex: number,
    field: keyof ItemBatch,
    value: any,
  ) => {
    const updated = [...activeItems];
    if (updated[itemIndex].batches && updated[itemIndex].batches![batchIndex]) {
      (updated[itemIndex].batches![batchIndex] as any)[field] = value;
      setActiveItems(updated);
    }
  };

  // Validate receiving and proceed to Review GR (WH-04)
  const handleProceedToReview = () => {
    receivingForm.validateFields().then((headerValues) => {
      if (headerValues.deliveryNoteNumber === 'NA' && !headerValues.deliveryNoteRemark?.trim()) {
        message.error('Remark / Reason is strictly mandatory when Delivery Note is NA.');
        return;
      }

      for (const item of activeItems) {
        const planned = item.plannedQty || item.poQty;
        const totalBatch = item.batches?.reduce((sum, b) => sum + (Number(b.batchQty) || 0), 0) || 0;
        if (totalBatch !== item.receiveQty) {
          message.error(
            `Item ${item.code}: Batch Qty Total (${totalBatch}) must equal Actual Received Qty (${item.receiveQty}).`,
          );
          return;
        }
        if (item.receiveQty < planned && !item.missingRemark?.trim()) {
          message.error(
            `Item ${item.code} has missing discrepancy (${planned - item.receiveQty} missing). Discrepancy remark is required.`,
          );
          return;
        }
      }

      setIsReceivingModalOpen(false);
      setIsReviewModalOpen(true);
    });
  };

  // Final submit to QC (WH-04 -> WH-05)
  const handleConfirmSubmitToQC = () => {
    if (!selectedReceipt) return;
    const headerValues = receivingForm.getFieldsValue();

    const updatedReceipt: GoodsReceipt = {
      ...selectedReceipt,
      deliveryNoteNumber: headerValues.deliveryNoteNumber,
      deliveryNoteRemark: headerValues.deliveryNoteRemark,
      truckPlateNumber: headerValues.truckPlateNumber,
      driverName: headerValues.driverName,
      driverContact: headerValues.driverContact,
      actualArrivalDate: headerValues.actualArrivalDate ? dayjs(headerValues.actualArrivalDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      actualArrivalTime: headerValues.actualArrivalTime ? dayjs(headerValues.actualArrivalTime).format('HH:mm') : dayjs().format('HH:mm'),
      deliveryPlanStatus: 'Waiting for QC',
      processState: 'QC_PENDING',
      items: activeItems,
      activities: [
        ...(selectedReceipt.activities || []),
        {
          id: `act-${Date.now()}`,
          title: 'Physical Receiving Completed',
          description: `Received ${activeItems.reduce((s, i) => s + i.receiveQty, 0)} units across ${activeItems.reduce((s, i) => s + (i.batches?.length || 0), 0)} batches. Submitted to QC.`,
          performedBy: 'Warehouse Staff',
          timestamp: dayjs().format('YYYY-MM-DD HH:mm'),
          state: 'done',
        },
      ],
    };

    onSubmitToQC(updatedReceipt);
    message.success(`Goods Receipt ${updatedReceipt.grNumber} successfully submitted to QC Inspection!`);
    setIsReviewModalOpen(false);
  };

  // Create Temporary GR
  const handleCreateTempGR = () => {
    tempGrForm.validateFields().then((vals) => {
      const tempGr = {
        id: Date.now(),
        grNumber: `TMP-${dayjs().format('MMDD')}-${Math.floor(100 + Math.random() * 900)}`,
        irPlanNumber: 'TEMP_UNPLANNED',
        deliveryPlanNumber: 'Unscheduled',
        poNumber: 'UNLINKED_PO',
        supplier: vals.vendor,
        expectedDate: dayjs().format('DD-MM-YYYY'),
        actualReceiptDate: dayjs().format('DD-MM-YYYY'),
        actualArrivalDate: dayjs().format('YYYY-MM-DD'),
        actualArrivalTime: dayjs().format('HH:mm'),
        deliveryNoteNumber: vals.dnNumber || 'NA',
        truckPlateNumber: vals.truckPlate || 'PP-TEMP-01',
        deliveryPlanStatus: 'To Receive',
        processState: 'STORED_ON_HOLD',
        receiverWarehouseName: 'WHM1 - Main Raw Materials',
        activities: [
          {
            id: `act-temp-${Date.now()}`,
            title: 'Temporary GR Created',
            description: `Unplanned truck arrival received. Reason: ${vals.reason}`,
            performedBy: 'Warehouse Staff',
            timestamp: dayjs().format('YYYY-MM-DD HH:mm'),
            state: 'done',
          },
        ],
        items: [
          {
            id: Date.now(),
            code: vals.itemCode || 'TEMP-ITEM-01',
            name: vals.itemName || 'Urgent Arrival Goods',
            poNumber: 'PENDING_LINK',
            supplier: vals.vendor,
            uom: vals.uom || 'EA',
            poQty: 0,
            plannedQty: 0,
            receiveQty: Number(vals.qty) || 100,
            actualReceivedQty: Number(vals.qty) || 100,
            batches: [
              {
                id: `b-temp-${Date.now()}`,
                batchNumber: vals.batchNo || `TMP-${dayjs().format('MMDD')}`,
                batchQty: Number(vals.qty) || 100,
                productionDate: dayjs().format('YYYY-MM-DD'),
                expiryDate: dayjs().add(2, 'year').format('YYYY-MM-DD'),
              },
            ],
          },
        ],
      } as GoodsReceipt;

      onSaveGR(tempGr);
      message.success(`Temporary GR ${tempGr.grNumber} logged in Exception Queue.`);
      setIsTempGrModalOpen(false);
      tempGrForm.resetFields();
    });
  };

  const handleExport = () => {
    message.success('Exporting Warehouse Goods Receipts to Excel format...');
  };

  // Table Columns matching Procurement design
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
        const s = status || 'To Receive';
        let cls = 'open';
        if (s === 'In Progress') cls = 'in-progress';
        if (s === 'Waiting for QC') cls = 'waiting-qc';
        if (s === 'Stored' || s === 'Completed') cls = 'completed';
        if (record.expectedDate?.includes('26-08-2026')) cls = 'overdue';

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
          onClick={() => handleOpenIRPlan(ir, record)}
        >
          {ir || '—'}
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
      title: 'Delivery Date',
      dataIndex: 'expectedDate',
      key: 'deliveryDate',
      width: 140,
      render: (date: string) => {
        const isOverdue = date?.includes('26-08-2026');
        return (
          <div>
            <Space size={4}>
              <ClockCircleOutlined style={{ color: isOverdue ? '#dc2626' : '#64748b' }} />
              <span style={{ color: isOverdue ? '#dc2626' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
                {date || '27-08-2026'}
              </span>
            </Space>
            {isOverdue && (
              <Tag color="error" style={{ display: 'block', width: 'fit-content', marginTop: 2, fontSize: 10 }}>
                Overdue
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'PO #',
      key: 'poRefs',
      width: 130,
      render: (_: any, record: GoodsReceipt) => (
        <Space wrap size={4}>
          {record.poReferences?.map((p) => (
            <span key={p.poNumber} className="po-link">
              {p.poNumber}
            </span>
          )) || (
            <span className="po-link">
              {record.poNumber}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: 'Items',
      key: 'items',
      width: 100,
      render: (_: any, record: GoodsReceipt) => (
        <span style={{ fontWeight: 500 }}>{record.items.length} item(s)</span>
      ),
    },
    {
      title: 'Received QTY',
      key: 'qtyComparison',
      width: 160,
      render: (_: any, record: GoodsReceipt) => {
        const planned = record.items.reduce((s, i) => s + (i.plannedQty || i.poQty || 0), 0);
        const received = record.items.reduce((s, i) => s + (i.receiveQty || 0), 0);
        const diff = planned - received;

        return (
          <div>
            <Text strong>{received.toLocaleString()}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}> / {planned.toLocaleString()} PCS</Text>
            {diff > 0 && (
              <Tag color="orange" style={{ fontSize: 10, padding: '0 4px', lineHeight: '18px', display: 'block', width: 'fit-content', marginTop: 2 }}>
                Diff: -{diff} (Missing)
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 140,
      render: (_: any, record: GoodsReceipt) => {
        const canReceive =
          record.deliveryPlanStatus === 'To Receive' ||
          record.deliveryPlanStatus === 'In Progress' ||
          record.deliveryPlanStatus === 'Partially Received' ||
          !record.deliveryPlanStatus;

        return (
          <Space>
            {canReceive ? (
              <Button
                size="small"
                type="primary"
                icon={<InboxOutlined />}
                onClick={() => handleStartReceiving(record)}
                style={{ background: '#2563eb', borderColor: '#2563eb', fontWeight: 500 }}
              >
                Physical Receive
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
                View GR
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="procurement-workspace">
      {/* 1. Header Row matching Procurement */}
      <div className="workspace-header-row">
        <div className="header-titles" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <h1 className="main-title" style={{ margin: 0 }}>Warehouse Inbound Management</h1>
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
            Receive incoming shipments from Procurement IR plans, manage multi-batch lots, and dispatch goods receipts to QC
          </p>
        </div>
      </div>

      {/* 2. KPI Summary Cards Grid */}
      <div className="summary-cards-row">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Expected Today</span>
            <div className="kpi-icon-badge blue">
              <InboxOutlined />
            </div>
          </div>
          <div className="kpi-value blue">{tabCounts.today}</div>
          <div className="kpi-subtitle">Scheduled for arrival</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Overdue Inbound</span>
            <div className="kpi-icon-badge orange">
              <WarningOutlined />
            </div>
          </div>
          <div className="kpi-value orange">{tabCounts.overdue}</div>
          <div className="kpi-subtitle">Past scheduled date</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">In Receiving</span>
            <div className="kpi-icon-badge amber">
              <SyncOutlined />
            </div>
          </div>
          <div className="kpi-value amber">{tabCounts.inProgress}</div>
          <div className="kpi-subtitle">Dock receiving active</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Waiting for QC</span>
            <div className="kpi-icon-badge purple">
              <SafetyCertificateOutlined />
            </div>
          </div>
          <div className="kpi-value purple">{tabCounts.waitingQC}</div>
          <div className="kpi-subtitle">Submitted for inspection</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Completed & Stored</span>
            <div className="kpi-icon-badge green">
              <CheckCircleOutlined />
            </div>
          </div>
          <div className="kpi-value green">{tabCounts.completed}</div>
          <div className="kpi-subtitle">Stored in warehouse</div>
        </div>
      </div>

      {/* 3. Single-Line Filter Toolbar Card with Title Labels */}
      <div className="filter-toolbar-card" style={{ padding: '12px 18px', background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 240px', minWidth: 200, maxWidth: 300 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Search</span>
            <Input
              placeholder="Search GR #, PO #, item, vendor..."
              prefix={<SearchOutlined style={{ color: '#9ca3af', marginRight: 4 }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              style={{ height: 36, borderRadius: 6 }}
            />
          </div>

          {/* Status Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 160 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Status</span>
            <Select
              style={{ width: '100%', height: 36 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: 'All Status', value: 'ALL' },
                { label: 'To Receive', value: 'To Receive' },
                { label: 'In Progress', value: 'In Progress' },
                { label: 'Waiting for QC', value: 'Waiting for QC' },
                { label: 'Stored / Completed', value: 'Stored' },
                { label: 'Overdue', value: 'OVERDUE' },
              ]}
            />
          </div>

          {/* Warehouse Select */}
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

          {/* Date Range Picker */}
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

      {/* 4. Main Content Card with Custom Tab Bar */}
      <div className="main-content-card">
        <div className="tab-action-bar">
          <div className="tabs-list">
            <button
              className={`tab-button ${activeTab === 'TO_RECEIVE' ? 'active' : ''}`}
              onClick={() => setActiveTab('TO_RECEIVE')}
            >
              <span>To Receive</span>
              <span className="tab-count-badge">{tabCounts.toReceive}</span>
            </button>

            <button
              className={`tab-button ${activeTab === 'IN_PROGRESS' ? 'active' : ''}`}
              onClick={() => setActiveTab('IN_PROGRESS')}
            >
              <span>In Progress</span>
              <span className="tab-count-badge">{tabCounts.inProgress}</span>
            </button>

            <button
              className={`tab-button ${activeTab === 'WAITING_QC' ? 'active' : ''}`}
              onClick={() => setActiveTab('WAITING_QC')}
            >
              <span>Waiting for QC</span>
              <span className="tab-count-badge">{tabCounts.waitingQC}</span>
            </button>

            <button
              className={`tab-button ${activeTab === 'COMPLETED' ? 'active' : ''}`}
              onClick={() => setActiveTab('COMPLETED')}
            >
              <span>Completed</span>
              <span className="tab-count-badge">{tabCounts.completed}</span>
            </button>

            <button
              className={`tab-button ${activeTab === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveTab('ALL')}
            >
              <span>All Receipts</span>
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

      {/* 5. Detail / Track Intake Drawer for Warehouse Goods Receipt */}
      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
            <Space size={8}>
              <FileTextOutlined style={{ color: '#2563eb', fontSize: 18 }} />
              <span style={{ fontWeight: 700, fontSize: 16 }}>
                Goods Receipt Details: {selectedReceipt?.grNumber || selectedReceipt?.irPlanNumber}
              </span>
            </Space>
            <Space>
              {selectedReceipt && (
                <>
                  <Tag
                    color={
                      selectedReceipt.deliveryPlanStatus === 'In Progress'
                        ? 'processing'
                        : selectedReceipt.deliveryPlanStatus === 'Received' || selectedReceipt.deliveryPlanStatus === 'Posted' || selectedReceipt.deliveryPlanStatus === 'QC Completed'
                        ? 'success'
                        : 'blue'
                    }
                    style={{ fontSize: 12, padding: '2px 8px', whiteSpace: 'nowrap' }}
                  >
                    {selectedReceipt.deliveryPlanStatus || 'To Receive'}
                  </Tag>
                  <InboundStatusBadge type="deliveryPlan" value={selectedReceipt.deliveryPlanStatus || 'To Receive'} />
                </>
              )}
            </Space>
          </div>
        }
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        width={920}
        styles={{ body: { padding: '20px 24px', background: '#f8fafc' } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Warehouse Intake Record • Sourced from IR Plan {selectedReceipt?.irPlanNumber}
            </Text>
            <Space size={12}>
              <Button onClick={() => setIsDetailDrawerOpen(false)}>Close</Button>
              {selectedReceipt?.irPlanNumber && (
                <Button
                  type="default"
                  icon={<FileTextOutlined />}
                  onClick={() => {
                    setIsDetailDrawerOpen(false);
                    handleOpenIRPlan(selectedReceipt.irPlanNumber, selectedReceipt);
                  }}
                  style={{ color: '#2563eb', borderColor: '#bfdbfe', fontWeight: 600 }}
                >
                  View IR Schedule ({selectedReceipt.irPlanNumber})
                </Button>
              )}
              {selectedReceipt && (selectedReceipt.deliveryPlanStatus === 'To Receive' || selectedReceipt.deliveryPlanStatus === 'In Progress') && (
                <Button
                  type="primary"
                  icon={<InboxOutlined />}
                  onClick={() => {
                    setIsDetailDrawerOpen(false);
                    handleStartReceiving(selectedReceipt);
                  }}
                  style={{ background: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }}
                >
                  Physical Receive
                </Button>
              )}
            </Space>
          </div>
        }
      >
        {(() => {
          if (!selectedReceipt) return null;

          const totalPlannedQty = selectedReceipt.items.reduce((s, i) => s + (i.plannedQty || i.poQty || 0), 0);
          const totalReceivedQty = selectedReceipt.items.reduce((s, i) => s + (i.receiveQty || 0), 0);
          const totalRemainingQty = Math.max(0, totalPlannedQty - totalReceivedQty);
          const percentReceived = totalPlannedQty > 0 ? Math.min(100, Math.round((totalReceivedQty / totalPlannedQty) * 1000) / 10) : 0;
          const totalBatchesCount = selectedReceipt.items.reduce((s, i) => s + (i.batches?.length || 0), 0);

          return (
            <div className="detail-drawer-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Dynamic Intake Tracking Banner */}
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
                    <SyncOutlined spin={selectedReceipt.deliveryPlanStatus === 'In Progress'} style={{ color: '#2563eb', fontSize: 16 }} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#1e3a8a' }}>
                      Live Inbound Intake Progress
                    </span>
                  </div>
                  <Tag color="blue" style={{ fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 12 }}>
                    {totalReceivedQty >= totalPlannedQty ? 'Intake Complete' : `${percentReceived}% Received`}
                  </Tag>
                </div>

                <Progress
                  percent={percentReceived}
                  strokeColor="#2563eb"
                  trailColor="#e2e8f0"
                  status={selectedReceipt.deliveryPlanStatus === 'In Progress' ? 'active' : totalReceivedQty >= totalPlannedQty ? 'success' : 'normal'}
                  style={{ marginBottom: 12 }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Total Planned</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{totalPlannedQty.toLocaleString()} Units</div>
                  </div>
                  <div style={{ background: '#eff6ff', padding: '10px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 500 }}>Total Received</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#2563eb' }}>{totalReceivedQty.toLocaleString()} Units</div>
                  </div>
                  <div style={{ background: totalRemainingQty > 0 ? '#fefce8' : '#f0fdf4', padding: '10px 12px', borderRadius: 8, border: totalRemainingQty > 0 ? '1px solid #fef08a' : '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: 11, color: totalRemainingQty > 0 ? '#854d0e' : '#16a34a', fontWeight: 500 }}>Remaining Balance</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: totalRemainingQty > 0 ? '#ca8504' : '#16a34a' }}>{totalRemainingQty.toLocaleString()} Units</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Batches Recorded</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                      <span style={{ color: '#2563eb' }}>{totalBatchesCount > 0 ? `${totalBatchesCount} Lots Captured` : 'Pending Intake'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Exact Figma Shipment & Logistics Details Card */}
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
                  Shipment & Logistics Details
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
                        {selectedReceipt.grNumber || 'Pending GR'}
                      </span>
                    </div>
                    <div className="label-value-pair" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span className="field-label" style={{ width: 140, fontSize: 13, fontWeight: 500, color: '#6b7280', flexShrink: 0 }}>
                        IR Plan #
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span
                        className="field-value po-link"
                        style={{ fontSize: 14, fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
                        onClick={() => {
                          setIsDetailDrawerOpen(false);
                          handleOpenIRPlan(selectedReceipt.irPlanNumber, selectedReceipt);
                        }}
                      >
                        {selectedReceipt.irPlanNumber}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Vendor vs Delivery Plan */}
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
                        Delivery Plan
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span className="field-value" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>
                        {selectedReceipt.deliveryPlanNumber || 'Plan 1'}
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Delivery Note (DN) vs Truck Plate */}
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
                        Truck Plate No.
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span className="field-value" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>
                        {selectedReceipt.truckPlateNumber || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Row 4: Driver & Contact vs Receiving Warehouse */}
                  <div className="po-grid-row" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <div className="label-value-pair" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span className="field-label" style={{ width: 140, fontSize: 13, fontWeight: 500, color: '#6b7280', flexShrink: 0 }}>
                        Driver & Contact
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span className="field-value" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>
                        {selectedReceipt.driverContact || selectedReceipt.driverName || 'N/A'}
                      </span>
                    </div>
                    <div className="label-value-pair" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span className="field-label" style={{ width: 140, fontSize: 13, fontWeight: 500, color: '#6b7280', flexShrink: 0 }}>
                        Receiving Warehouse
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span className="field-value" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>
                        {selectedReceipt.receiverWarehouseName || 'WHM1 - Main Raw Materials'}
                      </span>
                    </div>
                  </div>

                  {/* Row 5: Expected Date vs Actual Arrival */}
                  <div className="po-grid-row" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <div className="label-value-pair" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span className="field-label" style={{ width: 140, fontSize: 13, fontWeight: 500, color: '#6b7280', flexShrink: 0 }}>
                        Expected Date
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span className="field-value" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>
                        {selectedReceipt.expectedDate}
                      </span>
                    </div>
                    <div className="label-value-pair" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span className="field-label" style={{ width: 140, fontSize: 13, fontWeight: 500, color: '#6b7280', flexShrink: 0 }}>
                        Actual Arrival
                      </span>
                      <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                        :
                      </span>
                      <span className="field-value" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>
                        {selectedReceipt.actualArrivalDate || 'Pending dock arrival'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Line Items & Batches Breakdown Table Card */}
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
                  <InboxOutlined style={{ color: '#ca8504' }} />
                  <span>Line Items & Batches Intake Breakdown ({selectedReceipt.items.length})</span>
                </div>
                <Table
                  size="small"
                  dataSource={selectedReceipt.items}
                  rowKey="code"
                  pagination={false}
                  className="po-custom-table"
                  columns={[
                    {
                      title: 'Item Code',
                      dataIndex: 'code',
                      key: 'code',
                      width: 120,
                      render: (c) => <Text strong style={{ color: '#2563eb' }}>{c}</Text>,
                    },
                    {
                      title: 'Item Name & Description',
                      dataIndex: 'name',
                      key: 'name',
                      render: (name) => (
                        <span style={{ fontWeight: 500, whiteSpace: 'nowrap', display: 'block' }}>
                          {name}
                        </span>
                      ),
                    },
                    {
                      title: 'Planned QTY',
                      key: 'planned',
                      width: 110,
                      render: (_, r) => (
                        <Text strong>
                          {(r.plannedQty || r.poQty).toLocaleString()} <span style={{ fontSize: 11, color: '#64748b' }}>{r.uom}</span>
                        </Text>
                      ),
                    },
                    {
                      title: 'Received QTY',
                      dataIndex: 'receiveQty',
                      key: 'receiveQty',
                      width: 110,
                      render: (q, r) => (
                        <span style={{ color: q > 0 ? '#16a34a' : '#64748b', fontWeight: q > 0 ? 600 : 400 }}>
                          {(q || 0).toLocaleString()} <span style={{ fontSize: 11, color: '#64748b' }}>{r.uom}</span>
                        </span>
                      ),
                    },
                    {
                      title: 'Remaining',
                      key: 'remaining',
                      width: 110,
                      render: (_, r) => {
                        const planned = r.plannedQty || r.poQty || 0;
                        const rec = r.receiveQty || 0;
                        const rem = Math.max(0, planned - rec);
                        return (
                          <Text strong style={{ color: rem > 0 ? '#ca8504' : '#16a34a' }}>
                            {rem.toLocaleString()} <span style={{ fontSize: 11, color: '#64748b' }}>{r.uom}</span>
                          </Text>
                        );
                      },
                    },
                    {
                      title: 'Recorded Batches',
                      key: 'batches',
                      render: (_, r) => (
                        <Space direction="vertical" size={2}>
                          {r.batches?.map((b) => (
                            <div key={b.batchNumber} style={{ fontSize: 12 }}>
                              <Tag color="blue" style={{ fontSize: 10 }}>{b.batchNumber}</Tag>
                              <span style={{ fontWeight: 600 }}>{b.batchQty} {r.uom}</span>
                              <span style={{ fontSize: 11, color: '#64748b', marginLeft: 4 }}>Exp: {b.expiryDate}</span>
                            </div>
                          )) || <Text type="secondary">Pending intake</Text>}
                        </Space>
                      ),
                    },
                    {
                      title: 'Intake Status',
                      key: 'intakeStatus',
                      width: 130,
                      render: (_, r) => {
                        const planned = r.plannedQty || r.poQty || 0;
                        const rec = r.receiveQty || 0;
                        if (rec >= planned && planned > 0) {
                          return <Tag color="green" style={{ whiteSpace: 'nowrap' }}>Fully Received</Tag>;
                        }
                        if (rec > 0) {
                          return (
                            <Tag color="blue" style={{ whiteSpace: 'nowrap' }}>
                              Partial ({rec}/{planned})
                            </Tag>
                          );
                        }
                        return <Tag color="default" style={{ whiteSpace: 'nowrap' }}>Pending Intake</Tag>;
                      },
                    },
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

      {/* 5A. IR Schedule (IR Plan) Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
            <Space size={10}>
              <FileTextOutlined style={{ color: '#2563eb', fontSize: 18 }} />
              <span style={{ fontWeight: 700, fontSize: 16 }}>
                IR Schedule: {selectedIRPlan?.irPlanNumber}
              </span>
              {selectedIRPlan?.deliveryPlanNumber && (
                <Tag color="cyan">{selectedIRPlan.deliveryPlanNumber}</Tag>
              )}
            </Space>
            {selectedIRPlan && (
              <InboundStatusBadge type="deliveryPlan" value={selectedIRPlan.status || 'Confirmed'} />
            )}
          </div>
        }
        open={isIRPlanDrawerOpen}
        onClose={() => setIsIRPlanDrawerOpen(false)}
        width={920}
        styles={{ body: { padding: '20px 24px', background: '#f8fafc' } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Sourced from Procurement Inbound Planning • Linked to Warehouse Receiving
            </Text>
            <Space size={12}>
              <Button onClick={() => setIsIRPlanDrawerOpen(false)}>Close</Button>
              {(() => {
                const linkedReceipt = receipts.find(
                  (r) => r.irPlanNumber === selectedIRPlan?.irPlanNumber || r.id === (selectedIRPlan as any)?.id,
                ) || (selectedReceipt?.irPlanNumber === selectedIRPlan?.irPlanNumber ? selectedReceipt : undefined);

                return (
                  <>
                    {linkedReceipt && (
                      <Button
                        type="default"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          setSelectedReceipt(linkedReceipt);
                          setIsIRPlanDrawerOpen(false);
                          setIsDetailDrawerOpen(true);
                        }}
                        style={{ color: '#2563eb', borderColor: '#bfdbfe', fontWeight: 600 }}
                      >
                        View Receipt Details
                      </Button>
                    )}
                    {linkedReceipt && (linkedReceipt.deliveryPlanStatus === 'To Receive' || linkedReceipt.deliveryPlanStatus === 'In Progress') && (
                      <Button
                        type="primary"
                        icon={<InboxOutlined />}
                        onClick={() => {
                          setIsIRPlanDrawerOpen(false);
                          handleStartReceiving(linkedReceipt);
                        }}
                        style={{ background: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }}
                      >
                        Physical Receive
                      </Button>
                    )}
                  </>
                );
              })()}
            </Space>
          </div>
        }
      >
        {selectedIRPlan && (
          <div className="detail-drawer-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 1. Planning Overview Header Card */}
            <div
              className="po-figma-details-card"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
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
                  color: '#0f172a',
                  marginBottom: 14,
                  lineHeight: 1.2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CalendarOutlined style={{ color: '#2563eb' }} />
                <span>IR Schedule Details</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 24 }}>
                {/* Column 1: Schedule & PO Reference */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="label-value-pair" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="field-label" style={{ width: 105, fontSize: 13, fontWeight: 500, color: '#64748b', flexShrink: 0 }}>
                      IR Plan #
                    </span>
                    <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                      :
                    </span>
                    <span className="field-value" style={{ fontSize: 14, fontWeight: 700, color: '#2563eb' }}>
                      {selectedIRPlan.irPlanNumber}
                    </span>
                  </div>
                  <div className="label-value-pair" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="field-label" style={{ width: 105, fontSize: 13, fontWeight: 500, color: '#64748b', flexShrink: 0 }}>
                      PO #
                    </span>
                    <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                      :
                    </span>
                    <span className="field-value">
                      <span className="po-link" style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>
                        {selectedIRPlan.poNumbers?.[0] || selectedIRPlan.items?.[0]?.poNumber || '26000977'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Column 2: Vendor Information */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="label-value-pair" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="field-label" style={{ width: 105, fontSize: 13, fontWeight: 500, color: '#64748b', flexShrink: 0 }}>
                      Vendor Code
                    </span>
                    <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                      :
                    </span>
                    <span className="field-value" style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                      {(selectedIRPlan as any).vendorCode || 'V000374'}
                    </span>
                  </div>
                  <div className="label-value-pair" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="field-label" style={{ width: 105, fontSize: 13, fontWeight: 500, color: '#64748b', flexShrink: 0 }}>
                      Vendor Name
                    </span>
                    <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                      :
                    </span>
                    <span className="field-value" style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>
                      {selectedIRPlan.vendor}
                    </span>
                  </div>
                </div>

                {/* Column 3: Creation Audit Information */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="label-value-pair" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="field-label" style={{ width: 105, fontSize: 13, fontWeight: 500, color: '#64748b', flexShrink: 0 }}>
                      Created By
                    </span>
                    <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                      :
                    </span>
                    <span className="field-value" style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>
                      {selectedIRPlan.createdBy || 'Keo Srey'}
                    </span>
                  </div>
                  <div className="label-value-pair" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="field-label" style={{ width: 105, fontSize: 13, fontWeight: 500, color: '#64748b', flexShrink: 0 }}>
                      Created Date
                    </span>
                    <span className="field-colon" style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', marginRight: 8, flexShrink: 0 }}>
                      :
                    </span>
                    <span className="field-value" style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>
                      {selectedIRPlan.createdAt || '2026-08-22'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Scheduled Line Items & Allocation Breakdown */}
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
                <InboxOutlined style={{ color: '#ca8504' }} />
                <span>Planned Line Items & Allocation ({selectedIRPlan.items?.length || 0})</span>
              </div>
              <Table
                size="small"
                dataSource={(selectedIRPlan.items || []).flatMap((item, itemIdx) => {
                  if (item.schedules && item.schedules.length > 0) {
                    return item.schedules.map((sched, sIdx) => ({
                      rowKey: `${item.itemCode || itemIdx}-${sIdx}`,
                      isMainRow: sIdx === 0,
                      itemCode: item.itemCode,
                      itemName: item.itemName,
                      poNumber: item.poNumber || selectedIRPlan.poNumbers?.[0] || '26000977',
                      totalPoQty: item.totalPoQty || item.allocatedQty,
                      uom: item.uom,
                      irQty: sched.plannedQty,
                      remainingQty: item.remainingQty,
                      deliveryDate: sched.deliveryDate || selectedIRPlan.deliveryDate,
                      parentItem: item,
                    }));
                  }
                  return [
                    {
                      rowKey: `${item.itemCode || itemIdx}-0`,
                      isMainRow: true,
                      itemCode: item.itemCode,
                      itemName: item.itemName,
                      poNumber: item.poNumber || selectedIRPlan.poNumbers?.[0] || '26000977',
                      totalPoQty: item.totalPoQty || item.allocatedQty,
                      uom: item.uom,
                      irQty: item.allocatedQty,
                      remainingQty: item.remainingQty,
                      deliveryDate: selectedIRPlan.deliveryDate,
                      parentItem: item,
                    },
                  ];
                })}
                rowKey="rowKey"
                pagination={false}
                className="po-custom-table"
                columns={[
                  {
                    title: 'Item Code',
                    dataIndex: 'itemCode',
                    key: 'itemCode',
                    width: 120,
                    render: (_, r: any) => {
                      if (r.isMainRow) {
                        return <Text strong style={{ color: '#2563eb' }}>{r.itemCode}</Text>;
                      }
                      return (
                        <div style={{ paddingLeft: 8 }}>
                          <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>↳</span>
                        </div>
                      );
                    },
                  },
                  {
                    title: 'Item Description',
                    dataIndex: 'itemName',
                    key: 'itemName',
                    render: (_, r: any) =>
                      r.isMainRow ? (
                        <span style={{ fontWeight: 500 }}>{r.itemName}</span>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      ),
                  },
                  {
                    title: 'Order Qty',
                    dataIndex: 'totalPoQty',
                    key: 'totalPoQty',
                    width: 110,
                    render: (_, r: any) =>
                      r.isMainRow ? `${(r.totalPoQty || 0).toLocaleString()} ${r.uom}` : <span style={{ color: '#cbd5e1' }}>—</span>,
                  },
                  {
                    title: 'IR Qty',
                    dataIndex: 'irQty',
                    key: 'irQty',
                    width: 120,
                    render: (_, r: any) => (
                      <span style={{ fontWeight: 600, color: (r.irQty || 0) > 0 ? '#2563eb' : '#94a3b8' }}>
                        {(r.irQty || 0).toLocaleString()} <span style={{ fontSize: 11, color: '#94a3b8' }}>{r.uom}</span>
                      </span>
                    ),
                  },
                  {
                    title: 'Pending Qty',
                    dataIndex: 'remainingQty',
                    key: 'remainingQty',
                    width: 120,
                    render: (_, r: any) => {
                      if (!r.isMainRow) return <span style={{ color: '#cbd5e1' }}>—</span>;
                      const rem = r.remainingQty !== undefined ? r.remainingQty : Math.max(0, (r.totalPoQty || 0) - (r.irQty || 0));
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span
                            style={{
                              fontWeight: 700,
                              color: rem > 0 ? '#ea580c' : '#94a3b8',
                              fontSize: 14,
                            }}
                          >
                            {rem.toLocaleString()}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
                            {r.uom}
                          </span>
                        </div>
                      );
                    },
                  },
                  {
                    title: 'IR Schedule Date',
                    dataIndex: 'deliveryDate',
                    key: 'deliveryDate',
                    width: 135,
                    render: (date: string) => <span>{date || selectedIRPlan.deliveryDate || '2026-08-27'}</span>,
                  },
                ]}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* WH-03 Physical Receiving Modal & WH-03A Multi-Batch Manager */}
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
            <Space>
              <InboxOutlined style={{ color: '#2563eb', fontSize: 18 }} />
              <span style={{ fontWeight: 600 }}>
                WH-03 Physical Receiving & Multi-Batch Intake: {selectedReceipt?.irPlanNumber} ({selectedReceipt?.deliveryPlanNumber})
              </span>
            </Space>
            <Tag color="cyan">GR: {selectedReceipt?.grNumber}</Tag>
          </div>
        }
        open={isReceivingModalOpen}
        onCancel={() => setIsReceivingModalOpen(false)}
        width={1050}
        footer={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tip: Tap '+ Add Batch' to split carton lots. Total batch sum must match Actual Received Qty.
            </Text>
            <Space>
              <Button onClick={() => setIsReceivingModalOpen(false)}>Cancel</Button>
              <Button
                type="default"
                icon={<SaveOutlined />}
                onClick={() => {
                  message.success('Draft physical counts saved locally.');
                }}
              >
                Save Draft
              </Button>
              <Button
                type="primary"
                icon={<FileDoneOutlined />}
                onClick={handleProceedToReview}
                style={{ background: '#2563eb', borderColor: '#2563eb' }}
              >
                Review GR (WH-04)
              </Button>
            </Space>
          </div>
        }
      >
        {/* Logistics Header Form */}
        <Form form={receivingForm} layout="vertical" style={{ marginBottom: 12 }}>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label={<Text strong>Delivery Note / DN <span style={{ color: '#dc2626' }}>*</span></Text>}
                  name="deliveryNoteNumber"
                  rules={[{ required: true, message: 'DN is required (or enter NA with remark)' }]}
                >
                  <Input
                    placeholder="e.g. DN-OMC-20260827 or NA"
                    onChange={(e) => setDnValue(e.target.value)}
                  />
                </Form.Item>
              </Col>
              {dnValue === 'NA' && (
                <Col xs={24} sm={16}>
                  <Form.Item
                    label={<Text strong style={{ color: '#ca8504' }}>Reason / Remark for DN = NA *</Text>}
                    name="deliveryNoteRemark"
                    rules={[{ required: true, message: 'Reason required when DN = NA' }]}
                  >
                    <Input placeholder="Explain why physical DN is absent (e.g. digital manifest, phone confirmation)" />
                  </Form.Item>
                </Col>
              )}
              <Col xs={12} sm={8}>
                <Form.Item label="Vehicle / Truck No." name="truckPlateNumber">
                  <Input prefix={<CarOutlined />} placeholder="e.g. PP-2AB-9988" />
                </Form.Item>
              </Col>
              <Col xs={12} sm={8}>
                <Form.Item label="Driver & Contact" name="driverContact">
                  <Input prefix={<PhoneOutlined />} placeholder="e.g. Sokha Men (+855 12 889 001)" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={12} sm={8}>
                <Form.Item label="Receiving Warehouse" name="receiverWarehouseName">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col xs={12} sm={8}>
                <Form.Item label="Actual Arrival Date" name="actualArrivalDate">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={8}>
                <Form.Item label="Arrival Time" name="actualArrivalTime">
                  <TimePicker style={{ width: '100%' }} format="HH:mm" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>

        {/* WH-03A Multi-Batch Items List */}
        <Divider orientation="left" style={{ margin: '8px 0 16px' }}>
          <Text strong>WH-03A Items & Multi-Batch Receiving</Text>
        </Divider>

        {activeItems.map((item, itemIdx) => {
          const planned = item.plannedQty || item.poQty;
          const batches = item.batches || [];
          const totalBatchQty = batches.reduce((sum, b) => sum + (Number(b.batchQty) || 0), 0);
          const isBatchMatched = totalBatchQty === item.receiveQty;
          const isQtyUnder = item.receiveQty < planned;
          const diff = planned - item.receiveQty;

          return (
            <div
              key={item.code}
              style={{
                marginBottom: 16,
                border: !isBatchMatched ? '1px solid #dc2626' : '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 14,
                background: '#ffffff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              }}
            >
              <Row gutter={[12, 8]} align="middle" justify="space-between">
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
                      <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Planned</Text>
                      <Text strong>{planned} {item.uom}</Text>
                    </div>

                    <div>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Actual Received</Text>
                      <InputNumber
                        min={0}
                        max={planned * 2}
                        value={item.receiveQty}
                        onChange={(val) => handleUpdateItemField(itemIdx, 'receiveQty', val || 0)}
                        style={{ width: 100, height: 32 }}
                      />
                    </div>

                    <div>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Discrepancy</Text>
                      {diff > 0 ? (
                        <Tag color="error">Missing: -{diff}</Tag>
                      ) : diff < 0 ? (
                        <Tag color="purple">Over: +{Math.abs(diff)}</Tag>
                      ) : (
                        <Tag color="green">Exact</Tag>
                      )}
                    </div>

                    <div>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Batch Validation</Text>
                      <Tag color={isBatchMatched ? 'green' : 'red'}>
                        {totalBatchQty} / {item.receiveQty} {isBatchMatched ? 'Matched' : 'Unmatched'}
                      </Tag>
                    </div>

                    <Button
                      type="dashed"
                      icon={<BarcodeOutlined />}
                      onClick={() => handleAddBatch(itemIdx)}
                      style={{ height: 32 }}
                    >
                      + Add Batch
                    </Button>
                  </Space>
                </Col>
              </Row>

              {/* Missing Remark Input if quantity is short */}
              {isQtyUnder && (
                <div style={{ marginTop: 12, padding: '8px 12px', background: '#fef2f2', borderRadius: 6, border: '1px solid #fee2e2' }}>
                  <Text strong style={{ color: '#dc2626', fontSize: 12 }}>
                    Missing Quantity Discrepancy Reason *
                  </Text>
                  <Input
                    placeholder="e.g. Short shipment from supplier carton #12, seal was missing"
                    value={item.missingRemark || ''}
                    onChange={(e) => handleUpdateItemField(itemIdx, 'missingRemark', e.target.value)}
                    style={{ marginTop: 4, height: 32 }}
                  />
                </div>
              )}

              {/* Batches Expanded Section */}
              <div style={{ marginTop: 12, background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #f1f5f9' }}>
                <Text strong style={{ fontSize: 12, color: '#475569', display: 'block', marginBottom: 8 }}>
                  Recorded Batches ({batches.length})
                </Text>

                {batches.map((batch, bIdx) => (
                  <Row
                    key={batch.id || bIdx}
                    gutter={8}
                    align="middle"
                    style={{
                      marginBottom: 8,
                      background: '#fff',
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Col xs={12} sm={4}>
                      <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>Batch #</Text>
                      <Input
                        value={batch.batchNumber}
                        onChange={(e) => handleUpdateBatchField(itemIdx, bIdx, 'batchNumber', e.target.value)}
                        placeholder="LOT-XXX"
                        style={{ height: 32 }}
                      />
                    </Col>

                    <Col xs={12} sm={3}>
                      <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>Batch Qty ({item.uom})</Text>
                      <InputNumber
                        min={1}
                        value={batch.batchQty}
                        onChange={(val) => handleUpdateBatchField(itemIdx, bIdx, 'batchQty', val || 0)}
                        style={{ width: '100%', height: 32 }}
                      />
                    </Col>

                    <Col xs={12} sm={4}>
                      <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>Mfg Date</Text>
                      <DatePicker
                        style={{ width: '100%', height: 32 }}
                        value={batch.productionDate ? dayjs(batch.productionDate) : undefined}
                        onChange={(d: dayjs.Dayjs | null) => handleUpdateBatchField(itemIdx, bIdx, 'productionDate', d ? d.format('YYYY-MM-DD') : '')}
                      />
                    </Col>

                    <Col xs={12} sm={4}>
                      <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>Exp Date</Text>
                      <DatePicker
                        style={{ width: '100%', height: 32 }}
                        value={batch.expiryDate ? dayjs(batch.expiryDate) : undefined}
                        onChange={(d: dayjs.Dayjs | null) => handleUpdateBatchField(itemIdx, bIdx, 'expiryDate', d ? d.format('YYYY-MM-DD') : '')}
                      />
                    </Col>

                    <Col xs={12} sm={4}>
                      <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>Best Before</Text>
                      <DatePicker
                        style={{ width: '100%', height: 32 }}
                        value={batch.bestBeforeDate ? dayjs(batch.bestBeforeDate) : undefined}
                        onChange={(d: dayjs.Dayjs | null) => handleUpdateBatchField(itemIdx, bIdx, 'bestBeforeDate', d ? d.format('YYYY-MM-DD') : '')}
                      />
                    </Col>

                    <Col xs={20} sm={4}>
                      <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>Remark</Text>
                      <Input
                        value={batch.remark}
                        onChange={(e) => handleUpdateBatchField(itemIdx, bIdx, 'remark', e.target.value)}
                        placeholder="Pallet #"
                        style={{ height: 32 }}
                      />
                    </Col>

                    <Col xs={4} sm={1} style={{ textAlign: 'center' }}>
                      <Button
                        size="small"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveBatch(itemIdx, bIdx)}
                        disabled={batches.length === 1}
                      />
                    </Col>
                  </Row>
                ))}
              </div>
            </div>
          );
        })}
      </Modal>

      {/* WH-04 Review GR Modal */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#16a34a' }} />
            <span>WH-04 Review Goods Receipt Before Submitting to QC</span>
          </Space>
        }
        open={isReviewModalOpen}
        onCancel={() => setIsReviewModalOpen(false)}
        width={850}
        footer={[
          <Button key="back" icon={<EditOutlined />} onClick={() => { setIsReviewModalOpen(false); setIsReceivingModalOpen(true); }}>
            Back to Edit
          </Button>,
          <Button key="draft" icon={<SaveOutlined />} onClick={() => { message.info('Saved as draft.'); setIsReviewModalOpen(false); }}>
            Save Draft
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<SendOutlined />}
            onClick={handleConfirmSubmitToQC}
            style={{ background: '#16a34a', borderColor: '#16a34a' }}
          >
            Submit to QC
          </Button>,
        ]}
      >
        <Alert
          message="Summary of Physical Receiving"
          description="Please verify total received counts and multi-batch details. Once submitted, status will transition to 'Waiting for QC'."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <Statistic
                title="Planned Qty"
                value={activeItems.reduce((s, i) => s + (i.plannedQty || i.poQty || 0), 0)}
                suffix="units"
              />
            </div>
          </Col>
          <Col span={6}>
            <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 8, textAlign: 'center', border: '1px solid #bbf7d0' }}>
              <Statistic
                title="Actual Received Qty"
                value={activeItems.reduce((s, i) => s + (i.receiveQty || 0), 0)}
                valueStyle={{ color: '#16a34a' }}
                suffix="units"
              />
            </div>
          </Col>
          <Col span={6}>
            <div style={{ background: '#fef2f2', padding: 12, borderRadius: 8, textAlign: 'center', border: '1px solid #fecaca' }}>
              <Statistic
                title="Discrepancy"
                value={
                  activeItems.reduce((s, i) => s + (i.plannedQty || i.poQty || 0), 0) -
                  activeItems.reduce((s, i) => s + (i.receiveQty || 0), 0)
                }
                valueStyle={{ color: '#dc2626' }}
                suffix="units"
              />
            </div>
          </Col>
          <Col span={6}>
            <div style={{ background: '#eff6ff', padding: 12, borderRadius: 8, textAlign: 'center', border: '1px solid #bfdbfe' }}>
              <Statistic
                title="Total Batches"
                value={activeItems.reduce((s, i) => s + (i.batches?.length || 0), 0)}
              />
            </div>
          </Col>
        </Row>

        <Table
          size="small"
          dataSource={activeItems}
          rowKey="code"
          pagination={false}
          className="po-custom-table"
          columns={[
            { title: 'Item Code', dataIndex: 'code', key: 'code', render: (t) => <Text strong style={{ color: '#2563eb' }}>{t}</Text> },
            { title: 'Item Name', dataIndex: 'name', key: 'name' },
            { title: 'Planned', key: 'planned', render: (_, r) => (r.plannedQty || r.poQty).toLocaleString() },
            { title: 'Actual Received', dataIndex: 'receiveQty', key: 'receiveQty', render: (q) => <Tag color="green">{q.toLocaleString()}</Tag> },
            {
              title: 'Batches',
              key: 'batches',
              render: (_, r) => (
                <Space direction="vertical" size={2}>
                  {r.batches?.map((b) => (
                    <Text key={b.batchNumber} style={{ fontSize: 11 }}>
                      {b.batchNumber}: {b.batchQty} {r.uom}
                    </Text>
                  ))}
                </Space>
              ),
            },
            {
              title: 'Discrepancy Remark',
              key: 'missing',
              render: (_, r) => r.missingRemark ? <Text type="danger" style={{ fontSize: 11 }}>{r.missingRemark}</Text> : <Text type="secondary">-</Text>,
            },
          ]}
        />
      </Modal>

      {/* Temporary GR Creation Modal (Exception Flow) */}
      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: '#ca8504' }} />
            <span>Create Temporary GR / Without PO (Exception Flow)</span>
          </Space>
        }
        open={isTempGrModalOpen}
        onCancel={() => setIsTempGrModalOpen(false)}
        onOk={handleCreateTempGR}
        okText="Create Temporary GR"
      >
        <Alert
          message="Isolated Exception Flow"
          description="Temporary GRs without SAP PO are kept completely separate from the standard Planned Inbound flow. A SAP PO must be linked before final supervisor approval."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={tempGrForm} layout="vertical">
          <Form.Item label="Vendor / Supplier Name" name="vendor" rules={[{ required: true }]}>
            <Input placeholder="e.g. OMCam Co. Ltd" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Delivery Note (DN)" name="dnNumber" rules={[{ required: true }]}>
                <Input placeholder="DN or NA" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Truck Plate No." name="truckPlate">
                <Input placeholder="e.g. PP-3CC-1234" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Item Description / Temp Code" name="itemName" rules={[{ required: true }]}>
                <Input placeholder="e.g. Urgent Preforms" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Received Quantity" name="qty" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Arrival Reason & Explanation" name="reason" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="Explain why goods arrived before PO issuance" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
