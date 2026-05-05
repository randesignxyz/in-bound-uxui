import BreadCrumbCom from '@/pages/prod/shared/BreadCrumbCom';
import { downloadGenericReport } from '@/services/apiGateway';
import { ProdPaths } from '@/pages/prod';
import { simpleRequestActions } from '@/services/model';
import { USE_STATIC_AUTH } from '@/staticAuthConfig';
import dayjs, { type Dayjs } from 'dayjs';
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
  Form,
  Modal,
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
import { history, useAccess, useLocation } from '@umijs/max';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type GRItem,
  type GoodsReceiptSourceType,
  type InboundHistoryStatus,
  type InboundProcessState,
  type POLinkStatus,
  type QcQueueStatus,
  getGoodsReceiptSourceColor,
  getInboundHistoryStatus,
  isQcRejectedReceipt,
  getPurchaseOrderVendorOptions,
  getQcQueueStatus,
  canCombinePurchaseOrders,
  getCombinedPurchaseOrderVendor,
  getReceiptDisplayStatus,
  getReceiptDisplayStatusColor,
  getReceiptApprovedGrNumber,
  getReceiptIrNumber,
  getReceiptPOReferences,
  getExceptionQueueReceipts,
  poLinkStatusLabel,
  summarizePOReferences,
  summarizeSuppliers,
} from './workflow';
import type {
  InboundDashboardSummaryApi,
  InboundDashboardSummaryParams,
  InboundDashboardSummaryRange,
  InboundExportReportKey,
  InboundSaveGoodsReceiptInput,
  InboundSupplierMasterApi,
  InboundUomMasterApi,
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
  period: InboundExportPeriod;
  dateRange?: [Dayjs, Dayjs];
};
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

const simulationRoleLabel: Record<InboundWorkspaceRole, string> = {
  WAREHOUSE_STAFF: 'Warehouse Staff',
  QC: 'QC',
  WAREHOUSE_SUPERVISOR: 'Warehouse Supervisor',
};

const historyStatusOptions: Array<{ label: string; value: HistoryStatusFilter }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Ready to Post SAP', value: 'Ready to Post SAP' },
  { label: 'Complete', value: 'Complete' },
  { label: 'Correction Required', value: 'Correction Required' },
  { label: 'Rejected', value: 'Rejected' },
];

const warehouseHistoryStatusOptions: Array<{ label: string; value: HistoryStatusFilter }> = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Ready to Post SAP', value: 'Ready to Post SAP' },
  { label: 'Complete', value: 'Complete' },
  { label: 'Correction Required', value: 'Correction Required' },
  { label: 'Rejected', value: 'Rejected' },
];

const supervisorHistoryStatusOptions: Array<{ label: string; value: HistoryStatusFilter }> = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Pending Approval', value: 'SUPERVISOR_PENDING' },
  { label: 'Ready to Post SAP', value: 'Ready to Post SAP' },
  { label: 'QC Pending', value: 'QC_PENDING' },
  { label: 'QC Rejected', value: 'QC_REJECTED' },
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

const inboundDefaultUomOptions: InboundUomMasterApi[] = [
  { id: 1, uom_code: 'BAG', uom_name: 'Bag', status: 'Active' },
  { id: 2, uom_code: 'BOX', uom_name: 'Box', status: 'Active' },
  { id: 3, uom_code: 'CTN', uom_name: 'Carton', status: 'Active' },
  { id: 4, uom_code: 'EA', uom_name: 'Each', status: 'Active' },
  { id: 5, uom_code: 'G', uom_name: 'Gram', status: 'Active' },
  { id: 6, uom_code: 'KG', uom_name: 'Kilogram', status: 'Active' },
  { id: 7, uom_code: 'L', uom_name: 'Liter', status: 'Active' },
  { id: 8, uom_code: 'ML', uom_name: 'Milliliter', status: 'Active' },
  { id: 9, uom_code: 'PALLET', uom_name: 'Pallet', status: 'Active' },
  { id: 10, uom_code: 'PCS', uom_name: 'Pieces', status: 'Active' },
  { id: 11, uom_code: 'ROLL', uom_name: 'Roll', status: 'Active' },
  { id: 12, uom_code: 'TANK', uom_name: 'Tank', status: 'Active' },
];

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
  onExport: (values: Required<InboundExportFormValues>) => Promise<void>;
}) {
  const [form] = Form.useForm<InboundExportFormValues>();
  const period = Form.useWatch('period', form);

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      reportTarget: reportOptions[0]?.value || 'PO_LIST',
      period: 'DAILY',
      dateRange: getInboundExportDateRange('DAILY'),
    });
  }, [form, open, reportOptions]);

  return (
    <Modal
      title="Export Report"
      open={open}
      width={520}
      onCancel={onCancel}
      confirmLoading={loading}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="export"
          type="primary"
          loading={loading}
          icon={<ExportOutlined />}
          onClick={async () => {
            const values = await form.validateFields();
            const dateRange = values.dateRange || getInboundExportDateRange(values.period);

            await onExport({
              reportTarget: values.reportTarget,
              period: values.period,
              dateRange,
            });
          }}
        >
          Export
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="reportTarget" label="Report Type" rules={[{ required: true }]}>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            options={reportOptions}
          />
        </Form.Item>

        <Form.Item name="period" label="Export Period" rules={[{ required: true }]}>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            onChange={(event) => {
              const nextPeriod = event.target.value as InboundExportPeriod;
              form.setFieldValue('dateRange', getInboundExportDateRange(nextPeriod));
            }}
            options={[
              { label: 'Daily', value: 'DAILY' },
              { label: 'Weekly', value: 'WEEKLY' },
              { label: 'Pick a Date Range', value: 'CUSTOM' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="dateRange"
          rules={[{ required: true, message: 'Please select a date range.' }]}
        >
          <DatePicker.RangePicker
            allowClear={false}
            disabled={period !== 'CUSTOM'}
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

const inboundWorkspaceMotionStyles = `
  @keyframes inboundWorkspaceTabEnter {
    from {
      opacity: 0;
      transform: translate3d(10px, 0, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  .inbound-workspace-tab-pane {
    animation: inboundWorkspaceTabEnter 180ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity, transform;
  }

  .inbound-workspace-tab-button {
    transition:
      background-color 180ms ease,
      border-color 180ms ease,
      box-shadow 180ms ease,
      color 180ms ease,
      transform 180ms ease;
  }

  .inbound-workspace-tab-button.ant-btn-primary {
    transform: translateY(-1px);
  }

  @media (prefers-reduced-motion: reduce) {
    .inbound-workspace-tab-pane {
      animation: none;
      will-change: auto;
    }

    .inbound-workspace-tab-button {
      transition: none;
    }
  }
`;

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

function getReceiptDateForFilter(receipt: GoodsReceipt): string {
  return (
    receipt.actualReceiptDate ||
    receipt.createdDate?.slice(0, 10) ||
    receipt.expectedDate ||
    ''
  );
}

function isReceiptInDateRange(receipt: GoodsReceipt, dateRange: [string, string] | null) {
  if (!dateRange) return true;

  const receiptDate = getReceiptDateForFilter(receipt);
  if (!receiptDate) return false;

  const [dateFrom, dateTo] = dateRange;
  return receiptDate >= dateFrom && receiptDate <= dateTo;
}

function sortPurchaseOrdersByLatestExpectedDate(purchaseOrders: PurchaseOrder[]): PurchaseOrder[] {
  return [...purchaseOrders].sort((left, right) => {
    const leftDate = left.expectedDate?.trim() || '';
    const rightDate = right.expectedDate?.trim() || '';

    if (leftDate !== rightDate) {
      if (!leftDate) return 1;
      if (!rightDate) return -1;
      return rightDate.localeCompare(leftDate);
    }

    const leftTime = left.expectedTime?.trim() || '';
    const rightTime = right.expectedTime?.trim() || '';
    if (leftTime !== rightTime) {
      return rightTime.localeCompare(leftTime);
    }

    return right.poNumber.localeCompare(left.poNumber);
  });
}

function getDefaultHistoryStatusFilter(role: InboundWorkspaceRole): HistoryStatusFilter {
  return role === 'WAREHOUSE_SUPERVISOR' ? 'SUPERVISOR_PENDING' : 'ALL';
}

function matchesSupervisorHistoryStatusFilter(
  receipt: GoodsReceipt,
  filter: HistoryStatusFilter,
): boolean {
  if (filter === 'ALL') {
    return true;
  }

  if (filter === 'SUPERVISOR_PENDING') {
    return receipt.processState === 'PENDING_SUPERVISOR_REVIEW';
  }

  if (filter === 'QC_PENDING') {
    return receipt.processState === 'QC_PENDING';
  }

  if (filter === 'QC_REJECTED') {
    return receipt.processState === 'CORRECTION_REQUIRED' || receipt.processState === 'MISMATCH_EXCEPTION';
  }

  return getInboundHistoryStatus(receipt) === filter;
}

function getSupervisorSortPriority(receipt: GoodsReceipt): number {
  if (receipt.processState === 'PENDING_SUPERVISOR_REVIEW') return 0;
  if (receipt.processState === 'QC_PENDING') return 1;
  if (receipt.processState === 'CORRECTION_REQUIRED' || receipt.processState === 'MISMATCH_EXCEPTION') return 2;
  return 3;
}

type UpcomingInboundListviewProps = {
  routeView?: InboundRouteView;
};

export default function UpcomingInboundListview({ routeView = 'list' }: UpcomingInboundListviewProps) {
  const access = useAccess();
  const location = useLocation();
  const isInboundAdmin = Boolean(access?.inboundVisibleBusinessUnits?.includes?.('*'));
  const inboundVisibleBusinessUnits: string[] = isInboundAdmin
    ? []
    : ((access?.inboundVisibleBusinessUnits as string[] | undefined) || []);
  const inboundWarehouseBusinessUnits: string[] = isInboundAdmin
    ? []
    : ((access?.inboundWarehouseBusinessUnits as string[] | undefined) || []);
  const inboundQcBusinessUnits: string[] = isInboundAdmin
    ? []
    : ((access?.inboundQcBusinessUnits as string[] | undefined) || []);
  const inboundSupervisorBusinessUnits: string[] = isInboundAdmin
    ? []
    : ((access?.inboundSupervisorBusinessUnits as string[] | undefined) || []);
  const requestActions = simpleRequestActions();
  const services = UpcomingInboundServiceAPI(requestActions);
  const [inboundView, setInboundView] = useState<InboundViewMode>('operations');
  const [simulationRole, setSimulationRole] = useState<InboundWorkspaceRole>('WAREHOUSE_STAFF');
  const [activeBusinessUnit, setActiveBusinessUnit] = useState<string | undefined>(
    inboundVisibleBusinessUnits[0],
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [supplierMasterOptions, setSupplierMasterOptions] = useState<InboundSupplierMasterApi[]>([]);
  const [uomMasterOptions, setUomMasterOptions] = useState<InboundUomMasterApi[]>([]);

  // Shared PO filters
  const [poSearchValue, setPOSearchValue] = useState('');
  const [poVendorFilter, setPOVendorFilter] = useState<string>('ALL');
  const [poTypeFilter, setPOTypeFilter] = useState<'ALL' | PurchaseOrder['type']>('ALL');
  const [queueSearchValue, setQueueSearchValue] = useState('');
  const [queueTypeFilter, setQueueTypeFilter] = useState<'ALL' | GoodsReceipt['receiptType']>('ALL');
  const [queueSourceFilter, setQueueSourceFilter] =
    useState<'ALL' | 'STANDARD' | 'TEMP'>('ALL');
  const [qcStatusFilter, setQcStatusFilter] = useState<QcQueueStatusFilter>('Pending');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'ALL' | 'Planned' | 'Unplanned'>('ALL');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<HistoryStatusFilter>('ALL');
  const [dashboardSummaryRange, setDashboardSummaryRange] = useState<DashboardSummaryViewMode>('OVERALL');
  const [dashboardPeriodFilter, setDashboardPeriodFilter] = useState<[string, string] | null>(null);
  const [isExportingReport, setIsExportingReport] = useState(false);
  const [isExportReportModalOpen, setIsExportReportModalOpen] = useState(false);
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
    totalIrGrs: 0,
  });
  const hasInitializedDashboardSummary = useRef(false);
  const hasOpenedReceiptFromQueryRef = useRef(false);
  const inboundVisibleBusinessUnitsKey = inboundVisibleBusinessUnits.join('|');

  // GR state (mirrors WarehouseStaffUI)
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [selectedPOs, setSelectedPOs] = useState<PurchaseOrder[]>([]);
  const [selectedWarehousePONumbers, setSelectedWarehousePONumbers] = useState<string[]>([]);
  const getPurchaseOrderRowKey = useCallback(
    (purchaseOrder: Pick<PurchaseOrder, 'businessUnit' | 'poNumber'>) =>
      `${purchaseOrder.businessUnit || 'UNSPECIFIED'}::${purchaseOrder.poNumber}`,
    [],
  );
  const parsePurchaseOrderRowKey = useCallback((key: string) => {
    const separatorIndex = key.indexOf('::');
    if (separatorIndex < 0) {
      return { businessUnit: '', poNumber: key };
    }

    const businessUnit = key.slice(0, separatorIndex);
    return {
      businessUnit: businessUnit === 'UNSPECIFIED' ? '' : businessUnit,
      poNumber: key.slice(separatorIndex + 2),
    };
  }, []);
  const [isGRCreationOpen, setIsGRCreationOpen] = useState(false);
  const [isTempGRCreationOpen, setIsTempGRCreationOpen] = useState(false);
  const [selectedPODetail, setSelectedPODetail] = useState<PurchaseOrder | null>(null);
  const [selectedGR, setSelectedGR] = useState<GoodsReceipt | null>(null);
  const [warehouseCorrectionReceipt, setWarehouseCorrectionReceipt] = useState<GoodsReceipt | null>(null);
  const [linkPOReceipt, setLinkPOReceipt] = useState<GoodsReceipt | null>(null);
  const [supervisorApprovalSuccess, setSupervisorApprovalSuccess] =
    useState<SupervisorApprovalSuccessData | null>(null);
  const activeBusinessUnitFilter = isInboundAdmin ? undefined : activeBusinessUnit;
  const hasActiveBusinessUnit = Boolean(activeBusinessUnitFilter);
  const canUseWarehouseRole =
    isInboundAdmin ||
    (hasActiveBusinessUnit
      ? inboundWarehouseBusinessUnits.includes(activeBusinessUnitFilter!)
      : inboundWarehouseBusinessUnits.length > 0);
  const canUseQcRole =
    isInboundAdmin ||
    (hasActiveBusinessUnit
      ? inboundQcBusinessUnits.includes(activeBusinessUnitFilter!)
      : inboundQcBusinessUnits.length > 0);
  const canUseSupervisorRole =
    isInboundAdmin ||
    (hasActiveBusinessUnit
      ? inboundSupervisorBusinessUnits.includes(activeBusinessUnitFilter!)
      : inboundSupervisorBusinessUnits.length > 0);
  const tempReceiptBusinessUnits =
    activeBusinessUnitFilter && canUseWarehouseRole
      ? [activeBusinessUnitFilter]
      : inboundWarehouseBusinessUnits;

  const inboundRoleOptions = useMemo(() => {
    const roles: InboundWorkspaceRole[] = [];
    if (canUseWarehouseRole) roles.push('WAREHOUSE_STAFF');
    if (canUseQcRole) roles.push('QC');
    if (canUseSupervisorRole) roles.push('WAREHOUSE_SUPERVISOR');
    return roles;
  }, [canUseQcRole, canUseSupervisorRole, canUseWarehouseRole]);

  const isRoleSimulationEnabled = USE_STATIC_AUTH;
  const activeRole: InboundWorkspaceRole =
    isRoleSimulationEnabled || inboundRoleOptions.includes(simulationRole)
      ? simulationRole
      : inboundRoleOptions[0] || 'WAREHOUSE_STAFF';
  const effectiveInboundView: InboundViewMode =
    activeRole === 'WAREHOUSE_STAFF' ? inboundView : 'operations';

  const routes = [
    { path: ProdPaths.prod, label: 'Prod' },
    { path: '', label: 'Upcoming Inbound' },
  ];
  const isCreateInboundRoute = routeView === 'create';
  const isReceiveWithoutPoRoute = routeView === 'receive-without-po';
  const closeInboundEntryRoute = useCallback(() => {
    history.push(`${ProdPaths.upcomingInbound}/list`);
  }, []);
  const routePurchaseOrderKeys = useMemo(
    () => new URLSearchParams(location.search).getAll('poKey'),
    [location.search],
  );

  const warehouseVendorOptions = useMemo(
    () => getPurchaseOrderVendorOptions(purchaseOrders),
    [purchaseOrders],
  );

  const supplierOptionsForTempReceipt = useMemo<InboundSupplierMasterApi[]>(() => {
    if (supplierMasterOptions.length > 0) return supplierMasterOptions;

    const supplierNames = Array.from(
      new Set(
        purchaseOrders
          .filter((po) => !activeBusinessUnitFilter || po.businessUnit === activeBusinessUnitFilter)
          .map((po) => po.supplier?.trim())
          .filter((supplier): supplier is string => Boolean(supplier)),
      ),
    );

    return supplierNames.map((supplierName, index) => ({
      id: index,
      business_unit: activeBusinessUnitFilter || '',
      supplier_code: supplierName,
      supplier_name: supplierName,
      status: 'Active',
    }));
  }, [activeBusinessUnitFilter, purchaseOrders, supplierMasterOptions]);

  const uomOptionsForTempReceipt = useMemo<InboundUomMasterApi[]>(() => {
    const uomByCode = new Map<string, InboundUomMasterApi>();

    [...inboundDefaultUomOptions, ...uomMasterOptions].forEach((uom) => {
      const code = uom.uom_code?.trim();
      if (!code) return;
      uomByCode.set(code.toUpperCase(), { ...uom, uom_code: code });
    });

    purchaseOrders
      .flatMap((po) => po.items || [])
      .map((item) => item.uom?.trim())
      .filter((uom): uom is string => Boolean(uom))
      .forEach((uomCode, index) => {
        const normalizedCode = uomCode.toUpperCase();
        if (uomByCode.has(normalizedCode)) return;
        uomByCode.set(normalizedCode, {
          id: 1000 + index,
          uom_code: uomCode,
          uom_name: uomCode,
          status: 'Active',
        });
      });

    return Array.from(uomByCode.values()).sort((left, right) =>
      left.uom_code.localeCompare(right.uom_code),
    );
  }, [purchaseOrders, uomMasterOptions]);

  const sharedDateRangeFilter = useMemo<[string, string] | null>(() => {
    if (dashboardSummaryRange === 'CUSTOM') {
      return dashboardPeriodFilter;
    }

    if (dashboardSummaryRange === 'DAILY') {
      const today = dayjs().format('YYYY-MM-DD');
      return [today, today];
    }

    if (dashboardSummaryRange === 'WEEKLY') {
      return [
        dayjs().startOf('week').format('YYYY-MM-DD'),
        dayjs().endOf('week').format('YYYY-MM-DD'),
      ];
    }

    return null;
  }, [dashboardPeriodFilter, dashboardSummaryRange]);

  const filteredWarehousePurchaseOrders = useMemo(() => {
    let data = [...purchaseOrders];

    if (activeBusinessUnitFilter) {
      data = data.filter((po) => po.businessUnit === activeBusinessUnitFilter);
    }

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

    if (sharedDateRangeFilter) {
      const [dateFrom, dateTo] = sharedDateRangeFilter;
      data = data.filter((po) => po.expectedDate >= dateFrom && po.expectedDate <= dateTo);
    }

    return data;
  }, [activeBusinessUnitFilter, poSearchValue, poTypeFilter, poVendorFilter, purchaseOrders, sharedDateRangeFilter]);

  const selectedWarehousePOs = useMemo(
    () =>
      filteredWarehousePurchaseOrders.filter((purchaseOrder) =>
        selectedWarehousePONumbers.includes(getPurchaseOrderRowKey(purchaseOrder)),
      ),
    [filteredWarehousePurchaseOrders, getPurchaseOrderRowKey, selectedWarehousePONumbers],
  );

  const selectedWarehousePOVendor = useMemo(
    () => getCombinedPurchaseOrderVendor(selectedWarehousePOs),
    [selectedWarehousePOs],
  );

  const buildBusinessUnitCriteria = () => ({
    businessUnit: activeBusinessUnitFilter || null,
  });

  const buildPurchaseOrderAdvanceSearchCriteria = () => {
    const [dateFrom, dateTo] = sharedDateRangeFilter || [];

    return {
      ...buildBusinessUnitCriteria(),
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
      expectedDate: dateFrom && dateFrom === dateTo ? dateFrom : null,
    };
  };

  const buildDashboardSummaryParams = (): InboundDashboardSummaryParams => ({
    ...buildBusinessUnitCriteria(),
    range: dashboardSummaryRange === 'CUSTOM' ? null : dashboardSummaryRange,
    dateFrom: sharedDateRangeFilter?.[0] ?? null,
    dateTo: sharedDateRangeFilter?.[1] ?? null,
  });

  const buildGoodsReceiptCriteria = () => ({
    ...buildBusinessUnitCriteria(),
    dateFrom: sharedDateRangeFilter?.[0] ?? null,
    dateTo: sharedDateRangeFilter?.[1] ?? null,
  });

  const applyPurchaseOrderResult = (nextPurchaseOrders: PurchaseOrder[]) => {
    setPurchaseOrders(nextPurchaseOrders);
    setSelectedPODetail((prev) => {
      if (!prev) return prev;
      return (
        nextPurchaseOrders.find(
          (po) => po.id === prev.id || getPurchaseOrderRowKey(po) === getPurchaseOrderRowKey(prev),
        ) || null
      );
    });
    setSelectedPOs((prev) =>
      prev
        .map(
          (selected) =>
            nextPurchaseOrders.find(
              (po) => po.id === selected.id || getPurchaseOrderRowKey(po) === getPurchaseOrderRowKey(selected),
            ) || null,
        )
        .filter((po): po is PurchaseOrder => po !== null),
    );
    setSelectedWarehousePONumbers((prevSelectedKeys) =>
      prevSelectedKeys.filter((poKey) =>
        nextPurchaseOrders.some((purchaseOrder) => getPurchaseOrderRowKey(purchaseOrder) === poKey),
      ),
    );
  };

  const loadInboundData = async () => {
    if (!isInboundAdmin && inboundVisibleBusinessUnits.length > 0 && !activeBusinessUnitFilter) {
      return;
    }

    const [poResult, receiptResult, summaryResult, supplierResult, uomResult] = await Promise.allSettled([
      services.pagePurchaseOrders({
        criteria: {
          advanceSearch: buildPurchaseOrderAdvanceSearchCriteria(),
        },
        pagination: {
          current: 1,
          pageSize: 200,
        },
      }),
      services.pageGoodsReceipts({
        criteria: buildGoodsReceiptCriteria(),
        pagination: {
          current: 1,
          pageSize: 200,
        },
      }),
      services.getDashboardSummary(buildDashboardSummaryParams()),
      services.listSuppliers({
        businessUnit: activeBusinessUnitFilter ?? null,
        status: 'Active',
      }),
      services.listUoms({}),
    ]);

    if (poResult.status === 'fulfilled') {
      const nextPurchaseOrders = sortPurchaseOrdersByLatestExpectedDate(poResult.value.items);
      applyPurchaseOrderResult(nextPurchaseOrders);
    } else {
      message.error(poResult.reason?.message || 'Failed to load purchase orders.');
    }

    if (receiptResult.status === 'fulfilled') {
      setReceipts(
        receiptResult.value.items
          .map(normalizeReceiptForUI)
          .filter(isVisibleOperationalReceipt)
          .filter((receipt) => isReceiptInDateRange(receipt, sharedDateRangeFilter)),
      );
    } else {
      message.error(receiptResult.reason?.message || 'Failed to load inbound receiving history.');
    }

    if (summaryResult.status === 'fulfilled') {
      setInboundStats(summaryResult.value);
    } else {
      message.error(summaryResult.reason?.message || 'Failed to load inbound dashboard summary.');
    }

    if (supplierResult.status === 'fulfilled') {
      setSupplierMasterOptions(supplierResult.value);
    } else {
      message.warning('Supplier master data did not load. Using PO supplier fallback.');
    }

    if (uomResult.status === 'fulfilled') {
      setUomMasterOptions(uomResult.value);
    } else {
      message.warning('UOM master data did not load. Using PO UOM fallback.');
    }
  };

  useEffect(() => {
    if (isInboundAdmin) return;
    const firstBusinessUnit = inboundVisibleBusinessUnits[0];
    if (!firstBusinessUnit) {
      setActiveBusinessUnit(undefined);
      return;
    }
    if (!activeBusinessUnit || !inboundVisibleBusinessUnits.includes(activeBusinessUnit)) {
      setActiveBusinessUnit(firstBusinessUnit);
    }
  }, [activeBusinessUnit, inboundVisibleBusinessUnitsKey, isInboundAdmin]);

  useEffect(() => {
    if (!isCreateInboundRoute && !isReceiveWithoutPoRoute) {
      setSelectedPOs([]);
      setSelectedWarehousePONumbers([]);
      setSelectedPODetail(null);
      setSelectedGR(null);
      setWarehouseCorrectionReceipt(null);
      setLinkPOReceipt(null);
      setSupervisorApprovalSuccess(null);
    }
    void loadInboundData();
  }, [activeBusinessUnit, isCreateInboundRoute, isReceiveWithoutPoRoute]);

  useEffect(() => {
    if (!hasInitializedDashboardSummary.current) {
      hasInitializedDashboardSummary.current = true;
      return;
    }
    if (dashboardSummaryRange === 'CUSTOM' && !dashboardPeriodFilter) {
      return;
    }
    void loadInboundData();
  }, [dashboardPeriodFilter, dashboardSummaryRange]);

  useEffect(() => {
    if (isRoleSimulationEnabled) return;
    if (inboundRoleOptions.length === 0) return;
    if (inboundRoleOptions.includes(simulationRole)) return;
    setSimulationRole(inboundRoleOptions[0]);
  }, [inboundRoleOptions, isRoleSimulationEnabled, simulationRole]);

  const syncReceiptInState = (receipt: GoodsReceipt) => {
    const normalized = normalizeReceiptForUI(receipt);

    if (!isVisibleOperationalReceipt(normalized) || !isReceiptInDateRange(normalized, sharedDateRangeFilter)) {
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

  const dashboardIncomingTitle =
    dashboardSummaryRange === 'CUSTOM' && dashboardPeriodFilter
      ? 'Incoming in Selected Period'
      : dashboardSummaryRange === 'DAILY'
        ? 'Incoming Today'
        : dashboardSummaryRange === 'WEEKLY'
          ? 'Incoming This Week'
          : 'Incoming Overall';
  const dashboardStatCards: DashboardStatCard[] =
    activeRole === 'WAREHOUSE_STAFF'
      ? [
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
              value: inboundStats.totalIrGrs,
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

  const exceptionQueue = useMemo(() => getExceptionQueueReceipts(receipts), [receipts]);

  const qcRelevantReceipts = useMemo(
    () => receipts.filter((receipt) => getQcQueueStatus(receipt) !== null),
    [receipts],
  );
  const shouldShowQcReceiptNotificationBadge = useCallback(
    (receipt: GoodsReceipt) => {
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
    },
    [],
  );
  const qcStatusCounts = useMemo(() => {
    const counts = {
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
        counts[status] += 1;
      }
    });

    return counts;
  }, [qcRelevantReceipts, shouldShowQcReceiptNotificationBadge]);
  const qcStatusOptionsWithBadge = useMemo<QcStatusOptionWithBadge[]>(
    () =>
      qcStatusOptions.map((option) => {
        if (
          (option.value === 'Pending' || option.value === 'Submitted' || option.value === 'Rejected') &&
          qcStatusCounts[option.value] > 0
        ) {
          return {
            ...option,
            badgeCount: qcStatusCounts[option.value],
          };
        }

        return option;
      }),
    [qcStatusCounts],
  );

  const supervisorStatusReceipts = useMemo(
    () => receipts,
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
          ? supervisorStatusReceipts
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
    } else {
      if (historyStatusFilter !== 'ALL') {
        data = data.filter((receipt) =>
          activeRole === 'WAREHOUSE_SUPERVISOR'
            ? matchesSupervisorHistoryStatusFilter(receipt, historyStatusFilter)
            : getInboundHistoryStatus(receipt) === historyStatusFilter,
        );
      }

      if (queueSourceFilter === 'STANDARD') {
        data = data.filter((receipt) => receipt.receiptSourceType !== 'TEMP_NO_PO');
      } else if (queueSourceFilter === 'TEMP') {
        data = data.filter((receipt) => receipt.receiptSourceType === 'TEMP_NO_PO');
      }
    }

    return data.sort((a, b) => {
      if (activeRole === 'WAREHOUSE_SUPERVISOR') {
        const priorityDiff = getSupervisorSortPriority(a) - getSupervisorSortPriority(b);
        if (priorityDiff !== 0) {
          return priorityDiff;
        }
      }

      return b.createdDate.localeCompare(a.createdDate);
    });
  }, [
    qcRelevantReceipts,
    qcStatusFilter,
    queueSearchValue,
    queueSourceFilter,
    queueTypeFilter,
    activeRole,
    historyStatusFilter,
    supervisorStatusReceipts,
  ]);

  // Handlers (mirrors WarehouseStaffUI)
  const hydratePurchaseOrder = async (po: PurchaseOrder): Promise<PurchaseOrder> => {
    if (po.businessUnit) {
      return services.detailPurchaseOrderByKey({
        po_number: po.poNumber,
        business_unit: po.businessUnit,
      });
    }

    if (!po.id) {
      return po;
    }

    return services.detailPurchaseOrder(po.id);
  };

  const handleCreateGR = async (purchaseOrders: PurchaseOrder[]) => {
    if (!purchaseOrders.length) return;
    if (!canCombinePurchaseOrders(purchaseOrders)) {
      message.error('You can only combine purchase orders from the same business unit and vendor into one IR/GR.');
      return;
    }

    const params = new URLSearchParams();
    purchaseOrders.forEach((purchaseOrder) => {
      params.append('poKey', getPurchaseOrderRowKey(purchaseOrder));
    });
    history.push(`${ProdPaths.upcomingInbound}/create?${params.toString()}`);
  };

  const handleCreateSelectedGR = async () => {
    if (!selectedWarehousePOs.length) return;
    if (!canCombinePurchaseOrders(selectedWarehousePOs)) {
      message.error('You can only combine purchase orders from the same business unit and vendor into one IR/GR.');
      return;
    }

    await handleCreateGR(selectedWarehousePOs);
  };

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
          message.error('Selected purchase orders no longer share the same business unit and vendor. Please reselect them.');
          closeInboundEntryRoute();
          return;
        }

        setSelectedPODetail(null);
        setSelectedPOs(
          [...purchaseOrdersFromRoute].sort((left, right) => left.poNumber.localeCompare(right.poNumber)),
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
  }, [closeInboundEntryRoute, isCreateInboundRoute, location.search, parsePurchaseOrderRowKey]);

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
    const nextSelectedPOs = filteredWarehousePurchaseOrders.filter((purchaseOrder) =>
      nextSelectedRowKeys.includes(getPurchaseOrderRowKey(purchaseOrder)),
    );

    if (!canCombinePurchaseOrders(nextSelectedPOs)) {
      message.warning('Please select purchase orders from the same business unit and vendor only.');
      return;
    }

    setSelectedWarehousePONumbers(nextSelectedPOs.map((purchaseOrder) => getPurchaseOrderRowKey(purchaseOrder)));
  };

  const handleCreateTempGR = () => {
    if (!canUseWarehouseRole) {
      message.error('You do not have warehouse permission for the selected business unit.');
      return;
    }
    history.push(`${ProdPaths.upcomingInbound}/receive-without-po`);
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
      handleCreateTempGR();
    }
  };

  const resetDashboardFilters = () => {
    setDashboardSummaryRange('OVERALL');
    setDashboardPeriodFilter(null);
  };

  const resetWorkspaceFilters = (role: InboundWorkspaceRole = activeRole) => {
    setSelectedWarehousePONumbers([]);
    setPOSearchValue('');
    setPOVendorFilter('ALL');
    setPOTypeFilter('ALL');
    setQueueSearchValue('');
    setQueueTypeFilter('ALL');
    setQueueSourceFilter('ALL');
    setQcStatusFilter('Pending');
    setHistoryTypeFilter('ALL');
    setHistoryStatusFilter(getDefaultHistoryStatusFilter(role));
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
    resetWorkspaceFilters(nextRole);
  };

  const handleViewPODetail = async (po: PurchaseOrder) => {
    try {
      const detail = await hydratePurchaseOrder(po);
      setSelectedPODetail(detail);
    } catch (error: any) {
      message.error(error?.message || 'Failed to load purchase order detail.');
    }
  };

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
        const viewedReceipt = normalizeReceiptForUI(viewedResponse.data);
        syncReceiptInState(viewedReceipt);
        setSelectedGR(viewedReceipt);
        return;
      }

      const detail = await services.detailGoodsReceipt(gr.id);
      setSelectedGR(normalizeReceiptForUI(detail));
    } catch (error: any) {
      message.error(error?.message || 'Failed to load inbound receiving detail.');
    }
  };

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
        setSelectedGR(normalizeReceiptForUI(detail));
      } catch (error: any) {
        clearReceiptQueryParams();
        message.error(error?.message || 'Failed to open inbound receiving detail.');
      }
    })();
  }, [clearReceiptQueryParams, services]);

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
          .map((reference) => [`${reference.businessUnit || ''}::${reference.poNumber}`, reference]),
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
      business_unit: data.businessUnit || primaryPoReference?.businessUnit || undefined,
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
      const response = await services.saveGoodsReceipt(mapDraftToSaveInput(data));
      const updatedReceipt = normalizeReceiptForUI(response.data);
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
      message.success('Linked to PO Successfully.');
    } catch (error: any) {
      message.error(error?.message || 'Failed to link temporary PO.');
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

  const handleExportReport = async (values: Required<InboundExportFormValues>) => {
    const [dateFromValue, dateToValue] = values.dateRange;
    const dateFrom = dateFromValue.format('YYYY-MM-DD');
    const dateTo = dateToValue.format('YYYY-MM-DD');
    const isPoReport = values.reportTarget === 'PO_LIST';
    const searchValue = isPoReport ? poSearchValue : queueSearchValue;

    try {
      setIsExportingReport(true);
      const report = await services.buildExportReport({
        reportKey: values.reportTarget,
        businessUnit: activeBusinessUnitFilter || null,
        dateFrom,
        dateTo,
        searchValue: searchValue.trim() || null,
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

  useEffect(() => {
    const visiblePurchaseOrderKeys = new Set(
      filteredWarehousePurchaseOrders.map((purchaseOrder) => getPurchaseOrderRowKey(purchaseOrder)),
    );

    setSelectedWarehousePONumbers((prev) => {
      const next = prev.filter((poKey) => visiblePurchaseOrderKeys.has(poKey));
      return next.length === prev.length ? prev : next;
    });
  }, [filteredWarehousePurchaseOrders, getPurchaseOrderRowKey]);

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

    previousRoleRef.current = activeRole;
    setHistoryStatusFilter(getDefaultHistoryStatusFilter(activeRole));
  }, [activeRole]);

  const lastStatusRefreshKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const refreshKey =
      activeRole === 'QC'
        ? `QC:${qcStatusFilter}`
        : activeRole === 'WAREHOUSE_SUPERVISOR'
          ? `WAREHOUSE_SUPERVISOR:${historyStatusFilter}`
          : null;

    if (!refreshKey) {
      lastStatusRefreshKeyRef.current = null;
      return;
    }

    if (lastStatusRefreshKeyRef.current === null) {
      lastStatusRefreshKeyRef.current = refreshKey;
      return;
    }

    if (lastStatusRefreshKeyRef.current === refreshKey) {
      return;
    }

    lastStatusRefreshKeyRef.current = refreshKey;
    void loadInboundData();
  }, [activeRole, historyStatusFilter, qcStatusFilter]);

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
          : 'Select same-BU, same-vendor POs to create one IR/GR'}
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
  const shouldShowBusinessUnitControl = !isInboundAdmin && inboundVisibleBusinessUnits.length > 0;
  const canSelectBusinessUnit = inboundVisibleBusinessUnits.length > 1;

  const shouldShowRoleSelector = isRoleSimulationEnabled || inboundRoleOptions.length > 1;
  const shouldShowInboundTabs = activeRole === 'WAREHOUSE_STAFF';
  const dashboardSummaryTitle =
    activeRole === 'WAREHOUSE_STAFF'
      ? 'Upcoming Inbound Dashboard'
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
  const inboundViewOptions: {
    icon: ReactNode;
    label: ReactNode;
    value: InboundViewMode;
  }[] = [
    { label: operationsTabLabel, value: 'operations', icon: <AppstoreOutlined /> },
    { label: historyTabLabel, value: 'history', icon: <BarsOutlined /> },
  ];
  const inboundReportOptions = useMemo(
    () => (isInboundAdmin ? allInboundReportOptions : inboundReportOptionsByRole[activeRole]),
    [activeRole, isInboundAdmin],
  );
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
      data = data.filter((receipt) =>
        activeRole === 'WAREHOUSE_SUPERVISOR'
          ? matchesSupervisorHistoryStatusFilter(receipt, historyStatusFilter)
          : getInboundHistoryStatus(receipt) === historyStatusFilter,
      );
    }
    return data.length;
  }, [activeRole, historyReceipts, historyStatusFilter, historyTypeFilter]);
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
          initialReceipt={warehouseCorrectionReceipt}
          correctionMode
          availableBusinessUnits={tempReceiptBusinessUnits}
          supplierOptions={supplierOptionsForTempReceipt}
          uomOptions={uomOptionsForTempReceipt}
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
        onClose={() => {
          setIsGRCreationOpen(false);
          if (isCreateInboundRoute) {
            closeInboundEntryRoute();
          }
        }}
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
          if (isReceiveWithoutPoRoute) {
            closeInboundEntryRoute();
          }
        }}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmitGR}
        availableBusinessUnits={tempReceiptBusinessUnits}
        supplierOptions={supplierOptionsForTempReceipt}
        uomOptions={uomOptionsForTempReceipt}
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
              {shouldShowBusinessUnitControl && (
                <Space size={8}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Business Unit
                  </Text>
                  <Select
                    value={activeBusinessUnit}
                    open={canSelectBusinessUnit ? undefined : false}
                    onChange={(value) => {
                      if (!canSelectBusinessUnit) return;
                      setActiveBusinessUnit(value);
                      resetWorkspaceFilters();
                    }}
                    style={{ width: 120 }}
                    options={inboundVisibleBusinessUnits.map((businessUnit) => ({
                      label: businessUnit,
                      value: businessUnit,
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
                      {qcStatusOptionsWithBadge.map((option) => (
                        <Radio.Button key={option.value} value={option.value}>
                          <Badge count={option.badgeCount ?? 0} size="small" offset={[8, -6]}>
                            {option.label}
                          </Badge>
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
                    <Select<HistoryStatusFilter>
                      value={historyStatusFilter}
                      onChange={(value) => setHistoryStatusFilter(value)}
                      options={supervisorHistoryStatusOptions}
                      style={{ width: 160 }}
                    />
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
        <div
          key={`${activeRole}-${effectiveInboundView}`}
          className="inbound-workspace-tab-pane"
        >
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
                    onRefresh={loadInboundData}
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
                  onRefresh={loadInboundData}
                  shouldShowNotificationBadge={
                    activeRole === 'QC' ? shouldShowQcReceiptNotificationBadge : undefined
                  }
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
              <InboundGRTable
                receipts={historyReceipts}
                onViewDetail={handleOpenGRDetail}
                typeFilter={historyTypeFilter}
                statusFilter={historyStatusFilter}
                headerTitle={inboundReceivingHeaderTitle}
                hideSourceAndPoLink={activeRole === 'WAREHOUSE_STAFF' || activeRole === 'WAREHOUSE_SUPERVISOR'}
                showNotificationBadge={activeRole === 'WAREHOUSE_STAFF'}
                onRefresh={loadInboundData}
              />
            </Card>
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
            onCreateGR={(po) => void handleCreateGR([po])}
            onOpenReceiptInNewTab={handleOpenReceiptInNewTab}
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
