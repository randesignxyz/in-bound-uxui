import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { NewStaffListItem, SavePayLoad, SearchParams } from "@/pages/fma/new-staff/data.types";
import { execDataService, queryDataPagingService } from "@/services/apiGateway";

export const NewStaffService = {

    fetchPaging: (params: TableViewSearchParams<SearchParams>) => 
        queryDataPagingService<NewStaffListItem>({
            actionName: 'fetch-paging-fma-new-staff-request',
            endpoint: 'HR',
            payload: params,
                pagination:{
                current: params.pagination?.current,
                pageSize: params.pagination?.pageSize
            },
        }),
    save: (param: SavePayLoad) => 
        execDataService<{data: string}, SavePayLoad>({
            actionName: 'make-fma-new-staff-request',
            endpoint: 'HR',
            payload: param
        }),
}