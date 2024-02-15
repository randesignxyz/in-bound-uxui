import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { GroupCreate, GroupDTO, GroupSearchParam } from "./data";
import { Page } from "@/services/shared/data";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";


const GroupService ={
    save: (data:GroupCreate):ServiceApiType<GroupCreate>=>({
        actionName:"save-group",
        endpoint:"DMS",
        type:"EXEC",
        payload:data
    }),
    page:(params:TableViewSearchParams<GroupSearchParam>):ServiceApiType<{searchValue?:string}>=>({
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


export const GroupServiceAPI = (requestActions :RequestActions)=>{
    return {
        save:(data:GroupCreate)=>singleRequest<{data:string; message:string}>(GroupService.save(data))(requestActions),
        page:(param:TableViewSearchParams<GroupSearchParam>) => singleRequest<GroupDTO>(GroupService.page(param))(requestActions) as Promise<Page<GroupDTO>>
    }
}