// import { CrudBaseServices1 } from "@/services/CrudBaseSevices";
// import { TransferRequestDetail, TransferRequestListItem, TransferRequestSavePayload, TransferRequestSearchParams } from "./data";
// import { simpleRequestActions } from "@/services/model";
// import { FetchPagingParams } from "@/components/DataCrud/TableView";
// import { execDataService, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";

import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import {
  ActivitiesItem,
  AddSupplierParams,
  BomItem,
  BomItemSearch,
  GetCount,
  GetToExcelParams,
  Item,
  ItemGroup,
  ItemSearch,
  ProductionLine,
  Provided,
  ProvidedItem,
  ProvidedList,
  SAPTransferRequest,
  Supplier,
  SupplierSearch,
  TotalProvideParams,
  TransferRequest,
  TransferRequestCreate,
  TransferRequestSearch,
  TransferRequestStatusChange,
  Warehouse,
  WarehouseSearch,
  closeParams,
} from './data';

// export const createTransferRequestService = (): CrudBaseServices1<
//     TransferRequestListItem,
//     TransferRequestDetail,
//     TransferRequestSearchParams,
//     TransferRequestSavePayload
// > => {
//     const request = simpleRequestActions();

//     return {
//         fetchPaging: async (params: FetchPagingParams<TransferRequestSearchParams>) =>
//             fetchDataPagingService<TransferRequestListItem, FetchPagingParams<TransferRequestSearchParams>>({
//                 actionName: 'fetch-paging-transfer-request',
//                 endpoint: 'PROD',
//                 payload: params,
//                 pagination: {
//                     page: params.pagination?.current,
//                     pageSize: params.pagination?.pageSize
//                 }
//             }).query(request)
//         ,
//         fetchList: async (params: TransferRequestSearchParams) =>
//             fetchDataListService<TransferRequestListItem, TransferRequestSearchParams>({
//                 actionName: 'fetch-list-transfer-request',
//                 endpoint: 'PROD',
//                 payload: params
//             }).query(request)
//         ,
//         fetchItem: async (id: number) =>
//             fetchDataItemService<TransferRequestDetail, { id: number }>({
//                 actionName: 'fetch-item-transfer-request',
//                 endpoint: 'PROD',
//                 payload: { id }
//             }).query(request)
//         ,
//         saveItem: async (data: TransferRequestSavePayload) =>
//             execDataService<{ data: string }, TransferRequestSavePayload>({
//                 actionName: 'make-staff-transfer-request',
//                 endpoint: 'PROD',
//                 payload: data
//             })(request)
//         ,
//         requestAction: request

//     }
// }

const TransferRequestAction = {
  page: (
    params: TableViewSearchParams<TransferRequestSearch>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'fetch-paging-transfer-request',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
  page_warehouse: (
    params: TableViewSearchParams<TransferRequestSearch>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'page_warehouse_request',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  save: (data: TransferRequestCreate): ServiceApiType<TransferRequestCreate> => ({
    actionName: 'save-transfer-request',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data,
  }),
  save_activities: (data: ActivitiesItem): ServiceApiType<ActivitiesItem> => ({
    actionName: 'save-activities',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data,
  }),

  status_change: (
    data: TransferRequestStatusChange,
  ): ServiceApiType<TransferRequestStatusChange> => ({
    actionName: 'transfer-request-status-change',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data,
  }),

  detail: (id: string): ServiceApiType<{ id: string }> => ({
    actionName: 'detail-transfer-request',
    endpoint: 'PROD',
    type: 'FETCH_QUERY',
    payload: { id },
  }),

  get_count: (data: GetCount): ServiceApiType<GetCount> => ({
    actionName: 'get-count-transfer-request',
    endpoint: 'PROD',
    type: 'LIST_QUERY',
    payload: data,
  }),
  provided: (data: Provided): ServiceApiType<Provided> => ({
    actionName: 'save-provided',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data,
  }),
  get_to_excel: (data: GetToExcelParams): ServiceApiType<GetToExcelParams> => ({
    actionName: 'get-save-to-excel',
    endpoint: 'PROD',
    type: 'LIST_QUERY',
    payload: data,
  }),
  save_to_sap: (data: SAPTransferRequest): ServiceApiType<SAPTransferRequest> => ({
    actionName: 'save-transfer-to-sap',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data
  }),
  get_total_provide: (data: TotalProvideParams): ServiceApiType<TotalProvideParams> => ({
    actionName: 'get-total-provide',
    endpoint: 'PROD',
    type: 'LIST_QUERY',
    payload: data
  }),
  get_provided_list: (transfer_request_id: string): ServiceApiType<{ transfer_request_id: string }> => ({
    actionName: 'get-provide-list',
    endpoint: 'PROD',
    type: 'LIST_QUERY',
    payload: { transfer_request_id },
  }),
  get_provided_item: (provided: string): ServiceApiType<{ provided: string }> => ({
    actionName: 'get-provide',
    endpoint: 'PROD',
    type: 'LIST_QUERY',
    payload: { provided }
  }),
  close_transfer: (data: closeParams): ServiceApiType<closeParams> => ({
    actionName: 'close-transfer',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data
  }),
  get_line: (): ServiceApiType<{}> => ({
    actionName: 'get-line',
    endpoint: 'PROD',
    type: 'LIST_QUERY',
    payload: {},
  })
};

export const TransferRequestServiceAPI = (requestAction: RequestActions) => {
  return {
    page: (params: TableViewSearchParams<TransferRequestSearch>) =>
      singleRequest<TransferRequest>(TransferRequestAction.page(params))(requestAction) as Promise<
        Paging<TransferRequest>
      >,
    page_warehouse: (params: TableViewSearchParams<TransferRequestSearch>) =>
      singleRequest<TransferRequest>(TransferRequestAction.page_warehouse(params))(
        requestAction,
      ) as Promise<Paging<TransferRequest>>,
    save: (data: TransferRequestCreate) =>
      singleRequest<{ data: string; message: string }>(TransferRequestAction.save(data))(
        requestAction,
      ),
    status_change: (data: TransferRequestStatusChange) =>
      singleRequest<{ data: string; message: string }>(TransferRequestAction.status_change(data))(
        requestAction,
      ),
    detail: (id: string) =>
      singleRequest<TransferRequest>(TransferRequestAction.detail(id))(
        requestAction,
      ) as Promise<TransferRequest>,
    get_count: (data: GetCount) =>
      singleRequest<{ data: string; message: string }>(TransferRequestAction.get_count(data))(
        requestAction,
      ),
    save_activites: (data: ActivitiesItem) =>
      singleRequest<{ data: string; message: string }>(TransferRequestAction.save_activities(data))(
        requestAction,
      ),
    provided: (data: Provided) =>
      singleRequest<{ data: string; message: string }>(TransferRequestAction.provided(data))(
        requestAction,
      ),
    get_to_excel: (data: GetToExcelParams) =>
      singleRequest<TransferRequest>(TransferRequestAction.get_to_excel(data))(
        requestAction,
      ) as Promise<TransferRequest>,
    save_to_sap: (data: SAPTransferRequest) =>
      singleRequest<{ data: string; message: string }>(TransferRequestAction.save_to_sap(data))(
        requestAction,
      ),
    get_total_provide: (data: TotalProvideParams) =>
      singleRequest<{ data: string; message: string }>(TransferRequestAction.get_total_provide(data))(
        requestAction,
      ),
    get_provided_list: (transfer_request_id: string) =>
      singleRequest<ProvidedList>(TransferRequestAction.get_provided_list(transfer_request_id))(
        requestAction
      ),
    get_provided_item: (provided: string) =>
      singleRequest<ProvidedItem>(TransferRequestAction.get_provided_item(provided))(
        requestAction
      ),
    close_transfer: (data: closeParams) =>
      singleRequest<{ data: string; message: string }>(TransferRequestAction.close_transfer(data))(
        requestAction,
      ),
    get_line: () => singleRequest<ProductionLine>(TransferRequestAction.get_line())(
      requestAction
    ),

  };
};

const ItemAction = {
  page: (params: TableViewSearchParams<ItemSearch>): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'fetch-paging-item',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
  listItemGroup: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'PROD',
    actionName: 'list-item-group',
    responseKey: '',
    payload: null,
  }),
  detail: (id: number): ServiceApiType<{ id: number }> => ({
    actionName: 'detail-item',
    endpoint: 'PROD',
    type: 'FETCH_QUERY',
    payload: { id },
  }),
  page_bom: (
    params: TableViewSearchParams<BomItemSearch>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'fetch-paging-bom-item',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
  listChildItem: (
    father: string,
    tendency: string,
  ): ServiceApiType<{ father: string; tendency: string }> => ({
    type: 'LIST_QUERY',
    endpoint: 'PROD',
    actionName: 'list-sub-item',
    responseKey: '',
    payload: { father, tendency },
  }),
  detailByCode: (
    father: string,
    code: string,
    tendency: string,
  ): ServiceApiType<{ father: string; code: string; tendency: string }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'PROD',
    actionName: 'detail-item-by-code',
    payload: { father, code, tendency },
  }),
  page_supplier: (
    params: TableViewSearchParams<SupplierSearch>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'fetch-paging-supplier',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
  add_supplier: (data: AddSupplierParams): ServiceApiType<AddSupplierParams> => ({
    actionName: 'add-supplier',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data,
  }),
};

export const ItemServiceAPI = (requestAction: RequestActions) => {
  return {
    page: (params: TableViewSearchParams<ItemSearch>) =>
      singleRequest<Item>(ItemAction.page(params))(requestAction) as Promise<Paging<Item>>,
    listItemGroup: () =>
      singleRequest<ItemGroup>(ItemAction.listItemGroup())(requestAction) as Promise<ItemGroup[]>,
    detail: (id: number) =>
      singleRequest<Item>(ItemAction.detail(id))(requestAction) as Promise<Item>,
    page_bom: (params: TableViewSearchParams<BomItemSearch>) =>
      singleRequest<BomItem>(ItemAction.page_bom(params))(requestAction) as Promise<
        Paging<BomItem>
      >,
    listChildItem: (father: string, tendency?: string) =>
      singleRequest<Item[]>(ItemAction.listChildItem(father, tendency || ''))(
        requestAction,
      ) as Promise<Item[]>,
    detailByCode: (father: string, code: string, tendency: string) =>
      singleRequest<Item>(ItemAction.detailByCode(father, code, tendency))(
        requestAction,
      ) as Promise<Item>,
    page_supplier: (params: TableViewSearchParams<SupplierSearch>) =>
      singleRequest<Supplier>(ItemAction.page_supplier(params))(requestAction) as Promise<
        Paging<Supplier>
      >,
    add_supplier: (data: AddSupplierParams) =>
      singleRequest<{ data: string; message: string }>(ItemAction.add_supplier(data))(
        requestAction,
      ),
  };
};

const WarehouseAction = {
  page: (
    params: TableViewSearchParams<WarehouseSearch>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'fetch-warehouse-list',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
  detail: (id: number): ServiceApiType<{ id: number }> => ({
    actionName: 'detail-warehouse',
    endpoint: 'PROD',
    type: 'FETCH_QUERY',
    payload: { id },
  }),
};

export const WarehouseServiceAPI = (requestAction: RequestActions) => {
  return {
    page: (params: TableViewSearchParams<WarehouseSearch>) =>
      singleRequest<Warehouse>(WarehouseAction.page(params))(requestAction) as Promise<
        Paging<Warehouse>
      >,
    detail: (id: number) =>
      singleRequest<Warehouse>(WarehouseAction.detail(id))(requestAction) as Promise<Warehouse>,
  };
};
