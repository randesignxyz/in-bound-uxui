import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Allocate, allocateSearch, DeliveryList, DNList, DNParams, SOList, UpdateRemarkParams } from "./data";
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
    listDn: (so_allocate_id: string[]): ServiceApiType<{ so_allocate_id: string[] }> => ({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'get-dn-by-so',
        payload: { so_allocate_id },
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
        list_dn: (so_allocate_id: string[]) =>
            singleRequest<DNParams>(AllocateAction.listDn(so_allocate_id))(
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

    }
}