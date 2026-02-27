import { SimpleRequestActions } from "@/services/model";
import { NewStaffItemDetail, NewStaffListItem, SavePayLoad, SearchParams } from "./data.types";
import { CrudBaseServices } from "@/services/CrudBaseSevices";
import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { execDataService, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";


export const createService = (request: SimpleRequestActions): CrudBaseServices<
    NewStaffListItem,
    NewStaffItemDetail,
    SearchParams,
    SavePayLoad
> & {
    findByInstId: (instId: string) => Promise<NewStaffItemDetail>;
  exportToExcel: (params: {
    fromDate?: string;
    toDate?: string;
    company?: string;
    department?: string;
    status?: string;
    requestedBy?: string;
  }) => Promise<Blob>;
} => {
    return {
        fetchPaging: async (params: FetchPagingParams<SearchParams>) =>
            fetchDataPagingService<NewStaffListItem, FetchPagingParams<SearchParams>>({
                actionName: 'fetch-paging-fma-new-staff-request',
                endpoint: 'HR',
                payload: params,
              pagination:{
                  current: params.pagination?.current,
                  pageSize: params.pagination?.pageSize
              },
            }).query(request)
        ,

        fetchList: async (params: SearchParams) =>
            fetchDataListService<NewStaffListItem, SearchParams>({
                actionName: 'fetch-list-fam-new-staff-request',
                endpoint: 'HR',
                payload: params
            }).query(request)
        ,
        fetchItem: async (id: number) =>
            fetchDataItemService<NewStaffItemDetail, { id: number }>({
                actionName: 'fetch-item-fam-new-staff-request',
                endpoint: 'HR',
                payload: { id }
            }).query(request)
        ,
        saveItem: async (data: SavePayLoad) =>
            execDataService<{data: string}, SavePayLoad>({
                actionName: 'make-fma-new-staff-request',
                endpoint: 'HR',
                payload: data
            })(request)
        ,

        findByInstId: async(instId: string) => fetchDataItemService<NewStaffItemDetail, {id: string}>({
            actionName: "fetch-item-fma-new-staff-request",
            endpoint: 'HR',
            payload: {id: instId}
        }).query(request),
      exportToExcel: async (params: {
        fromDate?: string;
        toDate?: string;
        company?: string;
        department?: string;
        status?: string;
        requestedBy?: string;
      }) => {
        return fetchDataItemService<Blob, typeof params>({
          actionName: 'export-fma-new-staff-request',
          endpoint: 'HR',
          payload: params,
        }).query(request);
      },
    }
}
