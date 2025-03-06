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
    syncExecStoreProcedureSalesperson:():ServiceApiType<{}>=>({
        actionName:"sync-exec-store-procedure-salesperson-auto",
        endpoint:"CRM",
        type:"EXEC",
        payload:{}
    }),
    removeSalespersonOrg:(param:{id:number}):ServiceApiType<{}>=>({
        actionName:"remove-salesperson-org",
        endpoint:"CRM",
        type:"EXEC",
        payload:param
    }),
    addSalespersonOrg:(param:AddSalesperonOrg):ServiceApiType<{}>=>({
        actionName:"add-salesperson-org",
        endpoint:"CRM",
        type:"EXEC",
        payload:param
    }),
    moveSalespersonOrg:(param:{id:number}):ServiceApiType<{}>=>({
        actionName:"move-salesperson-org",
        endpoint:"CRM",
        type:"EXEC",
        payload:param
    }),
    saveSaleOrgAuditor:(param:{ saleId:number; targetSaleId:number; remark?:string }):ServiceApiType<{}>=>({
        actionName:"save-sale-org-auditor",
        endpoint:"CRM",
        type:"EXEC",
        payload:param
    })
}


export const SalespersonOrgAPI  = (requestAction:RequestActions) =>{
    return {
        salesOrgList :(param:any)=>singleRequest(SalespersonAction.list(param))(requestAction) as Promise<SalespersonOrg[]>,
        salespersonList :()=>singleRequest(SalespersonAction.salespersonList())(requestAction) as Promise<SalePerson[]>,
        syncExecStoreProcedureSalesperson:()=>singleRequest(SalespersonAction.syncExecStoreProcedureSalesperson())(requestAction),
        removeSalespersonOrg:(param:{id:number})=>singleRequest(SalespersonAction.removeSalespersonOrg(param))(requestAction),
        addSalespersonOrg:(param:AddSalesperonOrg)=>singleRequest(SalespersonAction.addSalespersonOrg(param))(requestAction),
        moveSalespersonOrg:(param:{id:number})=>singleRequest(SalespersonAction.moveSalespersonOrg(param))(requestAction),
        saveSaleOrgAuditor:(param:{ saleId:number; targetSaleId:number; remark?:string })=>singleRequest(SalespersonAction.saveSaleOrgAuditor(param))(requestAction),
    }
}
