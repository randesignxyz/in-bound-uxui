/* eslint-disable @typescript-eslint/no-use-before-define */
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { PROD_API } from '@/services/ApiUrl';
import { request } from '@umijs/max';
import {
  InboundDashboardSummaryApi,
  InboundDashboardSummaryParams,
  InboundExportReportParams,
  InboundGenericReportApi,
  InboundGoodsReceiptApi,
  InboundGoodsReceiptCountParams,
  InboundGoodsReceiptSearch,
  InboundItemMasterApi,
  InboundItemMasterListParams,
  InboundGoodsReceiptStatusChangeInput,
  InboundLinkPoInput,
  InboundMarkQcBadgeViewedInput,
  InboundPurchaseOrderApi,
  InboundPurchaseOrderCountParams,
  InboundPurchaseOrderSearch,
  InboundSaveActivityInput,
  InboundSaveGoodsReceiptInput,
  InboundSubmitQcReviewInput,
  InboundSubmitSupervisorReviewInput,
  InboundSuccessPayloadResponse,
  InboundSupplierMasterApi,
  InboundSupplierMasterListParams,
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

function toBackendPage(page?: number): number | undefined {
  if (typeof page !== 'number' || Number.isNaN(page)) return undefined;
  return page;
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
      page: toBackendPage(params.pagination?.current),
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

  syncPurchaseOrdersFromSap: (): ServiceApiType<Record<string, never>> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'inbound-sync-po-from-sap',
    payload: {},
  }),

  syncMasterDataFromSap: (): ServiceApiType<Record<string, never>> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'inbound-sync-master-data-from-sap',
    payload: {},
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

  listItems: (
    params: InboundItemMasterListParams,
  ): ServiceApiType<InboundItemMasterListParams> => ({
    type: 'LIST_QUERY',
    endpoint: 'PROD',
    actionName: 'inbound-list-items',
    payload: params,
  }),

  pageGoodsReceipts: (
    params: InboundGoodsReceiptTableParams,
  ): ServiceApiType<InboundGoodsReceiptSearch> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'inbound-fetch-paging-goods-receipt',
    payload: params.criteria || {},
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: toBackendPage(params.pagination?.current),
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

  saveGoodsReceipt: (
    data: InboundSaveGoodsReceiptInput,
  ): ServiceApiType<InboundSaveGoodsReceiptInput> => ({
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

  submitQcReview: (
    data: InboundSubmitQcReviewInput,
  ): ServiceApiType<InboundSubmitQcReviewInput> => ({
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
      const response = (await singleRequest<InboundPurchaseOrderApi>(
        UpcomingInboundAction.pagePurchaseOrders(params),
      )(requestAction)) as Paging<InboundPurchaseOrderApi>;
      return mapPaging(response, mapInboundPurchaseOrder);
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

    syncPurchaseOrdersFromSap: async (): Promise<
      InboundSuccessPayloadResponse<Record<string, unknown>>
    > => {
      return (await singleRequest<InboundSuccessPayloadResponse<Record<string, unknown>>>(
        UpcomingInboundAction.syncPurchaseOrdersFromSap(),
      )(requestAction)) as InboundSuccessPayloadResponse<Record<string, unknown>>;
    },

    syncMasterDataFromSap: async (): Promise<
      InboundSuccessPayloadResponse<Record<string, unknown>>
    > => {
      return (await singleRequest<InboundSuccessPayloadResponse<Record<string, unknown>>>(
        UpcomingInboundAction.syncMasterDataFromSap(),
      )(requestAction)) as InboundSuccessPayloadResponse<Record<string, unknown>>;
    },

    listSuppliers: async (
      params: InboundSupplierMasterListParams = {},
    ): Promise<InboundSupplierMasterApi[]> => {
      const response = await request<InboundSupplierMasterApi[]>(
        `${PROD_API}/inbound/master-data/suppliers`,
        {
          method: 'POST',
          data: params,
        },
      );
      const suppliersByKey = new Map<string, InboundSupplierMasterApi>();
      extractArrayResponse(response)
        .map(normalizeInboundSupplierMaster)
        .filter((supplier) => supplier.supplier_code || supplier.supplier_name)
        .forEach((supplier) => {
          const key = `${supplier.business_unit || 'ALL'}::${
            supplier.supplier_code || supplier.supplier_name
          }`;
          suppliersByKey.set(key, supplier);
        });

      return Array.from(suppliersByKey.values()).sort((left, right) => {
        const businessUnitCompare = left.business_unit.localeCompare(right.business_unit);
        return businessUnitCompare || left.supplier_name.localeCompare(right.supplier_name);
      });
    },

    listUoms: async (params: InboundUomMasterListParams = {}): Promise<InboundUomMasterApi[]> => {
      const response = await request<InboundUomMasterApi[]>(
        `${PROD_API}/inbound/master-data/uoms`,
        {
          method: 'POST',
          data: params,
        },
      );
      const uomsByKey = new Map<string, InboundUomMasterApi>();
      extractArrayResponse(response)
        .map(normalizeInboundUomMaster)
        .filter((uom) => uom.uom_code)
        .forEach((uom) => {
          const key = `${uom.business_unit || 'ALL'}::${uom.uom_entry ?? ''}::${uom.uom_code.toUpperCase()}`;
          uomsByKey.set(key, uom);
        });

      return Array.from(uomsByKey.values()).sort((left, right) => {
        const businessUnitCompare = left.business_unit.localeCompare(right.business_unit);
        return businessUnitCompare || left.uom_code.localeCompare(right.uom_code);
      });
    },

    listWarehouses: async (
      params: InboundWarehouseMasterListParams = {},
    ): Promise<InboundWarehouseMasterApi[]> => {
      const response = await request<InboundWarehouseMasterApi[]>(
        `${PROD_API}/inbound/master-data/warehouses`,
        {
          method: 'POST',
          data: params,
        },
      );
      const warehousesByKey = new Map<string, InboundWarehouseMasterApi>();
      extractArrayResponse(response)
        .map(normalizeInboundWarehouseMaster)
        .filter((warehouse) => warehouse.warehouse_code)
        .forEach((warehouse) => {
          const key = `${warehouse.business_unit || 'ALL'}::${warehouse.warehouse_code}`;
          warehousesByKey.set(key, warehouse);
        });

      return Array.from(warehousesByKey.values()).sort((left, right) => {
        const businessUnitCompare = left.business_unit.localeCompare(right.business_unit);
        return businessUnitCompare || left.warehouse_code.localeCompare(right.warehouse_code);
      });
    },

    listItems: async (
      params: InboundItemMasterListParams = {},
    ): Promise<InboundItemMasterApi[]> => {
      const response = await request<InboundItemMasterApi[]>(`${PROD_API}/inbound/master-data/items`, {
        method: 'POST',
        data: params,
      });
      const itemsByKey = new Map<string, InboundItemMasterApi>();
      extractArrayResponse(response)
        .map(normalizeInboundItemMaster)
        .filter((item) => item.item_code && item.item_name)
        .forEach((item) => {
          const key = `${item.business_unit || 'ALL'}::${item.item_code}`;
          itemsByKey.set(key, item);
        });

      return Array.from(itemsByKey.values()).sort((left, right) => {
        const businessUnitCompare = left.business_unit.localeCompare(right.business_unit);
        return businessUnitCompare || left.item_code.localeCompare(right.item_code);
      });
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
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.records)) return response.records;
  if (Array.isArray(response?.rows)) return response.rows;
  if (Array.isArray(response?.list)) return response.list;
  if (Array.isArray(response?.payload)) return response.payload;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.content)) return response.data.content;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.result)) return response.data.result;
  if (Array.isArray(response?.data?.records)) return response.data.records;
  if (Array.isArray(response?.data?.rows)) return response.data.rows;
  if (Array.isArray(response?.data?.list)) return response.data.list;
  if (Array.isArray(response?.data?.payload)) return response.data.payload;
  return [];
}

function normalizeInboundUomMaster(value: InboundUomMasterApi | any): InboundUomMasterApi {
  return {
    id: value?.id ?? null,
    business_unit: String(value?.business_unit ?? value?.businessUnit ?? '').trim().toUpperCase(),
    uom_entry: value?.uom_entry ?? value?.uomEntry ?? null,
    uom_code: value?.uom_code ?? value?.uomCode ?? value?.code ?? '',
    uom_name:
      value?.uom_name ?? value?.uomName ?? value?.name ?? value?.uom_code ?? value?.uomCode ?? '',
    status: value?.status ?? 'Active',
  };
}

function normalizeInboundSupplierMaster(
  value: InboundSupplierMasterApi | any,
): InboundSupplierMasterApi {
  const businessUnit = value?.business_unit ?? value?.businessUnit ?? '';
  const supplierCode = value?.supplier_code ?? value?.supplierCode ?? value?.code ?? '';
  const supplierName =
    value?.supplier_name ?? value?.supplierName ?? value?.name ?? supplierCode ?? '';

  return {
    id: value?.id ?? null,
    business_unit: String(businessUnit).trim().toUpperCase(),
    supplier_code: String(supplierCode).trim(),
    supplier_name: String(supplierName).trim(),
    status: value?.status ?? 'Active',
  };
}

function normalizeInboundWarehouseMaster(
  value: InboundWarehouseMasterApi | any,
): InboundWarehouseMasterApi {
  const businessUnit = value?.business_unit ?? value?.businessUnit ?? '';
  const warehouseCode = value?.warehouse_code ?? value?.warehouseCode ?? value?.code ?? '';
  return {
    id: value?.id ?? null,
    business_unit: String(businessUnit).trim().toUpperCase(),
    warehouse_code: String(warehouseCode).trim(),
    warehouse_name:
      value?.warehouse_name ?? value?.warehouseName ?? value?.name ?? warehouseCode ?? '',
    status: value?.status ?? 'Active',
  };
}

function normalizeInboundItemMaster(value: InboundItemMasterApi | any): InboundItemMasterApi {
  const businessUnit = value?.business_unit ?? value?.businessUnit ?? '';
  const itemCode = value?.item_code ?? value?.itemCode ?? value?.code ?? '';
  const itemName = value?.item_name ?? value?.itemName ?? value?.name ?? itemCode ?? '';
  const uom = value?.uom ?? value?.uom_code ?? value?.uomCode ?? '';

  return {
    id: value?.id ?? null,
    business_unit: String(businessUnit).trim().toUpperCase(),
    item_code: String(itemCode).trim(),
    item_name: String(itemName).trim(),
    uom: String(uom).trim(),
    is_active: Boolean(value?.is_active ?? value?.isActive ?? true),
  };
}
