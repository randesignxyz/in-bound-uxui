import { CrudBaseServices1, FetchProcessInstance } from "@/services/CrudBaseSevices";
import { PriceComparisonDetail, PriceComparisonItemRs, PriceComparisonListItem, PriceComparisonSavePayload, PriceComparisonSearchParams } from "./data";
import { simpleRequestActions } from "@/services/model";
import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { execDataService, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";
import { Paging } from "@/services/API";

export const createPriceComparisonService = (): CrudBaseServices1<
    PriceComparisonListItem,
    PriceComparisonDetail,
    PriceComparisonSearchParams,
    PriceComparisonSavePayload
> & {
    searchItems: (params: FetchPagingParams<PriceComparisonSearchParams>) => Promise<Paging<PriceComparisonItemRs>>
} & FetchProcessInstance<PriceComparisonDetail> => {
    const request = simpleRequestActions();
    return {
        requestAction: request,
        fetchPaging: async (params: FetchPagingParams<PriceComparisonSearchParams>) => {
            const rs = await fetchDataPagingService<PriceComparisonListItem, FetchPagingParams<PriceComparisonSearchParams>>({
                actionName: 'fetch-paging-price-comparison',
                endpoint: 'PRO',
                payload: params,
                pagination: params.pagination
            }).query(request)

            return rs
        },

        fetchList: async (params: PriceComparisonSearchParams) => fetchDataListService<PriceComparisonListItem, PriceComparisonSearchParams>({
            actionName: 'fetch-list-price-comparison',
            endpoint: 'PRO',
            payload: params
        }).query(request),

        fetchItem: async (id: number) => {
            const rs = await fetchDataItemService<PriceComparisonDetail, { id: number }>({
                actionName: 'fetch-price-comparison',
                endpoint: 'PRO',
                payload: { id }
            }).query(request)
            return rs
        },

        fetchProcessInstance: async (id: string) => {
            const rs = await fetchDataItemService<PriceComparisonDetail, { id: string }>({
                actionName: 'fetch-price-comparison-by-instance-id',
                endpoint: 'PRO',
                payload: { id }
            }).query(request)
            return rs
        },
        saveItem: async (data: PriceComparisonSavePayload) => execDataService<{ data: string }, PriceComparisonSavePayload>({
            actionName: 'request-price-comparison',
            endpoint: 'PRO',
            payload: data
        })(request),

        searchItems: async (params: FetchPagingParams<PriceComparisonSearchParams>) => {
            const rs = await fetchDataPagingService<PriceComparisonItemRs, { keywords?: string, isService?: boolean, type: string }>({
                actionName: 'search-price-compare-item',
                endpoint: 'PRO',
                payload: {
                    keywords: params.criteria?.keyword,
                    isService: params.criteria?.isService,
                    type: params.criteria?.type!!
                },
                pagination: params.pagination
            }).query(request)

            return rs
        },

    }
}