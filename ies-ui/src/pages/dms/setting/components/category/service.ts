import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { CategoryCreate, CategoryDTO, CategorySearchParam } from "./data";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";

const CategoryAction = {
    save:(data:CategoryCreate):ServiceApiType<CategoryCreate>=>({
        actionName:"save-category",
        endpoint:"DMS",
        type:"EXEC",
        payload:data
    }),
    page:(params:TableViewSearchParams<CategorySearchParam>):ServiceApiType<{searchValue?:string}> =>({
        actionName:"page-category",
        endpoint:"DMS",
        type:"PAGING_QUERY",
        payload: { ...params.criteria },
        pagination: {
          pageSize: params.pagination?.pageSize,
          page: params.pagination?.current,
        },
    }),
}


 export const CategoryServiceAPI =(requestActions :RequestActions) =>{
    return {
        save:(data:CategoryCreate) =>singleRequest<{data:string, message:string}>(CategoryAction.save(data))(requestActions),
        page : (params: TableViewSearchParams<CategorySearchParam>)=>
        singleRequest<CategoryDTO>(CategoryAction.page(params))(requestActions) as Promise<Paging<CategoryDTO>> ,

    }
}