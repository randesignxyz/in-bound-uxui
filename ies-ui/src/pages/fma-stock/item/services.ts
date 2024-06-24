import { CrudBaseServices } from "@/services/CrudBaseSevices"
import { SimpleRequestActions } from "@/services/model"
import { ItemGroupListItem, ItemListItem, SearchParams, StockRequest, StockRequestDetailResponse, StockRequestListItem, StockRequestResponse } from "../request/data.types"
import { execDataService, execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { SavePayLoad } from "@/pages/fma/new-staff/data.types"
import { StartWorkFlowParam } from "@/services/process-workflow/params"
import { ITRequestDetail } from "@/pages/ict/it-request/data.types"
import { Paging } from "@/services/API"
import { ItemList, SaveItemData, SearchItemParams,ItemDetail } from "./data.types"

export const createService = (request: SimpleRequestActions): CrudBaseServices<
    ItemList,
    ItemDetail,
    SearchItemParams &{keyword?:string},
    SaveItemData    
> & {
    // request: (params: StartWorkFlowParam<StockRequest>) =>  Promise<StockRequestResponse>
    // listAllItemGroup: () => Promise<ItemGroupListItem[]>
    // detail: (id: number) => Promise<ItemDetail>
    // fetchItemByProcessInstanceId: (processInstanceId: string) => Promise<ITRequestDetail>
    // fetchItemPaging: (params: FetchPagingParams<SearchParams>) =>  Promise<Paging<ItemListItem>>
    // detailByProcessFlow:(instId: string) => Promise<StockRequestDetailResponse>
} => {
    return {
        fetchPaging: async (params: FetchPagingParams<SearchItemParams &{keyword?:string}>) =>
            fetchDataPagingService<ItemList, FetchPagingParams<SearchItemParams&{keyword?:string}>>({
                actionName: 'fetch-paging-item',
                endpoint: 'FMA',
                payload: params,
                pagination: {
                    page: params.pagination?.current,
                    pageSize: params.pagination?.pageSize
                }
            }).query(request)
        ,
        fetchList: async (params: SearchItemParams) =>
            fetchDataListService<ItemList, SearchItemParams>({
                actionName: 'fetch-list-it-request',
                endpoint: 'ICT',
                payload: params
            }).query(request)
        ,
        fetchItem: async (id: number) =>
            fetchDataItemService<ItemDetail, { id: number }>({
                actionName: 'fetch-item',
                endpoint: 'FMA',
                payload: { id }
            }).query(request)
        ,
        saveItem: async (data: SaveItemData) =>
            execDataService0<SaveItemData>({
                actionName: 'save-item',
                endpoint: 'FMA',
                payload: data
            })(request)
        ,

    }

}