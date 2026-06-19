import React, { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, Typography, Button, Input, Select, Radio, Badge, Row, Col, Space, Statistic, Modal, Form, Checkbox, message, DatePicker, Segmented } from 'antd';
import { AppstoreOutlined, BarsOutlined, ClockCircleOutlined, ExportOutlined, InboxOutlined, ReloadOutlined, SyncOutlined, WarningOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { history, useAccess, useLocation } from '@umijs/max';
import dayjs, { type Dayjs } from 'dayjs';

import { ProdPaths } from '@/pages/prod';
import BreadCrumbCom from '@/pages/prod/shared/BreadCrumbCom';
import { downloadGenericReport } from '@/services/apiGateway';
import { simpleRequestActions } from '@/services/model';
import { USE_STATIC_AUTH } from '@/staticAuthConfig';

// Subcomponents / Modals
import { GRCreationModal } from './features/goods-receipt';
import { GRDetailSidebar } from './features/goods-receipt';
import { TempGRCreationModal } from './features/goods-receipt';
import { LinkPOModal } from './features/purchase-order';
import { PODetailSidebar } from './features/purchase-order';
import { SupervisorApprovalSuccessModal } from './features/supervisor-review';

// Workspaces
import { WarehouseWorkspace } from './workspaces/WarehouseWorkspace';
import { QCWorkspace } from './workspaces/QCWorkspace';
import { SupervisorWorkspace } from './workspaces/SupervisorWorkspace';

// Shared state & hooks
import { useInboundContext, useInboundWorkspace, usePurchaseOrders, useGoodsReceipts, useInboundData } from './state';

// Types & business rules
import type {
  UpcomingInboundGoodsReceipt as GoodsReceipt,
  UpcomingInboundPurchaseOrder as PurchaseOrder,
  InboundSaveGoodsReceiptInput,
  InboundDashboardSummaryRange,
  InboundExportReportKey,
  InboundExportPlannedFilter,
} from './core/type';
import {
  type GRItem,
  type GoodsReceiptSourceType,
  type InboundHistoryStatus,
  type InboundProcessState,
  type POLinkStatus,
  type QcQueueStatus,
  canCombinePurchaseOrders,
  getCombinedPurchaseOrderVendor,
  getInboundHistoryStatus,
  getPurchaseOrderReceiptState,
  getQcQueueStatus,
  isQcRejectedReceipt,
  getReceiptPOReferences,
} from './core/workflow';

const { Text } = Typography;

function getClosedPurchaseOrdersForCreate(
  purchaseOrders: PurchaseOrder[],
  receipts: GoodsReceipt[],
) {
  return purchaseOrders.filter((purchaseOrder) => getPurchaseOrderReceiptState(purchaseOrder, receipts).isClosedPo);
}

type InboundViewMode = 'operations' | 'history';
type InboundRouteView = 'list' | 'create' | 'receive-without-po';
type InboundWorkspaceRole = 'WAREHOUSE_STAFF' | 'QC' | 'WAREHOUSE_SUPERVISOR';
type SupervisorHistoryStatusFilter = 'SUPERVISOR_PENDING' | 'QC_PENDING' | 'QC_REJECTED';
type HistoryStatusFilter = 'ALL' | InboundHistoryStatus | SupervisorHistoryStatusFilter;
type QcQueueStatusFilter = QcQueueStatus | 'All';
type QcStatusOptionWithBadge = {
  label: string;
  value: QcQueueStatusFilter;
  badgeCount?: number;
};
type DashboardSummaryViewMode = InboundDashboardSummaryRange | 'CUSTOM';
type InboundExportPeriod = 'DAILY' | 'WEEKLY' | 'CUSTOM';
type InboundExportFormValues = {
  reportTarget: InboundExportReportKey;
  plannedFilter: InboundExportPlannedFilter;
  period: InboundExportPeriod;
  dateRange?: [Dayjs, Dayjs];
  filterKeys?: InboundExportFilterKey[];
};
type InboundExportFilterKey =
  | 'withoutPoOnly'
  | 'agingOnly'
  | 'qcPendingOnly'
  | 'supervisorPendingOnly'
  | 'issueOnly';
type InboundReportOption = {
  label: string;
  value: InboundExportReportKey;
};
type DashboardStatCard = {
  title: string;
  value: number;
  color?: string;
  prefix?: ReactNode;
};

const DEFAULT_TABLE_PAGE_SIZE = 10;

const simulationRoleLabel: Record<InboundWorkspaceRole, string> = {
  WAREHOUSE_STAFF: 'Warehouse Staff',
  QC: 'QC',
  WAREHOUSE_SUPERVISOR: 'Warehouse Supervisor',
};

const getDefaultHistoryStatusFilter = (role: InboundWorkspaceRole): HistoryStatusFilter => {
  switch (role) {
    case 'WAREHOUSE_SUPERVISOR':
      return 'SUPERVISOR_PENDING';
    case 'WAREHOUSE_STAFF':
      return 'ALL';
    default:
      return 'ALL';
  }
};

const inboundReportOptionsByRole: Record<InboundWorkspaceRole, InboundReportOption[]> = {
  WAREHOUSE_STAFF: [
    { label: 'PO List', value: 'PO_LIST' },
    { label: 'IR / Receiving', value: 'WAREHOUSE_IR_RECEIVING' },
  ],
  QC: [{ label: 'QC Review', value: 'QC_REVIEW' }],
  WAREHOUSE_SUPERVISOR: [
    { label: 'Supervisor Approval', value: 'SUPERVISOR_APPROVAL' },
    { label: 'Status Summary', value: 'RECEIVING_STATUS_SUMMARY' },
  ],
};

const allInboundReportOptions: InboundReportOption[] = Array.from(
  new Map(
    Object.values(inboundReportOptionsByRole)
      .flat()
      .map((option) => [option.value, option]),
  ).values(),
);

const inboundExportFilterOptions: Array<{
  label: string;
  value: InboundExportFilterKey;
}> = [
  { label: 'IR without PO only', value: 'withoutPoOnly' },
  { label: 'Aging only', value: 'agingOnly' },
  { label: 'QC pending only', value: 'qcPendingOnly' },
  { label: 'Supervisor pending only', value: 'supervisorPendingOnly' },
  { label: 'IR with issue only', value: 'issueOnly' },
];

function getInboundExportDateRange(period: InboundExportPeriod): [Dayjs, Dayjs] {
  const today = dayjs();

  if (period === 'WEEKLY') {
    return [today.startOf('week'), today.endOf('week')];
  }

  return [today, today];
}

function InboundExportReportModal({
  open,
  loading,
  reportOptions,
  onCancel,
  onExport,
}: {
  open: boolean;
  loading: boolean;
  reportOptions: InboundReportOption[];
  onCancel: () => void;
  onExport: (values: Required<InboundExportFormValues>) => void;
}) {
  const [form] = Form.useForm<InboundExportFormValues>();
  const reportTargetValue = Form.useWatch('reportTarget', form);
  const periodValue = Form.useWatch('period', form);

  const shouldDisableSubmit = false;

  const initialValues = useMemo<Partial<InboundExportFormValues>>(() => {
    return {
      reportTarget: reportOptions[0]?.value,
      plannedFilter: 'ALL',
      period: 'DAILY',
      filterKeys: [],
    };
  }, [reportOptions]);

  useEffect(() => {
    if (!open) {
      return;
    }
    form.resetFields();
  }, [open]);

  const handleValuesChange = (changedValues: Partial<InboundExportFormValues>) => {
    if (changedValues.reportTarget) {
      form.setFieldValue('filterKeys', []);
    }
    if (changedValues.period) {
      form.setFieldValue('dateRange', undefined);
    }
  };

  const handleFinish = (values: InboundExportFormValues) => {
    const period = values.period;
    let dateRange = values.dateRange;

    if (!dateRange) {
      dateRange = getInboundExportDateRange(period);
    }

    onExport({
      ...values,
      dateRange,
    } as Required<InboundExportFormValues>);
  };

  const reportTargetOptions = useMemo(() => {
    return reportOptions.map((option) => ({
      label: option.label,
      value: option.value,
    }));
  }, [reportOptions]);

  const showAdditionalFilters = reportTargetValue === 'PO_LIST' || reportTargetValue === 'WAREHOUSE_IR_RECEIVING';

  return (
    <Modal
      title="Export Inbound Report"
      open={open}
      onCancel={onCancel}
      confirmLoading={loading}
      okButtonProps={{
        disabled: shouldDisableSubmit,
      }}
      onOk={() => form.submit()}
      width={480}
      destroyOnClose
    >
      <div style={{ paddingBlock: 8 }}>
        <Form<InboundExportFormValues>
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onValuesChange={handleValuesChange}
          onFinish={handleFinish}
        >
          <Form.Item name="reportTarget" label="Report Target" rules={[{ required: true }]}>
            <Select options={reportTargetOptions} />
          </Form.Item>
          {reportTargetValue === 'PO_LIST' && (
            <Form.Item name="plannedFilter" label="Fulfillment Type">
              <Radio.Group>
                <Radio value="ALL">All Type</Radio>
                <Radio value="PLANNED">Planned</Radio>
                <Radio value="UNPLANNED">Unplanned</Radio>
              </Radio.Group>
            </Form.Item>
          )}
          <Form.Item name="period" label="Export Period" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="DAILY">Daily</Radio>
              <Radio value="WEEKLY">Weekly</Radio>
              <Radio value="CUSTOM">Pick Period</Radio>
            </Radio.Group>
          </Form.Item>
          {periodValue === 'CUSTOM' && (
            <Form.Item
              name="dateRange"
              label="Select Date Range"
              rules={[{ required: true, message: 'Please select a date range.' }]}
            >
              <DatePicker.RangePicker style={{ width: '100%' }} />
            </Form.Item>
          )}
          {showAdditionalFilters && (
            <Form.Item name="filterKeys" label="Options / Additional Filters">
              <Checkbox.Group style={{ width: '100%' }}>
                <Row gutter={[0, 8]}>
                  {inboundExportFilterOptions
                    .filter((option) => {
                      if (reportTargetValue === 'PO_LIST') {
                        return option.value === 'agingOnly';
                      }
                      return option.value !== 'agingOnly';
                    })
                    .map((option) => (
                      <Col span={24} key={option.value}>
                        <Checkbox value={option.value}>{option.label}</Checkbox>
                      </Col>
                    ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          )}
        </Form>
      </div>
    </Modal>
  );
}

const inboundWorkspaceMotionStyles = `
@keyframes inboundWorkspaceFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.inbound-workspace-tab-pane {
  animation: inboundWorkspaceFadeIn 0.2s cubic-bezier(0.215, 0.61, 0.355, 1) both;
}
`;

export interface InboundListviewProps {
  routeView?: InboundRouteView;
}

export function InboundListview({ routeView = 'list' }: InboundListviewProps) {
  const context = useInboundContext();
  const requestActions = simpleRequestActions();

  const {
    isInboundAdmin,
    hasInboundSyncAdminRole,
    inboundVisibleBusinessUnits,
    inboundWarehouseBusinessUnits,
    inboundQcBusinessUnits,
    inboundSupervisorBusinessUnits,
    inboundRoleOptions,
    hasInboundWorkspaceAccess,
    activeRole,
    simulationRole,
    setSimulationRole,
    inboundView,
    setInboundView,
    effectiveInboundView,
    activeBusinessUnit,
    setActiveBusinessUnit,
    activeBusinessUnitFilter,
    hasActiveBusinessUnit,
    isGRCreationOpen,
    setIsGRCreationOpen,
    isTempGRCreationOpen,
    setIsTempGRCreationOpen,
    selectedPODetail,
    setSelectedPODetail,
    selectedGR,
    setSelectedGR,
    warehouseCorrectionReceipt,
    setWarehouseCorrectionReceipt,
    linkPOReceipt,
    setLinkPOReceipt,
    supervisorApprovalSuccess,
    setSupervisorApprovalSuccess,
    isExportReportModalOpen,
    setIsExportReportModalOpen,
    isExportingReport,
    setIsExportingReport,
    canUseWarehouseRole,
    canSyncPurchaseOrdersFromSap,
    services,
  } = useInboundWorkspace();

  const {
    purchaseOrders,
    poPagination,
    poSearchValue,
    setPOSearchValue,
    poVendorFilter,
    setPOVendorFilter,
    poVendorSearch,
    setPoVendorSearch,
    poTypeFilter,
    setPOTypeFilter,
    selectedPOs,
    setSelectedPOs,
    selectedWarehousePONumbers,
    setSelectedWarehousePONumbers,
    isSyncingPurchaseOrders,
    getPurchaseOrderRowKey,
    loadPurchaseOrders,
  } = usePurchaseOrders();

  const {
    receipts,
    awaitingPOLinkReceipts,
    exceptionQueueReceipts,
    queuePagination,
    historyPagination,
    queueSearchValue,
    setQueueSearchValue,
    queueTypeFilter,
    setQueueTypeFilter,
    queueSourceFilter,
    setQueueSourceFilter,
    qcStatusFilter,
    setQcStatusFilter,
    historyTypeFilter,
    setHistoryTypeFilter,
    historyStatusFilter,
    setHistoryStatusFilter,
    loadReceipts,
    loadWarehouseSupportReceipts,
    saveGoodsReceipt,
    changeGoodsReceiptStatus,
    linkPoToTempReceipt,
    submitQcReview,
    submitSupervisorReview,
    markQcBadgeViewed,
  } = useGoodsReceipts();

  const {
    inboundStats,
    supplierMasterOptions,
    uomMasterOptions,
    warehouseMasterOptions,
    itemMasterOptions,
    loadInboundData,
    refreshCurrentTable,
  } = useInboundData();

  const location = useLocation();
  const isRoleSimulationEnabled = USE_STATIC_AUTH;

  // Track initial load from URL query params
  const hasOpenedReceiptFromQueryRef = useRef(false);

  const routePurchaseOrderKeys = useMemo<string[]>(() => {
    if (typeof window === 'undefined' || !window.location.search) {
      return [];
    }
    const params = new URLSearchParams(window.location.search);
    return params.getAll('poKey').filter(Boolean);
  }, [location.search]);

  const isCreateInboundRoute = routeView === 'create';
  const isReceiveWithoutPoRoute = routeView === 'receive-without-po';

  const closeInboundEntryRoute = useCallback(() => {
    history.push(ProdPaths.upcomingInbound);
  }, []);

  const parsePurchaseOrderRowKey = useCallback(
    (key: string): { businessUnit: string; poNumber: string } => {
      const parts = key.split('::');
      return {
        businessUnit: parts[0] === 'UNSPECIFIED' ? '' : parts[0],
        poNumber: parts[1] || '',
      };
    },
    [],
  );

  // Sync receipts list updates in UI
  const syncReceiptInState = useCallback((normalized: GoodsReceipt): GoodsReceipt => {
    context.setReceipts((prev) => {
      const exists = prev.some((row) => row.grNumber === normalized.grNumber);
      if (!exists) {
        return prev;
      }
      return prev.map((row) => (row.grNumber === normalized.grNumber ? normalized : row));
    });

    setSelectedGR((prev) => {
      if (!prev || prev.grNumber !== normalized.grNumber) return prev;
      return normalized;
    });

    return normalized;
  }, [context]);

  // Master data filtering for unplanned receiving (receive without PO)
  const tempReceiptBusinessUnits = useMemo(() => {
    if (isInboundAdmin) {
      return ['OFL', 'NYD', 'SFC'];
    }
    return inboundWarehouseBusinessUnits;
  }, [inboundWarehouseBusinessUnits, isInboundAdmin]);

  const activeTempReceiptBU = activeBusinessUnitFilter || tempReceiptBusinessUnits[0];

  const supplierOptionsForTempReceipt = useMemo(() => {
    return supplierMasterOptions.filter(
      (supplier) => !activeTempReceiptBU || supplier.business_unit === activeTempReceiptBU,
    );
  }, [supplierMasterOptions, activeTempReceiptBU]);

  const uomOptionsForTempReceipt = useMemo(() => uomMasterOptions, [uomMasterOptions]);

  const itemOptionsForTempReceipt = useMemo(() => {
    return itemMasterOptions.filter(
      (item) => !activeTempReceiptBU || item.business_unit === activeTempReceiptBU,
    );
  }, [itemMasterOptions, activeTempReceiptBU]);


  const agingPoItemCount = useMemo(() => {
    return inboundStats.agingPoItems ?? 0;
  }, [inboundStats]);

  // Warehouse UI specific variables
  const warehouseVendorOptions = useMemo(() => {
    return Array.from(new Set(purchaseOrders.map((po) => po.supplier).filter(Boolean))).sort(
      (left, right) => left.localeCompare(right),
    );
  }, [purchaseOrders]);

  const selectedWarehousePOs = useMemo(() => {
    return purchaseOrders.filter((purchaseOrder) =>
      selectedWarehousePONumbers.includes(getPurchaseOrderRowKey(purchaseOrder)),
    );
  }, [getPurchaseOrderRowKey, purchaseOrders, selectedWarehousePONumbers]);

  const selectedWarehousePOVendor = useMemo(() => {
    return getCombinedPurchaseOrderVendor(selectedWarehousePOs);
  }, [selectedWarehousePOs]);

  // Load Inbound Data Effect
  useEffect(() => {
    void loadInboundData();
  }, [loadInboundData]);

  // Clear URL query parameters for direct links
  const clearReceiptQueryParams = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const nextUrl = new URL(window.location.href);
    let changed = false;
    ['inboundReceiptId', 'inboundView'].forEach((key) => {
      if (nextUrl.searchParams.has(key)) {
        nextUrl.searchParams.delete(key);
        changed = true;
      }
    });

    if (changed) {
      window.history.replaceState({}, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    }
  }, []);

  const handleOpenReceiptInNewTab = useCallback((receiptId: number) => {
    if (typeof window === 'undefined') {
      return;
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('inboundReceiptId', String(receiptId));
    nextUrl.searchParams.set('inboundView', 'operations');
    window.open(nextUrl.toString(), '_blank', 'noopener,noreferrer');
  }, []);

  // Handlers for PO and GR Details
  const handleViewPODetail = async (po: PurchaseOrder) => {
    try {
      let detail: PurchaseOrder;
      if (po.businessUnit) {
        detail = await services.detailPurchaseOrderByKey({
          po_number: po.poNumber,
          business_unit: po.businessUnit,
        });
      } else if (po.id) {
        detail = await services.detailPurchaseOrder(po.id);
      } else {
        detail = po;
      }
      setSelectedPODetail(detail);
    } catch (error: any) {
      message.error(error?.message || 'Failed to load purchase order detail.');
    }
  };

  const handleOpenGRDetail = async (gr: GoodsReceipt) => {
    const qcStatus = activeRole === 'QC' ? getQcQueueStatus(gr) : null;
    if (!gr.id) {
      const latest = receipts.find((row) => row.grNumber === gr.grNumber) || gr;
      setSelectedGR(latest);
      return;
    }

    try {
      if (qcStatus === 'Submitted' || (qcStatus === 'Rejected' && isQcRejectedReceipt(gr))) {
        const viewedResponse = await services.markQcBadgeViewed({
          id: gr.id,
          status: qcStatus,
        });
        const viewedReceipt = viewedResponse.data;
        syncReceiptInState(viewedReceipt);
        setSelectedGR(viewedReceipt);
        return;
      }

      const detail = await services.detailGoodsReceipt(gr.id);
      setSelectedGR(detail);
    } catch (error: any) {
      message.error(error?.message || 'Failed to load inbound receiving detail.');
    }
  };

  // Direct link routing from URL query parameter
  useEffect(() => {
    if (typeof window === 'undefined' || hasOpenedReceiptFromQueryRef.current) {
      return;
    }

    const receiptIdParam = window.location.search
      ? new URLSearchParams(window.location.search).get('inboundReceiptId')
      : null;
    const receiptId = Number(receiptIdParam);
    if (!receiptIdParam || Number.isNaN(receiptId) || receiptId <= 0) {
      return;
    }

    hasOpenedReceiptFromQueryRef.current = true;
    setInboundView('operations');

    void (async () => {
      try {
        const detail = await services.detailGoodsReceipt(receiptId);
        setSelectedPODetail(null);
        setSelectedGR(detail);
      } catch (error: any) {
        clearReceiptQueryParams();
        message.error(error?.message || 'Failed to open inbound receiving detail.');
      }
    })();
  }, [clearReceiptQueryParams, services]);

  // Map local forms to InboundSaveGoodsReceiptInput API request structure
  const mapDraftToSaveInput = (data: any): InboundSaveGoodsReceiptInput => {
    const canonicalPoReferences = Array.from(
      new Map(
        [...(data.poReferences || [])]
          .filter((reference) => reference?.poNumber)
          .sort((left, right) =>
            `${left.businessUnit || ''}::${left.poNumber}`.localeCompare(
              `${right.businessUnit || ''}::${right.poNumber}`,
            ),
          )
          .map((reference) => [
            `${reference.businessUnit || ''}::${reference.poNumber}`,
            reference,
          ]),
      ).values(),
    );
    const primaryPoReference = canonicalPoReferences[0];
    const receiptSourceType: GoodsReceiptSourceType =
      data.receiptSourceType || (data.receiptType === 'Planned' ? 'PLANNED' : 'UNPLANNED_WITH_PO');
    const poLinkStatus: POLinkStatus =
      data.poLinkStatus || (receiptSourceType === 'TEMP_NO_PO' ? 'WAITING_PO' : 'NOT_REQUIRED');

    return {
      id: data.id || undefined,
      gr_number: data.grNumber || undefined,
      receiving_number: data.receivingNumber || data.grNumber || undefined,
      process_state: data.processState || undefined,
      business_unit: data.businessUnit || primaryPoReference?.businessUnit || undefined,
      po_number: primaryPoReference?.poNumber || data.linkedPoNumber || undefined,
      supplier: primaryPoReference?.supplier || data.supplier,
      receipt_type: data.receiptType,
      append_to_open_receiving: false,
      receipt_source_type: receiptSourceType,
      po_link_status: poLinkStatus,
      temp_reference_no: data.tempReferenceNo || undefined,
      pending_po_reason: data.pendingPOReason || undefined,
      linked_po_number: data.linkedPoNumber || undefined,
      received_by_user: data.receiverWarehouseName || undefined,
      on_hold_warehouse_code: data.receiverWarehouseName || undefined,
      posting_date: data.postingDate,
      actual_receipt_date: data.actualReceiptDate,
      delivery_note_number: data.deliveryNoteNumber || '',
      poReferences: canonicalPoReferences.map((reference) => ({
        poNumber: reference.poNumber,
        businessUnit: reference.businessUnit,
        supplier: reference.supplier,
        expectedDate: reference.expectedDate,
        expectedTime: reference.expectedTime,
        deliveryNoteNumber: reference.deliveryNoteNumber || undefined,
      })),
      items: (data.items || []).map((item: GRItem) => ({
        poNumber: item.poNumber || undefined,
        poLineNumber: item.poLineNumber || undefined,
        supplier: item.supplier || undefined,
        code: item.code,
        name: item.name,
        poQty: item.poQty,
        receiveQty: item.receiveQty,
        uom: item.uom,
        condition: item.isMissing ? 'Missing' : 'Good',
        damagedQty: 0,
        rowNumber: undefined,
        isMissing: item.isMissing,
        missingRemark: item.missingRemark || undefined,
        productDate: item.productDate || undefined,
        expiryDate: item.expiryDate || undefined,
        batchNumber: item.batchNumber || undefined,
        barcode: item.barcode || undefined,
        qcDecision: item.qcDecision || undefined,
        qcRejectedQty: item.qcRejectedQty ?? undefined,
        qcRemark: item.qcRemark || undefined,
      })),
      spec_match: data.specMatch ?? true,
      qty_match: data.qtyMatch ?? true,
      quality_check_required: data.qualityCheckRequired ?? true,
      qc_result: data.qcResult ?? 'Pending',
      exception_reason: data.exceptionReason || undefined,
      documentChecklist: {
        vendorDN: data.documentChecklist?.vendorDN ?? false,
        goodsReceiptPOForm: data.documentChecklist?.goodsReceiptPOForm ?? true,
        pmrmLabelForm: false,
        pmrmStockCardForm: data.documentChecklist?.pmrmStockCardForm ?? false,
        supportingDocs: (data.documentChecklist?.supportingDocs || []).map((doc: any) => ({
          fileId: doc.fileId || undefined,
          fileName: doc.fileName,
          source: doc.source || undefined,
          poNumber: doc.poNumber || undefined,
        })),
      },
      labelForms: [],
    };
  };

  const persistWarehouseReceipt = async (data: any, successMessage: string) => {
    try {
      const existingReceipt = data.id ? receipts.find((receipt) => receipt.id === data.id) : null;
      const response = await saveGoodsReceipt(mapDraftToSaveInput(data));
      const updatedReceipt = response.data;
      setSelectedPOs([]);
      setSelectedWarehousePONumbers([]);
      await loadInboundData();
      syncReceiptInState(updatedReceipt);
      if (
        existingReceipt &&
        ['CORRECTION_REQUIRED', 'MISMATCH_EXCEPTION'].includes(existingReceipt.processState)
      ) {
        setSelectedGR(updatedReceipt);
      }
      message.success(successMessage);
      return true;
    } catch (error: any) {
      message.error(error?.message || 'Failed to save inbound receiving.');
      return false;
    }
  };

  const handleSaveDraft = async (data: any) => {
    const existingReceipt = data.id ? receipts.find((receipt) => receipt.id === data.id) : null;
    const successMessage =
      existingReceipt &&
      ['CORRECTION_REQUIRED', 'MISMATCH_EXCEPTION'].includes(existingReceipt.processState)
        ? 'Inbound receiving correction saved. Submit it to QC after warehouse recheck is complete.'
        : 'Inbound receiving draft saved.';

    return persistWarehouseReceipt(data, successMessage);
  };

  const handleSubmitGR = async (data: any) => {
    return persistWarehouseReceipt(data, 'Inbound receiving submitted.');
  };

  const handleOpenWarehouseCorrection = (receipt: GoodsReceipt) => {
    setSelectedGR(null);
    setWarehouseCorrectionReceipt(receipt);
  };

  const handleUpdateGRProcessState = async (
    grNumber: string,
    newState: InboundProcessState,
    note?: string,
    action?: string,
  ) => {
    const currentReceipt = receipts.find((gr) => gr.grNumber === grNumber);
    if (!currentReceipt?.id) {
      message.error('Inbound receiving id is missing.');
      return;
    }

    try {
      const response = await changeGoodsReceiptStatus({
        id: currentReceipt.id,
        statusChange: newState,
        remark: note,
        state: newState,
        action,
      });
      await loadInboundData();
      syncReceiptInState(response.data);
      message.success(response.message || 'Inbound receiving status updated.');
    } catch (error: any) {
      message.error(error?.message || 'Failed to update inbound receiving status.');
    }
  };

  // QC status badge counters and event handlers
  const qcRelevantReceipts = useMemo(
    () => receipts.filter((receipt) => getQcQueueStatus(receipt) !== null),
    [receipts],
  );

  const shouldShowQcReceiptNotificationBadge = useCallback((receipt: GoodsReceipt) => {
    const status = getQcQueueStatus(receipt);

    if (!status) {
      return false;
    }

    if (status === 'Pending') {
      return receipt.items.some((item) => !item.qcDecision);
    }

    if (status === 'Submitted' || status === 'Rejected') {
      if (status === 'Submitted') {
        return !receipt.qcSubmittedViewedAt;
      }

      return isQcRejectedReceipt(receipt) && !receipt.qcRejectedViewedAt;
    }

    return false;
  }, []);

  const [qcStatusCounts, setQcStatusCounts] = useState({
    Pending: 0,
    Submitted: 0,
    Rejected: 0,
  });

  useEffect(() => {
    const currentCounts = {
      Pending: 0,
      Submitted: 0,
      Rejected: 0,
    };

    qcRelevantReceipts.forEach((receipt) => {
      const status = getQcQueueStatus(receipt);
      if (
        (status === 'Pending' || status === 'Submitted' || status === 'Rejected') &&
        shouldShowQcReceiptNotificationBadge(receipt)
      ) {
        currentCounts[status] += 1;
      }
    });

    setQcStatusCounts((prev) => {
      if (qcStatusFilter === 'All') {
        return currentCounts;
      }

      const next = { ...prev };
      if (qcStatusFilter === 'Pending') next.Pending = currentCounts.Pending;
      if (qcStatusFilter === 'Submitted') next.Submitted = currentCounts.Submitted;
      if (qcStatusFilter === 'Rejected') next.Rejected = currentCounts.Rejected;

      if (
        next.Pending === prev.Pending &&
        next.Submitted === prev.Submitted &&
        next.Rejected === prev.Rejected
      ) {
        return prev;
      }
      return next;
    });
  }, [qcRelevantReceipts, shouldShowQcReceiptNotificationBadge, qcStatusFilter]);

  const qcStatusOptions: Array<{ label: string; value: QcQueueStatusFilter }> = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Submitted', value: 'Submitted' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Complete', value: 'Complete' },
    { label: 'All', value: 'All' },
  ];

  const qcStatusOptionsWithBadge = useMemo<QcStatusOptionWithBadge[]>(
    () =>
      qcStatusOptions.map((option) => {
        const badgeCount = qcStatusCounts[option.value as keyof typeof qcStatusCounts] || 0;
        return {
          ...option,
          badgeCount: badgeCount > 0 ? badgeCount : undefined,
        };
      }),
    [qcStatusCounts],
  );

  const warehouseRejectedReceiptCount = useMemo(
    () => receipts.filter((receipt) => getInboundHistoryStatus(receipt) === 'Rejected').length,
    [receipts],
  );


  const handleSubmitQCVerification = async (
    receipt: GoodsReceipt,
    payload: {
      items: GRItem[];
      processState: InboundProcessState;
      qcResult: GoodsReceipt['qcResult'];
      exceptionReason?: string;
      stepTitle: string;
      documentChecklist: GoodsReceipt['documentChecklist'];
    },
  ) => {
    if (!receipt.id) {
      message.error('Inbound receiving id is missing.');
      return false;
    }

    try {
      const response = await submitQcReview({
        id: receipt.id,
        items: payload.items.map((item) => ({
          code: item.code,
          itemId: item.id ?? undefined,
          poNumber: item.poNumber || undefined,
          poLineNumber: item.poLineNumber ?? undefined,
          batchNumber: item.batchNumber || undefined,
          qcDecision: item.qcDecision || 'Pass',
          qcRejectedQty: item.qcRejectedQty ?? undefined,
          qcRemark: item.qcRemark || undefined,
        })),
        documentChecklist: {
          vendorDN: payload.documentChecklist.vendorDN,
          goodsReceiptPOForm: payload.documentChecklist.goodsReceiptPOForm,
          pmrmLabelForm: false,
          pmrmStockCardForm: payload.documentChecklist.pmrmStockCardForm,
          supportingDocs: payload.documentChecklist.supportingDocs || [],
        },
      });
      await loadInboundData();
      const updated = syncReceiptInState(response.data);

      const isQcReject = payload.qcResult === 'Rejected';

      setQcStatusCounts((prev) => {
        const isPass = updated.qcResult === 'Pass';
        return {
          ...prev,
          Pending: qcStatusFilter === 'Pending' ? Math.max(0, prev.Pending - 1) : prev.Pending,
          Submitted: (isPass || isQcReject) ? prev.Submitted + 1 : prev.Submitted,
          Rejected: (!isPass || isQcReject) ? prev.Rejected + 1 : prev.Rejected,
        };
      });

      if (isQcReject && updated.qcResult === 'Pass') {
        setQcStatusFilter('Submitted');
        setSelectedGR(updated);
      } else {
        setQcStatusFilter(updated.qcResult === 'Pass' ? 'Submitted' : 'Rejected');
        if (updated.qcResult === 'Pass') {
          setSelectedGR(null);
        } else {
          setSelectedGR(updated);
        }
      }
      message.success(response.message || 'QC review submitted.');
      return true;
    } catch (error: any) {
      message.error(error?.message || 'Failed to submit review.');
      return false;
    }
  };

  const handleSubmitSupervisorReview = async (
    receipt: GoodsReceipt,
    payload: { action: 'approve' | 'reject'; note?: string },
  ) => {
    if (!receipt.id) {
      message.error('Inbound receiving id is missing.');
      return false;
    }

    try {
      const response = await submitSupervisorReview({
        id: receipt.id,
        action: payload.action,
        note: payload.note,
      });
      await loadInboundData();
      const updated = syncReceiptInState(response.data);

      if (payload.action === 'approve') {
        setSupervisorApprovalSuccess({
          approvedBy: updated.approvedBy || 'warehouse.supervisor',
          approvedDate: updated.approvedDate || '',
          approvedGrNumber: updated.approvedGrNumber || undefined,
          receivingNumber: updated.receivingNumber || updated.grNumber,
          note: payload.note?.trim(),
          poNumber: updated.poNumber,
          poReferences: updated.poReferences,
          receiptType: updated.receiptType,
          receiverWarehouseName: updated.receiverWarehouseName,
          supplier: updated.supplier,
          supplierNames: updated.supplierNames,
        });
        setSelectedGR(null);
      } else {
        setSupervisorApprovalSuccess(null);
        setSelectedGR(updated);
      }

      message.success(response.message || 'Supervisor review submitted.');
      return true;
    } catch (error: any) {
      message.error(error?.message || 'Failed to submit supervisor review.');
      return false;
    }
  };

  const handleLinkReceiptToPO = async (receipt: GoodsReceipt, purchaseOrder: PurchaseOrder) => {
    if (!receipt.id) {
      message.error('Inbound receiving id is missing.');
      return;
    }

    try {
      const response = await linkPoToTempReceipt({
        id: receipt.id,
        docNum: purchaseOrder.sapDocNum || purchaseOrder.poNumber,
      });
      syncReceiptInState(response.data);
      setLinkPOReceipt(null);
      await loadInboundData();
      message.success('Linked to PO Successfully.');
    } catch (error: any) {
      message.error(error?.message || 'Failed to link temporary PO.');
    }
  };

  const handleUpdatePOLinkValidation = (receipt: GoodsReceipt, reason: string) => {
    const nextReason = reason || undefined;
    context.setReceipts((prev) => {
      let changed = false;
      const next = prev.map((gr) => {
        if (gr.grNumber !== receipt.grNumber || gr.linkBlockReason === nextReason) {
          return gr;
        }
        changed = true;
        return {
          ...gr,
          linkBlockReason: nextReason,
        };
      });
      return changed ? next : prev;
    });

    setSelectedGR((prev) => {
      if (!prev || prev.grNumber !== receipt.grNumber || prev.linkBlockReason === nextReason) {
        return prev;
      }
      return {
        ...prev,
        linkBlockReason: nextReason,
      };
    });
  };

  // Sync Purchase Orders from SAP
  const handleSyncPurchaseOrdersFromSap = async () => {
    try {
      context.setIsSyncingPurchaseOrders(true);
      const response = await services.syncPurchaseOrdersFromSap();
      await loadInboundData();
      if (response.data?.skipped) {
        message.warning(response.message || 'Inbound PO sync from SAP was skipped.');
      } else {
        message.success(response.message || 'Inbound PO sync from SAP completed.');
      }
    } catch (error: any) {
      message.error(error?.message || 'Failed to sync inbound PO from SAP.');
    } finally {
      context.setIsSyncingPurchaseOrders(false);
    }
  };

  // Export report modal handlers
  const handleExportReport = async (values: Required<InboundExportFormValues>) => {
    const [dateFromValue, dateToValue] = values.dateRange;
    const dateFrom = dateFromValue.format('YYYY-MM-DD');
    const dateTo = dateToValue.format('YYYY-MM-DD');
    const isPoReport = values.reportTarget === 'PO_LIST';
    const searchValue = isPoReport ? poSearchValue : queueSearchValue;
    const filterKeys = values.filterKeys || [];

    try {
      setIsExportingReport(true);
      const report = await services.buildExportReport({
        reportKey: values.reportTarget,
        businessUnit: activeBusinessUnitFilter || null,
        dateFrom,
        dateTo,
        searchValue: searchValue.trim() || null,
        withoutPoOnly: filterKeys.includes('withoutPoOnly'),
        agingOnly: filterKeys.includes('agingOnly'),
        qcPendingOnly: filterKeys.includes('qcPendingOnly'),
        supervisorPendingOnly: filterKeys.includes('supervisorPendingOnly'),
        issueOnly: filterKeys.includes('issueOnly'),
        plannedFilter: values.plannedFilter === 'ALL' ? null : values.plannedFilter,
      });

      await downloadGenericReport(requestActions)({
        fileName: report.fileName,
        data: {
          reportName: report.reportName,
          reportPath: report.reportPath,
          data: report.data,
        },
        type: 'EXCEL',
      });
      setIsExportReportModalOpen(false);
    } catch (error) {
      message.error('Failed to download.');
    } finally {
      setIsExportingReport(false);
    }
  };

  // Route validation and simulations
  useEffect(() => {
    const visiblePurchaseOrderKeys = new Set(
      purchaseOrders.map((purchaseOrder) => getPurchaseOrderRowKey(purchaseOrder)),
    );

    setSelectedWarehousePONumbers((prev) => {
      const next = prev.filter((poKey) => visiblePurchaseOrderKeys.has(poKey));
      return next.length === prev.length ? prev : next;
    });
  }, [getPurchaseOrderRowKey, purchaseOrders]);

  useEffect(() => {
    if (poVendorFilter === 'ALL') {
      return;
    }

    if (!warehouseVendorOptions.includes(poVendorFilter)) {
      setPOVendorFilter('ALL');
    }
  }, [poVendorFilter, warehouseVendorOptions]);

  const previousRoleRef = useRef<InboundWorkspaceRole | null>(null);

  useEffect(() => {
    if (previousRoleRef.current === activeRole) {
      return;
    }

    previousRoleRef.current = activeRole as InboundWorkspaceRole;
    setHistoryStatusFilter(getDefaultHistoryStatusFilter(activeRole as InboundWorkspaceRole));
    context.setQueuePagination((prev) => ({ ...prev, current: 1 }));
    context.setHistoryPagination((prev) => ({ ...prev, current: 1 }));
  }, [activeRole]);

  // Route matching effects for Create / Receive without PO
  useEffect(() => {
    if (!isCreateInboundRoute) {
      setIsGRCreationOpen(false);
      return;
    }

    let isCancelled = false;

    const openCreateRoute = async () => {
      if (routePurchaseOrderKeys.length === 0) {
        message.warning('Please select purchase orders before creating inbound receiving.');
        closeInboundEntryRoute();
        return;
      }

      try {
        const purchaseOrdersFromRoute = await Promise.all(
          routePurchaseOrderKeys.map((key) => {
            const { businessUnit, poNumber } = parsePurchaseOrderRowKey(key);
            return services.detailPurchaseOrderByKey({
              po_number: poNumber,
              business_unit: businessUnit,
            });
          }),
        );

        if (isCancelled) return;

        if (!canCombinePurchaseOrders(purchaseOrdersFromRoute)) {
          message.error(
            'Selected purchase orders no longer share the same business unit and vendor. Please reselect them.',
          );
          closeInboundEntryRoute();
          return;
        }

        const closedPurchaseOrders = getClosedPurchaseOrdersForCreate(
          purchaseOrdersFromRoute,
          receipts,
        );
        if (closedPurchaseOrders.length > 0) {
          message.error(
            `Cannot create inbound receiving for closed PO: ${closedPurchaseOrders
              .map((purchaseOrder) => purchaseOrder.poNumber)
              .join(', ')}`,
          );
          closeInboundEntryRoute();
          return;
        }

        setSelectedPODetail(null);
        setSelectedPOs(
          [...purchaseOrdersFromRoute].sort((left, right) =>
            left.poNumber.localeCompare(right.poNumber),
          ),
        );
        setIsGRCreationOpen(true);
      } catch (error: any) {
        if (isCancelled) return;
        message.error(error?.message || 'Failed to load purchase order detail.');
        closeInboundEntryRoute();
      }
    };

    void openCreateRoute();

    return () => {
      isCancelled = true;
    };
  }, [closeInboundEntryRoute, isCreateInboundRoute, routePurchaseOrderKeys, receipts]);

  useEffect(() => {
    if (!isReceiveWithoutPoRoute) {
      setIsTempGRCreationOpen(false);
      return;
    }

    if (!canUseWarehouseRole) {
      message.error('You do not have warehouse permission for the selected business unit.');
      closeInboundEntryRoute();
      return;
    }

    setIsTempGRCreationOpen(true);
  }, [canUseWarehouseRole, closeInboundEntryRoute, isReceiveWithoutPoRoute]);

  const handleWarehousePOSelectionChange = (nextSelectedRowKeys: string[]) => {
    const nextSelectedPOs = purchaseOrders.filter((purchaseOrder) =>
      nextSelectedRowKeys.includes(getPurchaseOrderRowKey(purchaseOrder)),
    );

    if (!canCombinePurchaseOrders(nextSelectedPOs)) {
      message.warning('Please select purchase orders from the same business unit and vendor only.');
      return;
    }

    setSelectedWarehousePONumbers(
      nextSelectedPOs.map((purchaseOrder) => getPurchaseOrderRowKey(purchaseOrder)),
    );
  };

  const handleCreateTempGR = () => {
    if (!canUseWarehouseRole) {
      message.error('You do not have warehouse permission for the selected business unit.');
      return;
    }
    history.push(`${ProdPaths.upcomingInbound}/receive-without-po`);
  };

  const handleWarehousePOSearch = (value: string) => {
    setPOSearchValue(value);
    const term = value.trim().toUpperCase();
    if (!term || !term.startsWith('PO')) return;

    const hasMatchingPO = purchaseOrders.some((po) => po.poNumber.toUpperCase().includes(term));
    if (!hasMatchingPO) {
      handleCreateTempGR();
    }
  };

  const handleInboundViewChange = (nextView: InboundViewMode) => {
    setInboundView(nextView);
    // Reset filters
    setSelectedWarehousePONumbers([]);
    setPOSearchValue('');
    setPOVendorFilter('ALL');
    setPOTypeFilter('ALL');
    setQueueSearchValue('');
    setQueueTypeFilter('ALL');
    setQueueSourceFilter('ALL');
    setQcStatusFilter('Pending');
    setHistoryTypeFilter('ALL');
    setHistoryStatusFilter(getDefaultHistoryStatusFilter(activeRole as InboundWorkspaceRole));
    context.setDashboardSummaryRange('OVERALL');
    context.setDashboardPeriodFilter(null);
  };

  const handleRoleChange = (nextRole: InboundWorkspaceRole) => {
    if (!isRoleSimulationEnabled && !inboundRoleOptions.includes(nextRole)) {
      return;
    }
    setSimulationRole(nextRole);
    setSelectedPOs([]);
    setSelectedWarehousePONumbers([]);
    setIsGRCreationOpen(false);
    setIsTempGRCreationOpen(false);
    setSelectedPODetail(null);
    setSelectedGR(null);
    setWarehouseCorrectionReceipt(null);
    setLinkPOReceipt(null);
    setSupervisorApprovalSuccess(null);
    if (nextRole === 'QC') {
      setInboundView('operations');
    }
    // Reset filters for new role
    setSelectedWarehousePONumbers([]);
    setPOSearchValue('');
    setPOVendorFilter('ALL');
    setPOTypeFilter('ALL');
    setQueueSearchValue('');
    setQueueTypeFilter('ALL');
    setQueueSourceFilter('ALL');
    setQcStatusFilter('Pending');
    setHistoryTypeFilter('ALL');
    setHistoryStatusFilter(getDefaultHistoryStatusFilter(nextRole));
    context.setDashboardSummaryRange('OVERALL');
    context.setDashboardPeriodFilter(null);
  };

  const buildCorrectionPurchaseOrders = (receipt: GoodsReceipt): PurchaseOrder[] => {
    const referenceLookup = new Map(
      getReceiptPOReferences(receipt).map((reference) => [reference.poNumber, reference]),
    );
    const groupedItems = new Map<string, GRItem[]>();

    receipt.items.forEach((item) => {
      const poNumber = item.poNumber || receipt.linkedPoNumber || receipt.poNumber;
      if (!poNumber) return;
      const existingItems = groupedItems.get(poNumber) || [];
      existingItems.push(item);
      groupedItems.set(poNumber, existingItems);
    });

    return Array.from(groupedItems.entries()).map(([poNumber, items]) => {
      const reference = referenceLookup.get(poNumber);
      const totalQty = items.reduce((sum, item) => sum + item.poQty, 0);

      return {
        poNumber,
        supplier: reference?.supplier || items[0]?.supplier || receipt.supplier,
        expectedDate: reference?.expectedDate || receipt.expectedDate || '',
        expectedTime: reference?.expectedTime || receipt.expectedTime || '',
        items: items.map((item) => ({
          lineNumber: item.poLineNumber,
          code: item.code,
          name: item.name,
          poQty: item.poQty,
          receivedQty: item.receiveQty,
          remainingQty: item.poQty,
          uom: item.uom,
          supplier: item.supplier || reference?.supplier || receipt.supplier,
        })),
        totalItems: items.length,
        totalQty,
        type: receipt.receiptType,
      };
    });
  };

  const handleCreateGR = (pos: PurchaseOrder[]) => {
    if (!pos.length) return;
    const closedPurchaseOrders = getClosedPurchaseOrdersForCreate(pos, receipts);
    if (closedPurchaseOrders.length > 0) {
      message.error(
        `Cannot create inbound receiving for closed PO: ${closedPurchaseOrders
          .map((purchaseOrder) => purchaseOrder.poNumber)
          .join(', ')}`,
      );
      return;
    }
    if (!canCombinePurchaseOrders(pos)) {
      message.error(
        'You can only combine purchase orders from the same business unit and vendor into one IR/GR.',
      );
      return;
    }

    const params = new URLSearchParams();
    pos.forEach((purchaseOrder) => {
      params.append('poKey', getPurchaseOrderRowKey(purchaseOrder));
    });
    history.push(`${ProdPaths.upcomingInbound}/create?${params.toString()}`);
  };

  const handleCreateSelectedGR = async () => {
    if (!selectedWarehousePOs.length) return;
    if (!canCombinePurchaseOrders(selectedWarehousePOs)) {
      message.error(
        'You can only combine purchase orders from the same business unit and vendor into one IR/GR.',
      );
      return;
    }

    await handleCreateGR(selectedWarehousePOs);
  };

  // Breadcrumb configurations
  const routes = useMemo(() => {
    return [
      { path: ProdPaths.prod, label: 'Prod' },
      { path: '', label: 'Upcoming Inbound' },
    ];
  }, []);

  const roleSelectorOptions = useMemo(() => {
    const list = isRoleSimulationEnabled
      ? (Object.keys(simulationRoleLabel) as InboundWorkspaceRole[])
      : inboundRoleOptions;
    return list.map((role) => ({
      label: simulationRoleLabel[role],
      value: role,
    }));
  }, [inboundRoleOptions, isRoleSimulationEnabled]);

  const shouldShowBusinessUnitControl = !isInboundAdmin && inboundVisibleBusinessUnits.length > 0;
  const canSelectBusinessUnit = inboundVisibleBusinessUnits.length > 1;

  const shouldShowRoleSelector =
    !isInboundAdmin && (isRoleSimulationEnabled || inboundRoleOptions.length > 1);
  const shouldShowInboundTabs = activeRole === 'WAREHOUSE_STAFF';
  const dashboardSummaryTitle =
    activeRole === 'WAREHOUSE_STAFF' ? 'Upcoming Inbound Dashboard' : 'Inbound Receiving Dashboard';
  const operationsTabLabel =
    activeRole === 'WAREHOUSE_SUPERVISOR' ? 'Inbound Receiving' : 'Upcoming PO';
  const historyTabLabel =
    activeRole === 'WAREHOUSE_SUPERVISOR' ? (
      'GR History'
    ) : (
      <Space size={6}>
        <span>Inbound Receiving</span>
        {warehouseRejectedReceiptCount > 0 && (
          <Badge
            count={warehouseRejectedReceiptCount}
            style={{
              backgroundColor: '#ff4d4f',
              fontSize: 12,
              fontWeight: 700,
              minWidth: 20,
              height: 20,
              lineHeight: '20px',
              boxShadow: '0 0 0 1px #fff',
            }}
          />
        )}
      </Space>
    );

  const inboundViewOptions = useMemo(() => {
    return [
      { label: operationsTabLabel, value: 'operations' as InboundViewMode, icon: <AppstoreOutlined /> },
      { label: historyTabLabel, value: 'history' as InboundViewMode, icon: <BarsOutlined /> },
    ];
  }, [operationsTabLabel, historyTabLabel]);

  const inboundReportOptions = useMemo(
    () => (isInboundAdmin ? allInboundReportOptions : inboundReportOptionsByRole[activeRole as InboundWorkspaceRole]),
    [activeRole, isInboundAdmin],
  );

  const historyReceipts = useMemo(() => {
    return [...receipts].sort((a, b) => {
      const aPartial = (a.processState !== 'GRPO_DRAFT' && a.processState !== 'CORRECTION_REQUIRED' && !a.qtyMatch) || a.processState === 'MISMATCH_EXCEPTION';
      const bPartial = (b.processState !== 'GRPO_DRAFT' && b.processState !== 'CORRECTION_REQUIRED' && !b.qtyMatch) || b.processState === 'MISMATCH_EXCEPTION';
      if (aPartial && !bPartial) return -1;
      if (!aPartial && bPartial) return 1;
      const aTime = a.createdDate ? new Date(a.createdDate).getTime() : 0;
      const bTime = b.createdDate ? new Date(b.createdDate).getTime() : 0;
      return bTime - aTime;
    });
  }, [receipts]);

  const filteredRoleQueue = useMemo(() => {
    return [...receipts].sort((a, b) => {
      const aPartial = (a.processState !== 'GRPO_DRAFT' && a.processState !== 'CORRECTION_REQUIRED' && !a.qtyMatch) || a.processState === 'MISMATCH_EXCEPTION';
      const bPartial = (b.processState !== 'GRPO_DRAFT' && b.processState !== 'CORRECTION_REQUIRED' && !b.qtyMatch) || b.processState === 'MISMATCH_EXCEPTION';
      if (aPartial && !bPartial) return -1;
      if (!aPartial && bPartial) return 1;
      const aTime = a.createdDate ? new Date(a.createdDate).getTime() : 0;
      const bTime = b.createdDate ? new Date(b.createdDate).getTime() : 0;
      return bTime - aTime;
    });
  }, [receipts]);

  // Statistics definition
  const dashboardStatCards = useMemo<DashboardStatCard[]>(() => {
    const dashboardIncomingTitle =
      context.dashboardSummaryRange === 'CUSTOM' && context.dashboardPeriodFilter
        ? 'Incoming in Selected Period'
        : context.dashboardSummaryRange === 'DAILY'
        ? 'Incoming Today'
        : context.dashboardSummaryRange === 'WEEKLY'
        ? 'Incoming This Week'
        : 'Incoming Overall';

    if (activeRole === 'WAREHOUSE_STAFF') {
      return [
        {
          title: dashboardIncomingTitle,
          value: inboundStats.expectedToday,
          color: '#1890ff',
          prefix: <InboxOutlined />,
        },
        {
          title: 'QC Pending',
          value: inboundStats.qcPending,
          color: '#faad14',
          prefix: <ClockCircleOutlined />,
        },
        {
          title: 'Supervisor Pending',
          value: inboundStats.supervisorPending,
          color: '#d48806',
          prefix: <ClockCircleOutlined />,
        },
        {
          title: 'Aging PO Items',
          value: agingPoItemCount,
          color: '#cf1322',
          prefix: <WarningOutlined />,
        },
        {
          title: 'Exception Queue',
          value: inboundStats.exceptions,
          color: '#ff4d4f',
          prefix: <WarningOutlined />,
        },
        {
          title: 'Awaiting PO Link',
          value: inboundStats.awaitingPOLink,
          color: '#722ed1',
          prefix: <ClockCircleOutlined />,
        },
        {
          title: 'Total IR',
          value: inboundStats.totalIrGrs,
        },
      ];
    } else if (activeRole === 'QC') {
      return [
        {
          title: 'Total IR',
          value: inboundStats.totalIrGrs,
          color: '#1890ff',
          prefix: <InboxOutlined />,
        },
        {
          title: 'Aging PO Items',
          value: agingPoItemCount,
          color: '#cf1322',
          prefix: <WarningOutlined />,
        },
        {
          title: 'Pending Review',
          value: inboundStats.qcPending,
          color: '#faad14',
          prefix: <ClockCircleOutlined />,
        },
        {
          title: 'Completed',
          value: inboundStats.completed,
          color: '#52c41a',
          prefix: <InboxOutlined />,
        },
        {
          title: 'Submitted',
          value: inboundStats.supervisorPending,
          color: '#1677ff',
          prefix: <ClockCircleOutlined />,
        },
        {
          title: 'Rejected',
          value: inboundStats.returnedForCorrection,
          color: '#ff4d4f',
          prefix: <WarningOutlined />,
        },
      ];
    } else {
      return [
        {
          title: 'Total IR',
          value: inboundStats.totalIrGrs,
          color: '#1890ff',
          prefix: <InboxOutlined />,
        },
        {
          title: 'Aging PO Items',
          value: agingPoItemCount,
          color: '#cf1322',
          prefix: <WarningOutlined />,
        },
        {
          title: 'Pending Review',
          value: inboundStats.supervisorPending,
          color: '#d48806',
          prefix: <ClockCircleOutlined />,
        },
        {
          title: 'QC Pending',
          value: inboundStats.qcPending,
          color: '#faad14',
          prefix: <ClockCircleOutlined />,
        },
        {
          title: 'Completed',
          value: inboundStats.completed,
          color: '#52c41a',
          prefix: <InboxOutlined />,
        },
        {
          title: 'Return for Correction',
          value: inboundStats.returnedForCorrection,
          color: '#ff4d4f',
          prefix: <WarningOutlined />,
        },
      ];
    }
  }, [activeRole, inboundStats, agingPoItemCount, context.dashboardSummaryRange, context.dashboardPeriodFilter]);

  const handleQueuePageChange = (page: number, pageSize: number) => {
    void loadReceipts('operations', page, pageSize);
  };

  const handleHistoryPageChange = (page: number, pageSize: number) => {
    void loadReceipts('history', page, pageSize);
  };

  const handlePurchaseOrderPageChange = (page: number, pageSize: number) => {
    void loadPurchaseOrders(page, pageSize);
  };

  const workspaceContent =
    (warehouseCorrectionReceipt &&
      (warehouseCorrectionReceipt.receiptSourceType === 'TEMP_NO_PO' ? (
        <TempGRCreationModal
          open={true}
          onClose={() => setWarehouseCorrectionReceipt(null)}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmitGR}
          initialReceipt={warehouseCorrectionReceipt}
          correctionMode
          availableBusinessUnits={tempReceiptBusinessUnits}
          supplierOptions={supplierOptionsForTempReceipt}
          uomOptions={uomOptionsForTempReceipt}
          itemOptions={itemOptionsForTempReceipt}
          warehouseOptions={warehouseMasterOptions}
        />
      ) : (
        <GRCreationModal
          open={true}
          onClose={() => setWarehouseCorrectionReceipt(null)}
          purchaseOrders={buildCorrectionPurchaseOrders(warehouseCorrectionReceipt)}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmitGR}
          initialReceipt={warehouseCorrectionReceipt}
          correctionMode
          warehouseOptions={warehouseMasterOptions}
        />
      ))) ||
    (isGRCreationOpen && selectedPOs.length > 0 && (
      <GRCreationModal
        open={true}
        onClose={() => {
          setIsGRCreationOpen(false);
          if (isCreateInboundRoute) {
            closeInboundEntryRoute();
          }
        }}
        purchaseOrders={selectedPOs}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmitGR}
        warehouseOptions={warehouseMasterOptions}
      />
    )) ||
    (isTempGRCreationOpen && (
      <TempGRCreationModal
        open={true}
        onClose={() => {
          setIsTempGRCreationOpen(false);
          if (isReceiveWithoutPoRoute) {
            closeInboundEntryRoute();
          }
        }}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmitGR}
        availableBusinessUnits={tempReceiptBusinessUnits}
        supplierOptions={supplierOptionsForTempReceipt}
        uomOptions={uomOptionsForTempReceipt}
        itemOptions={itemOptionsForTempReceipt}
        warehouseOptions={warehouseMasterOptions}
      />
    )) ||
    (linkPOReceipt && (
      <LinkPOModal
        open={true}
        receipt={linkPOReceipt}
        purchaseOrders={purchaseOrders}
        onClose={() => setLinkPOReceipt(null)}
        onLink={handleLinkReceiptToPO}
        onValidationChange={handleUpdatePOLinkValidation}
      />
    ));

  return (
    <>
      <style>{inboundWorkspaceMotionStyles}</style>
      <BreadCrumbCom separator=">" routes={routes} />
      {!hasInboundWorkspaceAccess && !workspaceContent ? null : workspaceContent ? (
        workspaceContent
      ) : (
        <div style={{ marginTop: 16 }}>
          {shouldShowRoleSelector && (
            <Card size="small" bodyStyle={{ padding: '12px 16px' }} style={{ marginBottom: 16 }}>
              <Row justify="space-between" align="middle" gutter={[12, 12]}>
                <Col>
                  <Text strong>
                    {isRoleSimulationEnabled ? 'Role Simulation' : 'Role Workspace'}
                  </Text>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                    {isRoleSimulationEnabled
                      ? 'Frontend-only switch for Warehouse Staff, QC, and Warehouse Supervisor.'
                      : 'Switch between the inbound roles granted to your current account.'}
                  </div>
                </Col>
                <Col>
                  <Segmented
                    value={simulationRole}
                    onChange={(value) => handleRoleChange(value as InboundWorkspaceRole)}
                    options={roleSelectorOptions}
                  />
                </Col>
              </Row>
            </Card>
          )}

          <Row
            justify="space-between"
            align="middle"
            gutter={[12, 12]}
            style={{ marginBottom: 12 }}
          >
            <Col>
              <Text strong>{dashboardSummaryTitle}</Text>
            </Col>
            <Col>
              <Space size={12} wrap>
                {shouldShowBusinessUnitControl && (
                  <Space size={8}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Business Unit
                    </Text>
                    <Select
                      value={activeBusinessUnit}
                      disabled={!canSelectBusinessUnit}
                      onChange={(value) => {
                        if (!canSelectBusinessUnit) return;
                        setActiveBusinessUnit(value);
                        // Reset filters
                        setSelectedWarehousePONumbers([]);
                        setPOSearchValue('');
                        setPOVendorFilter('ALL');
                        setPOTypeFilter('ALL');
                        setQueueSearchValue('');
                        setQueueTypeFilter('ALL');
                        setQueueSourceFilter('ALL');
                        setQcStatusFilter('Pending');
                        setHistoryTypeFilter('ALL');
                        setHistoryStatusFilter(getDefaultHistoryStatusFilter(activeRole as InboundWorkspaceRole));
                        context.setDashboardSummaryRange('OVERALL');
                        context.setDashboardPeriodFilter(null);
                      }}
                      style={{ width: 120 }}
                      options={inboundVisibleBusinessUnits.map((bu) => ({
                        label: bu,
                        value: bu,
                      }))}
                    />
                  </Space>
                )}
                <Button
                  icon={<ExportOutlined />}
                  loading={isExportingReport}
                  onClick={() => setIsExportReportModalOpen(true)}
                  style={{ fontWeight: 600 }}
                >
                  Export Report
                </Button>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: 3,
                    background: '#f5f5f5',
                    border: '1px solid #d9d9d9',
                    borderRadius: 12,
                  }}
                >
                  {[
                    { label: 'Overall', value: 'OVERALL' },
                    { label: 'Daily', value: 'DAILY' },
                    { label: 'Weekly', value: 'WEEKLY' },
                    { label: 'Pick Period', value: 'CUSTOM' },
                  ].map((option) => {
                    const isActive = context.dashboardSummaryRange === option.value;

                    return (
                      <Button
                        key={option.value}
                        size="small"
                        type={isActive ? 'primary' : 'default'}
                        onClick={() => {
                          context.setDashboardSummaryRange(option.value as DashboardSummaryViewMode);
                          if (option.value !== 'CUSTOM') {
                            context.setDashboardPeriodFilter(null);
                          }
                        }}
                        style={{
                          minWidth: 78,
                          height: 30,
                          borderRadius: 9,
                          fontWeight: 600,
                          boxShadow: isActive ? '0 4px 10px rgba(0, 0, 0, 0.08)' : 'none',
                        }}
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
                {context.dashboardSummaryRange === 'CUSTOM' && (
                  <DatePicker.RangePicker
                    size="small"
                    allowClear
                    style={{ width: 220 }}
                    placeholder={['Start date', 'End date']}
                    onChange={(values: any) => {
                      if (!values?.[0] || !values?.[1]) {
                        context.setDashboardPeriodFilter(null);
                        context.setDashboardSummaryRange('OVERALL');
                        return;
                      }

                      context.setDashboardPeriodFilter([
                        values[0].format('YYYY-MM-DD'),
                        values[1].format('YYYY-MM-DD'),
                      ]);
                    }}
                  />
                )}
                {canSyncPurchaseOrdersFromSap && (
                  <Button
                    icon={<SyncOutlined />}
                    loading={isSyncingPurchaseOrders}
                    onClick={handleSyncPurchaseOrdersFromSap}
                    style={{ fontWeight: 600 }}
                  >
                    Sync SAP PO
                  </Button>
                )}
              </Space>
            </Col>
          </Row>

          {/* Stats Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              marginBottom: 16,
            }}
          >
            {dashboardStatCards.map((card) => (
              <div key={card.title}>
                <Card size="small" bodyStyle={{ padding: '12px 16px' }}>
                  <Statistic
                    title={<Text style={{ fontSize: 12 }}>{card.title}</Text>}
                    value={card.value}
                    valueStyle={{
                      fontSize: 24,
                      ...(card.color ? { color: card.color } : {}),
                    }}
                    prefix={card.prefix}
                  />
                </Card>
              </div>
            ))}
          </div>

          <ProCard bordered style={{ marginBottom: 0 }}>
            <Row justify="space-between" align="middle" gutter={[12, 12]}>
              {shouldShowInboundTabs && (
                <Col>
                  <Space
                    size={6}
                    wrap
                    style={{
                      padding: 2,
                      background: '#f5f5f5',
                      border: '1px solid #e8e8e8',
                      borderRadius: 14,
                    }}
                  >
                    {inboundViewOptions.map((option) => {
                      const isActive = inboundView === option.value;

                      return (
                        <Button
                          key={option.value}
                          className="inbound-workspace-tab-button"
                          type={isActive ? 'primary' : 'default'}
                          size="small"
                          icon={option.icon}
                          onClick={() => handleInboundViewChange(option.value)}
                          style={{
                            minHeight: 32,
                            paddingInline: 10,
                            borderRadius: 10,
                            fontWeight: 600,
                            boxShadow: isActive ? '0 4px 12px rgba(22, 119, 255, 0.16)' : 'none',
                          }}
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </Space>
                </Col>
              )}
            </Row>
          </ProCard>

          {/* ── Role Workspaces ── */}
          <div key={`${activeRole}-${effectiveInboundView}`} className="inbound-workspace-tab-pane">
            {activeRole === 'WAREHOUSE_STAFF' && (
              <WarehouseWorkspace
                warehouseVendorOptions={warehouseVendorOptions}
                selectedWarehousePOs={selectedWarehousePOs}
                selectedWarehousePOVendor={selectedWarehousePOVendor}
                warehouseRejectedReceiptCount={warehouseRejectedReceiptCount}
                historyReceipts={historyReceipts}
                onViewPODetail={handleViewPODetail}
                onCreateSelectedGR={handleCreateSelectedGR}
                onCreateTempGR={handleCreateTempGR}
                onOpenGRDetail={handleOpenGRDetail}
                onLinkPO={(receipt) => setLinkPOReceipt(receipt)}
                onRefresh={refreshCurrentTable}
                onWarehousePOSearch={handleWarehousePOSearch}
                onPurchaseOrderPageChange={handlePurchaseOrderPageChange}
                onHistoryPageChange={handleHistoryPageChange}
                onWarehousePOSelectionChange={handleWarehousePOSelectionChange}
              />
            )}
            {activeRole === 'QC' && (
              <QCWorkspace
                filteredRoleQueue={filteredRoleQueue}
                qcStatusOptionsWithBadge={qcStatusOptionsWithBadge}
                shouldShowQcReceiptNotificationBadge={shouldShowQcReceiptNotificationBadge}
                onOpenGRDetail={handleOpenGRDetail}
                onRefresh={refreshCurrentTable}
                onQueuePageChange={handleQueuePageChange}
              />
            )}
            {activeRole === 'WAREHOUSE_SUPERVISOR' && (
              <SupervisorWorkspace
                filteredRoleQueue={filteredRoleQueue}
                historyReceipts={historyReceipts}
                onOpenGRDetail={handleOpenGRDetail}
                onRefresh={refreshCurrentTable}
                onQueuePageChange={handleQueuePageChange}
                onHistoryPageChange={handleHistoryPageChange}
              />
            )}
          </div>
        </div>
      )}

      <InboundExportReportModal
        open={!workspaceContent && isExportReportModalOpen}
        loading={isExportingReport}
        reportOptions={inboundReportOptions}
        onCancel={() => setIsExportReportModalOpen(false)}
        onExport={handleExportReport}
      />

      {/* ── Modals & Sidebars ── */}
      {!workspaceContent && (
        <>
          <PODetailSidebar
            open={selectedPODetail !== null}
            onClose={() => setSelectedPODetail(null)}
            po={selectedPODetail}
            onCreateGR={(po) => handleCreateGR([po])}
            onOpenReceiptInNewTab={handleOpenReceiptInNewTab}
            warehouseOptions={warehouseMasterOptions}
            goodsReceipts={receipts}
          />

          <GRDetailSidebar
            open={selectedGR !== null}
            onClose={() => {
              setSelectedGR(null);
              clearReceiptQueryParams();
            }}
            receipt={selectedGR}
            viewerRole={activeRole}
            onUpdateProcessState={handleUpdateGRProcessState}
            onOpenWarehouseCorrection={handleOpenWarehouseCorrection}
            onOpenLinkPO={(receipt) => setLinkPOReceipt(receipt)}
            onSubmitQCVerification={handleSubmitQCVerification}
            onSubmitSupervisorReview={handleSubmitSupervisorReview}
            onViewPODetails={async (poNumber, businessUnit) => {
              try {
                const skeletonPO: PurchaseOrder = {
                  poNumber,
                  businessUnit,
                  supplier: '',
                  expectedDate: '',
                  expectedTime: '',
                  items: [],
                  totalItems: 0,
                  totalQty: 0,
                  type: 'Planned',
                };
                await handleViewPODetail(skeletonPO);
              } catch (err: any) {
                message.error('Failed to view purchase order details.');
              }
            }}
          />

          <SupervisorApprovalSuccessModal
            open={supervisorApprovalSuccess !== null}
            data={supervisorApprovalSuccess}
            onClose={() => setSupervisorApprovalSuccess(null)}
          />
        </>
      )}
    </>
  );
}

export default InboundListview;
