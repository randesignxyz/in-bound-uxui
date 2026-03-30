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
  requestedQty: number;
  approvedQty?: number;
  unit: string;
  toWarehouseCode?: string | null;
  forLine?: string | null;
  remark?: string | null;
  imageId?: string | string[] | null;
};

type MyRequestDto = {
  id: number;
  requestNo?: string;
  requestId: string;
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

type CreateRequestPayload = {
  items: Array<{
    item: SparePartRequestItem;
    quantity: number;
    purpose: string;
    toWarehouseCode: string;
    forLine: string;
    uom?: string;
  }>;
  remark: string;
  priority: 'normal' | 'high' | 'urgent';
};

type ApproveRequestPayload = {
  id: number;
  lines: Array<{
    requestLineId: number;
    approvedQty: number;
  }>;
  remark?: string;
};

type RejectRequestPayload = {
  id: number;
  remark?: string;
};

const SparePartRequestAction = {
  pageMyRequests: (
    params: TableViewSearchParams<MyRequestSearch>,
  ): ServiceApiType<{
    searchValue?: string;
    advanceSearch?: {
      priority?: string;
      status?: string;
      type?: string;
      dateRange?: [string, string];
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
        type:
          params.criteria?.advanceSearch?.type && params.criteria.advanceSearch.type !== 'ALL'
            ? params.criteria.advanceSearch.type
            : undefined,
        dateRange: params.criteria?.advanceSearch?.dateRange,
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
        requestedQty: line.quantity,
        purpose: line.purpose,
        toWarehouseCode: line.toWarehouseCode,
        forLine: line.forLine,
        productId: line.item.productId,
        uom: line.uom,
      })),
      remark: payload.remark,
      priority: payload.priority,
    },
  }),
  approveRequest: (payload: ApproveRequestPayload): ServiceApiType<any> => ({
    type: 'EXEC',
    actionName: 'approve-spare-part-request',
    endpoint: 'PROD',
    payload,
  }),
  rejectRequest: (payload: RejectRequestPayload): ServiceApiType<any> => ({
    type: 'EXEC',
    actionName: 'reject-spare-part-request',
    endpoint: 'PROD',
    payload,
  }),
  confirmPickup: (id: number): ServiceApiType<any> => ({
    type: 'EXEC',
    actionName: 'confirm-spare-part-pickup',
    endpoint: 'PROD',
    payload: { id },
  }),
};

const normalizePriority = (value?: string | null): RequestPriority => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'urgent') return 'urgent';
  if (normalized === 'high') return 'high';
  if (normalized === 'low') return 'low';
  return 'normal';
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
      return 'partial';
    case 'READY_TO_PICKUP':
      return 'ready_to_Pickup';
    case 'COMPLETE':
      return totalIssuedQty > 0 && totalPickedQty >= totalIssuedQty ? 'completed' : 'ready_to_Pickup';
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
  requestedQty: Number(item.requestedQty || 0),
  approvedQty: Number(item.approvedQty || 0),
  unit: item.unit || 'pcs',
  toWarehouseCode: item.toWarehouseCode || undefined,
  forLine: item.forLine || undefined,
  remark: item.remark || undefined,
  imageId: item.imageId || undefined,
});

export const mapMyRequestItem = (item: MyRequestDto): MyRequestItem => {
  const totalIssuedQty = Number(item.totalIssuedQty || 0);
  const totalPickedQty = Number(item.totalPickedQty || 0);
  const items = (item.items || []).map(mapRequestLine);

  return {
    id: Number(item.id || 0),
    requestId: item.requestNo || item.requestId,
    requestNo: item.requestNo || undefined,
    requestedBy: item.requestId,
    priority: normalizePriority(item.priority),
    requestDate: item.requestedDate || item.requestDate || '',
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
      by: 'Approver',
      dot: 'done',
    });
  }

  if (request.requestStatus === 'rejected') {
    activities.push({
      label: 'Rejected',
      description: 'Request rejected',
      date: request.requestDate,
      by: 'Approver',
      dot: 'done',
    });
  }

  if (request.requestStatus === 'partial') {
    activities.push({
      label: 'Partial Issue',
      description: 'Warehouse issued part of the approved quantity',
      date: request.requestDate,
      by: 'Warehouse',
      dot: 'done',
    });
  }

  if (request.requestStatus === 'ready_to_Pickup') {
    activities.push({
      label: 'Ready to Pick up',
      description: 'Items are ready for pickup',
      date: request.requestDate,
      by: 'Warehouse',
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
  const items: RequestDetailLineItem[] = (request.items || []).map((item, index) => ({
    no: index + 1,
    requestLineId: item.requestLineId,
    imageId: Array.isArray(item.imageId) ? item.imageId[0] : item.imageId,
    productId: item.sparePartId || item.sparePartCode,
    requestId: request.requestId,
    itemName: item.sparePartName,
    quantityToReturn: Number(item.approvedQty || item.requestedQty || 0),
    usedQuantity: 0,
    total: Number(item.requestedQty || 0),
    warehouseSentQuantity: 0,
    warehouse: item.toWarehouseCode,
    sparePartType: request.type,
    businessUnit: item.unit,
    uom: item.unit,
    description: item.remark,
  }));

  return {
    id: request.id,
    requestId: request.requestId,
    requestDate: request.requestDate,
    status: request.requestStatus,
    priority: request.priority,
    type: request.type,
    totalItems: request.totalItems,
    receivedItems: request.receivedItems,
    remark: request.remark,
    requestedBy: request.requestedBy,
    approvedBy: 'Approver',
    items,
    activities: buildRequestActivities(request),
  };
};

export const SparePartRequestService = (requestAction: RequestActions) => ({
  pageMyRequests: async (
    params: TableViewSearchParams<MyRequestSearch>,
  ): Promise<Paging<MyRequestItem>> => {
    const response = (await singleRequest<MyRequestDto>(
      SparePartRequestAction.pageMyRequests(params),
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
  rejectRequest: async (payload: RejectRequestPayload): Promise<MyRequestItem> => {
    const response = (await singleRequest<MyRequestDto>(
      SparePartRequestAction.rejectRequest(payload),
    )(requestAction)) as MyRequestDto;

    return mapMyRequestItem(response);
  },
  confirmPickup: async (id: number): Promise<any> => {
    return await singleRequest<any>(SparePartRequestAction.confirmPickup(id))(requestAction);
  },
});
