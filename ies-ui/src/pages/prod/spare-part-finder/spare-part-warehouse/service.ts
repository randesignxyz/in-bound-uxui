import type { Paging } from '@/services/API';
import { type RequestActions, type ServiceApiType, singleRequest } from '@/services/apiGateway';
import type {
  RequestDetailActivity,
  RequestDetailData,
  RequestDetailLineItem,
} from './RequestedBatchWareHouse';
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
  category_id?: number | null;
  category?: { id?: number | null; category_name?: string | null } | string | null;
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
  pickupQrToken?: string | null;
  pickupQrGeneratedAt?: string | null;
  pickupQrExpiredAt?: string | null;
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
  activities?: Array<{
    label?: string | null;
    description?: string | null;
    date?: string | null;
    by?: string | null;
    dot?: 'pending' | 'done' | string | null;
  }>;
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
type DeleteDraftPayload = { id: number };
type AcceptIssuePayload = { id: number };
type GeneratePickupQrPayload = { id: number; fulfillmentId?: string };
type ConfirmPickupPayload = { id: number; fulfillmentId?: string };

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
  deleteDraft: (payload: DeleteDraftPayload): ServiceApiType<DeleteDraftPayload> => ({
    type: 'EXEC',
    actionName: 'delete-spare-part-issue-draft',
    endpoint: 'PROD',
    payload,
  }),
  confirmPickup: (payload: ConfirmPickupPayload): ServiceApiType<ConfirmPickupPayload> => ({
    type: 'EXEC',
    actionName: 'confirm-spare-part-pickup',
    endpoint: 'PROD',
    payload,
  }),
  generatePickupQr: (payload: GeneratePickupQrPayload): ServiceApiType<GeneratePickupQrPayload> => ({
    type: 'EXEC',
    actionName: 'generate-spare-part-pickup-qr',
    endpoint: 'PROD',
    payload,
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

const resolveCategoryName = (
  category?: { id?: number | null; category_name?: string | null } | string | null,
): string | undefined => (typeof category === 'string' ? category : category?.category_name || undefined);

const deriveRecordStatus = (
  requestStatus?: string | null,
  pickupStatus?: string | null,
  totalIssuedQty: number = 0,
  history: IssueHistoryDto[] = [],
): WarehouseRequestRecord['status'] => {
  const normalizedRequestStatus = String(requestStatus || '').trim().toUpperCase();
  const normalizedPickupStatus = String(pickupStatus || '').trim().toLowerCase();
  const committedShipmentCount = history.length;
  const confirmedShipmentCount = history.filter((entry) => Boolean(entry.pickupConfirmedAt)).length;
  const hasAnyConfirmedShipment = confirmedShipmentCount > 0;
  const hasAllShipmentsConfirmed = committedShipmentCount > 0 && confirmedShipmentCount === committedShipmentCount;
  const hasPendingShipment = committedShipmentCount > confirmedShipmentCount;

  switch (normalizedRequestStatus) {
    case 'REJECTED':
      return 'Rejected';
    case 'IN_PROGRESS':
      return hasAnyConfirmedShipment || (normalizedPickupStatus === 'confirmed' && totalIssuedQty > 0)
        ? 'Partial'
        : 'In Progress';
    case 'PARTIAL_ISSUE':
      if (hasPendingShipment) return 'Ready To Pick Up';
      if (hasAllShipmentsConfirmed || normalizedPickupStatus === 'confirmed') return 'Partial';
      return 'Ready To Pick Up';
    case 'READY_TO_PICKUP':
      if (committedShipmentCount === 0) {
        return normalizedPickupStatus === 'confirmed' ? 'Completed' : 'Ready To Pick Up';
      }
      return hasAllShipmentsConfirmed ? 'Completed' : 'Ready To Pick Up';
    case 'COMPLETE':
      if (committedShipmentCount === 0) {
        return normalizedPickupStatus === 'confirmed' ? 'Completed' : 'Ready To Pick Up';
      }
      if (hasPendingShipment) return 'Ready To Pick Up';
      if (hasAllShipmentsConfirmed) return 'Completed';
      if (hasAnyConfirmedShipment) return 'Ready To Pick Up';
      return 'Ready To Pick Up';
    case 'APPROVED':
      return 'Pending';
    default:
      return 'Pending';
  }
};

const mapRecordStatusToDetailStatus = (
  status: WarehouseRequestRecord['status'],
): RequestDetailData['status'] => {
  switch (status) {
    case 'Rejected':
      return 'rejected';
    case 'Pending':
      return 'pending';
    case 'In Progress':
      return 'in-progress';
    case 'Ready To Pick Up':
      return 'ready_to_Pickup';
    case 'Partial':
      return 'partial';
    case 'Completed':
      return 'completed';
    default:
      return 'pending';
  }
};

const deriveDetailStatus = (
  requestStatus?: string | null,
  pickupStatus?: string | null,
  history: IssueHistoryDto[] = [],
): RequestDetailData['status'] => {
  const normalizedRequestStatus = String(requestStatus || '').trim().toUpperCase();
  const normalizedPickupStatus = String(pickupStatus || '').trim().toLowerCase();
  const committedShipmentCount = history.length;
  const confirmedShipmentCount = history.filter((entry) => Boolean(entry.pickupConfirmedAt)).length;
  const hasAllShipmentsConfirmed = committedShipmentCount > 0 && confirmedShipmentCount === committedShipmentCount;
  const hasPendingShipment = committedShipmentCount > confirmedShipmentCount;

  switch (normalizedRequestStatus) {
    case 'REJECTED':
      return 'rejected';
    case 'APPROVED':
      return 'approved';
    case 'IN_PROGRESS':
      return 'in-progress';
    case 'PARTIAL_ISSUE':
      return hasPendingShipment ? 'ready_to_Pickup' : 'partial';
    case 'READY_TO_PICKUP':
      return hasAllShipmentsConfirmed ? 'completed' : 'ready_to_Pickup';
    case 'COMPLETE':
      if (hasPendingShipment) return 'ready_to_Pickup';
      if (hasAllShipmentsConfirmed) return 'completed';
      return 'ready_to_Pickup';
    default:
      return mapRecordStatusToDetailStatus(deriveRecordStatus(requestStatus, pickupStatus, 0, history));
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

const mapIssueRequestRecord = (item: IssueRequestDto): WarehouseRequestRecord => {
  const items = (item.items || []).map(mapIssueLineToWarehouseLine);
  const totalIssuedQty = items.reduce((sum, entry) => sum + Number(entry.receivedQuantity || 0), 0);

  return {
    id: Number(item.id || 0),
    requestId: item.requestNo || '',
    requestDate: item.requestedDate || '',
    requester: item.requesterId || '',
    priority: normalizePriority(item.priority),
    status: deriveRecordStatus(item.requestStatus, item.pickupStatus, totalIssuedQty, item.history || []),
    items,
    rawRequestStatus: item.requestStatus,
    pickupStatus: item.pickupStatus || undefined,
  };
};

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
  category: resolveCategoryName(item.category),
  businessUnit: item.unit || 'pcs',
  uom: item.unit || 'pcs',
  imageId: Array.isArray(item.imageId) ? item.imageId[0] : item.imageId || undefined,
});

const buildShipments = (
  history: IssueHistoryDto[],
): Shipment[] => {
  const orderedHistory = [...history].sort((left, right) => {
    const leftTime = new Date(left.issuedAt || '').getTime();
    const rightTime = new Date(right.issuedAt || '').getTime();
    return leftTime - rightTime;
  });

  return orderedHistory.map((entry, index) => ({
    id: entry.fulfillmentId,
    shipmentNo: index + 1,
    createdAt: entry.issuedAt || '',
    createdBy: entry.warehouseStaffId || 'Warehouse',
    status: entry.pickupConfirmedAt
      ? 'completed'
      : entry.pickupQrToken
        ? 'qr_generated'
        : 'pending',
    pickupQrToken: entry.pickupQrToken || undefined,
    pickupQrGeneratedAt: entry.pickupQrGeneratedAt || undefined,
    pickupQrExpiredAt: entry.pickupQrExpiredAt || undefined,
    confirmedAt: entry.pickupConfirmedAt || undefined,
    confirmedBy: entry.pickupConfirmedBy || undefined,
    lines: (entry.items || []).map((line) => ({
      productId: line.sparePartId || line.sparePartCode,
      itemName: line.sparePartName,
      quantity: Number(line.deliveredQty || 0),
      uom: line.unit || 'pcs',
    })),
  }));
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
  const confirmedHistory = orderedHistory.filter((entry) => Boolean(entry.pickupConfirmedAt));
  const hasAllShipmentsConfirmed =
    orderedHistory.length > 0 && confirmedHistory.length === orderedHistory.length;
  const finalConfirmedEntry = hasAllShipmentsConfirmed
    ? [...confirmedHistory].sort((left, right) => {
        const leftTime = new Date(left.pickupConfirmedAt || left.issuedAt || item.requestedDate || '').getTime();
        const rightTime = new Date(right.pickupConfirmedAt || right.issuedAt || item.requestedDate || '').getTime();
        return leftTime - rightTime;
      })[confirmedHistory.length - 1]
    : undefined;
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
    const hasPickupConfirmation = Boolean(entry.pickupConfirmedAt);
    const isFinalCompletedEntry =
      hasAllShipmentsConfirmed && finalConfirmedEntry?.fulfillmentId === entry.fulfillmentId;

    activities.push({
      label: 'Ready to Pick up',
      description: `Shipment #${shipmentNo} is ready to pick up`,
      date: entry.issuedAt || item.requestedDate,
      by: entry.warehouseStaffId || 'Warehouse',
      dot: hasPickupConfirmation ? 'done' : 'pending',
    });

    if (hasPickupConfirmation) {
      activities.push({
        label: 'Confirm Pick up',
        description: `Shipment #${shipmentNo} pickup confirmed`,
        date: entry.pickupConfirmedAt || entry.issuedAt || item.requestedDate,
        by: entry.pickupConfirmedBy || entry.warehouseStaffId || undefined,
        dot: 'done',
      });

      if (!isFinalCompletedEntry) {
        activities.push({
          label: `Partial Issue #${shipmentNo}`,
          description: `Shipment #${shipmentNo} was picked up, but the request is still partially issued.`,
          date: entry.pickupConfirmedAt || entry.issuedAt || item.requestedDate,
          by: entry.pickupConfirmedBy || entry.warehouseStaffId || undefined,
          dot: 'done',
        });
      }
    }
  });

  if (hasAllShipmentsConfirmed && finalConfirmedEntry) {
    activities.push({
      label: 'Completed',
      description: 'All issued items have been picked up.',
      date:
        finalConfirmedEntry.pickupConfirmedAt ||
        finalConfirmedEntry.issuedAt ||
        item.requestedDate,
      by: finalConfirmedEntry.pickupConfirmedBy || finalConfirmedEntry.warehouseStaffId || undefined,
      dot: 'done',
    });
  }

  return activities;
};

const mapIssueRequestDetail = (item: IssueRequestDto): RequestDetailData => {
  const detailCategory = (item.items || [])
    .map((line) => resolveCategoryName(line.category))
    .find((value): value is string => Boolean(value));
  const normalizedStatus = deriveDetailStatus(item.requestStatus, item.pickupStatus, item.history || []);

  return {
    id: Number(item.id || 0),
    requestId: item.requestNo || '',
    requestDate: item.requestedDate || '',
    status: normalizedStatus,
    priority: normalizePriority(item.priority).toLowerCase() as RequestDetailData['priority'],
    category: detailCategory,
    totalItems: (item.items || []).length,
    receivedItems: Number(item.totalIssuedQty || 0),
    remark: item.remark || '',
    requestedBy: item.requesterId || 'Requester',
    approvedBy: item.approverId || undefined,
    warehouseBy: item.history?.[item.history.length - 1]?.warehouseStaffId || 'Warehouse',
    items: (item.items || []).map((line, index) => mapIssueLineDetail(line, item.requestNo || '', index)),
    activities: (item.activities || []).map((activity) => ({
      label: String(activity.label || '').trim(),
      description: String(activity.description || '').trim(),
      date: activity.date || item.requestedDate,
      by: activity.by?.trim() ? activity.by.trim() : undefined,
      dot: activity.dot === 'pending' ? 'pending' : 'done',
    })),
    // activities:
    //   (item.activities || []).length > 0
    //     ? (item.activities || []).map((activity) => ({
    //         label: String(activity.label || '').trim(),
    //         description: String(activity.description || '').trim(),
    //         date: activity.date || item.requestedDate,
    //         by: activity.by?.trim() ? activity.by.trim() : undefined,
    //         dot: activity.dot === 'pending' ? 'pending' : 'done',
    //       }))
    //     : buildActivities(item, normalizedStatus),
    shipments: buildShipments(item.history || []),
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
  deleteDraft: async (id: number): Promise<{ record: WarehouseRequestRecord; detail: RequestDetailData }> => {
    const response = (await singleRequest<ExecResponseDto<IssueRequestDto>>(
      SparePartWarehouseAction.deleteDraft({ id }),
    )(requestAction)) as ExecResponseDto<IssueRequestDto>;

    const data = unwrapExecPayload(response);
    if (!data) {
      throw new Error('Delete draft response is missing data.');
    }

    return {
      record: mapIssueRequestRecord(data),
      detail: mapIssueRequestDetail(data),
    };
  },
  confirmPickup: async (payload: ConfirmPickupPayload): Promise<{ record: WarehouseRequestRecord; detail: RequestDetailData }> => {
    const response = (await singleRequest<ExecResponseDto<IssueRequestDto>>(
      SparePartWarehouseAction.confirmPickup(payload),
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
  generatePickupQr: async (payload: GeneratePickupQrPayload): Promise<{ record: WarehouseRequestRecord; detail: RequestDetailData }> => {
    const response = (await singleRequest<ExecResponseDto<IssueRequestDto>>(
      SparePartWarehouseAction.generatePickupQr(payload),
    )(requestAction)) as ExecResponseDto<IssueRequestDto>;

    const data = unwrapExecPayload(response);
    if (!data) {
      throw new Error('Generate pickup QR response is missing data.');
    }

    return {
      record: mapIssueRequestRecord(data),
      detail: mapIssueRequestDetail(data),
    };
  },
});
