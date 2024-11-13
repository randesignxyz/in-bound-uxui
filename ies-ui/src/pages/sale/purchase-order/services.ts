import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { PoAdvanceSearchParams, RsmRequestMpuDetail } from "@/services/sale/data";
import { Paging } from "@/services/API";

const MpuActions = {
    list: (
        params: TableViewSearchParams<PoAdvanceSearchParams>,
    ): ServiceApiType<{ searchValue?: string , advanceSearch?: any}> => ({
        type: 'PAGING_QUERY',
        endpoint: 'SALE',
        actionName: 'list-rsm-request-mpu',
        payload: { 
            searchValue: params.criteria?.searchValue ? params.criteria?.searchValue : '',
            advanceSearch: params.criteria?.advanceSearch ? params.criteria?.advanceSearch : '',
        },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current
        }
    }),

    detail: (id: number): ServiceApiType<{ id: number }> => ({
        type: 'FETCH_QUERY',
        endpoint: 'SALE',
        actionName: 'find-rsm-request-mpu',
        // actionName: 'detail-mpu',
        payload: {id}
    }),

    save: (data: RsmRequestMpuDetail) : ServiceApiType<RsmRequestMpuDetail> => ({
        type: 'EXEC',
        endpoint: 'SALE',
        actionName: 'save-mpu-request',
        payload: data,
    }),

    deActivatePo: (id: number) : ServiceApiType<{id: number}> => ({
        type: 'EXEC',
        endpoint: 'SALE',
        actionName: 'de-activate-po',
        payload: {id}
    }),

    forceCloseRequest: (id: number) : ServiceApiType<{id: number}> => ({
        type: 'EXEC',
        endpoint: 'SALE',
        actionName: 'force-close-purchase-order',
        payload: {id}
    })
};

export const MpuServiceApi = (requestActions: RequestActions) => {
    return {
        listMpuRequest: (params: TableViewSearchParams<PoAdvanceSearchParams>) =>
            singleRequest<RsmRequestMpuDetail>(
                MpuActions.list(params))(requestActions) as Promise<
            Paging<RsmRequestMpuDetail>>,

        detailRequest: (id?: number) => 
            singleRequest<RsmRequestMpuDetail>(
                MpuActions.detail(id))(requestActions) as Promise<
            RsmRequestMpuDetail>,

        forceCloseRequest: (id?: number) => singleRequest<RsmRequestMpuDetail>(
            MpuActions.forceCloseRequest(id)
        )(requestActions) as Promise<RsmRequestMpuDetail>,

        deActivatePo: (id?: number) => singleRequest<RsmRequestMpuDetail>(
            MpuActions.deActivatePo(id)
        )(requestActions) as Promise<RsmRequestMpuDetail>,

        save: (params: RsmRequestMpuDetail) => 
            singleRequest<RsmRequestMpuDetail>(
                MpuActions.save(params))(requestActions)
    }
}