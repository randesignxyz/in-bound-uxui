import { SimpleRequestActions } from "@/services/model";
import { RequestItem, SavePayLoad, SearchParams, StaffProposalDetail, StaffProposalListItem, StaffProposalRequestCancel } from "./data.types";
import { CrudBaseServices } from "@/services/CrudBaseSevices";
import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { execDataService, execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";
import { TaskActionDataParam } from "@/services/process-workflow/params";


export const createService = (request: SimpleRequestActions): CrudBaseServices<
    StaffProposalListItem,
    StaffProposalDetail,
    SearchParams,
    SavePayLoad
> & {
    actionHR: (data: TaskActionDataParam<{ id: number; items: RequestItem[] }>) => Promise<void>,
    findByInstId: (instId: string) => Promise<StaffProposalDetail>,
    cancelRequest: (data: StaffProposalRequestCancel) => Promise<void>
} => {
    return {
        fetchPaging: async (params: FetchPagingParams<SearchParams>) =>
            fetchDataPagingService<StaffProposalListItem, FetchPagingParams<SearchParams>>({
                actionName: 'fetch-paging-staff-proposal-request',
                endpoint: 'HR',
                payload: params,
                pagination: {
                    page: params.pagination?.current,
                    pageSize: params.pagination?.pageSize
                }
            }).query(request)
        ,
        fetchList: async (params: SearchParams) =>
            fetchDataListService<StaffProposalListItem, SearchParams>({
                actionName: 'fetch-list-it-request',
                endpoint: 'HR',
                payload: params
            }).query(request)
        ,
        fetchItem: async (id: number) =>
            fetchDataItemService<StaffProposalDetail, { id: number }>({
                actionName: 'fetch-item-staff-proposal-request',
                endpoint: 'HR',
                payload: { id }
            }).query(request)
        ,
        saveItem: async (data: SavePayLoad) =>
            execDataService<{ data: string }, SavePayLoad>({
                actionName: 'make-staff-proposal-request',
                endpoint: 'HR',
                payload: data
            })(request)
        ,
        findByInstId: async (instId: string) => fetchDataItemService<StaffProposalDetail, { id: string }>({
            actionName: "fetch-item-staff-proposal-request_by_instanceId",
            endpoint: 'HR',
            payload: { id: instId }
        }).query(request),
        actionHR: async (data: TaskActionDataParam<{ id: number; items: RequestItem[] }>) => execDataService0<TaskActionDataParam<{ id: number; items: RequestItem[] }>>({
            actionName: 'action-hr-staff-proposal-request',
            endpoint: 'HR',
            payload: data
        })(request),
        cancelRequest: async (data: StaffProposalRequestCancel) => execDataService0<StaffProposalRequestCancel>({
            actionName: 'staff-proposal-request-cancel',
            endpoint: 'HR',
            payload: data
        })(request),
    }
}
