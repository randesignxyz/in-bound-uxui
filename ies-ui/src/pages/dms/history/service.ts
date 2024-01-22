import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { HistoryCreate, HistoryDTO, HistorySearchParam } from "./data";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";


const HistoryAction = {
    save:(data:HistoryCreate):ServiceApiType<HistoryCreate>=>({
        actionName:"save-history",
        endpoint:"DMS",
        type:"EXEC",
        payload:data
    }),
    page: (params: TableViewSearchParams<HistorySearchParam>): ServiceApiType<{ searchValue?: string }> => ({
        actionName: "page-history",
        endpoint: "DMS",
        type: "PAGING_QUERY",
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
        },
    })
}

export const HistoryServiceAPI =(requestAction:RequestActions) =>{
    return {
        save:(data:HistoryCreate)=>singleRequest<{data:string; message:string}>(HistoryAction.save(data))(requestAction),
        page:(params:TableViewSearchParams<HistorySearchParam>)=>singleRequest<HistoryDTO>(HistoryAction.page(params))(requestAction) as Promise<Page<HistoryDTO>>,
    }
}