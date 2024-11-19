import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import {  ReceiveShareAdvanceSearchParam, ShareCreate, ShareDTO } from "./data";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";
import { DocumentationCreate } from "../documentation/data";


const ShareAction ={
    save:(data:ShareCreate):ServiceApiType<ShareCreate> =>({
        actionName:"save-share",
        endpoint:"DMS",
        type:"EXEC",
        payload:data
    }),
    copyDocument:(data:DocumentationCreate):ServiceApiType<DocumentationCreate> =>({
        actionName:"copy-document-share",
        endpoint:"DMS",
        type:"EXEC",
        payload:data
    }),
    delete:(id?:number):ServiceApiType<{id?:number}> =>({
        actionName:"delete-share",
        endpoint:"DMS",
        type:"EXEC",
        payload:{id}
    }),
    fetch:(id?:number):ServiceApiType<{id?:number}> =>({
        actionName:"fetch-share",
        endpoint:"DMS",
        type:"FETCH_QUERY",
        payload:{id}
    }),
    list:(id?:number):ServiceApiType<{id?:number}> =>({
        actionName:"list-share",
        endpoint:"DMS",
        type:"LIST_QUERY",
        payload:{id:id}
    }),
    page:(params:TableViewSearchParams<ReceiveShareAdvanceSearchParam>):ServiceApiType<{searchValue?:string}> =>({
        actionName:"page-share",
        endpoint:"DMS",
        type:"PAGING_QUERY",
        payload: { ...params.criteria },
        pagination: {
          pageSize: params.pagination?.pageSize,
          page: params.pagination?.current,
        },
    })
}

export const ShareServiceAPI =(requestAction:RequestActions) =>{
    return {
        save:(data:ShareCreate)=>singleRequest<{data:string; messeage:string}>(ShareAction.save(data))(requestAction),
        copyDocument:(data:DocumentationCreate)=>singleRequest<{data:string; messeage:string}>(ShareAction.copyDocument(data))(requestAction),
        delete:(id?:number)=>singleRequest<{data:string; messeage:string}>(ShareAction.delete(id))(requestAction),
        fetch:(id?:number)=>singleRequest<ShareDTO>(ShareAction.fetch(id))(requestAction) as Promise<ShareDTO>,
        list:(id?:number) =>singleRequest<{id?:number}>(ShareAction.list(id))(requestAction) as Promise<ShareDTO[]>,
        page : (params: TableViewSearchParams<ReceiveShareAdvanceSearchParam>)=>
        singleRequest<ShareDTO>(ShareAction.page(params))(requestAction) as Promise<Paging<ShareDTO>> ,
    }
} 