import { SimpleRequestActions } from "@/services/model";
import { HiringFunctionSaveParams, ItemSupportSaveParams, NewStaffItemDetail, NewStaffListItem, SavePayLoad, SearchParams } from "./data.types";
import { CrudBaseServices } from "@/services/CrudBaseSevices";
import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { execDataService, execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";
import { TaskActionDataParam } from "@/services/process-workflow/params";


export const createService = (request: SimpleRequestActions): CrudBaseServices<
    NewStaffListItem,
    NewStaffItemDetail,
    SearchParams,
    SavePayLoad
> & {
    findByInstId: (instId: string) => Promise<NewStaffItemDetail>
    // actionItSupport: (data: TaskActionDataParam<ItemSupportSaveParams>) => Promise<void>
    actionReviewItemFunction: (data: TaskActionDataParam<HiringFunctionSaveParams>) => Promise<void>
} => {
    return {
        fetchPaging: async (params: FetchPagingParams<SearchParams>) =>
            fetchDataPagingService<NewStaffListItem, FetchPagingParams<SearchParams>>({
                actionName: 'fetch-paging-it-new-staff-request',
                endpoint: 'ICT',
                payload: params
            }).query(request)
        ,

        fetchList: async (params: SearchParams) =>
            fetchDataListService<NewStaffListItem, SearchParams>({
                actionName: 'fetch-list-it-request',
                endpoint: 'ICT',
                payload: params
            }).query(request)
        ,
        fetchItem: async (id: number) =>
            fetchDataItemService<NewStaffItemDetail, { id: number }>({
                actionName: 'fetch-item-it-request',
                endpoint: 'ICT',
                payload: { id }
            }).query(request)
        ,
        saveItem: async (data: SavePayLoad) =>
            execDataService<{ data: string }, SavePayLoad>({
                actionName: 'make-it-new-staff-request',
                endpoint: 'ICT',
                payload: data
            })(request)
        ,
        findByInstId: async (instId: string) => fetchDataItemService<NewStaffItemDetail, { id: string }>({
            actionName: "fetch-item-it-new-staff-request",
            endpoint: 'ICT',
            payload: { id: instId }
        }).query(request),

        // actionItSupport: async (data: TaskActionDataParam<ItemSupportSaveParams>) => execDataService0<TaskActionDataParam<ItemSupportSaveParams>>({
        //     actionName: 'action-it-support',
        //     endpoint: 'ICT',
        //     payload: data
        // })(request),

        actionReviewItemFunction: async (data: TaskActionDataParam<HiringFunctionSaveParams>) => execDataService0<TaskActionDataParam<HiringFunctionSaveParams>>({
            actionName: 'action-review-item-function',
            endpoint: 'ICT',
            payload: data
        })(request)
    }
}