import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Allocate, allocateSearch, DeliveryList, DNList, DNParams, SOAllocateActivities, SOList, UpdateRemarkParams } from "./data";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";

const AllocateAction = {
    page: (
        params: TableViewSearchParams<allocateSearch>,
    ): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'page-allocate',
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
        },
    }),
    pageSO: (
        params: TableViewSearchParams<allocateSearch>,
    ): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'page-allocate-so',
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
        },
    }),
    listDn: (so_allocate_id: string[], docNum?: string): ServiceApiType<{ so_allocate_id: string[], docNum?: string }> => ({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'get-dn-by-so',
        payload: { so_allocate_id, docNum },
    }),
    updateRemark: (params: UpdateRemarkParams): ServiceApiType<UpdateRemarkParams> => ({
        actionName: 'update-remark',
        endpoint: 'DELIVERY',
        type: 'EXEC',
        payload: params,
    }),
    pageDN: (
        params: TableViewSearchParams<allocateSearch>,
    ): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'page-allocate-dn',
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
        },
    }),
    syncAllocate: (): ServiceApiType<{}> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'sync-allocate',
        payload: {}
    }),
    claimDn: (sales_planid: number, claimed_by?: string, action?: string, activities_name?: string): ServiceApiType<{ sales_planid: number, claimed_by?: string, action?: string, activities_name?: string }> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'claim-dn',
        payload: { sales_planid, claimed_by, action, activities_name }
    }),
    getActivities: (dnID: number): ServiceApiType<{ dnID: number }> => ({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'get-activities-by-dn',
        payload: { dnID },
    }),
    listDnbyUser: (status?:string): ServiceApiType<{ status?:string }> => ({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'get-dn-by-user',
        payload: {status },
    }),
}

export const AllocateServiceAPI = (requestAction: RequestActions) => {
    return {
        page: (params: TableViewSearchParams<allocateSearch>) =>
            singleRequest<Allocate>(AllocateAction.page(params))(requestAction) as Promise<
                Paging<Allocate>
            >,
        pageSO: (params: TableViewSearchParams<allocateSearch>) =>
            singleRequest<SOList>(AllocateAction.pageSO(params))(requestAction) as Promise<
                Paging<SOList>
            >,
        list_dn: (so_allocate_id: string[], docNum?: string) =>
            singleRequest<DNParams>(AllocateAction.listDn(so_allocate_id, docNum))(
                requestAction
            ),
        updateRemark: (params: UpdateRemarkParams) =>
            singleRequest<{ data: string; message: string }>(AllocateAction.updateRemark(params))(
                requestAction
            ),
        pageDN: (params: TableViewSearchParams<allocateSearch>) =>
            singleRequest<DNList>(AllocateAction.pageDN(params))(requestAction) as Promise<
                Paging<DNList>
            >,
        syncAllocate: () =>
            singleRequest<{ data: string, message: string }>(AllocateAction.syncAllocate())(requestAction),

        ClaimDn: (sales_planid: number, claimed_by?: string, action?: string, activities_name?: string) =>
            singleRequest<{ data: string, message: string }>(AllocateAction.claimDn(sales_planid, claimed_by, action, activities_name))(requestAction),

        getActivities: (dnID: number) =>
            singleRequest<SOAllocateActivities>(AllocateAction.getActivities(dnID))(
                requestAction
            ),
        list_dn_by_user: (status?:string) =>
            singleRequest<DNList>(AllocateAction.listDnbyUser(status))(
                requestAction
            ),

    }
}