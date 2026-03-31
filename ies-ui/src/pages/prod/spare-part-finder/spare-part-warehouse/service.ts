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
  note?: string | null;
  totalIssuedQty: number;
  items?: IssueHistoryLineDto[];
};

type IssueRequestDto = {
  id: number;
  requestNo: string;
  requesterId: string;
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
  issueRequest: (payload: IssueRequestPayload): ServiceApiType<IssueRequestPayload> => ({
    type: 'EXEC',
    actionName: 'issue-spare-part-request',
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
    case 'PARTIAL_ISSUE':
      return 'Partial';
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
): Shipment[] => {
  const isConfirmed = String(pickupStatus || '').trim().toLowerCase() === 'confirmed';

  return history.map((entry, index) => ({
    id: entry.fulfillmentId,
    shipmentNo: index + 1,
    createdAt: entry.issuedAt || '',
    createdBy: entry.warehouseStaffId || 'Warehouse',
    status: isConfirmed ? 'completed' : 'ready_to_pickup',
    confirmedAt: isConfirmed ? entry.issuedAt || '' : undefined,
    confirmedBy: isConfirmed ? entry.warehouseStaffId || 'Warehouse' : undefined,
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
      date: item.requestedDate,
      by: 'Approver',
      dot: 'done',
    });
  }

  if (status === 'in-progress' || status === 'partial' || status === 'ready_to_Pickup' || status === 'completed') {
    activities.push({
      label: 'Confirmed',
      description: 'Warehouse confirmed and started processing this request',
      date: item.requestedDate,
      by: item.history?.[0]?.warehouseStaffId || 'Warehouse',
      dot: 'done',
    });
  }

  (item.history || []).forEach((entry, index) => {
    activities.push({
      label: 'Ready to Pick up',
      description: `Shipment #${index + 1} is ready to pick up`,
      date: entry.issuedAt || item.requestedDate,
      by: entry.warehouseStaffId || 'Warehouse',
      dot: String(item.pickupStatus || '').trim().toLowerCase() === 'confirmed' ? 'done' : 'pending',
    });
  });

  if (String(item.pickupStatus || '').trim().toLowerCase() === 'confirmed') {
    if (status === 'partial') {
      (item.history || []).forEach((entry, index) => {
        activities.push({
          label: `Partial Issue #${index + 1}`,
          description: `Shipment #${index + 1} was picked up, but the request is still partially issued.`,
          date: entry.issuedAt || item.requestedDate,
          by: item.requesterId || 'Requester',
          dot: 'done',
        });
      });
    } else {
      activities.push({
        label: 'Completed',
        description: 'All issued items have been picked up.',
        date: item.history?.[item.history.length - 1]?.issuedAt || item.requestedDate,
        by: item.requesterId || 'Requester',
        dot: 'done',
      });
    }
  }

  return activities;
};

const mapIssueRequestDetail = (item: IssueRequestDto): RequestDetailData => {
  const rawStatus = String(item.requestStatus || '').trim().toUpperCase();
  const normalizedPickupStatus = String(item.pickupStatus || '').trim().toLowerCase();
  const normalizedStatus: RequestDetailData['status'] =
    rawStatus === 'REJECTED'
      ? 'rejected'
      : rawStatus === 'APPROVED'
        ? 'approved'
        : rawStatus === 'PARTIAL_ISSUE'
          ? 'partial'
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
    type: normalizeSparePartType(item.type),
    totalItems: (item.items || []).length,
    receivedItems: Number(item.totalIssuedQty || 0),
    remark: item.remark || '',
    requestedBy: item.requesterId || 'Requester',
    approvedBy: 'Approver',
    warehouseBy: item.history?.[item.history.length - 1]?.warehouseStaffId || 'Warehouse',
    items: (item.items || []).map((line, index) => mapIssueLineDetail(line, item.requestNo || '', index)),
    activities: buildActivities(item, normalizedStatus),
    shipments: buildShipments(item.history || [], item.pickupStatus),
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
