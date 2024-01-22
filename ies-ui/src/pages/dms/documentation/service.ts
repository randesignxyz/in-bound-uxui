import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { DocumentationAdvanceSearch, DocumentationCreate, DocumentationDTO } from "./data";

const DocumnetAction ={
    save:(param:DocumentationCreate):ServiceApiType<DocumentationCreate>=>({
        actionName:"save-document",
        endpoint:"DMS",
        type:"EXEC",
        payload:param
    }),
    fetch:(id:number):ServiceApiType<{id:number}>=>({
        actionName:"fetch-document",
        endpoint:"DMS",
        type:"FETCH_QUERY",
        payload:{id}
    }),
    void:(id:number):ServiceApiType<{id:number}>=>({
        actionName:"void-document",
        endpoint:"DMS",
        type:"EXEC",
        payload:{id}
    }),
    delete:(id:number):ServiceApiType<{id:number}>=>({
        actionName:"delete-document",
        endpoint:"DMS",
        type:"EXEC",
        payload:{id}
    }),
    page:(params:TableViewSearchParams<DocumentationAdvanceSearch>):ServiceApiType<{searchValue?:string}> =>({
        actionName:"page-document",
        endpoint:"DMS",
        type:"PAGING_QUERY",
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
          }
    })
    
}

export const  DocumentServiceAPI =(requestActions: RequestActions)=>{

    return {
        save:(data:DocumentationCreate) =>singleRequest<{data:DocumentationDTO,message:string}> (DocumnetAction.save(data))(requestActions)  ,
        fetch:(id:number) =>singleRequest<DocumentationDTO> (DocumnetAction.fetch(id))(requestActions) as Promise<DocumentationDTO> ,
        void:(id:number) =>singleRequest<{message:string}> (DocumnetAction.void(id))(requestActions),
        delete:(id:number) =>singleRequest<{message:string}> (DocumnetAction.delete(id))(requestActions),
        page:(param:TableViewSearchParams<DocumentationAdvanceSearch>) =>singleRequest<DocumentationDTO> (DocumnetAction.page(param))(requestActions) as Promise<Page<DocumentationDTO>>
    }
    
}

