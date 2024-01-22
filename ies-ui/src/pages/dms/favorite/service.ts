import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import {  FavoriteCreate } from "./data";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";
import { DocumentationAdvanceSearch, DocumentationDTO } from "../documentation/data";


const FavoriteAction ={
    save:(data:FavoriteCreate):ServiceApiType<FavoriteCreate> =>({
        actionName:"save-favorite",
        endpoint:"DMS",
        type:"EXEC",
        payload:data
    }),

    page:(params:TableViewSearchParams<DocumentationAdvanceSearch>):ServiceApiType<{searchValue?:string}> =>({
        actionName:"page-favorite",
        endpoint:"DMS",
        type:"PAGING_QUERY",
        payload: { ...params.criteria },
        pagination: {
          pageSize: params.pagination?.pageSize,
          page: params.pagination?.current,
        },
    })
}

export const FavoriteServiceAPI =(requestAction:RequestActions) =>{
    return {
        save:(data:FavoriteCreate)=>singleRequest<{data:string; messeage:string}>(FavoriteAction.save(data))(requestAction),
        page : (params: TableViewSearchParams<DocumentationDTO>)=>
        singleRequest<DocumentationDTO>(FavoriteAction.page(params))(requestAction) as Promise<Paging<DocumentationDTO>> ,
    }
} 