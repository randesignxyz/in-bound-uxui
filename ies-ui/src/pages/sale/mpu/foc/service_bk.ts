import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";


const FOCAction ={
    page:(params:TableViewSearchParams<FOCSearchParam>):ServiceApiType<{searchValue?:string}> =>({
        actionName:"page-foc",
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
    closedFOC:(param:{id?:number}):ServiceApiType<{id?:number}> =>({
        actionName:"closed-foc",
        endpoint:"SALE",
        type:"EXEC",
        payload:param
    }),
    
}

export const FOCServiceAPI = (requestAction :RequestActions)=>{

    return {
        page:(param:TableViewSearchParams<FOCSearchParam>) =>singleRequest(FOCAction.page(param))(requestAction) as Promise<Page<any>>,
        closedFOC:(param:{id?:number}) =>singleRequest(FOCAction.closedFOC(param))(requestAction) as Promise<any>
    }
}