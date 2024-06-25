import { CrudBaseServices1 } from "@/services/CrudBaseSevices";
import { simpleRequestActions } from "@/services/model";
import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { execDataService, execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";
import { Item, QuotationDetail, QuotationListItem, QuotationSavePayload, QuotationSearchParams, } from "./data";
import { Paging } from "@/services/API";
import { EmployeeServices } from "@/pages/hrm/services";

export const createQuotationService = (): CrudBaseServices1<
    QuotationListItem,
    QuotationDetail,
    QuotationSearchParams,
    QuotationSavePayload
> & {
    listItemByPr: (ids?: number[], keywords?: string) => Promise<Item[]>
    listServiceByPr: (ids?: number[], keywords?: string) => Promise<Item[]>
    listItemByKeywords: (keywords?: string, fromPrOnly?: boolean) => Promise<Paging<Item>>
    fetchItems: (ids: number[]) => Promise<QuotationDetail[]>
    void: (id: number, remarks: string) => Promise<void>
    select: (id: number, remarks: string) => Promise<void>
    fetchQuotationForPc: (params: FetchPagingParams<QuotationSearchParams>) => Promise<Paging<QuotationListItem>>,
    fetchQuotationForPo: (params: FetchPagingParams<QuotationSearchParams>) => Promise<QuotationListItem[]>,
    getVendorChangedRequired: () => Promise<{ data: number }>,
    postPQ: (id: number) => Promise<void>,
    postPQs: (pcId: number) => Promise<void>
} => {
    const request = simpleRequestActions();

    return ({
        requestAction: request,
        fetchPaging: async (params: FetchPagingParams<QuotationSearchParams>) => {
            const list = await fetchDataPagingService<QuotationListItem, FetchPagingParams<QuotationSearchParams>>({
                actionName: 'fetch-paging-quotation',
                endpoint: 'PRO',
                payload: params,
                pagination: {
                    current: params.pagination?.current,
                    pageSize: params.pagination?.pageSize
                }
            }).query(request)

            try {
                const ids = [...list.items.map(it => it.buyerId), ...list.items.map(it => it.ownerId)].filter(it => it > 0)
                const empList = ids.length == 0 ? [] : await EmployeeServices.listAllByIds(ids).query(request)

                return {
                    ...list, items: list.items.map(it => {
                        const buyer = empList.find(i => it.buyerId == i.id)
                        const owner = empList.find(i => it.ownerId == i.id)
                        return {
                            ...it,
                            buyer: buyer,
                            owner: owner
                        }
                    })
                }
            } catch (error) {
                return list
            }
        },

        fetchList: async (params: QuotationSearchParams) => fetchDataListService<QuotationListItem, QuotationSearchParams>({
            actionName: 'fetch-list-quotation',
            endpoint: 'PRO',
            payload: params
        }).query(request),

        fetchItem: async (id: number) => {
            const rs = await fetchDataItemService<QuotationDetail, { id: number }>({
                actionName: 'fetch-quotation',
                endpoint: 'PRO',
                payload: { id }
            }).query(request)


            try {
                const empList = await EmployeeServices.listAllByIds([rs.buyerId, rs.ownerId]).query(request)

                return {
                    ...rs,
                    owner: empList.find(it => it.id == rs.ownerId),
                    buyer: empList.find(it => it.id == rs.buyerId),
                }
            } catch (error) {
                return rs
            }
        },

        fetchItems: async (ids: number[]) => await fetchDataListService<QuotationDetail, { ids: number[] }>({
            actionName: 'fetch-quotations',
            endpoint: 'PRO',
            payload: { ids }
        }).query(request)
        ,


        saveItem: async (data: QuotationSavePayload) => execDataService<{ data: string }, QuotationSavePayload>({
            actionName: 'create-quotation',
            endpoint: 'PRO',
            payload: data
        })(request),

        listItemByPr: async (ids?: number[], keywords?: string) => fetchDataListService<Item, { ids?: number[]; keywords?: string; }>({
            actionName: 'fetch-pr-items-by-pr-id',
            endpoint: 'PRO',
            payload: { ids, keywords }
        }).query(request),

        listServiceByPr: async (ids?: number[], keywords?: string) => fetchDataListService<Item, { ids?: number[]; keywords?: string; }>({
            actionName: 'fetch-pr-services-by-pr-id',
            endpoint: 'PRO',
            payload: { ids, keywords }
        }).query(request),

        listItemByKeywords: async (keywords?: string, fromPrOnly?: boolean) => fetchDataPagingService<Item, { keywords?: string; fromPrOnly?: boolean }>({
            actionName: 'fetch-item-by-keywords-search',
            endpoint: 'PRO',
            payload: {
                keywords,
                fromPrOnly
            }
        }).query(request),

        void: async (id, remarks) => execDataService0<{ id: Number; remarks: string }>({
            actionName: 'void-quotation',
            endpoint: 'PRO',
            payload: { id, remarks }
        })(request),
        getVendorChangedRequired: () => fetchDataItemService<{ data: number }>({
            actionName: 'get-vendor-changed-required',
            endpoint: 'PRO',

        }).query(request),

        select: async (id, remarks) => execDataService0<{ id: Number; remarks: string }>({
            actionName: 'select-quotation',
            endpoint: 'PRO',
            payload: { id, remarks }
        })(request),


        fetchQuotationForPc: (params: FetchPagingParams<QuotationSearchParams>) => fetchDataPagingService<QuotationListItem, FetchPagingParams<QuotationSearchParams>>({
            actionName: 'fetch-pr-for-pc',
            endpoint: 'PRO',
            payload: {
                keywords: params.keywords,
                criteria: params.criteria,
                pagination: {
                    current: params.pagination?.current,
                    pageSize: params.pagination?.pageSize
                }
            }

        }).query(request),

        fetchQuotationForPo: (params: FetchPagingParams<QuotationSearchParams>) => fetchDataListService<QuotationListItem, FetchPagingParams<QuotationSearchParams>>({
            actionName: 'fetch-pq-for-po',
            endpoint: 'PRO',
            payload: {
                keywords: params.keywords,
                criteria: params.criteria,
            }

        }).query(request),

        postPQ: (id: number) => execDataService0<{ id: number }>({
            actionName: 'post-quotation',
            endpoint: 'PRO',
            payload: { id }
        })(request),

        postPQs: (pcId: number) => execDataService0<{ id: number }>({
            actionName: 'post-quotations-by-pc',
            endpoint: 'PRO',
            payload: { id: pcId }
        })(request)

    })
}