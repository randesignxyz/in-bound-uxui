import { CrudBaseServices1 } from "@/services/CrudBaseSevices";
import { TransferRequestDetail, TransferRequestListItem, TransferRequestSavePayload, TransferRequestSearchParams } from "./data";
import { simpleRequestActions } from "@/services/model";
import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { execDataService, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";

export const createTransferRequestService = (): CrudBaseServices1<
    TransferRequestListItem,
    TransferRequestDetail,
    TransferRequestSearchParams,
    TransferRequestSavePayload
> => {
    const request = simpleRequestActions();

    return {
        fetchPaging: async (params: FetchPagingParams<TransferRequestSearchParams>) =>
            fetchDataPagingService<TransferRequestListItem, FetchPagingParams<TransferRequestSearchParams>>({
                actionName: 'fetch-paging-transfer-request',
                endpoint: 'PROD',
                payload: params,
                pagination: {
                    page: params.pagination?.current,
                    pageSize: params.pagination?.pageSize
                }
            }).query(request)
        ,
        fetchList: async (params: TransferRequestSearchParams) =>
            fetchDataListService<TransferRequestListItem, TransferRequestSearchParams>({
                actionName: 'fetch-list-transfer-request',
                endpoint: 'PROD',
                payload: params
            }).query(request)
        ,
        fetchItem: async (id: number) =>
            fetchDataItemService<TransferRequestDetail, { id: number }>({
                actionName: 'fetch-item-transfer-request',
                endpoint: 'PROD',
                payload: { id }
            }).query(request)
        ,
        saveItem: async (data: TransferRequestSavePayload) =>
            execDataService<{ data: string }, TransferRequestSavePayload>({
                actionName: 'make-staff-transfer-request',
                endpoint: 'PROD',
                payload: data
            })(request)
        ,
        requestAction: request

    }
}