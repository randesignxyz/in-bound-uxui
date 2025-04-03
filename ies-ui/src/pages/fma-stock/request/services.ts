import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { execDataService, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";
import { SimpleRequestActions } from "@/services/model";
import { ItemDetail, ItemGroupListItem, ItemListItem,  SearchParams,  StockRequest, StockRequestDetailResponse, StockRequestListItem, StockRequestResponse, UoMItemList, WarehouseGroup } from "./data.types";
import { StartWorkFlowParam, TaskActionDataParam } from "@/services/process-workflow/params";

export const createService = (request: SimpleRequestActions) => {
    return {  
    submitRequest: async (data: StockRequest) => execDataService<{ formNo: string }, StockRequest>({
            actionName: 'fma-stock-request',
            endpoint: 'FMA',
            payload: data
        })(request) ,    
        // request: (params: StartWorkFlowParam<StockRequest>) => 
        //     execDataService<StockRequestResponse,StartWorkFlowParam<StockRequest>>({
        //         actionName: 'fma-stock-request',
        //         endpoint: 'FMA',
        //         payload: params
        //     })(request),
        fetchPaging: async (params: FetchPagingParams<SearchParams>) =>
            fetchDataPagingService<StockRequestListItem, FetchPagingParams<SearchParams>>({
                actionName: 'fetch-paging-stock-request',
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
      
        detailByProcessFlow: async(instId: string) => fetchDataItemService<StockRequestDetailResponse>({
            actionName: 'detail-by-process-flow',
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
        updatStockRemarks: (params: TaskActionDataParam<{items:{id: number, stockRemarks?: string}[]}>) => 
            execDataService<{message: string,id: number}, TaskActionDataParam<{items:{id: number, stockRemarks?: string}[]}>>({
                actionName: 'update-stock-remarks',
                endpoint: 'FMA',
                payload: params
            })(request),
        listWarehouseGroup: async () => fetchDataListService<WarehouseGroup>({
                actionName: 'fetch-warehouse-groups',
                endpoint: 'FMA',
    
            }).query(request),    
    }
}