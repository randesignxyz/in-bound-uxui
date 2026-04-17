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
  Select,
  Space,
  Tag,
  message,
} from 'antd';
import {
  AppstoreOutlined,
  BarsOutlined,
  InboxOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  type GRItem,
  type GoodsReceiptSourceType,
  type InboundHistoryStatus,
  type InboundProcessState,
  type POLinkStatus,
  type QcQueueStatus,
  getGoodsReceiptSourceColor,
  getInboundHistoryStatus,
  getPurchaseOrderVendorOptions,
  getQcQueueStatus,
  canCombinePurchaseOrders,
  getCombinedPurchaseOrderVendor,
  getReceiptDisplayStatus,
  getReceiptDisplayStatusColor,
  getReceiptApprovedGrNumber,
  getReceiptIrNumber,
  getReceiptPOReferences,
  poLinkStatusLabel,
  summarizePOReferences,
  summarizeSuppliers,
} from './workflow';
import type {
  InboundDashboardSummaryApi,
  InboundDashboardSummaryParams,
  InboundDashboardSummaryRange,
  InboundSaveGoodsReceiptInput,
  UpcomingInboundGoodsReceipt as GoodsReceipt,
  UpcomingInboundPurchaseOrder as PurchaseOrder,
} from './data';
import { UpcomingInboundServiceAPI } from './service';
import { ProCard } from '@ant-design/pro-components';
import { POListTable } from './components/POListTable';
import { PODetailSidebar } from './components/PODetailSidebar';
import { GRCreationModal } from './components/GRCreationModal';
import { GRDetailSidebar } from './components/GRDetailSidebar';
import { InboundGRTable } from './components/InboundGRTable';
import { GRQueueTable } from './components/GRQueueTable';
import { TempGRCreationModal } from './components/TempGRCreationModal';
import { LinkPOModal } from './components/LinkPOModal';
import {
  SupervisorApprovalSuccessModal,
  type SupervisorApprovalSuccessData,
} from './components/SupervisorApprovalSuccessModal';

const { Text } = Typography;

type InboundViewMode = 'operations' | 'history';
type InboundWorkspaceRole = 'WAREHOUSE_STAFF' | 'QC' | 'WAREHOUSE_SUPERVISOR';
type HistoryStatusFilter = 'ALL' | InboundHistoryStatus;
type QcQueueStatusFilter = QcQueueStatus | 'All';
type DashboardSummaryViewMode = InboundDashboardSummaryRange | 'CUSTOM';
type DashboardStatCard = {
  title: string;
  value: number;
  color?: string;
  prefix?: ReactNode;
};

const simulationRoleLabel: Record<InboundWorkspaceRole, string> = {
  WAREHOUSE_STAFF: 'Warehouse Staff',
  QC: 'QC',
  WAREHOUSE_SUPERVISOR: 'Warehouse Supervisor',
};

const historyStatusOptions: Array<{ label: string; value: HistoryStatusFilter }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Complete', value: 'Complete' },
  { label: 'Correction Required', value: 'Correction Required' },
  { label: 'Rejected', value: 'Rejected' },
];

const warehouseHistoryStatusOptions: Array<{ label: string; value: HistoryStatusFilter }> = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Complete', value: 'Complete' },
  { label: 'Correction Required', value: 'Correction Required' },
  { label: 'Rejected', value: 'Rejected' },
];

const supervisorHistoryStatusOptions: Array<{ label: string; value: HistoryStatusFilter }> = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Complete', value: 'Complete' },
  { label: 'Rejected', value: 'Rejected' },
];

const qcStatusOptions: Array<{ label: string; value: QcQueueStatusFilter }> = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Submitted', value: 'Submitted' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Complete', value: 'Complete' },
  { label: 'All', value: 'All' },
];

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

function isVisibleOperationalReceipt(receipt: GoodsReceipt) {
  return receipt.processState !== 'MERGED_TO_SUPERVISOR_REVIEW';
}

export default function UpcomingInboundListview() {
  const access = useAccess();
  const requestActions = simpleRequestActions();
  const services = UpcomingInboundServiceAPI(requestActions);
  const [inboundView, setInboundView] = useState<InboundViewMode>('operations');
  const [simulationRole, setSimulationRole] = useState<InboundWorkspaceRole>('WAREHOUSE_STAFF');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  // Shared PO filters
  const [poSearchValue, setPOSearchValue] = useState('');
  const [poVendorFilter, setPOVendorFilter] = useState<string>('ALL');
  const [poTypeFilter, setPOTypeFilter] = useState<'ALL' | PurchaseOrder['type']>('ALL');
  const [poDateRangeFilter, setPODateRangeFilter] = useState<[string, string] | null>(null);
  const [queueSearchValue, setQueueSearchValue] = useState('');
  const [queueTypeFilter, setQueueTypeFilter] = useState<'ALL' | GoodsReceipt['receiptType']>('ALL');
  const [queueSourceFilter, setQueueSourceFilter] =
    useState<'ALL' | 'STANDARD' | 'TEMP'>('ALL');
  const [qcStatusFilter, setQcStatusFilter] = useState<QcQueueStatusFilter>('Pending');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'ALL' | 'Planned' | 'Unplanned'>('ALL');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<HistoryStatusFilter>('ALL');
  const [dashboardSummaryRange, setDashboardSummaryRange] = useState<DashboardSummaryViewMode>('OVERALL');
  const [dashboardPeriodFilter, setDashboardPeriodFilter] = useState<[string, string] | null>(null);
  const [inboundStats, setInboundStats] = useState<InboundDashboardSummaryApi>({
    expectedToday: 0,
    qcPending: 0,
    supervisorPending: 0,
    approved: 0,
    completed: 0,
    exceptions: 0,
    returnedForCorrection: 0,
    awaitingPOLink: 0,
    totalGRs: 0,
  });
  const hasInitializedDashboardSummary = useRef(false);

  // GR state (mirrors WarehouseStaffUI)
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [selectedPOs, setSelectedPOs] = useState<PurchaseOrder[]>([]);
  const [selectedWarehousePONumbers, setSelectedWarehousePONumbers] = useState<string[]>([]);
  const [isGRCreationOpen, setIsGRCreationOpen] = useState(false);
  const [isTempGRCreationOpen, setIsTempGRCreationOpen] = useState(false);
  const [selectedPODetail, setSelectedPODetail] = useState<PurchaseOrder | null>(null);
  const [selectedGR, setSelectedGR] = useState<GoodsReceipt | null>(null);
  const [warehouseCorrectionReceipt, setWarehouseCorrectionReceipt] = useState<GoodsReceipt | null>(null);
  const [linkPOReceipt, setLinkPOReceipt] = useState<GoodsReceipt | null>(null);
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

  const warehouseVendorOptions = useMemo(
    () => getPurchaseOrderVendorOptions(purchaseOrders),
    [purchaseOrders],
  );

  const filteredWarehousePurchaseOrders = useMemo(() => {
    let data = [...purchaseOrders];

    if (poSearchValue.trim()) {
      const term = poSearchValue.trim().toUpperCase();
      data = data.filter(
        (po) =>
          po.poNumber.toUpperCase().includes(term) ||
          po.supplier.toUpperCase().includes(term),
      );
    }

    if (poVendorFilter !== 'ALL') {
      data = data.filter((po) => po.supplier?.trim() === poVendorFilter);
    }

    if (poTypeFilter !== 'ALL') {
      data = data.filter((po) => po.type === poTypeFilter);
    }

    if (poDateRangeFilter) {
      const [dateFrom, dateTo] = poDateRangeFilter;
      data = data.filter((po) => po.expectedDate >= dateFrom && po.expectedDate <= dateTo);
    }

    return data;
  }, [poDateRangeFilter, poSearchValue, poTypeFilter, poVendorFilter, purchaseOrders]);

  const selectedWarehousePOs = useMemo(
    () =>
      filteredWarehousePurchaseOrders.filter((purchaseOrder) =>
        selectedWarehousePONumbers.includes(purchaseOrder.poNumber),
      ),
    [filteredWarehousePurchaseOrders, selectedWarehousePONumbers],
  );

  const selectedWarehousePOVendor = useMemo(
    () => getCombinedPurchaseOrderVendor(selectedWarehousePOs),
    [selectedWarehousePOs],
  );

  const buildDashboardSummaryParams = (): InboundDashboardSummaryParams => ({
    range: dashboardSummaryRange === 'CUSTOM' ? null : dashboardSummaryRange,
    dateFrom: dashboardPeriodFilter?.[0] ?? null,
    dateTo: dashboardPeriodFilter?.[1] ?? null,
  });

  const loadInboundData = async () => {
    const [poResult, receiptResult, summaryResult] = await Promise.allSettled([
      services.listPurchaseOrders(),
      services.pageGoodsReceipts({
        criteria: {},
        pagination: {
          current: 1,
          pageSize: 200,
        },
      }),
      services.getDashboardSummary(buildDashboardSummaryParams()),
    ]);

    if (poResult.status === 'fulfilled') {
      const nextPurchaseOrders = poResult.value;
      setPurchaseOrders(nextPurchaseOrders);
      setSelectedPODetail((prev) => {
        if (!prev) return prev;
        return nextPurchaseOrders.find((po) => po.id === prev.id || po.poNumber === prev.poNumber) || null;
      });
      setSelectedPOs((prev) =>
        prev
          .map(
            (selected) =>
              nextPurchaseOrders.find(
                (po) => po.id === selected.id || po.poNumber === selected.poNumber,
              ) || null,
          )
          .filter((po): po is PurchaseOrder => po !== null),
      );
      setSelectedWarehousePONumbers((prev) =>
        prev.filter((poNumber) =>
          nextPurchaseOrders.some((purchaseOrder) => purchaseOrder.poNumber === poNumber),
        ),
      );
    } else {
      message.error(poResult.reason?.message || 'Failed to load purchase orders.');
    }

    if (receiptResult.status === 'fulfilled') {
      setReceipts(
        receiptResult.value.items
          .map(normalizeReceiptForUI)
          .filter(isVisibleOperationalReceipt),
      );
    } else {
      message.error(receiptResult.reason?.message || 'Failed to load inbound receiving history.');
    }

    if (summaryResult.status === 'fulfilled') {
      setInboundStats(summaryResult.value);
    } else {
      message.error(summaryResult.reason?.message || 'Failed to load inbound dashboard summary.');
    }
  };

  const loadDashboardSummary = async () => {
    try {
      if (dashboardSummaryRange === 'CUSTOM' && !dashboardPeriodFilter) {
        return;
      }
      const summary = await services.getDashboardSummary(buildDashboardSummaryParams());
      setInboundStats(summary);
    } catch (error: any) {
      message.error(error?.message || 'Failed to load inbound dashboard summary.');
    }
  };

  useEffect(() => {
    void loadInboundData();
  }, []);

  useEffect(() => {
    if (!hasInitializedDashboardSummary.current) {
      hasInitializedDashboardSummary.current = true;
      return;
    }
    void loadDashboardSummary();
  }, [dashboardPeriodFilter, dashboardSummaryRange]);
  
  useEffect(() => {
    if (isRoleSimulationEnabled) return;
    if (inboundRoleOptions.length === 0) return;
    if (inboundRoleOptions.includes(simulationRole)) return;
    setSimulationRole(inboundRoleOptions[0]);
  }, [inboundRoleOptions, isRoleSimulationEnabled, simulationRole]);

  const syncReceiptInState = (receipt: GoodsReceipt) => {
    const normalized = normalizeReceiptForUI(receipt);

    if (!isVisibleOperationalReceipt(normalized)) {
      setReceipts((prev) => prev.filter((row) => row.grNumber !== normalized.grNumber));
      setSelectedGR((prev) => (prev?.grNumber === normalized.grNumber ? null : prev));
      return normalized;
    }

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

  const dashboardExpectedTitle =
    dashboardSummaryRange === 'CUSTOM' && dashboardPeriodFilter
      ? 'Expected in Selected Period'
      : dashboardSummaryRange === 'DAILY'
        ? 'Expected Today'
        : dashboardSummaryRange === 'WEEKLY'
          ? 'Expected This Week'
          : 'Expected Overall';
  const dashboardStatCards: DashboardStatCard[] =
    activeRole === 'WAREHOUSE_STAFF'
      ? [
          {
            title: dashboardExpectedTitle,
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
            title: 'Total GRs',
            value: inboundStats.totalGRs,
          },
        ]
      : activeRole === 'QC'
        ? [
            {
              title: 'Total IR/GR',
              value: inboundStats.totalGRs,
              color: '#1890ff',
              prefix: <InboxOutlined />,
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
          ]
        : [
            {
              title: 'Total GR',
              value: inboundStats.totalGRs,
              color: '#1890ff',
              prefix: <InboxOutlined />,
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

  const qcRelevantReceipts = useMemo(
    () => receipts.filter((receipt) => getQcQueueStatus(receipt) !== null),
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

  const warehouseRejectedReceiptCount = useMemo(
    () => receipts.filter((receipt) => getInboundHistoryStatus(receipt) === 'Rejected').length,
    [receipts],
  );

  const filteredRoleQueue = useMemo(() => {
    const source =
      activeRole === 'QC'
        ? qcRelevantReceipts
        : activeRole === 'WAREHOUSE_SUPERVISOR'
          ? supervisorQueueReceipts
          : [];

    let data = [...source];

    if (queueSearchValue.trim()) {
      const term = queueSearchValue.trim().toUpperCase();
      data = data.filter(
        (receipt) =>
          receipt.grNumber.toUpperCase().includes(term) ||
          getReceiptIrNumber(receipt).toUpperCase().includes(term) ||
          (getReceiptApprovedGrNumber(receipt)?.toUpperCase().includes(term) ?? false) ||
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

    if (activeRole === 'QC') {
      if (qcStatusFilter !== 'All') {
        data = data.filter((receipt) => getQcQueueStatus(receipt) === qcStatusFilter);
      }
    } else if (queueSourceFilter === 'STANDARD') {
      data = data.filter((receipt) => receipt.receiptSourceType !== 'TEMP_NO_PO');
    } else if (queueSourceFilter === 'TEMP') {
      data = data.filter((receipt) => receipt.receiptSourceType === 'TEMP_NO_PO');
    }

    return data.sort((a, b) => b.createdDate.localeCompare(a.createdDate));
  }, [
    qcRelevantReceipts,
    qcStatusFilter,
    queueSearchValue,
    queueSourceFilter,
    queueTypeFilter,
    activeRole,
    supervisorQueueReceipts,
  ]);

  // Handlers (mirrors WarehouseStaffUI)
  const hydratePurchaseOrder = async (po: PurchaseOrder): Promise<PurchaseOrder> => {
    if (!po.id) {
      return po;
    }

    return services.detailPurchaseOrder(po.id);
  };

  const handleCreateGR = async (purchaseOrders: PurchaseOrder[]) => {
    if (!purchaseOrders.length) return;
    if (!canCombinePurchaseOrders(purchaseOrders)) {
      message.error('You can only combine purchase orders from the same vendor into one IR/GR.');
      return;
    }

    setSelectedPODetail(null);

    try {
      const hydratedPurchaseOrders = await Promise.all(purchaseOrders.map(hydratePurchaseOrder));
      if (!canCombinePurchaseOrders(hydratedPurchaseOrders)) {
        message.error('Selected purchase orders no longer share the same vendor. Please reselect them.');
        return;
      }
      setSelectedPOs(
        [...hydratedPurchaseOrders].sort((left, right) => left.poNumber.localeCompare(right.poNumber)),
      );
      setIsGRCreationOpen(true);
    } catch (error: any) {
      message.error(error?.message || 'Failed to load purchase order detail.');
    }
  };

  const handleCreateSelectedGR = async () => {
    await handleCreateGR(selectedWarehousePOs);
  };

  const handleWarehousePOSelectionChange = (nextSelectedRowKeys: string[]) => {
    const nextSelectedPOs = filteredWarehousePurchaseOrders.filter((purchaseOrder) =>
      nextSelectedRowKeys.includes(purchaseOrder.poNumber),
    );

    if (!canCombinePurchaseOrders(nextSelectedPOs)) {
      message.warning('Please select purchase orders from the same vendor only.');
      return;
    }

    setSelectedWarehousePONumbers(nextSelectedPOs.map((purchaseOrder) => purchaseOrder.poNumber));
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

  const resetDashboardFilters = () => {
    setDashboardSummaryRange('OVERALL');
    setDashboardPeriodFilter(null);
  };

  const resetWorkspaceFilters = () => {
    setSelectedWarehousePONumbers([]);
    setPOSearchValue('');
    setPOVendorFilter('ALL');
    setPOTypeFilter('ALL');
    setPODateRangeFilter(null);
    setQueueSearchValue('');
    setQueueTypeFilter('ALL');
    setQueueSourceFilter('ALL');
    setQcStatusFilter('Pending');
    setHistoryTypeFilter('ALL');
    setHistoryStatusFilter('ALL');
    resetDashboardFilters();
  };

  const handleInboundViewChange = (nextView: InboundViewMode) => {
    setInboundView(nextView);
    resetWorkspaceFilters();
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
    resetWorkspaceFilters();
  };

  const handleViewPODetail = async (po: PurchaseOrder) => {
    try {
      const detail = await hydratePurchaseOrder(po);
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
    const canonicalPoReferences = Array.from(
      new Map(
        [...(data.poReferences || [])]
          .filter((reference) => reference?.poNumber)
          .sort((left, right) => left.poNumber.localeCompare(right.poNumber))
          .map((reference) => [reference.poNumber, reference]),
      ).values(),
    );
    const primaryPoReference = canonicalPoReferences[0];
    const receiptSourceType: GoodsReceiptSourceType =
      data.receiptSourceType || (data.receiptType === 'Planned' ? 'PLANNED' : 'UNPLANNED_WITH_PO');
    const poLinkStatus: POLinkStatus =
      data.poLinkStatus || (receiptSourceType === 'TEMP_NO_PO' ? 'WAITING_PO' : 'NOT_REQUIRED');
    const isNewMultiPOReceipt = !data.id && canonicalPoReferences.length > 1;

    return {
      id: data.id || undefined,
      gr_number: data.grNumber || undefined,
      receiving_number: data.receivingNumber || data.grNumber || undefined,
      process_state: data.processState || undefined,
      po_number: primaryPoReference?.poNumber || data.linkedPoNumber || undefined,
      supplier: primaryPoReference?.supplier || data.supplier,
      receipt_type: data.receiptType,
      append_to_open_receiving: data.id ? false : !isNewMultiPOReceipt,
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
      poReferences: canonicalPoReferences,
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
      setSelectedWarehousePONumbers([]);
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
    action?: string,
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
        action,
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
      documentChecklist: GoodsReceipt['documentChecklist'];
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
      if (updated.qcResult === 'Pass') {
        setSelectedGR(null);
      } else {
        setSelectedGR(updated);
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
      const response = await services.submitSupervisorReview({
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

  const handleExportReportClick = () => {
    message.info('Export report is not connected yet.');
  };

  useEffect(() => {
    const visiblePurchaseOrderNumbers = new Set(
      filteredWarehousePurchaseOrders.map((purchaseOrder) => purchaseOrder.poNumber),
    );

    setSelectedWarehousePONumbers((prev) => {
      const next = prev.filter((poNumber) => visiblePurchaseOrderNumbers.has(poNumber));
      return next.length === prev.length ? prev : next;
    });
  }, [filteredWarehousePurchaseOrders]);

  useEffect(() => {
    if (poVendorFilter === 'ALL') {
      return;
    }

    if (!warehouseVendorOptions.includes(poVendorFilter)) {
      setPOVendorFilter('ALL');
    }
  }, [poVendorFilter, warehouseVendorOptions]);

  const poHeaderTitle = (
    <div style={{ paddingLeft: 8 }}>
      <Text strong>{`Purchase Orders (${filteredWarehousePurchaseOrders.length})`}</Text>
    </div>
  );

  const poHeaderActions = (
    <Space size={8} wrap>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {selectedWarehousePOs.length > 0 && selectedWarehousePOVendor
          ? `${selectedWarehousePOs.length} PO${selectedWarehousePOs.length > 1 ? 's' : ''} selected from ${selectedWarehousePOVendor}`
          : 'Select same-vendor POs to create one IR/GR'}
      </Text>
      <Button
        type="primary"
        onClick={() => void handleCreateSelectedGR()}
        disabled={selectedWarehousePOs.length === 0}
      >
        {selectedWarehousePOs.length > 1
          ? `Create 1 IR (${selectedWarehousePOs.length} POs)`
          : 'Create 1 IR'}
      </Button>
      {selectedWarehousePONumbers.length > 0 && (
        <Button onClick={() => setSelectedWarehousePONumbers([])}>Clear Selection</Button>
      )}
      <Button
        onClick={() => handleCreateTempGR()}
        style={{
          background: '#fff',
          fontWeight: 600,
        }}
      >
        Receive Without PO
      </Button>
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
  const shouldShowInboundTabs = activeRole !== 'QC';
  const effectiveInboundView: InboundViewMode =
    activeRole === 'QC' ? 'operations' : inboundView;
  const dashboardSummaryTitle =
    activeRole === 'WAREHOUSE_STAFF'
      ? 'Inbound Upcoming Dashboard'
      : 'Inbound Receiving Dashboard';
  const operationsTabLabel =
    activeRole === 'WAREHOUSE_SUPERVISOR' ? 'Inbound Receiving' : 'Inbound Upcoming';
  const historyTabLabel =
    activeRole === 'WAREHOUSE_SUPERVISOR' ? (
      'GR History'
    ) : (
      <Space size={6}>
        <span>Inbound Receiving</span>
        {warehouseRejectedReceiptCount > 0 && (
          <Badge count={warehouseRejectedReceiptCount} size="small" />
        )}
      </Space>
    );
  const inboundViewOptions: {
    icon: ReactNode;
    label: ReactNode;
    value: InboundViewMode;
  }[] = [
    { label: operationsTabLabel, value: 'operations', icon: <AppstoreOutlined /> },
    { label: historyTabLabel, value: 'history', icon: <BarsOutlined /> },
  ];
  const historyReceipts = useMemo(() => {
    if (activeRole !== 'WAREHOUSE_SUPERVISOR') {
      return receipts;
    }

    return receipts.filter((receipt) => {
      const historyStatus = getInboundHistoryStatus(receipt);
      return historyStatus === 'Complete' || historyStatus === 'Rejected';
    });
  }, [activeRole, receipts]);
  const filteredHistoryReceiptCount = useMemo(() => {
    let data = historyReceipts;
    if (historyTypeFilter !== 'ALL') {
      data = data.filter((receipt) => receipt.receiptType === historyTypeFilter);
    }
    if (historyStatusFilter !== 'ALL') {
      data = data.filter((receipt) => getInboundHistoryStatus(receipt) === historyStatusFilter);
    }
    return data.length;
  }, [historyReceipts, historyStatusFilter, historyTypeFilter]);
  const historyHeaderTitle =
    activeRole === 'WAREHOUSE_SUPERVISOR' ? 'Good Receipt' : 'Inbound Receiving';
  const historyStatusFilterOptions =
    activeRole === 'WAREHOUSE_SUPERVISOR'
      ? supervisorHistoryStatusOptions
      : activeRole === 'WAREHOUSE_STAFF'
        ? warehouseHistoryStatusOptions
        : historyStatusOptions;
  const inboundReceivingHeaderTitle = (
    <div style={{ paddingLeft: 8 }}>
      <Text strong>{`${historyHeaderTitle} (${filteredHistoryReceiptCount})`}</Text>
    </div>
  );
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
    ));

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      {workspaceContent ? (
        workspaceContent
      ) : (
      <div style={{ marginTop: 16 }}>
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

        <Row justify="space-between" align="middle" gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col>
            <Text strong>{dashboardSummaryTitle}</Text>
          </Col>
          <Col>
            <Space size={12} wrap>
              <Button
                icon={<ExportOutlined />}
                onClick={handleExportReportClick}
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
                  const isActive = dashboardSummaryRange === option.value;

                  return (
                    <Button
                      key={option.value}
                      size="small"
                      type={isActive ? 'primary' : 'default'}
                      onClick={() => {
                        setDashboardSummaryRange(option.value as DashboardSummaryViewMode);
                        if (option.value !== 'CUSTOM') {
                          setDashboardPeriodFilter(null);
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
              {dashboardSummaryRange === 'CUSTOM' && (
                <DatePicker.RangePicker
                  size="small"
                  allowClear
                  style={{ width: 220 }}
                  placeholder={['Start date', 'End date']}
                  onChange={(values) => {
                    if (!values?.[0] || !values?.[1]) {
                      setDashboardPeriodFilter(null);
                      setDashboardSummaryRange('OVERALL');
                      return;
                    }

                    setDashboardPeriodFilter([
                      values[0].format('YYYY-MM-DD'),
                      values[1].format('YYYY-MM-DD'),
                    ]);
                  }}
                />
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

        <ProCard bordered style={{ marginBottom: 16 }}>
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
            <Col flex="auto">
              {effectiveInboundView === 'operations' ? (
                activeRole === 'WAREHOUSE_STAFF' ? (
                  <Space size="large" wrap style={{ justifyContent: 'flex-end', width: '100%' }}>
                    <Input.Search
                      allowClear
                      placeholder="Search PO / Supplier"
                      onSearch={handleWarehousePOSearch}
                      onChange={(e) => setPOSearchValue(e.target.value)}
                      style={{ width: 220 }}
                    />
                    <Select
                      value={poVendorFilter}
                      onChange={(value) => setPOVendorFilter(value)}
                      style={{ width: 220 }}
                      options={[
                        { label: 'All Vendors', value: 'ALL' },
                        ...warehouseVendorOptions.map((vendor) => ({
                          label: vendor,
                          value: vendor,
                        })),
                      ]}
                    />
                    <Radio.Group
                      value={poTypeFilter}
                      onChange={(e) => setPOTypeFilter(e.target.value)}
                    >
                      <Radio.Button value="ALL">All</Radio.Button>
                      <Radio.Button value="Planned">Planned</Radio.Button>
                      <Radio.Button value="Unplanned">Unplanned</Radio.Button>
                    </Radio.Group>
                    <DatePicker.RangePicker
                      allowClear
                      style={{ width: 260 }}
                      onChange={(values) => {
                        if (!values?.[0] || !values?.[1]) {
                          setPODateRangeFilter(null);
                          return;
                        }

                        setPODateRangeFilter([
                          values[0].format('YYYY-MM-DD'),
                          values[1].format('YYYY-MM-DD'),
                        ]);
                      }}
                      placeholder={['Start date', 'End date']}
                    />
                  </Space>
                ) : activeRole === 'QC' ? (
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
                      value={qcStatusFilter}
                      onChange={(event) => setQcStatusFilter(event.target.value)}
                    >
                      {qcStatusOptions.map((option) => (
                        <Radio.Button key={option.value} value={option.value}>
                          {option.label}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
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
              ) : effectiveInboundView === 'history' ? (
                <Space size="large" wrap style={{ justifyContent: 'flex-end', width: '100%' }}>
                  <Radio.Group
                    value={historyTypeFilter}
                    onChange={(e) => setHistoryTypeFilter(e.target.value)}
                  > 
                    <Radio.Button value="ALL">All</Radio.Button>
                    <Radio.Button value="Planned">Planned</Radio.Button>
                    <Radio.Button value="Unplanned">Unplanned</Radio.Button>
                  </Radio.Group>
                  <Space size={8}>
                    {activeRole !== 'WAREHOUSE_SUPERVISOR' && activeRole !== 'WAREHOUSE_STAFF' && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Status
                      </Text>
                    )}
                    <Select<HistoryStatusFilter>
                      value={historyStatusFilter}
                      onChange={(value) => setHistoryStatusFilter(value)}
                      options={historyStatusFilterOptions}
                      style={{ width: 190 }}
                    />
                  </Space>
                </Space>
              ) : null}
            </Col>
          </Row>
        </ProCard>

        {/* ── Inbound Operations View ── */}
        {effectiveInboundView === 'operations' && (
          <div>
            {activeRole === 'WAREHOUSE_STAFF' ? (
              <>
                <POListTable
                  purchaseOrders={filteredWarehousePurchaseOrders}
                  onViewDetails={handleViewPODetail}
                  headerTitle={poHeaderTitle}
                  toolbarExtra={poHeaderActions}
                  selectedRowKeys={selectedWarehousePONumbers}
                  lockedSupplier={selectedWarehousePOVendor}
                  onSelectionChange={handleWarehousePOSelectionChange}
                />

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
                    {exceptionQueue.map((gr) => {
                      const displayStatus = getReceiptDisplayStatus(gr);

                      return (
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
                                {summarizeSuppliers(gr)} &middot;{' '}
                                <Tag color={getReceiptDisplayStatusColor(displayStatus)} bordered={false}>
                                  {displayStatus}
                                </Tag>
                              </Text>
                            </Col>
                          </Row>
                        </div>
                      );
                    })}
                  </Card>
                )}
              </>
            ) : (
              <GRQueueTable
                receipts={filteredRoleQueue}
                onViewDetail={handleOpenGRDetail}
                statusMode={activeRole === 'QC' ? 'qc' : 'legacy'}
                headerTitle={
                  <div style={{ paddingLeft: 8 }}>
                    <Text strong>{`Inbound Receiving (${filteredRoleQueue.length})`}</Text>
                  </div>
                }
              />
            )}
          </div>
        )}

        {/* ── GR History View ── */}
        {effectiveInboundView === 'history' && (
          <Card size="small" style={{ marginBottom: 16 }} bodyStyle={{ padding: 0 }}>
            <div style={{ padding: '16px 16px 12px' }}>{inboundReceivingHeaderTitle}</div>
            <InboundGRTable
              receipts={historyReceipts}
              onViewDetail={handleOpenGRDetail}
              typeFilter={historyTypeFilter}
              statusFilter={historyStatusFilter}
              hideSourceAndPoLink={activeRole === 'WAREHOUSE_STAFF' || activeRole === 'WAREHOUSE_SUPERVISOR'}
              showNotificationBadge={activeRole === 'WAREHOUSE_STAFF'}
            />
          </Card>
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
            onCreateGR={(po) => void handleCreateGR([po])}
          />

          <GRDetailSidebar
            open={selectedGR !== null}
            onClose={() => setSelectedGR(null)}
            receipt={selectedGR}
            viewerRole={activeRole}
            onUpdateProcessState={handleUpdateGRProcessState}
            onOpenWarehouseCorrection={handleOpenWarehouseCorrection}
            onOpenLinkPO={(receipt) => setLinkPOReceipt(receipt)}
            onSubmitQCVerification={handleSubmitQCVerification}
            onSubmitSupervisorReview={handleSubmitSupervisorReview}
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
