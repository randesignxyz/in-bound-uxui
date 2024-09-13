import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";
import { ReminderCreate, ReminderAdvanceSearchParam, ReminderDTO } from "./data";


const ReminderAction ={
    save:(data:ReminderCreate):ServiceApiType<ReminderCreate> => ({
        actionName:"save-reminder",
        endpoint:"DMS",
        type:"EXEC",
        payload:data,
    
    }),
    list:(id?:number):ServiceApiType<{id?:number}> =>({
        actionName:"list-reminder",
        endpoint:"DMS",
        type:"LIST_QUERY",
        payload:{id}
    }),

    delete:(id?:number):ServiceApiType<{id?:number}>=>({
        actionName:"delete-reminder",
        endpoint:"DMS",
        type:"EXEC",
        payload:{id}
    }),
    page:(param:TableViewSearchParams<ReminderAdvanceSearchParam>):ServiceApiType<{searchValue?:string}> =>({
        actionName:"page-reminder",
        endpoint:"DMS",
        type:"PAGING_QUERY",
        payload:{}
    })
}

export const ReminderServiceAPI = (requestActions:RequestActions)=>{
    return {
        save:(data:ReminderCreate)=>singleRequest<{data:string; message:string}>(ReminderAction.save(data))(requestActions),
        list:(id?:number)=>singleRequest<ReminderDTO>(ReminderAction.list(id))(requestActions) as Promise<ReminderDTO[]>,
        delete:(id?:number) =>singleRequest<ReminderDTO>(ReminderAction.delete(id))(requestActions),
        page:(param: TableViewSearchParams<ReminderAdvanceSearchParam>) => singleRequest<ReminderDTO>(ReminderAction.page(param))(requestActions) as Promise<Page<ReminderDTO>>
    }
}