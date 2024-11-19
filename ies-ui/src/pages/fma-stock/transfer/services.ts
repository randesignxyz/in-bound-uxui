import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { execDataService, execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";
import { SimpleRequestActions } from "@/services/model";
import { EmpWarehouseList, ItemDetail, ItemGroupListItem, ItemListItem,  SearchParams,  TransferRequest, TransferRequestDetailResponse, TransferRequestListItem, TransferRequestResponse, UoMItemList } from "./data.types";
import { StartWorkFlowParam, TaskActionDataParam } from "@/services/process-workflow/params";

export const createService = (request: SimpleRequestActions) => {
    return {       
        request: (params: StartWorkFlowParam<TransferRequest>) => 
            execDataService<TransferRequestResponse,StartWorkFlowParam<TransferRequest>>({
                actionName: 'whm-transfer-request',
                endpoint: 'FMA',
                payload: params
            })(request),
        fetchPaging: async (params: FetchPagingParams<SearchParams>) =>
            fetchDataPagingService<TransferRequestListItem, FetchPagingParams<SearchParams>>({
                actionName: 'fetch-paging-transfer-request',
                endpoint: 'FMA',
                payload: params,
                pagination: {
                    page: params.pagination?.current,
                    pageSize: params.pagination?.pageSize
                }
            }).query(request)
        ,
        detail: async (id: number) => fetchDataItemService<ItemDetail>({
            actionName: 'fetch-item-detail',
            endpoint: 'FMA',
            payload: {id}
        }).query(request)
        ,
        listAllItemGroup: async () => fetchDataListService<ItemGroupListItem>({
            actionName: 'list-all-item-group',
            endpoint: 'FMA',

        }).query(request),
        listAllIUoMtem: async () => fetchDataListService<UoMItemList>({
            actionName: 'fetch-uom-item',
            endpoint: 'FMA',

        }).query(request),
      
        detailByProcessFlow: async(instId: string) => fetchDataItemService<TransferRequestDetailResponse>({
            actionName: 'transfer-request-detail-by-process-flow',
            endpoint: 'FMA',
            payload: {id:instId}
        }).query(request),
        fetchItemPaging: async (params: FetchPagingParams<SearchParams>) =>
            fetchDataPagingService<ItemListItem, FetchPagingParams<SearchParams>>({
                actionName: 'fetch-paging-stock-item',
                endpoint: 'FMA',
                payload: params,
                pagination: {
                    page: params.pagination?.current,
                    pageSize: params.pagination?.pageSize
                }
            }).query(request)
        ,
        updatTransferRequestRemarks: (params: TaskActionDataParam<{items:{id: number, stockRemarks?: string}[]}>  & {processInstId: string}) => 
            execDataService<{message: string,id: number}, TaskActionDataParam<{items:{id: number, stockRemarks?: string}[]}>>({
                actionName: 'update-transfer-request-remarks',
                endpoint: 'FMA',
                payload: params
            })(request),
        listEmpWarehouse: async () => fetchDataListService<EmpWarehouseList>({
            actionName: 'fetch-warehouse-emp-no',
            endpoint: 'FMA',

        }).query(request),   
        listEmpWarehouseFrom: async (id: number) => fetchDataListService<EmpWarehouseList>({
            actionName: 'fetch-warehouse-from-by-emp-no',
            endpoint: 'FMA',
            payload: {id}
        }).query(request),    
        postInventoryTransfer:(id: number)=>
            execDataService0<{id: number}>({
                actionName: 'post-inventory-transfer-to-sap',
                endpoint: 'FMA',
                payload: {id}
            })(request),
    }
}