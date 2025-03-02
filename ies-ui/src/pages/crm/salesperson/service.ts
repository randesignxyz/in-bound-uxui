import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { SalePerson } from "@/services/crm/data";


const SalespersonAction ={
    list:(param:any):ServiceApiType<{}> =>({
        actionName:"salesperson-org-list",
        endpoint:"CRM",
        type:"LIST_QUERY",
        payload:param
    }),
    salespersonList:():ServiceApiType<{}>=>({
        actionName:"salesperson-list",
        endpoint:"CRM",
        type:"LIST_QUERY",
        payload:{},
    }),

    remove:(param:{saleId:number; parentId:number; removeSubornation:boolean }):ServiceApiType<{}>=>({
        actionName:"remove-sale-org",
        endpoint:"CRM",
        type:"EXEC",
        payload:param
    }),
    move:(param:{saleId:number; parentId:number; moveSubornation:boolean }):ServiceApiType<{}>=>({
        actionName:"move-sale-org",
        endpoint:"CRM",
        type:"EXEC",
        payload:param
    }),
    addSaleOrg:(param:{ saleId:number; parentId:number; position:string }):ServiceApiType<{}>=>({
        actionName:"add-sale-org",
        endpoint:"CRM",
        type:"EXEC",
        payload:param
    }),
}


export const SalespersonAPI  = (requestAction:RequestActions) =>{

    return {
        salesOrgList :(param:any)=>singleRequest(SalespersonAction.list(param))(requestAction) as Promise<SalespersonOrg[]>,
        salespersonList :()=>singleRequest(SalespersonAction.salespersonList())(requestAction) as Promise<SalePerson[]>,
        remove:(param:{saleId:number; parentId:number; removeSubornation:boolean })=>singleRequest(SalespersonAction.remove(param))(requestAction),
        move:(param:{saleId:number; parentId:number; moveSubornation:boolean })=>singleRequest(SalespersonAction.move(param))(requestAction),
        addSaleOrg:(param:{ saleId:number; parentId:number; position:string })=>singleRequest(SalespersonAction.addSaleOrg(param))(requestAction),
    }
}
