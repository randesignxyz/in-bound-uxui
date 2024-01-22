import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { execDataService, execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";
import { CrudBaseServices } from "@/services/CrudBaseSevices";
import { LookupDataItem, LookupDataItem4 } from "@/services/data";
import { SimpleRequestActions } from "@/services/model";
import { ItRequestCategory, ItRequestData, ITRequestDetail, ItRequestItem, ITRequestListItem, SavePayLoad, SearchParams } from "./data.types";

export const createService = (request: SimpleRequestActions): CrudBaseServices<
    ITRequestListItem,
    ITRequestDetail,
    SearchParams,
    SavePayLoad
> & {
    listCategory: () => Promise<ItRequestCategory[]>
    listItem: () => Promise<ItRequestItem[]>
    fetchItemByProcessInstanceId: (processInstanceId: string) => Promise<ITRequestDetail>
    listItemByCategory: (categoryId: number) => Promise<LookupDataItem[]>
    listItemByCategories: (categoryId: number[]) => Promise<LookupDataItem4[]>
    listCCTVLocation: () => Promise<LookupDataItem[]>
    submitRequest: (data: ItRequestData) => Promise<{ formNo: string }>
} => {

    return {
        fetchPaging: async (params: FetchPagingParams<SearchParams>) =>
            fetchDataPagingService<ITRequestListItem, FetchPagingParams<SearchParams>>({
                actionName: 'fetch-paging-it-request',
                endpoint: 'ICT',
                payload: params,
                pagination: {
                    page: params.pagination?.current,
                    pageSize: params.pagination?.pageSize
                }
            }).query(request)
        ,

        fetchList: async (params: SearchParams) =>
            fetchDataListService<ITRequestListItem, SearchParams>({
                actionName: 'fetch-list-it-request',
                endpoint: 'ICT',
                payload: params
            }).query(request)
        ,
        fetchItemByProcessInstanceId: async (processInstanceId: string) =>
            fetchDataItemService<ITRequestDetail, { id: string }>({
                actionName: 'fetch-item-it-request-by-pro-instance-id',
                endpoint: 'ICT',
                payload: { id: processInstanceId }
            }).query(request)
        ,
        fetchItem: async (id: number) =>
            fetchDataItemService<ITRequestDetail, { id: number }>({
                actionName: 'fetch-item-it-request',
                endpoint: 'ICT',
                payload: { id }
            }).query(request)
        ,
        saveItem: async (data: SavePayLoad) =>
            execDataService0<SavePayLoad>({
                actionName: 'save-it-request',
                endpoint: 'ICT',
                payload: data
            })(request)
        ,

        listCategory: async () => fetchDataListService<ItRequestCategory>({
            actionName: 'list-all-it-request-category',
            endpoint: 'ICT',

        }).query(request),

        listItem: async () => fetchDataListService<ItRequestItem>({
            actionName: 'list-all-it-request_item',
            endpoint: 'ICT',

        }).query(request),


        listItemByCategory: async (categoryId) => fetchDataListService<LookupDataItem, { id: number }>({
            actionName: 'list-all-it-request_item_by_category',
            endpoint: 'ICT',
            payload: { id: categoryId }
        }).query(request),

        listItemByCategories: async (categoryIds) => fetchDataListService<LookupDataItem, { ids: number[] }>({
            actionName: 'list-all-it-request_item_by_categories',
            endpoint: 'ICT',
            payload: { ids: categoryIds }
        }).query(request),

        listCCTVLocation: async () => fetchDataListService<LookupDataItem>({
            actionName: 'list-all-it-request-cctv-location',
            endpoint: 'ICT',
        }).query(request),

        submitRequest: async (data: ItRequestData) => execDataService<{ formNo: string }, ItRequestData>({
            actionName: 'start-it-request',
            endpoint: 'ICT',
            payload: data
        })(request)

    }
}