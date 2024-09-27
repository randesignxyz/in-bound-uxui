import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { execDataService, execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";
import { SimpleRequestActions } from "@/services/model";
import { EmpWarehouseList, ItemDetail, ItemGroupListItem, ItemListItem,  SearchParams,  AdjRequest, AdjRequestDetailResponse, AdjRequestListItem, AdjRequestResponse, UoMItemList, SearchLookupParams, LookupData, AdjRequestItemPayload } from "./data.types";
import { StartWorkFlowParam, TaskActionDataParam } from "@/services/process-workflow/params";

export const createService = (request: SimpleRequestActions) => {
    return {       
        request: (params: StartWorkFlowParam<AdjRequest>) => 
            execDataService<AdjRequestResponse,StartWorkFlowParam<AdjRequest>>({
                actionName: 'whm-inventory-adj-request',
                endpoint: 'FMA',
                payload: params
            })(request),
        updateAdj: (params: TaskActionDataParam<{items:AdjRequestItemPayload[]}> & {processInstId: string, warehouseFrom?: string}) => 
                execDataService<any,TaskActionDataParam<{items:AdjRequestItemPayload[]}> & {processInstId: string, warehouseFrom?: string}>({
                    actionName: 'whm-inventory-update-adj-request',
                    endpoint: 'FMA',
                    payload: params
                })(request),    
        fetchPaging: async (params: FetchPagingParams<SearchParams>) =>
            fetchDataPagingService<AdjRequestListItem, FetchPagingParams<SearchParams>>({
                actionName: 'fetch-paging-adj-request',
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
      
        detailByProcessFlow: async(instId: string) => fetchDataItemService<AdjRequestDetailResponse>({
            actionName: 'adj-request-detail-by-process-flow',
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
        // updatTransferRequestRemarks: (params: TaskActionDataParam<{items:{id: number, stockRemarks?: string}[]}>  & {processInstId: string}) => 
        //     execDataService<{message: string,id: number}, TaskActionDataParam<{items:{id: number, stockRemarks?: string}[]}>>({
        //         actionName: 'update-transfer-request-remarks',
        //         endpoint: 'FMA',
        //         payload: params
        //     })(request),
        // listEmpWarehouse: async () => fetchDataListService<EmpWarehouseList>({
        //     actionName: 'fetch-warehouse-emp-no',
        //     endpoint: 'FMA',

        // }).query(request),   
        // listEmpWarehouseFrom: async (id: number) => fetchDataListService<EmpWarehouseList>({
        //     actionName: 'fetch-warehouse-from-by-emp-no',
        //     endpoint: 'FMA',
        //     payload: {id}
        // }).query(request),    
        // postInventoryTransfer:(id: number)=>
        //     execDataService0<{id: number}>({
        //         actionName: 'post-inventory-transfer-to-sap',
        //         endpoint: 'FMA',
        //         payload: {id}
        //     })(request),
        listLookupData: async (params: SearchLookupParams) => fetchDataListService<LookupData>({
            actionName: 'look-up-data',
            endpoint: 'FMA',
            payload: params
        }).query(request),        
    }
}