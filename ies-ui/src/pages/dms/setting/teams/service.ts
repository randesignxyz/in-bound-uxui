import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { TeamsCreate, TeamsDTO, TeamsSearchParam } from "./data";


const TeamsService ={
    save: (data:TeamsCreate):ServiceApiType<TeamsCreate>=>({
        actionName:"save-group",
        endpoint:"DMS",
        type:"EXEC",
        payload:data
    }),
    delete:(id?:number):ServiceApiType<{id?:number}>=>({
        actionName:"delete-group",
        endpoint:"DMS",
        type:"EXEC",
        payload:{id},
    }),
    page:(params:TableViewSearchParams<TeamsSearchParam>):ServiceApiType<{searchValue?:string}>=>({
        actionName:"page-group",
        endpoint:"DMS",
        type:"PAGING_QUERY",
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
          }
    })
}


export const TeamsServiceAPI = (requestActions :RequestActions)=>{
    return {
        save:(data:TeamsCreate)=>singleRequest<{data:string; message:string}>(TeamsService.save(data))(requestActions),
        delete:(id?:number)=>singleRequest<{data:string; message:string}>(TeamsService.delete(id))(requestActions),
        page:(param:TableViewSearchParams<TeamsSearchParam>) => singleRequest<TeamsDTO>(TeamsService.page(param))(requestActions) as Promise<Page<TeamsDTO>>
    }
}