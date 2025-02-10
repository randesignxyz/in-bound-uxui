import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { TaskActionDataParam } from "@/services/process-workflow/params";
import { ApprovalStockControlDto } from "@/services/sale/data";


const WorkflowIntegrationAction ={
    stockControlApproval:(param:TaskActionDataParam<ApprovalStockControlDto>):ServiceApiType<{}> =>({
        actionName:"save-stock-control-approval",
        endpoint:"SALE",
        type:"EXEC",
        payload:param
    }),
    requestStockApproval:(id?:number):ServiceApiType<{id?:number}>=>({
        actionName:"update-request-status",
        endpoint:"SALE",
        type:"EXEC",
        payload:{id}
    }),
    fetchStockControl:(id?:string):ServiceApiType<{id?:string}> =>({
        actionName:"get-stock-control",
        endpoint:"SALE",
        type:"FETCH_QUERY",
        payload:{id}
    })
}


export const WorkflowIntegrationService = (requestAction:RequestActions)=>{
    return {
        stockControlApproval:(param:TaskActionDataParam<ApprovalStockControlDto>)=>singleRequest(WorkflowIntegrationAction.stockControlApproval(param))(requestAction),
        requestStockApproval :(id?:number) =>singleRequest(WorkflowIntegrationAction.requestStockApproval(id))(requestAction),
        fetchStockControl:(id?:string) => singleRequest(WorkflowIntegrationAction.fetchStockControl(id))(requestAction) as Promise<StockControlDTO>
    }
}