import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";

const DocumentTypeAction={
    save:(data:DocumentTypeCreate):ServiceApiType<DocumentTypeCreate> =>({
        actionName:"save-document-type",
        endpoint:"DMS",
        type:"EXEC",
        payload:data
    }),

    fetch:(id?:number):ServiceApiType<{id?:number}> =>({
        actionName:"fetch-document-type",
        endpoint:"DMS",
        type:"FETCH_QUERY",
        payload:{id}
    }),
    
    delete:(id?:number):ServiceApiType<{id?:number}> =>({
        actionName:"delete-document-type",
        endpoint:"DMS",
        type:"EXEC",
        payload:{id}
    }),
    
    page:(params:TableViewSearchParams<DocumentTypeAdvanceSearch>):ServiceApiType<{searchValue?:string}> =>({
        actionName:"page-document-type",
        endpoint:"DMS",
        type:"PAGING_QUERY",
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
          }
    })
}


export const DocumentTypeServiceAPI = (requestActions:RequestActions) =>{
    return {
        save:(data:DocumentTypeCreate) =>singleRequest(DocumentTypeAction.save(data))(requestActions),
        fetch:(id?:number)=>singleRequest(DocumentTypeAction.fetch(id)) (requestActions) as Promise<DocumentTypeDTO>,
        delete:(id?:number)=>singleRequest(DocumentTypeAction.delete(id)) (requestActions) ,
        page:(params:TableViewSearchParams<DocumentTypeAdvanceSearch>) =>singleRequest(DocumentTypeAction.page(params))(requestActions) as Promise<Page<DocumentTypeDTO>>
    }
}