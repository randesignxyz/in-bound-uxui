import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";

const DepartmentAction = {
    save:(data:DeparmentCreate):ServiceApiType<DeparmentCreate>=>({
        actionName:"save-department",
        endpoint:"DMS",
        type:"EXEC",
        payload:data
    }),
    page:(params:TableViewSearchParams<DepartmentAdvanceSearchParam>):ServiceApiType<{searchValue?:string}> =>({
        actionName:"page-department",
        endpoint:"DMS",
        type:"PAGING_QUERY",
        payload: { ...params.criteria },
        pagination: {
          pageSize: params.pagination?.pageSize,
          page: params.pagination?.current,
        },
    }),

    assignUser:(data:AssignDepartment):ServiceApiType<AssignDepartment>=>({
        actionName:"assign-department",
        endpoint:"DMS",
        type:"EXEC",
        payload:data
    })
}


 export const DepartmentServiceAPI =(requestActions :RequestActions) =>{
    return {
        save:(data:DeparmentCreate) =>singleRequest<{data:string, message:string}>(DepartmentAction.save(data))(requestActions),
        assignUser:(data:AssignDepartment) =>singleRequest<{data:string, message:string}>(DepartmentAction.assignUser(data))(requestActions),
        page : (params: TableViewSearchParams<DepartmentAdvanceSearchParam>)=>
        singleRequest<DepartmentDTO>(DepartmentAction.page(params))(requestActions) as Promise<Paging<DepartmentDTO>> ,

    }
}