import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";

const InventoryAction={
    save:(data:InventoryCreate):ServiceApiType<InventoryCreate>=>({
            actionName:"save-inventory",
            endpoint:"FLEET",
            type:"EXEC",
            payload:data
    }),

    page:(params:TableViewSearchParams<InventorySearchParam>):ServiceApiType<{searchValue?:string}> =>({
        actionName:"page-inventory",
        endpoint:"FLEET",
        type:"PAGING_QUERY",
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
        },
    })

}


export const InventoryAPIService = (requestActions: RequestActions) => {
    return {
        save:(data:InventoryCreate)=>singleRequest<{data:string,message:string }>(InventoryAction.save(data))(requestActions),
        page:(params:TableViewSearchParams<InventorySearchParam>)=>singleRequest<{}>(InventoryAction.page(params))(requestActions) as Promise<InventoryDTO>
    }
}