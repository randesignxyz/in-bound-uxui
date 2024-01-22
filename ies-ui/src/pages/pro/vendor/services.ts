import { CrudBaseServices1 } from "@/services/CrudBaseSevices";
import { simpleRequestActions } from "@/services/model";
import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { execDataService, execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";
import { VendorDetail, VendorListItem, VendorSavePayload, VendorSearchParams } from "./vendor";
import { List } from "lodash";
import { LookupDataItem } from "@/services/data";
import { ChangeVendorParams } from "../quotation/data";

export const createVendorService = (): CrudBaseServices1<
    VendorListItem,
    VendorDetail,
    VendorSearchParams,
    VendorSavePayload
> & {
    fetchListPaymentGroup: () => Promise<LookupDataItem[]>;
    updateVendor: (data: ChangeVendorParams) => Promise<void>
} => {
    const request = simpleRequestActions();
    return ({
        requestAction: request,
        fetchPaging: async (params: FetchPagingParams<VendorSearchParams>) =>
            fetchDataPagingService<VendorListItem, FetchPagingParams<VendorSearchParams>>({
                actionName: 'fetch-paging-vendor',
                endpoint: 'PRO',
                payload: params
            }).query(request),

        fetchList: async (params: VendorSearchParams) => fetchDataListService<VendorListItem, VendorSearchParams>({
            actionName: 'fetch-list-vendor',
            endpoint: 'PRO',
            payload: params
        }).query(request),

        fetchItem: async (id: number) => fetchDataItemService<VendorDetail, { id: number }>({
            actionName: 'fetch-vendor',
            endpoint: 'PRO',
            payload: { id }
        }).query(request),

        saveItem: async (data: VendorSavePayload) => execDataService<{ data: string }, VendorSavePayload>({
            actionName: 'create-vendor',
            endpoint: 'PRO',
            payload: data
        })(request),

        fetchListPaymentGroup: async () => fetchDataListService<LookupDataItem, {}>({
            actionName: 'fetch-list-payment-group',
            endpoint: 'PRO',
        }).query(request),
        updateVendor: async (data: ChangeVendorParams) => execDataService0<ChangeVendorParams>({
            actionName: 'change-quotation-vendor',
            endpoint: 'PRO',
            payload: data
        })(request)
    })
}