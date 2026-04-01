import type { Paging } from '@/services/API';
import { type RequestActions, type ServiceApiType, singleRequest } from '@/services/apiGateway';
import type {
  RequestDetailActivity,
  RequestDetailData,
  RequestDetailLineItem,
} from './RequestedBatchWareHouse';
import type { SparePartType } from '../spare-part-request/data';
import type { Shipment } from '../shipmentsStore';
import type { WarehouseDisplayStatus, WarehouseRequestRecord } from './requestsWarehouse.shared';

type BackendIssueStatus =
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'PARTIAL_ISSUE'
  | 'READY_TO_PICKUP'
  | 'COMPLETE'
  | 'REJECTED'
  | string;

type IssueLineDto = {
  requestLineId: number;
  sparePartId: string;
  sparePartCode: string;
  sparePartName: string;
  type?: string | null;
  approvedQty: number;
  issuedQty: number;
  remainingQty: number;
  unit: string;
  toWarehouseCode?: string | null;
  forLine?: string | null;
  remark?: string | null;
  imageId?: string | string[] | null;
};

type IssueHistoryLineDto = {
  requestLineId: string;
  sparePartId: string;
  sparePartCode: string;
  sparePartName: string;
  deliveredQty: number;
  unit: string;
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

type IssueRequestDto = {
  id: number;
  requestNo: string;
  requesterId: string;
  approverId?: string | null;
  approvedAt?: string | null;
  warehouseAcceptedBy?: string | null;
  warehouseAcceptedAt?: string | null;
  requestedDate?: string;
  requestStatus: BackendIssueStatus;
  type?: string | null;
  remark?: string | null;
  totalRequestedQty: number;
  totalApprovedQty: number;
  totalIssuedQty: number;
  totalRemainingQty: number;
  priority?: string | null;
  items?: IssueLineDto[];
  history?: IssueHistoryDto[];
  draftItems?: Array<{ requestLineId: number; draftQty: number }>;
  pickupStatus?: string | null;
};

type ExecResponseDto<T> = {
  message?: string;
  data?: T;
};

type PageIssueRequestsParams = {
  searchValue?: string;
  status?: 'All' | WarehouseDisplayStatus;
  pagination?: {
    current?: number;
    pageSize?: number;
  };
};

type IssueRequestPayload = {
  id: number;
  lines: Array<{
    requestLineId: number;
    issueQty: number;
  }>;
};

type SaveDraftPayload = IssueRequestPayload;
type AcceptIssuePayload = { id: number };

const SparePartWarehouseAction = {
  pageRequests: (params: PageIssueRequestsParams): ServiceApiType<any> => ({
    type: 'PAGING_QUERY',
    actionName: 'fetch-paging-spare-part-issue-request',
    endpoint: 'PROD',
    payload: {
      searchValue: params.searchValue || '',
      advanceSearch: {
        searchValue: params.searchValue || '',
        status: mapIssueStatusFilter(params.status),
      },
    },
    pagination: {
      page: params.pagination?.current,
      pageSize: params.pagination?.pageSize,
    },
  }),
  getRequest: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    actionName: 'get-spare-part-issue-request',
    endpoint: 'PROD',
    payload: { id },
  }),
  acceptRequest: (payload: AcceptIssuePayload): ServiceApiType<AcceptIssuePayload> => ({
    type: 'EXEC',
    actionName: 'accept-spare-part-issue-request',
    endpoint: 'PROD',
    payload,
  }),
  issueRequest: (payload: IssueRequestPayload): ServiceApiType<IssueRequestPayload> => ({
    type: 'EXEC',
    actionName: 'issue-spare-part-request',
    endpoint: 'PROD',
    payload,
  }),
  saveDraft: (payload: SaveDraftPayload): ServiceApiType<SaveDraftPayload> => ({
    type: 'EXEC',
    actionName: 'save-spare-part-issue-draft',
    endpoint: 'PROD',
    payload,
  }),
  confirmPickup: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'EXEC',
    actionName: 'confirm-spare-part-pickup',
    endpoint: 'PROD',
    payload: { id },
  }),
};

const unwrapExecPayload = <T,>(payload?: T | ExecResponseDto<T> | null): T | undefined => {
  if (!payload) return undefined;
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as ExecResponseDto<T>).data;
  }
  return payload as T;
};

const normalizePriority = (value?: string | null): WarehouseRequestRecord['priority'] => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'urgent') return 'Urgent';
  if (normalized === 'high') return 'High';
  return 'Normal';
};

const normalizeSparePartType = (value?: string | null): SparePartType | undefined => {
  const normalized = String(value || '').trim().replace(/_/g, '-').toUpperCase();
  if (normalized === 'MRO-S') return 'MRO-S';
  if (normalized === 'MRO-G') return 'MRO-G';
  if (normalized === 'MRO-W') return 'MRO-W';
  return undefined;
};

const deriveRecordStatus = (
  requestStatus?: string | null,
  pickupStatus?: string | null,
): WarehouseRequestRecord['status'] => {
  const normalizedRequestStatus = String(requestStatus || '').trim().toUpperCase();
  const normalizedPickupStatus = String(pickupStatus || '').trim().toLowerCase();

  if (normalizedPickupStatus === 'confirmed') {
    return normalizedRequestStatus === 'PARTIAL_ISSUE' ? 'Partial' : 'Completed';
  }

  switch (normalizedRequestStatus) {
    case 'REJECTED':
      return 'Rejected';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'PARTIAL_ISSUE':
      return 'Ready To Pick Up';
    case 'READY_TO_PICKUP':
    case 'COMPLETE':
      return 'Ready To Pick Up';
    case 'APPROVED':
      return 'Pending';
    default:
      return 'Pending';
  }
};

const mapIssueLineToWarehouseLine = (item: IssueLineDto) => ({
  id: Number(item.requestLineId || 0),
  productId: item.sparePartId || item.sparePartCode,
  itemName: item.sparePartName,
  quantity: Number(item.approvedQty || 0),
  receivedQuantity: Number(item.issuedQty || 0),
  businessUnit: item.unit || 'pcs',
  uom: item.unit || 'pcs',
});

const mapIssueRequestRecord = (item: IssueRequestDto): WarehouseRequestRecord => ({
  id: Number(item.id || 0),
  requestId: item.requestNo || '',
  requestDate: item.requestedDate || '',
  requester: item.requesterId || '',
  priority: normalizePriority(item.priority),
  status: deriveRecordStatus(item.requestStatus, item.pickupStatus),
  items: (item.items || []).map(mapIssueLineToWarehouseLine),
  rawRequestStatus: item.requestStatus,
  pickupStatus: item.pickupStatus || undefined,
});

const mapIssueLineDetail = (item: IssueLineDto, requestId: string, index: number): RequestDetailLineItem => ({
  no: index + 1,
  requestLineId: Number(item.requestLineId || 0),
  productId: item.sparePartId || item.sparePartCode,
  requestId,
  itemName: item.sparePartName,
  quantityToReturn: Number(item.approvedQty || 0),
  usedQuantity: 0,
  total: Number(item.approvedQty || 0),
  warehouseSentQuantity: Number(item.issuedQty || 0),
  description: item.remark || undefined,
  warehouse: item.toWarehouseCode || undefined,
  sparePartType: normalizeSparePartType(item.type),
  businessUnit: item.unit || 'pcs',
  uom: item.unit || 'pcs',
  imageId: Array.isArray(item.imageId) ? item.imageId[0] : item.imageId || undefined,
});

const buildShipments = (
  history: IssueHistoryDto[],
  pickupStatus?: string | null,
  requestStatus?: string | null,
): Shipment[] => {
  const isConfirmed = String(pickupStatus || '').trim().toLowerCase() === 'confirmed';
  const normalizedRequestStatus = String(requestStatus || '').trim().toUpperCase();
  const orderedHistory = [...history].sort((left, right) => {
    const leftTime = new Date(left.issuedAt || '').getTime();
    const rightTime = new Date(right.issuedAt || '').getTime();
    return leftTime - rightTime;
  });

  return orderedHistory.map((entry, index) => {
    const isPreviouslyPicked =
      !isConfirmed &&
      normalizedRequestStatus === 'PARTIAL_ISSUE' &&
      index < orderedHistory.length - 1;

    return ({
    id: entry.fulfillmentId,
    shipmentNo: index + 1,
    createdAt: entry.issuedAt || '',
    createdBy: entry.warehouseStaffId || 'Warehouse',
    status: isConfirmed || isPreviouslyPicked ? 'completed' : 'ready_to_pickup',
    confirmedAt: isConfirmed || isPreviouslyPicked ? entry.issuedAt || '' : undefined,
    confirmedBy: isConfirmed || isPreviouslyPicked ? entry.warehouseStaffId || 'Warehouse' : undefined,
    lines: (entry.items || []).map((line) => ({
      productId: line.sparePartId || line.sparePartCode,
      itemName: line.sparePartName,
      quantity: Number(line.deliveredQty || 0),
      uom: line.unit || 'pcs',
    })),
  })});
};

const buildActivities = (
  item: IssueRequestDto,
  status: RequestDetailData['status'],
): RequestDetailActivity[] => {
  const orderedHistory = [...(item.history || [])].sort((left, right) => {
    const leftTime = new Date(left.issuedAt || item.requestedDate || '').getTime();
    const rightTime = new Date(right.issuedAt || item.requestedDate || '').getTime();
    return leftTime - rightTime;
  });
  const activities: RequestDetailActivity[] = [
    {
      label: 'Requested',
      description: `Requested by ${item.requesterId || 'Requester'}`,
      date: item.requestedDate,
      by: item.requesterId || 'Requester',
      dot: 'done',
    },
  ];

  if (status !== 'pending' && status !== 'rejected') {
    activities.push({
      label: 'Approved',
      description: 'Request approved',
      date: item.approvedAt || item.requestedDate,
      by: item.approverId || undefined,
      dot: 'done',
    });
  }

  if (status === 'in-progress' || status === 'partial' || status === 'ready_to_Pickup' || status === 'completed') {
    activities.push({
      label: 'Confirmed',
      description: 'Warehouse confirmed and started processing this request',
      date: item.warehouseAcceptedAt || orderedHistory[0]?.issuedAt || item.approvedAt || item.requestedDate,
      by: item.warehouseAcceptedBy || item.history?.[0]?.warehouseStaffId || undefined,
      dot: 'done',
    });
  }

  orderedHistory.forEach((entry, index) => {
    const shipmentNo = index + 1;
    const isPreviouslyPicked =
      String(item.pickupStatus || '').trim().toLowerCase() !== 'confirmed' &&
      String(item.requestStatus || '').trim().toUpperCase() === 'PARTIAL_ISSUE' &&
      index < orderedHistory.length - 1;

    activities.push({
      label: 'Ready to Pick up',
      description: `Shipment #${shipmentNo} is ready to pick up`,
      date: entry.issuedAt || item.requestedDate,
      by: entry.warehouseStaffId || 'Warehouse',
      dot:
        String(item.pickupStatus || '').trim().toLowerCase() === 'confirmed' || isPreviouslyPicked
          ? 'done'
          : 'pending',
    });

    if (isPreviouslyPicked) {
      activities.push({
        label: 'Confirm Pick up',
        description: `Shipment #${shipmentNo} pickup confirmed`,
        date: entry.pickupConfirmedAt || entry.issuedAt || item.requestedDate,
        by: entry.pickupConfirmedBy || entry.warehouseStaffId || undefined,
        dot: 'done',
      });
      activities.push({
        label: `Partial Issue #${shipmentNo}`,
        description: `Shipment #${shipmentNo} was picked up, but the request is still partially issued.`,
        date: entry.pickupConfirmedAt || entry.issuedAt || item.requestedDate,
        by: entry.pickupConfirmedBy || entry.warehouseStaffId || undefined,
        dot: 'done',
      });
    }
  });

  if (String(item.pickupStatus || '').trim().toLowerCase() === 'confirmed') {
    if (status === 'partial') {
      orderedHistory.forEach((entry, index) => {
        const shipmentNo = index + 1;
        activities.push({
          label: 'Confirm Pick up',
          description: `Shipment #${shipmentNo} pickup confirmed`,
          date: entry.pickupConfirmedAt || entry.issuedAt || item.requestedDate,
          by: entry.pickupConfirmedBy || entry.warehouseStaffId || undefined,
          dot: 'done',
        });
        activities.push({
          label: `Partial Issue #${shipmentNo}`,
          description: `Shipment #${shipmentNo} was picked up, but the request is still partially issued.`,
          date: entry.pickupConfirmedAt || entry.issuedAt || item.requestedDate,
          by: entry.pickupConfirmedBy || entry.warehouseStaffId || undefined,
          dot: 'done',
        });
      });
    } else {
      const lastShipmentNo = orderedHistory.length > 0 ? orderedHistory.length : 1;
      activities.push({
        label: 'Confirm Pick up',
        description: `Shipment #${lastShipmentNo} pickup confirmed`,
        date:
          orderedHistory[orderedHistory.length - 1]?.pickupConfirmedAt ||
          orderedHistory[orderedHistory.length - 1]?.issuedAt ||
          item.requestedDate,
        by:
          orderedHistory[orderedHistory.length - 1]?.pickupConfirmedBy ||
          orderedHistory[orderedHistory.length - 1]?.warehouseStaffId ||
          undefined,
        dot: 'done',
      });
      activities.push({
        label: 'Completed',
        description: 'All issued items have been picked up.',
        date:
          orderedHistory[orderedHistory.length - 1]?.pickupConfirmedAt ||
          orderedHistory[orderedHistory.length - 1]?.issuedAt ||
          item.requestedDate,
        by:
          orderedHistory[orderedHistory.length - 1]?.pickupConfirmedBy ||
          orderedHistory[orderedHistory.length - 1]?.warehouseStaffId ||
          undefined,
        dot: 'done',
      });
    }
  }

  return activities;
};

const mapIssueRequestDetail = (item: IssueRequestDto): RequestDetailData => {
  const rawStatus = String(item.requestStatus || '').trim().toUpperCase();
  const normalizedPickupStatus = String(item.pickupStatus || '').trim().toLowerCase();
  const detailType =
    normalizeSparePartType(item.type) ||
    (item.items || [])
      .map((line) => normalizeSparePartType(line.type))
      .find((value): value is SparePartType => Boolean(value));
  const normalizedStatus: RequestDetailData['status'] =
    rawStatus === 'REJECTED'
      ? 'rejected'
      : rawStatus === 'APPROVED'
        ? 'approved'
        : rawStatus === 'IN_PROGRESS'
          ? 'in-progress'
        : rawStatus === 'PARTIAL_ISSUE'
          ? normalizedPickupStatus === 'confirmed'
            ? 'partial'
            : 'ready_to_Pickup'
          : rawStatus === 'READY_TO_PICKUP'
            ? 'ready_to_Pickup'
            : rawStatus === 'COMPLETE'
              ? normalizedPickupStatus === 'confirmed'
                ? 'completed'
                : 'ready_to_Pickup'
              : 'pending';

  return {
    id: Number(item.id || 0),
    requestId: item.requestNo || '',
    requestDate: item.requestedDate || '',
    status: normalizedStatus,
    priority: normalizePriority(item.priority).toLowerCase() as RequestDetailData['priority'],
    type: detailType,
    totalItems: (item.items || []).length,
    receivedItems: Number(item.totalIssuedQty || 0),
    remark: item.remark || '',
    requestedBy: item.requesterId || 'Requester',
    approvedBy: item.approverId || undefined,
    warehouseBy: item.history?.[item.history.length - 1]?.warehouseStaffId || 'Warehouse',
    items: (item.items || []).map((line, index) => mapIssueLineDetail(line, item.requestNo || '', index)),
    activities: buildActivities(item, normalizedStatus),
    shipments: buildShipments(item.history || [], item.pickupStatus, item.requestStatus),
    draftItems: (item.draftItems || []).map((entry) => ({
      requestLineId: Number(entry.requestLineId || 0),
      draftQty: Number(entry.draftQty || 0),
    })),
    pickupStatus: item.pickupStatus || undefined,
    rawStatus: item.requestStatus,
    pickupQrToken: (item as any).pickupQrToken || undefined,
    pickupQrGeneratedAt: (item as any).pickupQrGeneratedAt || undefined,
    pickupQrExpiredAt: (item as any).pickupQrExpiredAt || undefined,
  };
};

const mapIssueStatusFilter = (value?: 'All' | WarehouseDisplayStatus) => {
  switch (value) {
    case 'Partial':
      return 'PARTIAL_ISSUE';
    case 'Ready To Pick Up':
      return 'READY_TO_PICKUP';
    case 'Completed':
      return 'COMPLETE';
    case 'Rejected':
      return 'REJECTED';
    default:
      return undefined;
  }
};

export const SparePartWarehouseService = (requestAction: RequestActions) => ({
  pageRequests: async (params: PageIssueRequestsParams): Promise<Paging<WarehouseRequestRecord>> => {
    const response = (await singleRequest<IssueRequestDto>(
      SparePartWarehouseAction.pageRequests(params),
    )(requestAction)) as Paging<IssueRequestDto>;

    return {
      ...response,
      items: (response.items || []).map(mapIssueRequestRecord),
    };
  },
  getRequestDetail: async (
    id: number,
  ): Promise<{ record: WarehouseRequestRecord; detail: RequestDetailData }> => {
    const response = (await singleRequest<IssueRequestDto>(
      SparePartWarehouseAction.getRequest(id),
    )(requestAction)) as IssueRequestDto;

    return {
      record: mapIssueRequestRecord(response),
      detail: mapIssueRequestDetail(response),
    };
  },
  acceptRequest: async (id: number): Promise<{ record: WarehouseRequestRecord; detail: RequestDetailData }> => {
    const response = (await singleRequest<ExecResponseDto<IssueRequestDto>>(
      SparePartWarehouseAction.acceptRequest({ id }),
    )(requestAction)) as ExecResponseDto<IssueRequestDto>;

    const data = unwrapExecPayload(response);
    if (!data) {
      throw new Error('Accept request response is missing data.');
    }

    return {
      record: mapIssueRequestRecord(data),
      detail: mapIssueRequestDetail(data),
    };
  },
  issueRequest: async (payload: IssueRequestPayload): Promise<{ record: WarehouseRequestRecord; detail: RequestDetailData }> => {
    const response = (await singleRequest<ExecResponseDto<IssueRequestDto>>(
      SparePartWarehouseAction.issueRequest(payload),
    )(requestAction)) as ExecResponseDto<IssueRequestDto>;

    const data = unwrapExecPayload(response);
    if (!data) {
      throw new Error('Issue request response is missing data.');
    }

    return {
      record: mapIssueRequestRecord(data),
      detail: mapIssueRequestDetail(data),
    };
  },
  saveDraft: async (payload: SaveDraftPayload): Promise<{ record: WarehouseRequestRecord; detail: RequestDetailData }> => {
    const response = (await singleRequest<ExecResponseDto<IssueRequestDto>>(
      SparePartWarehouseAction.saveDraft(payload),
    )(requestAction)) as ExecResponseDto<IssueRequestDto>;

    const data = unwrapExecPayload(response);
    if (!data) {
      throw new Error('Save draft response is missing data.');
    }

    return {
      record: mapIssueRequestRecord(data),
      detail: mapIssueRequestDetail(data),
    };
  },
  confirmPickup: async (id: number): Promise<{ record: WarehouseRequestRecord; detail: RequestDetailData }> => {
    const response = (await singleRequest<ExecResponseDto<IssueRequestDto>>(
      SparePartWarehouseAction.confirmPickup(id),
    )(requestAction)) as ExecResponseDto<IssueRequestDto>;

    const data = unwrapExecPayload(response);
    if (!data) {
      throw new Error('Confirm pickup response is missing data.');
    }

    return {
      record: mapIssueRequestRecord(data),
      detail: mapIssueRequestDetail(data),
    };
  },
});
