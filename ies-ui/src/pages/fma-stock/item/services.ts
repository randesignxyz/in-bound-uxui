import { CrudBaseServices } from "@/services/CrudBaseSevices"
import { SimpleRequestActions } from "@/services/model"
import { execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { ItemList, SaveItemData, SearchItemParams,ItemDetail, UoM } from "./data.types"

export const createService = (request: SimpleRequestActions): CrudBaseServices<
    ItemList,
    ItemDetail,
    SearchItemParams &{keyword?:string},
    SaveItemData    
> & {
    fetchUoMList:()=> Promise<UoM[]>
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
        fetchUoMList: async () =>
            fetchDataListService<any, UoM>({
                actionName: 'fetch-uom',
                endpoint: 'FMA',
                // payload: {}
            }).query(request)
        ,

    }

}