import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { NewStaffListItem, SavePayLoad, SearchParams } from "@/pages/fma/new-staff/data.types";
import { execDataService, queryDataPagingService } from "@/services/apiGateway";
import { SaveNewStaffPayLoad } from "./data.types";

export const NewStaffService = {

    fetchPaging: (params: TableViewSearchParams<SearchParams>) => 
        queryDataPagingService<NewStaffListItem>({
            actionName: 'fetch-paging-new-staff-request',
            endpoint: 'HR',
            payload: params,
                pagination:{
                current: params.pagination?.current,
                pageSize: params.pagination?.pageSize
            },
        }),
    save: (param: SaveNewStaffPayLoad) => 
        execDataService<{data: string}, SaveNewStaffPayLoad>({
            actionName: 'make-fma-ict-new-staff-request',
            endpoint: 'HR',
            payload: param
        }),
}