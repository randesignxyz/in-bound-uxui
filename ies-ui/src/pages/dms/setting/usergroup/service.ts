import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { GroupCreate, GroupDTO, GroupSearchParam } from "./data";
import { Page } from "@/services/shared/data";


const GroupService ={
    save: (data:GroupCreate):ServiceApiType<GroupCreate>=>({
        actionName:"save-group",
        endpoint:"DMS",
        type:"EXEC",
        payload:data
    }),
    page:(params:GroupSearchParam):ServiceApiType<{searchValue?:string}>=>({
        actionName:"page-group",
        endpoint:"DMS",
        type:"PAGING_QUERY",
        payload:params
    })
}


export const GroupServiceAPI = (requestActions :RequestActions)=>{
    return {
        save:(data:GroupCreate)=>singleRequest<{data:string; message:string}>(GroupService.save(data))(requestActions),
        page:(param:GroupSearchParam) => singleRequest<GroupDTO>(GroupService.page(param))(requestActions) as Promise<Page<GroupDTO>>
    }
}