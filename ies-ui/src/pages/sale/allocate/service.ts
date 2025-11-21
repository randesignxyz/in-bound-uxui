import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Allocate, allocateSearch, DeliveryList, DNList, DNParams, DnQuickView, LocationList, SkuList, SOAllocateActivities, SOList, UpdateRemarkParams,ListDnDetailParams } from "./data";
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
    listDnDetail: (params:ListDnDetailParams): ServiceApiType<ListDnDetailParams> => ({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'get-dn-detail',
        payload: params,
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
    listDnbyUser: (status?: string,startDate?: string, endDate?: string): ServiceApiType<{ status?: string,startDate?: string, endDate?: string }> => ({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'get-dn-by-user',
        payload: { status, startDate,endDate },
    }),
    fetchDnQuickView: (startDate?: string, endDate?: string): ServiceApiType<{ startDate?: string, endDate?: string }> => ({
        type: 'FETCH_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'get-dn-quick-view',
        payload: { startDate, endDate },
    }),
    listSku: (): ServiceApiType<{}> => ({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'get-list-sku',
        payload: {},
    }),
    listLocation: (type?: string, parent?: string): ServiceApiType<{ type?: string, parent?: string }> => ({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'get-list-location',
        payload: { type, parent },
    }),
    forceClose: (params: UpdateRemarkParams): ServiceApiType<UpdateRemarkParams> => ({
        actionName: 'force-close',
        endpoint: 'DELIVERY',
        type: 'EXEC',
        payload: params,
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
        list_dn_by_user: (status?: string,startDate?: string, endDate?: string) =>
            singleRequest<DNList>(AllocateAction.listDnbyUser(status,startDate,endDate))(
                requestAction
            ),
        fetch_dn_quick_view: (startDate?: string, endDate?: string) =>
            singleRequest<DnQuickView>(AllocateAction.fetchDnQuickView(startDate, endDate))(
                requestAction
            ),
        list_dn_detail: (params:ListDnDetailParams) =>
            singleRequest<DNList>(AllocateAction.listDnDetail(params))(
                requestAction
            ),
        list_sku: () =>
            singleRequest<SkuList>(AllocateAction.listSku())(
                requestAction
            ),
        list_Location: (type?: string, parent?: string) =>
            singleRequest<LocationList>(AllocateAction.listLocation(type, parent))(
                requestAction
            ),
        force_close: (params: UpdateRemarkParams) =>
            singleRequest<{ data: string; message: string }>(AllocateAction.forceClose(params))(
                requestAction
            ),
    }
}