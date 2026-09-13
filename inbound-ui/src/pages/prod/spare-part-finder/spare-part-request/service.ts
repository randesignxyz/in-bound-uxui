import { getServiceUrl } from '@/services/ApiUrl';
import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import { type RequestActions, type ServiceApiType, singleRequest } from '@/services/apiGateway';
import type {
  MyRequestItem,
  MyRequestLineItem,
  MyRequestSearch,
  RequestPriority,
  RequestStatus,
  SparePartRequestItem,
} from './data';
import {
  mapItem,
  type SparePartCategoryApiItem,
  type SparePartRequestListApiItem,
} from './service.api';
import type {
  RequestDetailActivity,
  RequestDetailData,
  RequestDetailLineItem,
} from './RequestedBatchDrawer';

type BackendRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'PARTIAL_ISSUE'
  | 'READY_TO_PICKUP'
  | 'COMPLETE'
  | string;

type MyRequestLineDto = {
  requestLineId: number;
  sparePartId: string;
  sparePartCode: string;
  sparePartName: string;
  category_id?: number | null;
  category?: { id?: number | null; category_name?: string | null } | string | null;
  requestedQty: number;
  approvedQty?: number;
  unit: string;
  fromWarehouse?: string | null;
  from_warehouse?: string | null;
  fromWarehouseCode?: string | null;
  from_warehouse_code?: string | null;
  issuedFromWarehouseCode?: string | null;
  issued_from_warehouse_code?: string | null;
  toWarehouseCode?: string | null;
  forLine?: string | null;
  requestOtherDestination?: boolean | null;
  otherDestination?: string | null;
  remark?: string | null;
  imageId?: string | string[] | null;
};

type MyRequestDto = {
  id: number;
  requestNo?: string;
  requestId: string;
  managerId?: string | null;
  managerRemark?: string | null;
  requestedDate?: string;
  requestDate?: string;
  requestStatus: BackendRequestStatus;
  remark?: string | null;
  totalRequestedQty?: number;
  totalApprovedQty?: number;
  totalIssuedQty?: number;
  totalPickedQty?: number;
  priority?: string | null;
  items?: MyRequestLineDto[];
};

type IssueHistoryLineDto = {
  requestLineId: string;
  sparePartId: string;
  sparePartCode: string;
  sparePartName: string;
  deliveredQty: number;
  unit: string;
  itemCondition?: string | null;
};

type IssueHistoryDto = {
  fulfillmentId: string;
  fulfillmentNo: string;
  fulfillmentStatus: string;
  issuedAt?: string | null;
  warehouseStaffId: string;
  pickupConfirmedAt?: string | null;
  pickupConfirmedBy?: string | null;
  note?: string | null;
  totalIssuedQty: number;
  items?: IssueHistoryLineDto[];
};

type IssueDetailLineDto = {
  requestLineId: number;
  sparePartId: string;
  sparePartCode: string;
  sparePartName: string;
  category_id?: number | null;
  category?: { id?: number | null; category_name?: string | null } | string | null;
  requestedQty: number;
  approvedQty: number;
  issuedQty: number;
  remainingQty: number;
  rejected?: boolean;
  rejectRemark?: string | null;
  approvalStatus?: string | null;
  unit: string;
  fromWarehouseCode?: string | null;
  fromWarehouse?: string | null;
  toWarehouseCode?: string | null;
  forLine?: string | null;
  requestOtherDestination?: boolean | null;
  otherDestination?: string | null;
  remark?: string | null;
  imageId?: string | string[] | null;
};

type IssueDetailDto = {
  id: number;
  requestNo: string;
  requesterId: string;
  approverId?: string | null;
  managerRemark?: string | null;
  approvedAt?: string | null;
  warehouseAcceptedBy?: string | null;
  warehouseAcceptedAt?: string | null;
  requestedDate?: string;
  requestStatus: BackendRequestStatus;
  remark?: string | null;
  warehouseRemark?: string | null;
  totalRequestedQty?: number;
  totalApprovedQty?: number;
  totalIssuedQty?: number;
  totalRemainingQty?: number;
  priority?: string | null;
  pickupStatus?: string | null;
  items?: IssueDetailLineDto[];
  history?: IssueHistoryDto[];
  draftItems?: Array<{ requestLineId: number; draftQty: number }>;
  activities?: Array<{
    label?: string | null;
    description?: string | null;
    date?: string | null;
    by?: string | null;
    dot?: 'pending' | 'done' | string | null;
    requestLineId?: number | null;
  }>;
};

type CreateRequestPayload = {
  items: Array<{
    item: SparePartRequestItem;
    quantity: number;
    purpose: string;
    sourceWarehouseCode?: string | null;
    sourceInventoryId?: number | null;
    sourceBusinessUnit?: string | null;
    inventoryId?: number | null;
    warehouseCode?: string | null;
    toWarehouseCode: string | null;
    forLine: string | null;
    productionLineId?: number | null;
    uom?: string;
    requestOtherDestination?: boolean;
    otherDestination?: string;
  }>;
  remark: string;
  priority: 'normal' | 'high' | 'urgent';
};

const toDecimalPayload = (value: number | string): string => {
  const normalized = String(value ?? '').trim();
  return normalized || '0';
};

type SparePartWarehouseOption = {
  warehouseCode: string;
  warehouseName: string;
};

const normalizeUomOptions = (value?: string | string[] | null) => {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.map((item) => String(item || '').trim()).filter(Boolean)));
  }

  const normalized = String(value || '').trim();
  if (!normalized) return [];

  try {
    const parsed = JSON.parse(normalized);
    if (Array.isArray(parsed)) {
      return Array.from(new Set(parsed.map((item) => String(item || '').trim()).filter(Boolean)));
    }
  } catch (error) {
    // Fall back to parsing comma-delimited values such as "[PCS,BOX]".
  }

  const flattened = normalized
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .split(',')
    .map((item) => item.trim().replace(/^"+|"+$/g, ''))
    .filter(Boolean);

  return Array.from(new Set(flattened.length > 0 ? flattened : [normalized]));
};

const resolveRequestLineUom = (line: CreateRequestPayload['items'][number]) => {
  const explicitUom = String(line.uom || '').trim();
  if (explicitUom) return explicitUom;

  const itemUomOptions = Array.isArray(line.item.uomOptions) ? line.item.uomOptions : [];
  const normalizedOptions = itemUomOptions.length > 0 ? itemUomOptions : normalizeUomOptions(line.item.uom);
  return normalizedOptions[0] || '';
};

type ApproveRequestPayload = {
  id: number;
  lines: Array<{
    requestLineId: number;
    approvedQty: number | string;
    editedAt?: string;
    rejected?: boolean;
    rejectRemark?: string;
  }>;
  remark?: string;
};

type UpdatePendingRequestLinesPayload = {
  id: number;
  lines: Array<{
    requestLineId: number;
    requestedQty: number | string;
    editedAt?: string;
    rejected?: boolean;
    rejectRemark?: string;
  }>;
};

type RejectRequestPayload = {
  id: number;
  remark?: string;
};
type ApprovalDashboardDto = {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
};

const SparePartRequestAction = {
  pageMyRequests: (
    params: TableViewSearchParams<MyRequestSearch>,
    scope: 'my' | 'approval' = 'my',
  ): ServiceApiType<{
    searchValue?: string;
    advanceSearch?: {
      priority?: string;
      status?: string;
      dateRange?: [string, string];
      type?: string;
    };
  }> => ({
    type: 'PAGING_QUERY',
    actionName: 'fetch-paging-my-spare-part-request',
    endpoint: 'PROD',
    payload: {
      searchValue: params.criteria?.searchValue || '',
      advanceSearch: {
        priority: mapRequestPriorityFilter(params.criteria?.advanceSearch?.priority),
        status: mapRequestStatusFilter(params.criteria?.advanceSearch?.status),
        dateRange: params.criteria?.advanceSearch?.dateRange,
        type: scope === 'approval' ? 'approval' : undefined,
      },
    },
    pagination: {
      page: params.pagination?.current,
      pageSize: params.pagination?.pageSize,
    },
  }),
  createRequest: (payload: CreateRequestPayload): ServiceApiType<any> => ({
    type: 'EXEC',
    actionName: 'create-spare-part-request',
    endpoint: 'PROD',
    payload: {
      items: payload.items.map((line) => ({
        requestedQty: toDecimalPayload(line.quantity),
        purpose: line.purpose,
        sourceWarehouseCode:
          line.sourceWarehouseCode ||
          line.warehouseCode ||
          line.item.locations?.[0]?.warehouseCode ||
          line.item.warehouse ||
          null,
        sourceInventoryId: line.sourceInventoryId || line.inventoryId || line.item.locations?.[0]?.inventoryId || null,
        sourceBusinessUnit: line.sourceBusinessUnit || line.item.businessUnit || null,
        inventoryId: line.inventoryId || line.sourceInventoryId || line.item.locations?.[0]?.inventoryId || null,
        warehouseCode:
          line.warehouseCode ||
          line.sourceWarehouseCode ||
          line.item.locations?.[0]?.warehouseCode ||
          line.item.warehouse ||
          null,
        toWarehouseCode: line.toWarehouseCode,
        forLine: line.forLine,
        productionLineId: line.productionLineId ?? null,
        requestOtherDestination: Boolean(line.requestOtherDestination),
        otherDestination: line.otherDestination?.trim() || null,
        productId: line.item.productId,
        uom: resolveRequestLineUom(line),
      })),
      remark: payload.remark,
      priority: payload.priority,
    },
  }),
  approveRequest: (payload: ApproveRequestPayload): ServiceApiType<any> => ({
    type: 'EXEC',
    actionName: 'approve-spare-part-request',
    endpoint: 'PROD',
    payload: {
      ...payload,
      lines: payload.lines.map((line) => ({
        ...line,
        approvedQty: toDecimalPayload(line.approvedQty),
      })),
    },
  }),
  updatePendingRequestLines: (payload: UpdatePendingRequestLinesPayload): ServiceApiType<any> => ({
    type: 'EXEC',
    actionName: 'update-pending-spare-part-request-lines',
    endpoint: 'PROD',
    payload: {
      ...payload,
      lines: payload.lines.map((line) => ({
        ...line,
        requestedQty: toDecimalPayload(line.requestedQty),
      })),
    },
  }),
  getRequestDetail: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    actionName: 'get-spare-part-issue-request',
    endpoint: 'PROD',
    payload: { id },
  }),
  rejectRequest: (payload: RejectRequestPayload): ServiceApiType<any> => ({
    type: 'EXEC',
    actionName: 'reject-spare-part-request',
    endpoint: 'PROD',
    payload,
  }),
  getApprovalDashboard: (): ServiceApiType<Record<string, never>> => ({
    type: 'FETCH_QUERY',
    actionName: 'get-spare-part-approval-dashboard',
    endpoint: 'PROD',
    payload: {},
  }),
  confirmPickup: (id: number): ServiceApiType<any> => ({
    type: 'EXEC',
    actionName: 'confirm-spare-part-pickup',
    endpoint: 'PROD',
    payload: { id },
  }),
  categoryList: (): ServiceApiType<Record<string, never>> => ({
    type: 'LIST_QUERY',
    actionName: 'get-spare-part-categories',
    endpoint: 'PROD',
    payload: {},
  }),
  businessUnitList: (): ServiceApiType<Record<string, never>> => ({
    type: 'LIST_QUERY',
    actionName: 'get-spare-part-business-units',
    endpoint: 'PROD',
    payload: {},
  }),
  warehouseListByBusinessUnit: (
    businessUnit?: string | string[],
  ): ServiceApiType<{ businessUnit: string[] }> => ({
    type: 'LIST_QUERY',
    actionName: 'get-spare-part-warehouses-by-business-unit',
    endpoint: 'PROD',
    payload: {
      businessUnit: Array.isArray(businessUnit)
        ? businessUnit
        : businessUnit
          ? [businessUnit]
          : [],
    },
  }),
};

const normalizePriority = (value?: string | null): RequestPriority => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'urgent') return 'urgent';
  if (normalized === 'high') return 'high';
  if (normalized === 'low') return 'low';
  return 'normal';
};

type ImportedRequestRowDto = {
  rowNumber: number;
  requestedQty: number;
  purpose: string;
  warehouseCode?: string | null;
  toWarehouseCode: string;
  forLine: string;
  uom: string;
  item: SparePartRequestListApiItem;
};

type ImportedRequestFailedRowDto = {
  rowNumber: number;
  productId?: string | null;
  requestedQty?: string | null;
  purpose?: string | null;
  warehouseCode?: string | null;
  toWarehouseCode?: string | null;
  forLine?: string | null;
  uom?: string | null;
  reasons?: string[] | null;
};

type ImportedRequestResultDto = {
  totalRows: number;
  successCount: number;
  failureCount: number;
  successfulRows?: ImportedRequestRowDto[];
  failedRows?: ImportedRequestFailedRowDto[];
};

export type ImportedRequestRow = {
  rowNumber: number;
  quantity: number;
  purpose: string;
  toWarehouseCode: string;
  forLine: string;
  uom: string;
  item: SparePartRequestItem;
};

export type ImportedRequestFailedRow = {
  rowNumber: number;
  productId?: string;
  requestedQty?: string;
  purpose?: string;
  toWarehouseCode?: string;
  forLine?: string;
  uom?: string;
  reasons: string[];
};

export type ImportedRequestResult = {
  totalRows: number;
  successCount: number;
  failureCount: number;
  successfulRows: ImportedRequestRow[];
  failedRows: ImportedRequestFailedRow[];
};

const resolveCategoryName = (
  category?: { id?: number | null; category_name?: string | null } | string | null,
): string | undefined => (typeof category === 'string' ? category : category?.category_name || undefined);

const APPROVAL_METADATA_PREFIX = 'SPF_APPROVAL_QTY_V1:';
const APPROVAL_REMARK_DELIMITER = '|REMARK:';

const extractApproverRemark = (value?: string | null): string | undefined => {
  const normalized = String(value || '').trim();
  if (!normalized) return undefined;
  if (!normalized.startsWith(APPROVAL_METADATA_PREFIX)) return normalized;

  const remark = normalized
    .slice(APPROVAL_METADATA_PREFIX.length)
    .split(APPROVAL_REMARK_DELIMITER)[1]
    ?.trim();

  return remark || undefined;
};

const normalizeRequestStatus = (
  status?: BackendRequestStatus,
  totalIssuedQty: number = 0,
  totalPickedQty: number = 0,
): RequestStatus => {
  const normalized = String(status || '').trim().toUpperCase();

  switch (normalized) {
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
    case 'CANCELLED':
      return 'rejected';
    case 'PARTIAL_ISSUE':
      return totalIssuedQty > totalPickedQty ? 'ready_to_Pickup' : 'partial';
    case 'IN_PROGRESS':
      return 'in-progress';
    case 'READY_TO_PICKUP':
      return 'ready_to_Pickup';
    case 'COMPLETE':
      return totalIssuedQty > 0 && totalPickedQty >= totalIssuedQty ? 'completed' : 'ready_to_Pickup';
    case 'PENDING':
    default:
      return 'pending';
  }
};

const deriveIssueDetailStatus = (
  rawStatus: string,
  normalizedPickupStatus: string,
  totalIssuedQty: number,
  confirmedPickedQty: number,
): RequestStatus => {
  switch (rawStatus) {
    case 'REJECTED':
    case 'CANCELLED':
      return 'rejected';
    case 'APPROVED':
      return 'approved';
    case 'IN_PROGRESS':
      return confirmedPickedQty > 0 ? 'partial' : 'in-progress';
    case 'PARTIAL_ISSUE':
      return normalizedPickupStatus === 'confirmed' ? 'partial' : 'ready_to_Pickup';
    case 'READY_TO_PICKUP':
      return 'ready_to_Pickup';
    case 'COMPLETE':
      return totalIssuedQty > 0 && confirmedPickedQty >= totalIssuedQty ? 'completed' : 'ready_to_Pickup';
    case 'PENDING':
    default:
      return 'pending';
  }
};

const mapRequestStatusFilter = (value?: MyRequestSearch['status']) => {
  switch (value) {
    case 'pending':
      return 'PENDING';
    case 'approved':
      return 'APPROVED';
    case 'rejected':
      return 'REJECTED';
    case 'partial':
      return 'PARTIAL_ISSUE';
    case 'in-progress':
      return 'IN_PROGRESS';
    case 'ready_to_Pickup':
      return 'READY_TO_PICKUP';
    case 'completed':
      return 'COMPLETE';
    default:
      return undefined;
  }
};

const mapRequestPriorityFilter = (value?: MyRequestSearch['priority']) => {
  switch (value) {
    case 'urgent':
      return 'URGENT';
    case 'high':
      return 'HIGH';
    case 'low':
      return 'LOW';
    case 'normal':
      return 'MEDIUM';
    default:
      return undefined;
  }
};

const mapRequestLine = (item: MyRequestLineDto): MyRequestLineItem => ({
  requestLineId: Number(item.requestLineId || 0),
  sparePartId: item.sparePartId,
  sparePartCode: item.sparePartCode,
  sparePartName: item.sparePartName,
  categoryId: item.category_id ?? (typeof item.category === 'object' ? item.category?.id ?? undefined : undefined),
  category: resolveCategoryName(item.category),
  requestedQty: Number(item.requestedQty || 0),
  approvedQty: Number(item.approvedQty || 0),
  unit: item.unit || 'pcs',
  fromWarehouse:
    item.fromWarehouse ||
    item.from_warehouse ||
    item.fromWarehouseCode ||
    item.from_warehouse_code ||
    item.issuedFromWarehouseCode ||
    item.issued_from_warehouse_code ||
    undefined,
  fromWarehouseCode:
    item.fromWarehouseCode ||
    item.from_warehouse_code ||
    item.fromWarehouse ||
    item.from_warehouse ||
    item.issuedFromWarehouseCode ||
    item.issued_from_warehouse_code ||
    undefined,
  toWarehouseCode: item.toWarehouseCode || undefined,
  forLine: item.forLine || undefined,
  requestOtherDestination: Boolean(item.requestOtherDestination || item.otherDestination?.trim()),
  otherDestination: item.otherDestination?.trim() || undefined,
  remark: item.remark || undefined,
  imageId: item.imageId || undefined,
});

export const mapMyRequestItem = (item: MyRequestDto): MyRequestItem => {
  const totalIssuedQty = Number(item.totalIssuedQty || 0);
  const totalPickedQty = Number(item.totalPickedQty || 0);
  const items = (item.items || []).map(mapRequestLine);
  const requestCategory = items.find((line) => line.category)?.category;

  return {
    id: Number(item.id || 0),
    requestId: item.requestNo || item.requestId,
    requestNo: item.requestNo || undefined,
    requestedBy: item.requestId,
    approvedBy: item.managerId || undefined,
    approverRemark: extractApproverRemark(item.managerRemark),
    priority: normalizePriority(item.priority),
    requestDate: item.requestedDate || item.requestDate || '',
    category: requestCategory,
    totalItems: Number(item.totalRequestedQty || 0),
    receivedItems: totalPickedQty,
    requestStatus: normalizeRequestStatus(item.requestStatus, totalIssuedQty, totalPickedQty),
    remark: item.remark || '',
    totalApprovedQty: Number(item.totalApprovedQty || 0),
    totalIssuedQty,
    totalPickedQty,
    items,
    rawRequestStatus: item.requestStatus,
  };
};

const buildRequestActivities = (request: MyRequestItem): RequestDetailActivity[] => {
  const activities: RequestDetailActivity[] = [
    {
      label: 'Requested',
      description: 'Requester sent request',
      date: request.requestDate,
      by: request.requestedBy || 'Requester',
      dot: 'done',
    },
  ];

  if (request.requestStatus === 'approved' || request.requestStatus === 'partial' || request.requestStatus === 'ready_to_Pickup' || request.requestStatus === 'completed') {
    activities.push({
      label: 'Approved',
      description: 'Request approved',
      date: request.requestDate,
      by: request.approvedBy,
      dot: 'done',
    });
  }

  if (request.requestStatus === 'rejected') {
    activities.push({
      label: 'Rejected',
      description: 'Request rejected',
      date: request.requestDate,
      by: request.approvedBy,
      dot: 'done',
    });
  }

  if (request.requestStatus === 'partial') {
    activities.push({
      label: 'Partial Issue',
      description: 'Warehouse issued part of the approved quantity',
      date: request.requestDate,
      by: undefined,
      dot: 'done',
    });
  }

  if (request.requestStatus === 'ready_to_Pickup') {
    activities.push({
      label: 'Ready to Pick up',
      description: 'Items are ready for pickup',
      date: request.requestDate,
      by: undefined,
      dot: 'pending',
    });
  }

  if (request.requestStatus === 'completed') {
    activities.push({
      label: 'Completed',
      description: 'All issued items have been picked up',
      date: request.requestDate,
      by: request.requestedBy || 'Requester',
      dot: 'done',
    });
  }

  return activities;
};

export const buildRequestDetailData = (request: MyRequestItem): RequestDetailData => {
  const detailCategory = request.category || request.items?.find((item) => item.category)?.category;
  const items: RequestDetailLineItem[] = (request.items || []).map((item, index) => ({
    no: index + 1,
    requestLineId: item.requestLineId,
    imageId: Array.isArray(item.imageId) ? item.imageId[0] : item.imageId,
    productId: item.sparePartId || item.sparePartCode,
    requestId: request.requestId,
    itemName: item.sparePartName,
    requestedQty: Number(item.requestedQty || 0),
    quantityToReturn:
      request.requestStatus === 'pending'
        ? Number(item.approvedQty || item.requestedQty || 0)
        : Number(item.approvedQty ?? 0),
    usedQuantity: 0,
    total: Number(item.requestedQty || 0),
    warehouseSentQuantity: 0,
    fromWarehouse: undefined,
    requestOtherDestination: Boolean(item.requestOtherDestination || item.otherDestination?.trim()),
    otherDestination: item.otherDestination?.trim() || undefined,
    toWarehouse: item.requestOtherDestination || item.otherDestination?.trim() ? undefined : item.toWarehouseCode || undefined,
    productionLine: item.requestOtherDestination || item.otherDestination?.trim() ? undefined : item.forLine || undefined,
    warehouse: item.requestOtherDestination || item.otherDestination?.trim() ? undefined : item.toWarehouseCode,
    category: item.category || detailCategory,
    businessUnit: undefined,
    uom: item.unit,
    description: item.remark,
    approvalState:
      request.requestStatus !== 'pending' && Number(item.approvedQty ?? 0) === 0
        ? 'rejected'
        : request.requestStatus === 'pending' &&
            Number(item.approvedQty || 0) > 0 &&
            Number(item.approvedQty || 0) !== Number(item.requestedQty || 0)
          ? 'edited'
          : undefined,
  }));

  return {
    id: request.id,
    requestId: request.requestId,
    requestDate: request.requestDate,
    status: request.requestStatus,
    priority: request.priority,
    category: detailCategory,
    totalItems: request.totalItems,
    receivedItems: request.receivedItems,
    remark: request.remark,
    requestedBy: request.requestedBy,
    approvedBy: request.approvedBy,
    approverRemark: request.approverRemark,
    items,
    activities: buildRequestActivities(request),
  };
};

const mapIssueDetailToRequestDetailData = (item: IssueDetailDto): RequestDetailData => {
  const rawStatus = String(item.requestStatus || '').trim().toUpperCase();
  const normalizedPickupStatus = String(item.pickupStatus || '').trim().toLowerCase();
  const activityDtos = item.activities || [];
  const rejectedActivityByLineId = new Map<number, { by?: string; remark?: string }>();
  const editedActivityByLineId = new Map<number, { by?: string; remark?: string }>();

  activityDtos.forEach((activity) => {
    const label = String(activity.label || '').trim().toLowerCase();
    const description = String(activity.description || '').trim();

    if (label === 'item rejected') {
      const match = description.match(/^(.+?)\s+rejected(?::\s*(.*))?$/i);
      const requestLineId = Number(activity.requestLineId || 0);
      if (requestLineId) {
        rejectedActivityByLineId.set(requestLineId, {
          by: activity.by?.trim() || undefined,
          remark: match?.[2]?.trim() || description,
        });
      }
    }

    if (label === 'item edited') {
      const requestLineId = Number(activity.requestLineId || 0);
      if (requestLineId) {
        editedActivityByLineId.set(requestLineId, {
          by: activity.by?.trim() || undefined,
          remark: description,
        });
      }
    }
  });
  const confirmedPickedQtyByLineId = new Map<number, number>();
  (item.history || []).forEach((entry) => {
    if (!entry.pickupConfirmedAt) return;
    (entry.items || []).forEach((historyLine) => {
      const requestLineId = Number(historyLine.requestLineId || 0);
      if (!requestLineId) return;
      confirmedPickedQtyByLineId.set(
        requestLineId,
        (confirmedPickedQtyByLineId.get(requestLineId) || 0) + Number(historyLine.deliveredQty || 0),
      );
    });
  });

  const totalIssuedQty = Number(item.totalIssuedQty || 0);
  const confirmedPickedQty = (item.history || []).reduce(
    (sum, entry) => sum + (entry.pickupConfirmedAt ? Number(entry.totalIssuedQty || 0) : 0),
    0,
  );

  const items: RequestDetailLineItem[] = (item.items || []).map((line, index) => {
    const productId = line.sparePartId || line.sparePartCode;
    const requestLineId = Number(line.requestLineId || 0);
    const requestedQty = Number(line.requestedQty ?? line.approvedQty ?? 0);
    const approvedQty = Number(line.approvedQty ?? 0);
    const rejectedActivity = rejectedActivityByLineId.get(requestLineId);
    const editedActivity = editedActivityByLineId.get(requestLineId);
    const isRejectedLine =
      Boolean(line.rejected) ||
      String(line.approvalStatus || '').trim().toUpperCase() === 'REJECTED' ||
      (rawStatus !== 'PENDING' && approvedQty === 0);
    const hasQuantityEdit = approvedQty > 0 && approvedQty !== requestedQty;
    const pendingEditedQty = rawStatus === 'PENDING' && hasQuantityEdit ? approvedQty : requestedQty;

    return {
      no: index + 1,
      requestLineId,
      imageId: Array.isArray(line.imageId) ? line.imageId[0] : line.imageId || undefined,
      productId,
      requestId: item.requestNo || '',
      itemName: line.sparePartName,
      requestedQty,
      quantityToReturn: rawStatus === 'PENDING' ? pendingEditedQty : approvedQty,
      usedQuantity: confirmedPickedQtyByLineId.get(Number(line.requestLineId || 0)) || 0,
      total: requestedQty,
      warehouseSentQuantity: Number(line.issuedQty || 0),
      fromWarehouse: line.fromWarehouseCode || line.fromWarehouse || undefined,
      requestOtherDestination: Boolean(line.requestOtherDestination || line.otherDestination?.trim()),
      otherDestination: line.otherDestination?.trim() || undefined,
      toWarehouse: line.requestOtherDestination || line.otherDestination?.trim() ? undefined : line.toWarehouseCode || undefined,
      productionLine: line.requestOtherDestination || line.otherDestination?.trim() ? undefined : line.forLine || undefined,
      warehouse: line.requestOtherDestination || line.otherDestination?.trim() ? undefined : line.toWarehouseCode || undefined,
      category: resolveCategoryName(line.category),
      businessUnit: undefined,
      uom: line.unit || 'pcs',
      description: line.remark || undefined,
      approvalState: isRejectedLine ? 'rejected' : editedActivity || hasQuantityEdit ? 'edited' : undefined,
      approvalBy: rejectedActivity?.by || editedActivity?.by,
      approvalRemark: rejectedActivity?.remark || line.rejectRemark || editedActivity?.remark,
    };
  });
  const detailCategory = items.find((entry) => entry.category)?.category;

  const status: RequestStatus = deriveIssueDetailStatus(
    rawStatus,
    normalizedPickupStatus,
    totalIssuedQty,
    confirmedPickedQty,
  );

  const history = [...(item.history || [])].sort((left, right) => {
    const leftTime = new Date(left.issuedAt || '').getTime();
    const rightTime = new Date(right.issuedAt || '').getTime();
    return leftTime - rightTime;
  });
  const confirmedHistory = history.filter((entry) => Boolean(entry.pickupConfirmedAt));
  const hasAllShipmentsConfirmed = history.length > 0 && confirmedHistory.length === history.length;
  const finalConfirmedEntry = hasAllShipmentsConfirmed
    ? [...confirmedHistory].sort((left, right) => {
        const leftTime = new Date(left.pickupConfirmedAt || left.issuedAt || item.requestedDate || '').getTime();
        const rightTime = new Date(right.pickupConfirmedAt || right.issuedAt || item.requestedDate || '').getTime();
        return leftTime - rightTime;
      })[confirmedHistory.length - 1]
    : undefined;
  const lineItemByRequestLineId = new Map(items.map((line) => [Number(line.requestLineId || 0), line]));

  const activities: RequestDetailActivity[] = [
    {
      label: 'Requested',
      description: 'Requester sent request (waiting for approval)',
      date: item.requestedDate,
      by: item.requesterId || undefined,
      dot: 'done',
    },
  ];

  if (rawStatus === 'REJECTED') {
    activities.push({
      label: 'Rejected',
      description: 'Request rejected',
      date: item.approvedAt || item.requestedDate,
      by: item.approverId || undefined,
      dot: 'done',
    });
  } else if (rawStatus !== 'PENDING') {
    activities.push({
      label: 'Approved',
      description: 'Request approved',
      date: item.approvedAt || item.requestedDate,
      by: item.approverId || undefined,
      dot: 'done',
    });
  }

  if (item.warehouseAcceptedAt || rawStatus === 'IN_PROGRESS' || history.length > 0) {
    activities.push({
      label: 'In Progress',
      description: 'Warehouse processing request',
      date: item.warehouseAcceptedAt || history[0]?.issuedAt || item.approvedAt || item.requestedDate,
      by: item.warehouseAcceptedBy || history[0]?.warehouseStaffId || undefined,
      dot: history.length > 0 ? 'done' : 'pending',
    });
  }

  if ((item.draftItems || []).some((draft) => Number(draft.draftQty || 0) > 0)) {
    activities.push({
      label: 'Draft Updated',
      description: 'Warehouse updated shipment draft quantities',
      date: item.warehouseAcceptedAt || history[0]?.issuedAt || item.approvedAt || item.requestedDate,
      by: item.warehouseAcceptedBy || history[0]?.warehouseStaffId || undefined,
      dot: 'done',
    });
  }

  history.forEach((entry, index) => {
    const shipmentNo = index + 1;
    activities.push({
      label: 'Ready to Pick up',
      description: `Shipment #${shipmentNo} is ready for pick up`,
      date: entry.issuedAt || item.requestedDate,
      by: entry.warehouseStaffId || undefined,
      dot: entry.pickupConfirmedAt ? 'done' : 'pending',
    });

    if (entry.pickupConfirmedAt) {
      activities.push({
        label: 'Confirm Pick up',
        description: 'Requester confirmed pickup',
        date: entry.pickupConfirmedAt,
        by: entry.pickupConfirmedBy || entry.warehouseStaffId || undefined,
        remark: entry.note?.trim() || undefined,
        dot: 'done',
      });

      const hasMoreToIssue = Number(item.totalRemainingQty || 0) > 0;
      const isFinalConfirmedShipment = finalConfirmedEntry?.fulfillmentId === entry.fulfillmentId;

      if (hasMoreToIssue || !isFinalConfirmedShipment) {
        activities.push({
          label: `Partial Pick up #${shipmentNo}`,
          description: `Picked ${Number(entry.totalIssuedQty || 0)} item(s)`,
          date: entry.pickupConfirmedAt,
          by: entry.pickupConfirmedBy || entry.warehouseStaffId || undefined,
          remark: entry.note?.trim() || undefined,
          dot: 'done',
        });
      }
    }
  });

  if (hasAllShipmentsConfirmed && finalConfirmedEntry) {
    activities.push({
      label: 'Completed',
      description: 'Picked up all requested items',
      date: finalConfirmedEntry.pickupConfirmedAt || finalConfirmedEntry.issuedAt || item.requestedDate,
      by: finalConfirmedEntry.pickupConfirmedBy || finalConfirmedEntry.warehouseStaffId || undefined,
      remark: finalConfirmedEntry.note?.trim() || undefined,
      dot: 'done',
    });
  }

  const pickupBatches = history
    .filter((entry) => entry.pickupConfirmedAt)
    .map((entry, index) => ({
      batchNo: index + 1,
      createdAt: entry.pickupConfirmedAt || entry.issuedAt || item.requestedDate || '',
      pickedBy: entry.pickupConfirmedBy || entry.warehouseStaffId || undefined,
      remark: entry.note?.trim() || undefined,
      pickedItemsCount: Number(entry.totalIssuedQty || 0),
      items: (entry.items || []).map((historyLine, historyIndex) => {
        const requestLineId = Number(historyLine.requestLineId || 0);
        const baseLine = lineItemByRequestLineId.get(requestLineId);
        return {
          no: historyIndex + 1,
          requestLineId,
          imageId: baseLine?.imageId,
          productId: historyLine.sparePartId || historyLine.sparePartCode,
          requestId: item.requestNo || '',
          itemName: historyLine.sparePartName,
          requestedQty: baseLine?.requestedQty,
          quantityToReturn: Number(historyLine.deliveredQty || 0),
          usedQuantity: Number(historyLine.deliveredQty || 0),
          total: Number(historyLine.deliveredQty || 0),
          warehouseSentQuantity: Number(historyLine.deliveredQty || 0),
          description: baseLine?.description,
          stockQuantity: baseLine?.stockQuantity,
          fromWarehouse: baseLine?.fromWarehouse,
          toWarehouse: baseLine?.toWarehouse,
          productionLine: baseLine?.productionLine,
          warehouse: baseLine?.warehouse,
          zone: baseLine?.zone,
          shelf: baseLine?.shelf,
          level: baseLine?.level,
          company: baseLine?.company,
          category: baseLine?.category,
          businessUnit: baseLine?.businessUnit,
          uom: historyLine.unit || baseLine?.uom,
        };
      }),
    }));
  const getPickupActivityRemark = (activity: {
    label?: string | null;
    description?: string | null;
    date?: string | null;
  }) => {
    const label = String(activity.label || '').toLowerCase();
    const description = String(activity.description || '').toLowerCase();
    const isPickupActivity =
      label.includes('pick') ||
      label.includes('partial') ||
      label.includes('complete') ||
      description.includes('pick');

    if (!isPickupActivity) return undefined;

    const activityTime = activity.date ? new Date(activity.date).getTime() : Number.NaN;
    const matchedEntry = confirmedHistory.find((entry) => {
      const confirmedTime = entry.pickupConfirmedAt ? new Date(entry.pickupConfirmedAt).getTime() : Number.NaN;
      return Number.isFinite(activityTime) && Number.isFinite(confirmedTime) && activityTime === confirmedTime;
    });

    return matchedEntry?.note?.trim() || (confirmedHistory.length === 1 ? confirmedHistory[0].note?.trim() : undefined);
  };

  const mappedActivities = activityDtos.map((activity) => ({
    label: String(activity.label || '').trim(),
    description: String(activity.description || '').trim(),
    date: activity.date || item.requestedDate,
    by: activity.by?.trim() ? activity.by.trim() : undefined,
    remark:
      (activity as RequestDetailActivity).remark?.trim() ||
      getPickupActivityRemark(activity) ||
      undefined,
    dot: activity.dot === 'pending' ? 'pending' as const : 'done' as const,
    requestLineId: Number(activity.requestLineId || 0) || undefined,
  }));
  return {
    id: Number(item.id || 0),
    requestId: item.requestNo || '',
    requestDate: item.requestedDate || '',
    status,
    priority: normalizePriority(item.priority),
    category: detailCategory,
    totalItems: Number(item.totalRequestedQty || items.length),
    receivedItems: confirmedPickedQty,
    remark: item.remark || '',
    warehouseRemark: item.warehouseRemark || undefined,
    requestedBy: item.requesterId || undefined,
    approvedBy: item.approverId || undefined,
    approverRemark: extractApproverRemark(item.managerRemark),
    warehouseBy: history[history.length - 1]?.warehouseStaffId || history[0]?.warehouseStaffId || undefined,
    items,
    activities: mappedActivities,
    // activities:
    //   (item.activities || []).length > 0
    //     ? (item.activities || []).map((activity) => ({
    //         label: String(activity.label || '').trim(),
    //         description: String(activity.description || '').trim(),
    //         date: activity.date || item.requestedDate,
    //         by: activity.by?.trim() ? activity.by.trim() : undefined,
    //         dot: activity.dot === 'pending' ? 'pending' : 'done',
    //       }))
    //     : activities,
    pickupBatches,
  };
};

export const SparePartRequestService = (requestAction: RequestActions) => ({
  getApprovalDashboard: async (): Promise<ApprovalDashboardDto> => {
    return (await singleRequest<ApprovalDashboardDto>(
      SparePartRequestAction.getApprovalDashboard(),
    )(requestAction)) as ApprovalDashboardDto;
  },
  pageMyRequests: async (
    params: TableViewSearchParams<MyRequestSearch>,
    scope: 'my' | 'approval' = 'my',
  ): Promise<Paging<MyRequestItem>> => {
    const response = (await singleRequest<MyRequestDto>(
      SparePartRequestAction.pageMyRequests(params, scope),
    )(requestAction)) as Paging<MyRequestDto>;

    return {
      ...response,
      items: (response.items || []).map(mapMyRequestItem),
    };
  },
  createRequest: async (payload: CreateRequestPayload): Promise<MyRequestItem> => {
    const response = (await singleRequest<{ data?: { request?: MyRequestDto } }>(
      SparePartRequestAction.createRequest(payload),
    )(requestAction)) as { data?: { request?: MyRequestDto } };

    const request = response?.data?.request;
    if (!request) {
      throw new Error('Request response is missing request data.');
    }

    return mapMyRequestItem(request);
  },
  approveRequest: async (payload: ApproveRequestPayload): Promise<MyRequestItem> => {
    const response = (await singleRequest<MyRequestDto>(
      SparePartRequestAction.approveRequest(payload),
    )(requestAction)) as MyRequestDto;

    return mapMyRequestItem(response);
  },
  updatePendingRequestLines: async (payload: UpdatePendingRequestLinesPayload): Promise<MyRequestItem> => {
    const response = (await singleRequest<MyRequestDto>(
      SparePartRequestAction.updatePendingRequestLines(payload),
    )(requestAction)) as MyRequestDto;

    return mapMyRequestItem(response);
  },
  getRequestDetail: async (id: number): Promise<RequestDetailData> => {
    const response = (await singleRequest<IssueDetailDto>(
      SparePartRequestAction.getRequestDetail(id),
    )(requestAction)) as IssueDetailDto;

    return mapIssueDetailToRequestDetailData(response);
  },
  rejectRequest: async (payload: RejectRequestPayload): Promise<MyRequestItem> => {
    const response = (await singleRequest<MyRequestDto>(
      SparePartRequestAction.rejectRequest(payload),
    )(requestAction)) as MyRequestDto;

    return mapMyRequestItem(response);
  },
  confirmPickup: async (id: number): Promise<any> => {
    return await singleRequest<any>(SparePartRequestAction.confirmPickup(id))(requestAction);
  },
  categoryList: async (): Promise<SparePartCategoryApiItem[]> => {
    const response = await singleRequest<SparePartCategoryApiItem>(
      SparePartRequestAction.categoryList(),
    )(requestAction);
    return Array.isArray(response) ? response : [];
  },
  businessUnitList: async (): Promise<{ businessUnit: string }[]> => {
    const response = await singleRequest<{ businessUnit: string }>(
      SparePartRequestAction.businessUnitList(),
    )(requestAction);
    return Array.isArray(response) ? response : [];
  },
  warehouseListByBusinessUnit: async (
    businessUnit?: string | string[],
  ): Promise<SparePartWarehouseOption[]> => {
    const response = await singleRequest<SparePartWarehouseOption>(
      SparePartRequestAction.warehouseListByBusinessUnit(businessUnit),
    )(requestAction);
    return Array.isArray(response) ? response : [];
  },
  importRequestFile: async (file: File): Promise<ImportedRequestResult> => {
    requestAction?.start?.('import-spare-part-request');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${getServiceUrl('PROD')}/spare-part-finder/requests/import`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const payload = (await response.json().catch(() => ({}))) as ImportedRequestResultDto & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to import spare part request file.');
      }

      const successfulRows =
        (payload.successfulRows || []).map((row) => ({
          rowNumber: row.rowNumber,
          quantity: row.requestedQty,
          purpose: row.purpose,
          toWarehouseCode: '',
          forLine: row.forLine,
          uom: row.uom,
          item: mapItem(row.item),
        })) || [];

      const failedRows =
        (payload.failedRows || []).map((row) => ({
          rowNumber: row.rowNumber,
          productId: row.productId || undefined,
          requestedQty: row.requestedQty || undefined,
          purpose: row.purpose || undefined,
          toWarehouseCode: row.toWarehouseCode || row.warehouseCode || undefined,
          forLine: row.forLine || undefined,
          uom: row.uom || undefined,
          reasons: row.reasons || [],
        })) || [];

      requestAction?.end?.('SUCCESS');
      return {
        totalRows: payload.totalRows || 0,
        successCount: payload.successCount || successfulRows.length,
        failureCount: payload.failureCount || failedRows.length,
        successfulRows,
        failedRows,
      };
    } catch (error) {
      requestAction?.end?.('FAILED');
      throw error;
    }
  },
});
