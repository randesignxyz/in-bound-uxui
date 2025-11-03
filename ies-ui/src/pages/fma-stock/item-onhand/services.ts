import { CrudBaseServices, CrudBaseServices1 } from "@/services/CrudBaseSevices"
import { SimpleRequestActions } from "@/services/model"
import { execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingRefNoService, fetchDataPagingService } from "@/services/apiGateway"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import {  SaveItemData, SearchItemParams,ItemDetail,  ItemOnHandList } from "./data.types"

export const createService = (request: SimpleRequestActions): CrudBaseServices<
    ItemOnHandList,
    ItemDetail,
    SearchItemParams &{keyword?:string},
    SaveItemData    
> & {
    // fetchUoMList:()=> Promise<UoM[]>
    syncItemOnHand:()=> Promise<any>
} => {
    return {
        fetchPaging: async (params: FetchPagingParams<SearchItemParams &{keyword?:string}>) =>
            fetchDataPagingRefNoService<ItemOnHandList, FetchPagingParams<SearchItemParams&{keyword?:string}>>({
                actionName: 'fetch-paging-item-on-hand',
                endpoint: 'FMA',
                payload: params,
                pagination: {
                    refNo: params.pagination?.refNo,
                    page: params.pagination?.current,
                    pageSize: params.pagination?.pageSize
                }
            }).query(request)
        ,
        fetchList: async (params: SearchItemParams) =>
            fetchDataListService<ItemOnHandList, SearchItemParams>({
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
        syncItemOnHand: async()=>
             execDataService0<SaveItemData>({
                actionName: 'sync-item-on-hand',
                endpoint: 'FMA',
                // payload: {}
            })(request)
        // fetchUoMList: async () =>
        //     fetchDataListService<any, UoM>({
        //         actionName: 'fetch-uom',
        //         endpoint: 'FMA',
        //         // payload: {}
        //     }).query(request)
        // ,

    }

}