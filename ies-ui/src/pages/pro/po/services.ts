import { CrudBaseServices1, FetchProcessInstance } from "@/services/CrudBaseSevices";
import { simpleRequestActions } from "@/services/model";
import { CompanyAddress, PoItemSearch, PoRequestDetail, PoRequestListItem, PoRequestSavePayload, PoRequestSearchParams } from "./data";
import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { execDataService, execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";
import { RequisitionListItem } from "@/services/pro/data";

export const createPoService = (): CrudBaseServices1<
    PoRequestListItem,
    PoRequestDetail,
    PoRequestSearchParams,
    PoRequestSavePayload
> & {
    listCompanyAddress: () => Promise<CompanyAddress[]>,
    searchPoItem: (searchBy: string, searchOptions: string[], keywords?: string, isService?: boolean, itemIds?: number[], vendorId?: number) => Promise<Page<PoItemSearch>>,
    listPrByQuotation: (param: { quotationId: number; itemId: number }[]) => Promise<RequisitionListItem[]>,
    postPo: (id: number) => Promise<void>

} & FetchProcessInstance<PoRequestDetail> => {
    const request = simpleRequestActions();
    return ({
        requestAction: request,
        fetchPaging: async (params: FetchPagingParams<PoRequestSearchParams>) => fetchDataPagingService<PoRequestListItem, FetchPagingParams<PoRequestSearchParams>>({
            actionName: 'fetch-paging-po-request',
            endpoint: 'PRO',
            payload: params
        }).query(request),

        fetchList: async (params: PoRequestSearchParams) => fetchDataListService<PoRequestListItem, PoRequestSearchParams>({
            actionName: 'fetch-list-po-request',
            endpoint: 'PRO',
            payload: params
        }).query(request),

        fetchItem: async (id: number) => fetchDataItemService<PoRequestDetail, { id: number }>({
            actionName: 'fetch-po-request',
            endpoint: 'PRO',
            payload: { id }
        }).query(request),

        saveItem: async (data: PoRequestSavePayload) => execDataService<{ data: string }, PoRequestSavePayload>({
            actionName: 'make-po-request',
            endpoint: 'PRO',
            payload: data
        })(request),

        listCompanyAddress: async () => fetchDataListService<CompanyAddress, {}>({
            actionName: 'fetch-list-company-address',
            endpoint: 'PRO'
        }).query(request),

        searchPoItem: async (
            searchBy: string,
            searchOptions?: string[],
            keywords?: string,
            isService?: boolean,
            itemIds?: number[],
            vendorId?: number
        ) => fetchDataPagingService<PoItemSearch, {
            searchBy: string;
            keywords?: string;
            searchOptions?: string[];
            isService?: boolean,
            itemIds?: number[],
            vendorId?: number;
        }>({
            actionName: 'search-po-item',
            endpoint: 'PRO',
            payload: {
                searchBy,
                keywords,
                isService,
                itemIds,
                vendorId,
                searchOptions
            }
        }).query(request),

        fetchProcessInstance: async (id: string) => {
            const rs = await fetchDataItemService<PoRequestDetail, { id: string }>({
                actionName: 'fetch-po-request-by-instance-id',
                endpoint: 'PRO',
                payload: { id }
            }).query(request)
            return rs
        },
        listPrByQuotation: (param: { quotationId: number; itemId: number }[]) => fetchDataListService<RequisitionListItem, { items: { quotationId: number; itemId: number }[] }>({
            actionName: 'fetch-linked-by-quotation',
            endpoint: 'PRO',
            payload: {
                items: param
            }
        }).query(request),

        postPo: (id: number) => execDataService0<{ id: number }>({
            actionName: 'post-purchase-order',
            endpoint: 'PRO',
            payload: { id },
        })(request)
    })
}