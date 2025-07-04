import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";


const FOCAction ={
    page:(params:TableViewSearchParams<FreeOfChargeTrackingAdvanceSearch>):ServiceApiType<{searchValue?:string}> =>({
        actionName:"page-free-of-charge-tracking",
        endpoint:"SALE",
        type:"PAGING_QUERY",
        payload:{
            ...params.criteria
        },
        pagination:{
            page:params.pagination?.current,
            pageSize:params.pagination?.pageSize,
        }
    }),
    fetch:(param:{id?:number}):ServiceApiType<{}>=>({
        actionName:"fetch-free-of-charge-tracking",
        endpoint:"SALE",
        type:"FETCH_QUERY",
        payload:param
    }),
    updateStatus:(param:{id?:number, remark?:string}):ServiceApiType<{}> =>({
        actionName:"update-status-free-of-charge-tracking",
        endpoint:"SALE",
        type:"EXEC",
        payload:param
    }),
    
}

export const FOCServiceAPI = (requestAction :RequestActions)=>{

    return {
        page:(param:TableViewSearchParams<FreeOfChargeTrackingAdvanceSearch>) =>singleRequest(FOCAction.page(param))(requestAction) as Promise<Page<FreeOfChargeTrackingDTO>>,
        fetch:(param:{id?:number}) =>singleRequest(FOCAction.fetch(param))(requestAction) as Promise<FreeOfChargeTrackingDTO>,
        updateStatus:(param:{id?:number}) =>singleRequest(FOCAction.updateStatus(param))(requestAction) as Promise<any>
    }
}