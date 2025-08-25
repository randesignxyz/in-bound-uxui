import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";

const ShareCustomerAction ={
    listCustomerLeadBySE:(param:{id:number}):ServiceApiType<{}> =>({
        actionName:"customer-lead-by-sale",
        endpoint:"CRM",
        type:"LIST_QUERY",
        payload:param,
    }),
    saveShare:(param:any):ServiceApiType<{}>=>({
        actionName:"share-customer-lead",
        endpoint:"CRM",
        type:"EXEC",
        payload:param
    }),
    page:(param:TableViewSearchParams<any>):ServiceApiType<{searchValue?:string}>=>({
        actionName:"page-share-customer-lead",
        endpoint:"CRM",
        type:"PAGING_QUERY",
        payload:{...param.criteria},
        pagination:param.pagination
    }),
    delete:(param:any):ServiceApiType<{}>=>({
        actionName:"delete-share-customer-lead",
        endpoint:"CRM",
        type:"EXEC",
        payload:param
    }),
    changeStatus:(param:any):ServiceApiType<{}>=>({
        actionName:"change-status-share-customer-lead",
        endpoint:"CRM",
        type:"EXEC",
        payload:param
    })
}

export const ShareCustomerAPI =(requestAction:RequestActions)=>{
    return {
        listCustomerLeadBySE:(param:{id:number})=>singleRequest(ShareCustomerAction.listCustomerLeadBySE(param))(requestAction) as Promise<any[]>,
        saveShare:(param:any)=>singleRequest(ShareCustomerAction.saveShare(param))(requestAction) ,
        page:(param:TableViewSearchParams<any>)=>singleRequest(ShareCustomerAction.page(param))(requestAction) as Promise<Page<any>>,
        delete:(param:any)=>singleRequest(ShareCustomerAction.delete(param))(requestAction),
        changeStatus:(param:any)=>singleRequest(ShareCustomerAction.changeStatus(param))(requestAction)
    }
}