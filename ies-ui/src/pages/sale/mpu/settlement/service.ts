import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";
import { StatusActionForm, SettlementMethodAdvanceSearch, SettlementMethodDetailDTO } from "./data";


const SettlementMethodAction = {
    confirm :(param:StatusActionForm):ServiceApiType<StatusActionForm> =>({
        actionName:"confirm_settlement_method",
        endpoint:"SALE",
        type:"EXEC",
        payload:param
    }),
    reject :(param:StatusActionForm):ServiceApiType<StatusActionForm> =>({
        actionName:"reject_settlement_method",
        endpoint:"SALE",
        type:"EXEC",
        payload:param
    }),
    detail:(id?:number):ServiceApiType<{id?:number}> =>({
        actionName:"detail_settlement_method",
        endpoint:"SALE",
        type:"FETCH_QUERY",
        payload:{id}
    }),
    page:(param:TableViewSearchParams<SettlementMethodAdvanceSearch>):ServiceApiType<{searchValue?:string}> =>({
        actionName:"page_settlement_method",
        endpoint:"SALE",
        type:"PAGING_QUERY",
        payload: {...param.criteria},
        pagination:{
            page:param.pagination?.current,
            pageSize:param.pagination?.pageSize
        }
    })
}

export const SettlementMethodServicAPI = (requestActions: RequestActions) =>{
    return {
        confirm:(param:StatusActionForm)=>singleRequest(SettlementMethodAction.confirm(param))(requestActions),
        reject:(param:StatusActionForm)=>singleRequest(SettlementMethodAction.reject(param))(requestActions),
        detail:(id?:number)=> singleRequest(SettlementMethodAction.detail(id))(requestActions) as Promise<SettlementMethodDetailDTO>,
        page:(param:TableViewSearchParams<SettlementMethodAdvanceSearch>)=>singleRequest(SettlementMethodAction.page(param))(requestActions) as Promise<Page<SettlementMethodDetailDTO>>,

    }
}