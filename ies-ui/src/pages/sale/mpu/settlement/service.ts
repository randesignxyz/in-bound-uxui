import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";


const SettlementMethodAction = {
    confirm :(id?:number):ServiceApiType<{id?:number}> =>({
        actionName:"confirm_settlement_method",
        endpoint:"SALE",
        type:"EXEC",
        payload:{id}
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
        confirm:(id?:number)=>singleRequest(SettlementMethodAction.confirm(id))(requestActions),
        detail:(id?:number)=> singleRequest(SettlementMethodAction.detail(id))(requestActions) as Promise<SettlementMethodDetailDTO>,
        page:(param:TableViewSearchParams<SettlementMethodAdvanceSearch>)=>singleRequest(SettlementMethodAction.page(param))(requestActions) as Promise<Page<SettlementMethodDetailDTO>>,

    }
}