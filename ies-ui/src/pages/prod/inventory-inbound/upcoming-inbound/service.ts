import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import {
  InboundDashboardSummaryApi,
  InboundDashboardSummaryParams,
  InboundGoodsReceiptApi,
  InboundGoodsReceiptCountParams,
  InboundGoodsReceiptSearch,
  InboundGoodsReceiptStatusChangeInput,
  InboundLinkPoInput,
  InboundPurchaseOrderApi,
  InboundPurchaseOrderCountParams,
  InboundPurchaseOrderSearch,
  InboundSaveActivityInput,
  InboundSaveGoodsReceiptInput,
  InboundSubmitQcReviewInput,
  InboundSubmitSupervisorReviewInput,
  InboundSuccessPayloadResponse,
  UpcomingInboundGoodsReceipt,
  UpcomingInboundPurchaseOrder,
} from './data';
import {
  mapInboundDashboardSummary,
  mapInboundGoodsReceipt,
  mapInboundPurchaseOrder,
  mapInboundPurchaseOrders,
} from './mappers';

type InboundPurchaseOrderAdvanceSearch = NonNullable<InboundPurchaseOrderSearch['advanceSearch']>;
type InboundPurchaseOrderDetailByKeyParams = {
  po_number: string;
  business_unit: string;
};
type InboundGoodsReceiptTableParams = Omit<TableViewSearchParams<any>, 'criteria'> & {
  criteria?: InboundGoodsReceiptSearch;
};

function buildPurchaseOrderSearchPayload(
  params: TableViewSearchParams<InboundPurchaseOrderAdvanceSearch>,
): InboundPurchaseOrderSearch {
  return {
    searchValue: params.criteria?.searchValue,
    sort: params.criteria?.sort as InboundPurchaseOrderSearch['sort'],
    advanceSearch: params.criteria?.advanceSearch,
  };
}

const UpcomingInboundAction = {
  pagePurchaseOrders: (
    params: TableViewSearchParams<InboundPurchaseOrderAdvanceSearch>,
  ): ServiceApiType<InboundPurchaseOrderSearch> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'inbound-fetch-paging-purchase-order',
    payload: buildPurchaseOrderSearchPayload(params),
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  detailPurchaseOrder: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'PROD',
    actionName: 'inbound-detail-purchase-order',
    payload: { id },
  }),

  detailPurchaseOrderByKey: (
    params: InboundPurchaseOrderDetailByKeyParams,
  ): ServiceApiType<InboundPurchaseOrderDetailByKeyParams> => ({
    type: 'FETCH_QUERY',
    endpoint: 'PROD',
    actionName: 'inbound-detail-purchase-order-by-key',
    payload: params,
  }),

  listPurchaseOrders: (): ServiceApiType<Record<string, never>> => ({
    type: 'LIST_QUERY',
    endpoint: 'PROD',
    actionName: 'inbound-list-purchase-order',
    payload: {},
  }),

  getPurchaseOrderCounts: (
    params: InboundPurchaseOrderCountParams,
  ): ServiceApiType<InboundPurchaseOrderCountParams> => ({
    type: 'LIST_QUERY',
    endpoint: 'PROD',
    actionName: 'inbound-get-count-purchase-order',
    payload: params,
  }),

  pageGoodsReceipts: (
    params: InboundGoodsReceiptTableParams,
  ): ServiceApiType<InboundGoodsReceiptSearch> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'inbound-fetch-paging-goods-receipt',
    payload: { ...(params.criteria || {}) },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  detailGoodsReceipt: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'PROD',
    actionName: 'inbound-detail-goods-receipt',
    payload: { id },
  }),

  getGoodsReceiptCounts: (
    params: InboundGoodsReceiptCountParams,
  ): ServiceApiType<InboundGoodsReceiptCountParams> => ({
    type: 'LIST_QUERY',
    endpoint: 'PROD',
    actionName: 'inbound-get-count-goods-receipt',
    payload: params,
  }),

  getDashboardSummary: (
    params: InboundDashboardSummaryParams,
  ): ServiceApiType<InboundDashboardSummaryParams> => ({
    type: 'FETCH_QUERY',
    endpoint: 'PROD',
    actionName: 'inbound-dashboard-summary',
    payload: params,
  }),

  saveGoodsReceipt: (data: InboundSaveGoodsReceiptInput): ServiceApiType<InboundSaveGoodsReceiptInput> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'inbound-save-goods-receipt',
    payload: data,
  }),

  changeGoodsReceiptStatus: (
    data: InboundGoodsReceiptStatusChangeInput,
  ): ServiceApiType<InboundGoodsReceiptStatusChangeInput> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'inbound-status-change-goods-receipt',
    payload: data,
  }),

  saveActivity: (data: InboundSaveActivityInput): ServiceApiType<InboundSaveActivityInput> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'inbound-save-activity',
    payload: data,
  }),

  linkPoToTempReceipt: (data: InboundLinkPoInput): ServiceApiType<InboundLinkPoInput> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'inbound-link-po-to-temp-gr',
    payload: data,
  }),

  submitQcReview: (data: InboundSubmitQcReviewInput): ServiceApiType<InboundSubmitQcReviewInput> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'inbound-submit-qc-review',
    payload: data,
  }),

  submitSupervisorReview: (
    data: InboundSubmitSupervisorReviewInput,
  ): ServiceApiType<InboundSubmitSupervisorReviewInput> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'inbound-submit-supervisor-review',
    payload: data,
  }),
};

export const UpcomingInboundServiceAPI = (requestAction: RequestActions) => {
  return {
    pagePurchaseOrders: async (
      params: TableViewSearchParams<InboundPurchaseOrderAdvanceSearch>,
    ): Promise<Paging<UpcomingInboundPurchaseOrder>> => {
      try {
        const response = (await singleRequest<InboundPurchaseOrderApi>(
          UpcomingInboundAction.pagePurchaseOrders(params),
        )(requestAction)) as Paging<InboundPurchaseOrderApi>;
        const mapped = mapPaging(response, mapInboundPurchaseOrder);
        if (mapped.items.length > 0) {
          return mapped;
        }
      } catch (error) {
        // Some local inbound builds expose only the list endpoint while Postman still succeeds there.
      }

      const response = (await singleRequest<InboundPurchaseOrderApi>(
        UpcomingInboundAction.listPurchaseOrders(),
      )(requestAction)) as InboundPurchaseOrderApi[];
      const orders = mapInboundPurchaseOrders(extractArrayResponse(response));
      const filteredOrders = filterPurchaseOrdersForPageFallback(orders, params);
      const current = params.pagination?.current || 1;
      const pageSize = params.pagination?.pageSize || 20;
      const start = (current - 1) * pageSize;
      return {
        items: filteredOrders.slice(start, start + pageSize),
        pageSize,
        total: filteredOrders.length,
      };
    },

    detailPurchaseOrder: async (id: number): Promise<UpcomingInboundPurchaseOrder> => {
      const response = (await singleRequest<InboundPurchaseOrderApi>(
        UpcomingInboundAction.detailPurchaseOrder(id),
      )(requestAction)) as InboundPurchaseOrderApi;
      return mapInboundPurchaseOrder(response);
    },

    detailPurchaseOrderByKey: async (
      params: InboundPurchaseOrderDetailByKeyParams,
    ): Promise<UpcomingInboundPurchaseOrder> => {
      const response = (await singleRequest<InboundPurchaseOrderApi>(
        UpcomingInboundAction.detailPurchaseOrderByKey(params),
      )(requestAction)) as InboundPurchaseOrderApi;
      return mapInboundPurchaseOrder(response);
    },

    listPurchaseOrders: async (): Promise<UpcomingInboundPurchaseOrder[]> => {
      const response = (await singleRequest<InboundPurchaseOrderApi>(
        UpcomingInboundAction.listPurchaseOrders(),
      )(requestAction)) as InboundPurchaseOrderApi[];
      return mapInboundPurchaseOrders(response);
    },

    pageGoodsReceipts: async (
      params: InboundGoodsReceiptTableParams,
    ): Promise<Paging<UpcomingInboundGoodsReceipt>> => {
      const response = (await singleRequest<InboundGoodsReceiptApi>(
        UpcomingInboundAction.pageGoodsReceipts(params),
      )(requestAction)) as Paging<InboundGoodsReceiptApi>;
      return mapPaging(response, mapInboundGoodsReceipt);
    },

    detailGoodsReceipt: async (id: number): Promise<UpcomingInboundGoodsReceipt> => {
      const response = (await singleRequest<InboundGoodsReceiptApi>(
        UpcomingInboundAction.detailGoodsReceipt(id),
      )(requestAction)) as InboundGoodsReceiptApi;
      return mapInboundGoodsReceipt(response);
    },

    getDashboardSummary: async (
      params: InboundDashboardSummaryParams = {},
    ): Promise<InboundDashboardSummaryApi> => {
      const response = (await singleRequest<InboundDashboardSummaryApi>(
        UpcomingInboundAction.getDashboardSummary(params),
      )(requestAction)) as InboundDashboardSummaryApi;
      return mapInboundDashboardSummary(response);
    },

    saveGoodsReceipt: async (
      data: InboundSaveGoodsReceiptInput,
    ): Promise<InboundSuccessPayloadResponse<UpcomingInboundGoodsReceipt>> => {
      const response = (await singleRequest<InboundSuccessPayloadResponse<InboundGoodsReceiptApi>>(
        UpcomingInboundAction.saveGoodsReceipt(data),
      )(requestAction)) as InboundSuccessPayloadResponse<InboundGoodsReceiptApi>;
      return mapPayloadResponse(response, mapInboundGoodsReceipt);
    },

    changeGoodsReceiptStatus: async (
      data: InboundGoodsReceiptStatusChangeInput,
    ): Promise<InboundSuccessPayloadResponse<UpcomingInboundGoodsReceipt>> => {
      const response = (await singleRequest<InboundSuccessPayloadResponse<InboundGoodsReceiptApi>>(
        UpcomingInboundAction.changeGoodsReceiptStatus(data),
      )(requestAction)) as InboundSuccessPayloadResponse<InboundGoodsReceiptApi>;
      return mapPayloadResponse(response, mapInboundGoodsReceipt);
    },

    linkPoToTempReceipt: async (
      data: InboundLinkPoInput,
    ): Promise<InboundSuccessPayloadResponse<UpcomingInboundGoodsReceipt>> => {
      const response = (await singleRequest<InboundSuccessPayloadResponse<InboundGoodsReceiptApi>>(
        UpcomingInboundAction.linkPoToTempReceipt(data),
      )(requestAction)) as InboundSuccessPayloadResponse<InboundGoodsReceiptApi>;
      return mapPayloadResponse(response, mapInboundGoodsReceipt);
    },

    submitQcReview: async (
      data: InboundSubmitQcReviewInput,
    ): Promise<InboundSuccessPayloadResponse<UpcomingInboundGoodsReceipt>> => {
      const response = (await singleRequest<InboundSuccessPayloadResponse<InboundGoodsReceiptApi>>(
        UpcomingInboundAction.submitQcReview(data),
      )(requestAction)) as InboundSuccessPayloadResponse<InboundGoodsReceiptApi>;
      return mapPayloadResponse(response, mapInboundGoodsReceipt);
    },

    submitSupervisorReview: async (
      data: InboundSubmitSupervisorReviewInput,
    ): Promise<InboundSuccessPayloadResponse<UpcomingInboundGoodsReceipt>> => {
      const response = (await singleRequest<InboundSuccessPayloadResponse<InboundGoodsReceiptApi>>(
        UpcomingInboundAction.submitSupervisorReview(data),
      )(requestAction)) as InboundSuccessPayloadResponse<InboundGoodsReceiptApi>;
      return mapPayloadResponse(response, mapInboundGoodsReceipt);
    },
  };
};

function mapPaging<IN, OU>(paging: Paging<IN>, mapper: (value: IN) => OU): Paging<OU> {
  const items = extractPagingItems(paging);
  return {
    ...paging,
    items: items.map(mapper),
    total: paging?.total ?? items.length,
  };
}

function mapPayloadResponse<IN, OU>(
  response: InboundSuccessPayloadResponse<IN>,
  mapper: (value: IN) => OU,
): InboundSuccessPayloadResponse<OU> {
  return {
    message: response.message,
    data: mapper(response.data),
  };
}

function extractPagingItems<IN>(paging: Paging<IN> | any): IN[] {
  if (Array.isArray(paging)) return paging;
  if (Array.isArray(paging?.items)) return paging.items;
  if (Array.isArray(paging?.content)) return paging.content;
  if (Array.isArray(paging?.data)) return paging.data;
  return [];
}

function extractArrayResponse<IN>(response: IN[] | any): IN[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function filterPurchaseOrdersForPageFallback(
  orders: UpcomingInboundPurchaseOrder[],
  params: TableViewSearchParams<InboundPurchaseOrderAdvanceSearch>,
): UpcomingInboundPurchaseOrder[] {
  const businessUnit = params.criteria?.advanceSearch?.businessUnit || params.criteria?.advanceSearch?.business_unit;
  const searchValue = params.criteria?.searchValue?.trim().toUpperCase();
  const type = params.criteria?.advanceSearch?.type;
  const status = params.criteria?.advanceSearch?.status;
  const expectedDate = params.criteria?.advanceSearch?.expectedDate;

  return orders.filter((order) => {
    if (businessUnit && order.businessUnit !== businessUnit) return false;
    if (type && type !== 'ALL' && order.type !== type) return false;
    if (status && status !== 'ALL' && order.status !== status) return false;
    if (expectedDate && order.expectedDate !== expectedDate) return false;
    if (
      searchValue &&
      !order.poNumber.toUpperCase().includes(searchValue) &&
      !order.supplier.toUpperCase().includes(searchValue)
    ) {
      return false;
    }
    return true;
  });
}
