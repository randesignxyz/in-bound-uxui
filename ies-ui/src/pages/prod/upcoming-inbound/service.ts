/* eslint-disable @typescript-eslint/no-use-before-define */
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import {
  InboundDashboardSummaryApi,
  InboundDashboardSummaryParams,
  InboundExportReportParams,
  InboundGenericReportApi,
  InboundGoodsReceiptApi,
  InboundGoodsReceiptCountParams,
  InboundGoodsReceiptSearch,
  InboundGoodsReceiptStatusChangeInput,
  InboundLinkPoInput,
  InboundMarkQcBadgeViewedInput,
  InboundPurchaseOrderApi,
  InboundPurchaseOrderCountParams,
  InboundPurchaseOrderSearch,
  InboundSaveActivityInput,
  InboundSaveGoodsReceiptInput,
  InboundSupplierMasterApi,
  InboundSupplierMasterListParams,
  InboundSubmitQcReviewInput,
  InboundSubmitSupervisorReviewInput,
  InboundSuccessPayloadResponse,
  InboundUomMasterApi,
  InboundUomMasterListParams,
  InboundWarehouseMasterApi,
  InboundWarehouseMasterListParams,
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

  listSuppliers: (
    params: InboundSupplierMasterListParams,
  ): ServiceApiType<InboundSupplierMasterListParams> => ({
    type: 'LIST_QUERY',
    endpoint: 'PROD',
    actionName: 'inbound-list-suppliers',
    payload: params,
  }),

  listUoms: (params: InboundUomMasterListParams): ServiceApiType<InboundUomMasterListParams> => ({
    type: 'LIST_QUERY',
    endpoint: 'PROD',
    actionName: 'inbound-list-uoms',
    payload: params,
  }),

  listWarehouses: (
    params: InboundWarehouseMasterListParams,
  ): ServiceApiType<InboundWarehouseMasterListParams> => ({
    type: 'LIST_QUERY',
    endpoint: 'PROD',
    actionName: 'inbound-list-warehouses',
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

  buildExportReport: (
    params: InboundExportReportParams,
  ): ServiceApiType<InboundExportReportParams> => ({
    type: 'FETCH_QUERY',
    endpoint: 'PROD',
    actionName: 'inbound-build-export-report',
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

  markQcBadgeViewed: (
    data: InboundMarkQcBadgeViewedInput,
  ): ServiceApiType<InboundMarkQcBadgeViewedInput> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'inbound-mark-qc-badge-viewed',
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

    listSuppliers: async (
      params: InboundSupplierMasterListParams = {},
    ): Promise<InboundSupplierMasterApi[]> => {
      const response = (await singleRequest<InboundSupplierMasterApi>(
        UpcomingInboundAction.listSuppliers(params),
      )(requestAction)) as InboundSupplierMasterApi[];
      return extractArrayResponse(response);
    },

    listUoms: async (params: InboundUomMasterListParams = {}): Promise<InboundUomMasterApi[]> => {
      const response = (await singleRequest<InboundUomMasterApi>(
        UpcomingInboundAction.listUoms(params),
      )(requestAction)) as InboundUomMasterApi[];
      const uoms = extractArrayResponse(response).map(normalizeInboundUomMaster).filter((uom) => uom.uom_code);

      if (uoms.length > 0 || !params.status) {
        return uoms;
      }

      const retryResponse = (await singleRequest<InboundUomMasterApi>(
        UpcomingInboundAction.listUoms({ ...params, status: undefined }),
      )(requestAction)) as InboundUomMasterApi[];
      return extractArrayResponse(retryResponse)
        .map(normalizeInboundUomMaster)
        .filter((uom) => uom.uom_code);
    },

    listWarehouses: async (
      params: InboundWarehouseMasterListParams = {},
    ): Promise<InboundWarehouseMasterApi[]> => {
      const response = (await singleRequest<InboundWarehouseMasterApi>(
        UpcomingInboundAction.listWarehouses(params),
      )(requestAction)) as InboundWarehouseMasterApi[];
      const warehouses = extractArrayResponse(response)
        .map(normalizeInboundWarehouseMaster)
        .filter((warehouse) => warehouse.warehouse_code);

      if (warehouses.length > 0 || !params.status) {
        return warehouses;
      }

      const retryResponse = (await singleRequest<InboundWarehouseMasterApi>(
        UpcomingInboundAction.listWarehouses({ ...params, status: undefined }),
      )(requestAction)) as InboundWarehouseMasterApi[];
      return extractArrayResponse(retryResponse)
        .map(normalizeInboundWarehouseMaster)
        .filter((warehouse) => warehouse.warehouse_code);
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

    buildExportReport: async (
      params: InboundExportReportParams,
    ): Promise<InboundGenericReportApi> => {
      return (await singleRequest<InboundGenericReportApi>(
        UpcomingInboundAction.buildExportReport(params),
      )(requestAction)) as InboundGenericReportApi;
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

    markQcBadgeViewed: async (
      data: InboundMarkQcBadgeViewedInput,
    ): Promise<InboundSuccessPayloadResponse<UpcomingInboundGoodsReceipt>> => {
      const response = (await singleRequest<InboundSuccessPayloadResponse<InboundGoodsReceiptApi>>(
        UpcomingInboundAction.markQcBadgeViewed(data),
      )(requestAction)) as InboundSuccessPayloadResponse<InboundGoodsReceiptApi>;
      return mapPayloadResponse(response, mapInboundGoodsReceipt);
    },
  };
};

function mapPaging<IN, OU>(paging: Paging<IN>, mapper: (value: IN) => OU): Paging<OU> {
  const items = extractPagingItems<IN>(paging);
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
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.content)) return response.data.content;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

function normalizeInboundUomMaster(value: InboundUomMasterApi | any): InboundUomMasterApi {
  return {
    id: value?.id ?? null,
    uom_code: value?.uom_code ?? value?.uomCode ?? value?.code ?? '',
    uom_name: value?.uom_name ?? value?.uomName ?? value?.name ?? value?.uom_code ?? value?.uomCode ?? '',
    status: value?.status ?? 'Active',
  };
}

function normalizeInboundWarehouseMaster(value: InboundWarehouseMasterApi | any): InboundWarehouseMasterApi {
  const businessUnit = value?.business_unit ?? value?.businessUnit ?? '';
  const warehouseCode = value?.warehouse_code ?? value?.warehouseCode ?? value?.code ?? '';
  return {
    id: value?.id ?? null,
    business_unit: String(businessUnit).trim().toUpperCase(),
    warehouse_code: String(warehouseCode).trim(),
    warehouse_name:
      value?.warehouse_name ??
      value?.warehouseName ??
      value?.name ??
      warehouseCode ??
      '',
    status: value?.status ?? 'Active',
  };
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
  const dateFrom = params.criteria?.advanceSearch?.dateFrom;
  const dateTo = params.criteria?.advanceSearch?.dateTo;

  return orders.filter((order) => {
    if (businessUnit && order.businessUnit !== businessUnit) return false;
    if (type && type !== 'ALL' && order.type !== type) return false;
    if (status && status !== 'ALL' && order.status !== status) return false;
    if (expectedDate && order.expectedDate !== expectedDate) return false;
    if (dateFrom && order.expectedDate < dateFrom) return false;
    if (dateTo && order.expectedDate > dateTo) return false;
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
