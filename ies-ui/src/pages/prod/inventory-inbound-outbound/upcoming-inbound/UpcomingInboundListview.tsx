import BreadCrumbCom from '@/pages/prod/shared/BreadCrumbCom';
import { ProdPaths } from '@/pages/prod';
import { simpleRequestActions } from '@/services/model';
import { USE_STATIC_AUTH } from '@/staticAuthConfig';
import {
  Button,
  Card,
  Statistic,
  Segmented,
  Row,
  Col,
  Typography,
  Badge,
  Input,
  Radio,
  DatePicker,
  Space,
  Tag,
  message,
} from 'antd';
import {
  AppstoreOutlined,
  BarsOutlined,
  HistoryOutlined,
  InboxOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import { useEffect, useMemo, useState } from 'react';
import {
  type GRItem,
  type GoodsReceiptSourceType,
  type InboundProcessState,
  type POLinkStatus,
  getGoodsReceiptSourceColor,
  getReceiptPOReferences,
  officialStateLabel,
  poLinkStatusLabel,
  summarizePOReferences,
  summarizeSuppliers,
} from './workflow';
import type {
  InboundSaveGoodsReceiptInput,
  UpcomingInboundGoodsReceipt as GoodsReceipt,
  UpcomingInboundPurchaseOrder as PurchaseOrder,
} from './data';
import { UpcomingInboundServiceAPI } from './service';
import { ProCard } from '@ant-design/pro-components';
import { POCardGrid } from './components/POCardGrid';
import { POListTable } from './components/POListTable';
import { PODetailSidebar } from './components/PODetailSidebar';
import { GRCreationModal } from './components/GRCreationModal';
import { GRDetailSidebar } from './components/GRDetailSidebar';
import { RecentActivity } from './components/RecentActivity';
import { InboundGRTable } from './components/InboundGRTable';
import { GRQueueCardGrid } from './components/GRQueueCardGrid';
import { GRQueueTable } from './components/GRQueueTable';
import { QCVerificationModal } from './components/QCVerificationModal';
import { SupervisorReviewModal } from './components/SupervisorReviewModal';
import { TempGRCreationModal } from './components/TempGRCreationModal';
import { LinkPOModal } from './components/LinkPOModal';
import {
  SupervisorApprovalSuccessModal,
  type SupervisorApprovalSuccessData,
} from './components/SupervisorApprovalSuccessModal';

const { Text } = Typography;

type InboundViewMode = 'operations' | 'history' | 'activity';
type POViewMode = 'card' | 'list';
type InboundWorkspaceRole = 'WAREHOUSE_STAFF' | 'QC' | 'WAREHOUSE_SUPERVISOR';

const today = '2026-03-06';

const simulationRoleLabel: Record<InboundWorkspaceRole, string> = {
  WAREHOUSE_STAFF: 'Warehouse Staff',
  QC: 'QC',
  WAREHOUSE_SUPERVISOR: 'Warehouse Supervisor',
};

function normalizeReceiptForUI(receipt: GoodsReceipt): GoodsReceipt {
  const poReferences = getReceiptPOReferences(receipt);
  const supplierNames = receipt.supplierNames?.length
    ? receipt.supplierNames
    : Array.from(
        new Set([...poReferences.map((reference) => reference.supplier), receipt.supplier].filter(Boolean)),
      );

  return {
    ...receipt,
    poReferences,
    supplierNames,
  };
}

export default function UpcomingInboundListview() {
  const access = useAccess();
  const requestActions = simpleRequestActions();
  const services = UpcomingInboundServiceAPI(requestActions);
  const [inboundView, setInboundView] = useState<InboundViewMode>('operations');
  const [poViewMode, setPOViewMode] = useState<POViewMode>('list');
  const [simulationRole, setSimulationRole] = useState<InboundWorkspaceRole>('WAREHOUSE_STAFF');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Shared PO filters (used by both card and list views)
  const [poSearchValue, setPOSearchValue] = useState('');
  const [poStatusFilter, setPOStatusFilter] = useState<'ALL' | PurchaseOrder['status']>('ALL');
  const [poDateFilter, setPODateFilter] = useState<string | undefined>();
  const [queueSearchValue, setQueueSearchValue] = useState('');
  const [queueTypeFilter, setQueueTypeFilter] = useState<'ALL' | GoodsReceipt['receiptType']>('ALL');
  const [queueSourceFilter, setQueueSourceFilter] =
    useState<'ALL' | 'STANDARD' | 'TEMP'>('ALL');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'ALL' | 'Planned' | 'Unplanned'>('ALL');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'ALL' | 'pending' | 'completed'>('ALL');

  // GR state (mirrors WarehouseStaffUI)
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [selectedPOs, setSelectedPOs] = useState<PurchaseOrder[]>([]);
  const [isGRCreationOpen, setIsGRCreationOpen] = useState(false);
  const [isTempGRCreationOpen, setIsTempGRCreationOpen] = useState(false);
  const [selectedPODetail, setSelectedPODetail] = useState<PurchaseOrder | null>(null);
  const [selectedGR, setSelectedGR] = useState<GoodsReceipt | null>(null);
  const [warehouseCorrectionReceipt, setWarehouseCorrectionReceipt] = useState<GoodsReceipt | null>(null);
  const [linkPOReceipt, setLinkPOReceipt] = useState<GoodsReceipt | null>(null);
  const [qcVerificationReceipt, setQCVerificationReceipt] = useState<GoodsReceipt | null>(null);
  const [supervisorReviewReceipt, setSupervisorReviewReceipt] = useState<GoodsReceipt | null>(null);
  const [supervisorApprovalSuccess, setSupervisorApprovalSuccess] =
    useState<SupervisorApprovalSuccessData | null>(null);
  const [tempGRHint, setTempGRHint] = useState('');

  const inboundRoleOptions = useMemo(() => {
    const roles: InboundWorkspaceRole[] = [];
    if (access.canAccessInboundWarehouseStaff) roles.push('WAREHOUSE_STAFF');
    if (access.canAccessInboundQc) roles.push('QC');
    if (access.canAccessInboundSupervisor) roles.push('WAREHOUSE_SUPERVISOR');
    return roles;
  }, [
    access.canAccessInboundWarehouseStaff,
    access.canAccessInboundQc,
    access.canAccessInboundSupervisor,
  ]);

  const isRoleSimulationEnabled = USE_STATIC_AUTH;
  const activeRole: InboundWorkspaceRole =
    isRoleSimulationEnabled || inboundRoleOptions.includes(simulationRole)
      ? simulationRole
      : inboundRoleOptions[0] || 'WAREHOUSE_STAFF';

  const routes = [
    { path: ProdPaths.prod, label: 'Prod' },
    { path: `${ProdPaths.inventoryInboundOutbound}/list`, label: 'Inventory Inbound Outbound' },
    { path: '', label: 'Upcoming Inbound' },
  ];

  const loadInboundData = async () => {
    setIsLoading(true);
    try {
      const [poResult, receiptResult] = await Promise.allSettled([
        services.listPurchaseOrders(),
        services.pageGoodsReceipts({
          criteria: {},
          pagination: {
            current: 1,
            pageSize: 200,
          },
        }),
      ]);

      if (poResult.status === 'fulfilled') {
        setPurchaseOrders(poResult.value);
      } else {
        message.error(poResult.reason?.message || 'Failed to load purchase orders.');
      }

      if (receiptResult.status === 'fulfilled') {
        setReceipts(receiptResult.value.items.map(normalizeReceiptForUI));
      } else {
        message.error(receiptResult.reason?.message || 'Failed to load inbound receiving history.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInboundData();
  }, []);

  useEffect(() => {
    if (isRoleSimulationEnabled) return;
    if (inboundRoleOptions.length === 0) return;
    if (inboundRoleOptions.includes(simulationRole)) return;
    setSimulationRole(inboundRoleOptions[0]);
  }, [inboundRoleOptions, isRoleSimulationEnabled, simulationRole]);

  const syncReceiptInState = (receipt: GoodsReceipt) => {
    const normalized = normalizeReceiptForUI(receipt);

    setReceipts((prev) => {
      const exists = prev.some((row) => row.grNumber === normalized.grNumber);
      if (!exists) {
        return [normalized, ...prev];
      }
      return prev.map((row) => (row.grNumber === normalized.grNumber ? normalized : row));
    });

    setSelectedGR((prev) => {
      if (!prev || prev.grNumber !== normalized.grNumber) return prev;
      return normalized;
    });

    return normalized;
  };

  // Stats
  const inboundStats = useMemo(() => {
    const todayPOs = purchaseOrders.filter((po) => po.expectedDate === today);
    const qcPending = receipts.filter(
      (r) => r.processState === 'QC_PENDING',
    ).length;
    const supervisorPending = receipts.filter(
      (r) => r.processState === 'PENDING_SUPERVISOR_REVIEW',
    ).length;
    const approved = receipts.filter(
      (r) => r.processState === 'SUPERVISOR_APPROVED',
    ).length;
    const exceptions = receipts.filter(
      (r) =>
        r.processState === 'MISMATCH_EXCEPTION' || r.processState === 'CORRECTION_REQUIRED',
    ).length;
    const awaitingPOLink = receipts.filter(
      (r) => r.receiptSourceType === 'TEMP_NO_PO' && r.poLinkStatus === 'WAITING_PO',
    ).length;
    return {
      expectedToday: todayPOs.length,
      qcPending,
      supervisorPending,
      approved,
      exceptions,
      awaitingPOLink,
      totalGRs: receipts.length,
    };
  }, [purchaseOrders, receipts]);

  const exceptionQueue = useMemo(
    () =>
      receipts.filter(
        (r) =>
          r.processState === 'MISMATCH_EXCEPTION' ||
          !r.specMatch ||
          !r.qtyMatch,
      ),
    [receipts],
  );

  const qcQueueReceipts = useMemo(
    () => receipts.filter((r) => r.processState === 'QC_PENDING'),
    [receipts],
  );

  const supervisorQueueReceipts = useMemo(
    () => receipts.filter((r) => r.processState === 'PENDING_SUPERVISOR_REVIEW'),
    [receipts],
  );

  const awaitingPOLinkReceipts = useMemo(
    () =>
      receipts
        .filter((r) => r.receiptSourceType === 'TEMP_NO_PO' && r.poLinkStatus === 'WAITING_PO')
        .sort((a, b) => b.createdDate.localeCompare(a.createdDate)),
    [receipts],
  );

  const filteredRoleQueue = useMemo(() => {
    const source =
      activeRole === 'QC'
        ? qcQueueReceipts
        : activeRole === 'WAREHOUSE_SUPERVISOR'
          ? supervisorQueueReceipts
          : [];

    let data = [...source];

    if (queueSearchValue.trim()) {
      const term = queueSearchValue.trim().toUpperCase();
      data = data.filter(
        (receipt) =>
          receipt.grNumber.toUpperCase().includes(term) ||
          receipt.poNumber.toUpperCase().includes(term) ||
          getReceiptPOReferences(receipt).some((reference) =>
            reference.poNumber.toUpperCase().includes(term) ||
            reference.supplier.toUpperCase().includes(term),
          ) ||
          receipt.supplier.toUpperCase().includes(term) ||
          receipt.createdBy.toUpperCase().includes(term),
      );
    }

    if (queueTypeFilter !== 'ALL') {
      data = data.filter((receipt) => receipt.receiptType === queueTypeFilter);
    }

    if (queueSourceFilter === 'STANDARD') {
      data = data.filter((receipt) => receipt.receiptSourceType !== 'TEMP_NO_PO');
    } else if (queueSourceFilter === 'TEMP') {
      data = data.filter((receipt) => receipt.receiptSourceType === 'TEMP_NO_PO');
    }

    return data.sort((a, b) => b.createdDate.localeCompare(a.createdDate));
  }, [
    qcQueueReceipts,
    queueSearchValue,
    queueSourceFilter,
    queueTypeFilter,
    activeRole,
    supervisorQueueReceipts,
  ]);

  // PO list filtered for both card and table views
  const filteredPOs = useMemo(() => {
    let data = [...purchaseOrders];

    if (poSearchValue.trim()) {
      const term = poSearchValue.trim().toUpperCase();
      data = data.filter(
        (po) =>
          po.poNumber.toUpperCase().includes(term) ||
          po.supplier.toUpperCase().includes(term),
      );
    }
    if (poStatusFilter !== 'ALL') {
      data = data.filter((po) => po.status === poStatusFilter);
    }
    if (poDateFilter) {
      data = data.filter((po) => po.expectedDate === poDateFilter);
    }

    return data.sort((a, b) => {
      const dateA = `${a.expectedDate || '9999-12-31'} ${a.expectedTime || '23:59'}`;
      const dateB = `${b.expectedDate || '9999-12-31'} ${b.expectedTime || '23:59'}`;
      return dateA.localeCompare(dateB);
    });
  }, [poDateFilter, poSearchValue, poStatusFilter, purchaseOrders]);

  // Handlers (mirrors WarehouseStaffUI)
  const handleCreateGR = (purchaseOrders: PurchaseOrder[]) => {
    if (!purchaseOrders.length) return;
    setSelectedPODetail(null);
    setSelectedPOs(purchaseOrders);
    setIsGRCreationOpen(true);
  };

  const handleCreateTempGR = (hint?: string) => {
    setTempGRHint(hint?.trim() ? `SAP PO not found for: ${hint.trim()}` : '');
    setIsTempGRCreationOpen(true);
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
      const receivedQty = items.reduce((sum, item) => sum + item.receiveQty, 0);

      return {
        poNumber,
        supplier: reference?.supplier || items[0]?.supplier || receipt.supplier,
        expectedDate: reference?.expectedDate || receipt.expectedDate || '',
        expectedTime: reference?.expectedTime || receipt.expectedTime || '',
        items: items.map((item) => ({
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
        status:
          receivedQty <= 0
            ? 'Expected'
            : receivedQty < totalQty
              ? 'Partial'
              : 'Fully Received',
      };
    });
  };

  const handleWarehousePOSearch = (value: string) => {
    setPOSearchValue(value);
    const term = value.trim().toUpperCase();
    if (!term || !term.startsWith('PO')) return;

    const hasMatchingPO = purchaseOrders.some((po) => po.poNumber.toUpperCase().includes(term));
    if (!hasMatchingPO) {
      handleCreateTempGR(value);
    }
  };

  const togglePOSelection = (po: PurchaseOrder, checked?: boolean) => {
    setSelectedPOs((prev) => {
      const exists = prev.some((selected) => selected.poNumber === po.poNumber);
      const shouldAdd = checked ?? !exists;
      if (shouldAdd) {
        return [po];
      }
      if (!shouldAdd && exists) {
        return prev.filter((selected) => selected.poNumber !== po.poNumber);
      }
      return prev;
    });
  };

  const clearPOSelection = () => setSelectedPOs([]);

  const handleRoleChange = (nextRole: InboundWorkspaceRole) => {
    if (!isRoleSimulationEnabled && !inboundRoleOptions.includes(nextRole)) {
      return;
    }
    setSimulationRole(nextRole);
    setSelectedPOs([]);
    setIsGRCreationOpen(false);
    setIsTempGRCreationOpen(false);
    setSelectedPODetail(null);
    setSelectedGR(null);
    setWarehouseCorrectionReceipt(null);
    setLinkPOReceipt(null);
    setQCVerificationReceipt(null);
    setSupervisorReviewReceipt(null);
    setSupervisorApprovalSuccess(null);
    setQueueSearchValue('');
    setQueueTypeFilter('ALL');
    setQueueSourceFilter('ALL');
    setHistoryTypeFilter('ALL');
    setHistoryStatusFilter('ALL');
  };

  const handleViewPODetail = async (po: PurchaseOrder) => {
    if (!po.id) {
      setSelectedPODetail(po);
      return;
    }

    try {
      const detail = await services.detailPurchaseOrder(po.id);
      setSelectedPODetail(detail);
    } catch (error: any) {
      message.error(error?.message || 'Failed to load purchase order detail.');
    }
  };

  const handleOpenGRDetail = async (gr: GoodsReceipt) => {
    if (!gr.id) {
      const latest = receipts.find((row) => row.grNumber === gr.grNumber) || gr;
      setSelectedGR(latest);
      return;
    }

    try {
      const detail = await services.detailGoodsReceipt(gr.id);
      setSelectedGR(normalizeReceiptForUI(detail));
    } catch (error: any) {
      message.error(error?.message || 'Failed to load inbound receiving detail.');
    }
  };

  const mapDraftToSaveInput = (data: any): InboundSaveGoodsReceiptInput => {
    const primaryPoReference = data.poReferences?.[0];
    const receiptSourceType: GoodsReceiptSourceType =
      data.receiptSourceType || (data.receiptType === 'Planned' ? 'PLANNED' : 'UNPLANNED_WITH_PO');
    const poLinkStatus: POLinkStatus =
      data.poLinkStatus || (receiptSourceType === 'TEMP_NO_PO' ? 'WAITING_PO' : 'NOT_REQUIRED');

    return {
      id: data.id || undefined,
      gr_number: data.grNumber || undefined,
      receiving_number: data.receivingNumber || data.grNumber || undefined,
      process_state: data.processState || undefined,
      po_number: primaryPoReference?.poNumber || data.linkedPoNumber || undefined,
      supplier: primaryPoReference?.supplier || data.supplier,
      receipt_type: data.receiptType,
      append_to_open_receiving: data.id ? false : true,
      receipt_source_type: receiptSourceType,
      po_link_status: poLinkStatus,
      temp_reference_no: data.tempReferenceNo || undefined,
      pending_po_reason: data.pendingPOReason || undefined,
      linked_po_number: data.linkedPoNumber || undefined,
      received_by_user: data.receiverWarehouseName || undefined,
      on_hold_warehouse_code: 'ON-HOLD',
      posting_date: data.postingDate,
      actual_receipt_date: data.actualReceiptDate,
      delivery_note_number: data.deliveryNoteNumber || 'DRAFT',
      poReferences: primaryPoReference ? [primaryPoReference] : [],
      items: (data.items || []).map((item: GRItem) => ({
        poNumber: item.poNumber || undefined,
        supplier: item.supplier || undefined,
        code: item.code,
        name: item.name,
        poQty: item.poQty,
        receiveQty: item.receiveQty,
        uom: item.uom,
        condition: item.isMissing ? 'Missing' : 'Good',
        binLocation: 'ON-HOLD',
        damagedQty: 0,
        rowNumber: undefined,
        isMissing: item.isMissing,
        missingRemark: item.missingRemark || undefined,
        productDate: item.productDate || undefined,
        expiryDate: item.expiryDate || undefined,
        batchNumber: item.batchNumber || undefined,
        barcode: item.barcode || undefined,
        qcDecision: item.qcDecision || undefined,
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
        supportingDocs: data.documentChecklist?.supportingDocs || [],
      },
      labelForms: [],
    };
  };

  const persistWarehouseReceipt = async (data: any, successMessage: string) => {
    try {
      const existingReceipt = data.id ? receipts.find((receipt) => receipt.id === data.id) : null;
      const response = await services.saveGoodsReceipt(mapDraftToSaveInput(data));
      const updatedReceipt = normalizeReceiptForUI(response.data);
      setSelectedPOs([]);
      setTempGRHint('');
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
  ) => {
    const currentReceipt = receipts.find((gr) => gr.grNumber === grNumber);
    if (!currentReceipt?.id) {
      message.error('Inbound receiving id is missing.');
      return;
    }

    try {
      const response = await services.changeGoodsReceiptStatus({
        id: currentReceipt.id,
        statusChange: newState,
        remark: note,
        state: newState,
      });
      await loadInboundData();
      syncReceiptInState(response.data);
      message.success(response.message || 'Inbound receiving status updated.');
    } catch (error: any) {
      message.error(error?.message || 'Failed to update inbound receiving status.');
    }
  };

  const handleSubmitQCVerification = async (
    receipt: GoodsReceipt,
    payload: {
      items: GRItem[];
      processState: InboundProcessState;
      qcResult: GoodsReceipt['qcResult'];
      exceptionReason?: string;
      stepTitle: string;
    },
  ) => {
    if (!receipt.id) {
      message.error('Inbound receiving id is missing.');
      return false;
    }

    try {
      const response = await services.submitQcReview({
        id: receipt.id,
        items: payload.items.map((item) => ({
          code: item.code,
          poNumber: item.poNumber || undefined,
          qcDecision: item.qcDecision || 'Pass',
          qcRemark: item.qcRemark || undefined,
        })),
      });
      await loadInboundData();
      const updated = syncReceiptInState(response.data);
      setQCVerificationReceipt(null);
      if (updated.qcResult === 'Pass') {
        setSelectedGR(null);
      } else {
        setSelectedGR(updated);
      }
      message.success(response.message || 'QC review submitted.');
      return true;
    } catch (error: any) {
      message.error(error?.message || 'Failed to submit QC review.');
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
      const response = await services.submitSupervisorReview({
        id: receipt.id,
        action: payload.action,
        note: payload.note,
      });
      await loadInboundData();
      const updated = syncReceiptInState(response.data);
      setSupervisorReviewReceipt(null);

      if (payload.action === 'approve') {
        setSupervisorApprovalSuccess({
          approvedBy: updated.approvedBy || 'warehouse.supervisor',
          approvedDate: updated.approvedDate || '',
          grNumber: updated.approvedGrNumber || updated.grNumber,
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
      const response = await services.linkPoToTempReceipt({
        id: receipt.id,
        poNumber: purchaseOrder.poNumber,
      });
      syncReceiptInState(response.data);
      setLinkPOReceipt(null);
      await loadInboundData();
      message.success('Temporary inbound receiving linked to PO.');
    } catch (error: any) {
      message.error(error?.message || 'Failed to link temporary inbound receiving to PO.');
    }
  };

  const handleUpdatePOLinkValidation = (receipt: GoodsReceipt, reason: string) => {
    const nextReason = reason || undefined;

    setReceipts((prev) => {
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

  const selectionSummaryText =
    selectedPOs.length > 0
      ? `${selectedPOs[0].poNumber} selected for one inbound receiving`
      : 'Select one PO to create one inbound receiving';

  const poViewToggle = (
    <Segmented
      size="small"
      value={poViewMode}
      onChange={(val) => setPOViewMode(val as POViewMode)}
      options={[
        { label: 'List', value: 'list', icon: <BarsOutlined /> },
        { label: 'Cards', value: 'card', icon: <AppstoreOutlined /> },
      ]}
    />
  );

  const poHeaderTitle = (
    <Space direction="vertical" size={0}>
      <Text strong>
        <InboxOutlined style={{ marginRight: 8 }} />
        Purchase Orders
      </Text>
      <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
        {selectionSummaryText}
      </Text>
    </Space>
  );

  const poHeaderActions = (
    <Space size={8} wrap>
      {selectedPOs.length > 0 && <Button onClick={clearPOSelection}>Clear</Button>}
      <Button onClick={() => handleCreateTempGR()}>Create Temporary Inbound Receiving</Button>
      <Button
        type="primary"
        disabled={selectedPOs.length === 0}
        onClick={() => handleCreateGR(selectedPOs)}
      >
        {selectedPOs.length > 0 ? (
          <Space size={8}>
            <span>Create Inbound Receiving</span>
            <span
              style={{
                minWidth: 22,
                height: 22,
                paddingInline: 7,
                borderRadius: 999,
                background: 'rgba(255, 255, 255, 0.24)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                lineHeight: '22px',
                textAlign: 'center',
              }}
            >
              {selectedPOs.length}
            </span>
          </Space>
        ) : (
          'Create Inbound Receiving'
        )}
      </Button>
      {poViewToggle}
    </Space>
  );

  const roleSelectorOptions = (isRoleSimulationEnabled
    ? (Object.keys(simulationRoleLabel) as InboundWorkspaceRole[])
    : inboundRoleOptions
  ).map((role) => ({
    label: simulationRoleLabel[role],
    value: role,
  }));

  const shouldShowRoleSelector = isRoleSimulationEnabled || inboundRoleOptions.length > 1;
  const activeQueueTitle = activeRole === 'QC' ? 'QC Queue' : 'Warehouse Supervisor Queue';
  const historyTabLabel =
    activeRole === 'WAREHOUSE_SUPERVISOR' ? 'GR History' : 'Inbound Receiving History';
  const historyReceipts = useMemo(() => {
    if (activeRole !== 'WAREHOUSE_SUPERVISOR') {
      return receipts;
    }

    return receipts.filter((receipt) =>
      [
        'SUPERVISOR_APPROVED',
        'TRANSFERRED_TO_PM_RM_WH',
        'FIN_SUBMITTED',
        'DAILY_CLOSED',
        'MONTHLY_SUMMARY_READY',
      ].includes(receipt.processState),
    );
  }, [activeRole, receipts]);

  const workspaceContent =
    (warehouseCorrectionReceipt &&
      (warehouseCorrectionReceipt.receiptSourceType === 'TEMP_NO_PO' ? (
        <TempGRCreationModal
          open={true}
          onClose={() => setWarehouseCorrectionReceipt(null)}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmitGR}
          initialMissingPOHint={warehouseCorrectionReceipt.pendingPOReason}
          initialReceipt={warehouseCorrectionReceipt}
          correctionMode
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
        />
      ))) ||
    (isGRCreationOpen && selectedPOs.length > 0 && (
      <GRCreationModal
        open={true}
        onClose={() => setIsGRCreationOpen(false)}
        purchaseOrders={selectedPOs}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmitGR}
      />
    )) ||
    (isTempGRCreationOpen && (
      <TempGRCreationModal
        open={true}
        onClose={() => {
          setIsTempGRCreationOpen(false);
          setTempGRHint('');
        }}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmitGR}
        initialMissingPOHint={tempGRHint}
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
    )) ||
    (qcVerificationReceipt && (
      <QCVerificationModal
        open={true}
        receipt={qcVerificationReceipt}
        onClose={() => setQCVerificationReceipt(null)}
        onSubmit={(payload) => handleSubmitQCVerification(qcVerificationReceipt, payload)}
      />
    )) ||
    (supervisorReviewReceipt && (
      <SupervisorReviewModal
        open={true}
        receipt={supervisorReviewReceipt}
        onClose={() => setSupervisorReviewReceipt(null)}
        onSubmit={(payload) => handleSubmitSupervisorReview(supervisorReviewReceipt, payload)}
      />
    ));

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      {workspaceContent ? (
        workspaceContent
      ) : (
      <div style={{ marginTop: 16 }}>
        {isLoading && (
          <Card size="small" bodyStyle={{ padding: '12px 16px' }} style={{ marginBottom: 16 }}>
            <Text type="secondary">Loading inbound data...</Text>
          </Card>
        )}
        {shouldShowRoleSelector && (
          <Card size="small" bodyStyle={{ padding: '12px 16px' }} style={{ marginBottom: 16 }}>
            <Row justify="space-between" align="middle" gutter={[12, 12]}>
              <Col>
                <Text strong>{isRoleSimulationEnabled ? 'Role Simulation' : 'Role Workspace'}</Text>
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

        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={8} lg={4}>
            <Card size="small" bodyStyle={{ padding: '12px 16px' }}>
              <Statistic
                title={<Text style={{ fontSize: 12 }}>Expected Today</Text>}
                value={inboundStats.expectedToday}
                valueStyle={{ fontSize: 24, color: '#1890ff' }}
                prefix={<InboxOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card size="small" bodyStyle={{ padding: '12px 16px' }}>
              <Statistic
                title={<Text style={{ fontSize: 12 }}>QC Pending</Text>}
                value={inboundStats.qcPending}
                valueStyle={{ fontSize: 24, color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card size="small" bodyStyle={{ padding: '12px 16px' }}>
              <Statistic
                title={<Text style={{ fontSize: 12 }}>Supervisor Pending</Text>}
                value={inboundStats.supervisorPending}
                valueStyle={{ fontSize: 24, color: '#d48806' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card size="small" bodyStyle={{ padding: '12px 16px' }}>
              <Statistic
                title={<Text style={{ fontSize: 12 }}>Approved</Text>}
                value={inboundStats.approved}
                valueStyle={{ fontSize: 24, color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card size="small" bodyStyle={{ padding: '12px 16px' }}>
              <Statistic
                title={<Text style={{ fontSize: 12 }}>Exception Queue</Text>}
                value={inboundStats.exceptions}
                valueStyle={{ fontSize: 24, color: '#ff4d4f' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card size="small" bodyStyle={{ padding: '12px 16px' }}>
              <Statistic
                title={<Text style={{ fontSize: 12 }}>Awaiting PO Link</Text>}
                value={inboundStats.awaitingPOLink}
                valueStyle={{ fontSize: 24, color: '#722ed1' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card size="small" bodyStyle={{ padding: '12px 16px' }}>
              <Statistic
                title={<Text style={{ fontSize: 12 }}>Total GRs</Text>}
                value={inboundStats.totalGRs}
                valueStyle={{ fontSize: 24 }}
              />
            </Card>
          </Col>
        </Row>

        <ProCard bordered style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle" gutter={[12, 12]}>
            <Col>
              <Segmented
                value={inboundView}
                onChange={(val) => setInboundView(val as InboundViewMode)}
                options={[
                  { label: 'Inbound Operations', value: 'operations', icon: <AppstoreOutlined /> },
                  { label: historyTabLabel, value: 'history', icon: <BarsOutlined /> },
                  { label: 'Recent Activity', value: 'activity', icon: <HistoryOutlined /> },
                ]}
              />
            </Col>
            <Col flex="auto">
              {inboundView === 'operations' ? (
                activeRole === 'WAREHOUSE_STAFF' ? (
                  <Space size="large" wrap style={{ justifyContent: 'flex-end', width: '100%' }}>
                    <Input.Search
                      allowClear
                      placeholder="Search PO / Supplier"
                      onSearch={handleWarehousePOSearch}
                      onChange={(e) => setPOSearchValue(e.target.value)}
                      style={{ width: 220 }}
                    />
                    <Radio.Group
                      value={poStatusFilter}
                      onChange={(e) => setPOStatusFilter(e.target.value)}
                    >
                      <Radio.Button value="ALL">All</Radio.Button>
                      <Radio.Button value="Expected">Expected</Radio.Button>
                      <Radio.Button value="Partial">Partial</Radio.Button>
                      <Radio.Button value="Fully Received">Received</Radio.Button>
                    </Radio.Group>
                    <DatePicker
                      style={{ width: 165 }}
                      onChange={(v) => {
                        setPODateFilter(v?.format('YYYY-MM-DD'));
                      }}
                      placeholder="Expected date"
                    />
                  </Space>
                ) : (
                  <Space size="large" wrap style={{ justifyContent: 'flex-end', width: '100%' }}>
                    <Input.Search
                      allowClear
                      placeholder="Search GR / PO / Supplier"
                      onSearch={(value) => setQueueSearchValue(value)}
                      onChange={(event) => !event.target.value && setQueueSearchValue('')}
                      style={{ width: 260 }}
                    />
                    <Radio.Group
                      value={queueTypeFilter}
                      onChange={(event) => setQueueTypeFilter(event.target.value)}
                    >
                      <Radio.Button value="ALL">All</Radio.Button>
                      <Radio.Button value="Planned">Planned</Radio.Button>
                      <Radio.Button value="Unplanned">Unplanned</Radio.Button>
                    </Radio.Group>
                    <Radio.Group
                      value={queueSourceFilter}
                      onChange={(event) => setQueueSourceFilter(event.target.value)}
                    >
                      <Radio.Button value="ALL">All Source</Radio.Button>
                      <Radio.Button value="STANDARD">Standard</Radio.Button>
                      <Radio.Button value="TEMP">Temporary</Radio.Button>
                    </Radio.Group>
                  </Space>
                )
              ) : inboundView === 'history' ? (
                <Space size="large" wrap style={{ justifyContent: 'flex-end', width: '100%' }}>
                  <Radio.Group
                    value={historyTypeFilter}
                    onChange={(e) => setHistoryTypeFilter(e.target.value)}
                  >
                    <Radio.Button value="ALL">All</Radio.Button>
                    <Radio.Button value="Planned">Planned</Radio.Button>
                    <Radio.Button value="Unplanned">Unplanned</Radio.Button>
                  </Radio.Group>
                  <Radio.Group
                    value={historyStatusFilter}
                    onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  >
                    <Radio.Button value="ALL">All</Radio.Button>
                    <Radio.Button value="pending">Pending</Radio.Button>
                    <Radio.Button value="completed">Completed</Radio.Button>
                  </Radio.Group>
                </Space>
              ) : null}
            </Col>
          </Row>
        </ProCard>

        {/* ── Inbound Operations View ── */}
        {inboundView === 'operations' && (
          <div>
            {activeRole === 'WAREHOUSE_STAFF' ? (
              <>
                <Card
                  size="small"
                  style={{ marginBottom: 16 }}
                  bodyStyle={{ padding: poViewMode === 'card' ? 16 : 0 }}
                  title={poViewMode === 'card' ? poHeaderTitle : undefined}
                  extra={poViewMode === 'card' ? poHeaderActions : undefined}
                >
                  {poViewMode === 'card' ? (
                    <POCardGrid
                      purchaseOrders={filteredPOs}
                      onViewDetails={handleViewPODetail}
                      selectedPONumbers={selectedPOs.map((po) => po.poNumber)}
                      onToggleSelection={togglePOSelection}
                    />
                  ) : (
                    <POListTable
                      purchaseOrders={filteredPOs}
                      onViewDetails={handleViewPODetail}
                      selectedPONumbers={selectedPOs.map((po) => po.poNumber)}
                      onSelectionChange={(nextPurchaseOrders) =>
                        setSelectedPOs(nextPurchaseOrders.length > 0 ? [nextPurchaseOrders[0]] : [])
                      }
                      headerTitle={poHeaderTitle}
                      toolbarExtra={poHeaderActions}
                    />
                  )}
                </Card>

                {awaitingPOLinkReceipts.length > 0 && (
                  <Card
                    size="small"
                    style={{ marginBottom: 16, borderColor: '#d3adf7' }}
                    title={
                      <span>
                        <Badge color="#722ed1" />
                        <Text strong style={{ color: '#531dab', marginLeft: 8 }}>
                          Awaiting PO Link
                        </Text>
                        <Badge
                          count={awaitingPOLinkReceipts.length}
                          style={{ marginLeft: 8, backgroundColor: '#722ed1' }}
                        />
                      </span>
                    }
                  >
                    {awaitingPOLinkReceipts.map((gr) => (
                      <div
                        key={gr.grNumber}
                        style={{
                          padding: '8px 0',
                          borderBottom: '1px solid #f0f0f0',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleOpenGRDetail(gr)}
                      >
                        <Row align="middle" justify="space-between" gutter={12}>
                          <Col flex="auto">
                            <div>
                              <Text strong style={{ color: '#531dab', fontSize: 13 }}>
                                {gr.tempReferenceNo || gr.grNumber}
                              </Text>
                              <Tag
                                color={getGoodsReceiptSourceColor(gr.receiptSourceType)}
                                style={{ marginLeft: 8 }}
                              >
                                Temporary Receiving
                              </Tag>
                              <Tag color="warning" style={{ marginLeft: 8 }}>
                                {poLinkStatusLabel[gr.poLinkStatus]}
                              </Tag>
                            </div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {summarizeSuppliers(gr)} · {gr.pendingPOReason || 'Waiting for procurement PO'}
                            </Text>
                          </Col>
                          <Col>
                            <Button
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                setLinkPOReceipt(gr);
                              }}
                            >
                              Link PO
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </Card>
                )}

                {exceptionQueue.length > 0 && (
                  <Card
                    size="small"
                    title={
                      <span>
                        <Badge status="error" />
                        <Text strong style={{ color: '#cf1322', marginLeft: 8 }}>
                          Exception Queue
                        </Text>
                        <Badge
                          count={exceptionQueue.length}
                          style={{ marginLeft: 8, backgroundColor: '#ff4d4f' }}
                        />
                      </span>
                    }
                    style={{ borderColor: '#ffa39e' }}
                  >
                    {exceptionQueue.map((gr) => (
                      <div
                        key={gr.grNumber}
                        style={{
                          padding: '8px 0',
                          borderBottom: '1px solid #f0f0f0',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleOpenGRDetail(gr)}
                      >
                        <Row align="middle" justify="space-between">
                          <Col>
                            <div>
                              <Text strong style={{ color: '#cf1322', fontSize: 13 }}>
                                {gr.grNumber}
                              </Text>
                              <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                                - {summarizePOReferences(gr)}
                              </Text>
                            </div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {summarizeSuppliers(gr)} &middot; {officialStateLabel[gr.processState]}
                            </Text>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </Card>
                )}
              </>
            ) : (
              <>
                <Card
                  size="small"
                  style={{ marginBottom: 16 }}
                  bodyStyle={{ padding: poViewMode === 'card' ? 16 : 0 }}
                  title={
                    poViewMode === 'card' ? (
                      <Space size={8}>
                        <Text strong>
                          <InboxOutlined style={{ marginRight: 8 }} />
                          {activeQueueTitle}
                        </Text>
                        <Text type="secondary">
                          {filteredRoleQueue.length} receipt
                          {filteredRoleQueue.length !== 1 ? 's' : ''}
                        </Text>
                      </Space>
                    ) : undefined
                  }
                  extra={
                    poViewMode === 'card' ? (
                      <Segmented
                        size="small"
                        value={poViewMode}
                        onChange={(val) => setPOViewMode(val as POViewMode)}
                        options={[
                          { label: 'List', value: 'list', icon: <BarsOutlined /> },
                          { label: 'Cards', value: 'card', icon: <AppstoreOutlined /> },
                        ]}
                      />
                    ) : undefined
                  }
                >
                  {poViewMode === 'card' ? (
                    <GRQueueCardGrid receipts={filteredRoleQueue} onViewDetails={handleOpenGRDetail} />
                  ) : (
                    <GRQueueTable
                      receipts={filteredRoleQueue}
                      onViewDetail={handleOpenGRDetail}
                      headerTitle={
                        <Space size={8}>
                          <Text strong>
                            <InboxOutlined style={{ marginRight: 8 }} />
                            {activeQueueTitle}
                          </Text>
                          <Text type="secondary">
                            {filteredRoleQueue.length} receipt
                            {filteredRoleQueue.length !== 1 ? 's' : ''}
                          </Text>
                        </Space>
                      }
                      toolbarExtra={
                        <Segmented
                          size="small"
                          value={poViewMode}
                          onChange={(val) => setPOViewMode(val as POViewMode)}
                          options={[
                            { label: 'List', value: 'list', icon: <BarsOutlined /> },
                            { label: 'Cards', value: 'card', icon: <AppstoreOutlined /> },
                          ]}
                        />
                      }
                    />
                  )}
                </Card>
              </>
            )}
          </div>
        )}

        {/* ── GR History View ── */}
        {inboundView === 'history' && (
          <InboundGRTable
            receipts={historyReceipts}
            onViewDetail={handleOpenGRDetail}
            typeFilter={historyTypeFilter}
            statusFilter={historyStatusFilter}
          />
        )}

        {/* ── Recent Activity View ── */}
        {inboundView === 'activity' && (
          <RecentActivity receipts={receipts} onViewDetail={handleOpenGRDetail} />
        )}
      </div>
      )}

      {/* ── Modals & Sidebars ── */}
      {!workspaceContent && (
        <>
          <PODetailSidebar
            open={selectedPODetail !== null}
            onClose={() => setSelectedPODetail(null)}
            po={selectedPODetail}
            onCreateGR={(po) => handleCreateGR([po])}
          />

          <GRDetailSidebar
            open={selectedGR !== null}
            onClose={() => setSelectedGR(null)}
            receipt={selectedGR}
            viewerRole={activeRole}
            onUpdateProcessState={handleUpdateGRProcessState}
            onOpenWarehouseCorrection={handleOpenWarehouseCorrection}
            onOpenLinkPO={(receipt) => setLinkPOReceipt(receipt)}
            onOpenQCVerification={(receipt) => setQCVerificationReceipt(receipt)}
            onOpenSupervisorReview={(receipt) => setSupervisorReviewReceipt(receipt)}
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
