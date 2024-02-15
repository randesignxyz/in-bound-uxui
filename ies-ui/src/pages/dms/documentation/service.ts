import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Attachment, DocumentationAdvanceSearch, DocumentationCreate, DocumentationDTO, UploadAttachmentFile } from "./data";
import { List } from "lodash";

const DocumnetAction ={
    save:(param:DocumentationCreate):ServiceApiType<DocumentationCreate>=>({
        actionName:"save-doc",
        endpoint:"DMS",
        type:"EXEC",
        payload:param
    }),
    // saveDoc:(param:DocCreate):ServiceApiType<DocCreate>=>({
    //     actionName:"save-doc",
    //     endpoint:"DMS",
    //     type:"EXEC",
    //     payload:param
    // }),
    fetch:(id:number):ServiceApiType<{id:number}>=>({
        actionName:"fetch-doc",
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
        actionName:"delete-doc",
        endpoint:"DMS",
        type:"EXEC",
        payload:{id}
    }),
    moveToTrash:(id:number):ServiceApiType<{id:number}>=>({
        actionName:"trash-doc",
        endpoint:"DMS",
        type:"EXEC",
        payload:{id}
    }),
    // deleteDoc:(id:number):ServiceApiType<{id:number}>=>({
    //     actionName:"delete-doc",
    //     endpoint:"DMS",
    //     type:"EXEC",
    //     payload:{id}
    // }),
    uploadAttachment:(params:UploadAttachmentFile):ServiceApiType<UploadAttachmentFile> =>({
        actionName:"save-doc-upload-file",
        endpoint:"DMS",
        type:"EXEC",
        payload:params
    }),
    listUploadAttachment:(id?:number):ServiceApiType<{id?:number}> =>({
        actionName:"list-doc-upload-file",
        endpoint:"DMS",
        type:"LIST_QUERY",
        payload:{id}
    }),
    page:(params:TableViewSearchParams<DocumentationAdvanceSearch>):ServiceApiType<{searchValue?:string}> =>({
        actionName:"page-doc",
        endpoint:"DMS",
        type:"PAGING_QUERY",
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
          }
    }),

    
}

export const  DocumentServiceAPI =(requestActions: RequestActions)=>{

    return {
        save:(data:DocumentationCreate) =>singleRequest<{data:DocumentationDTO,message:string}> (DocumnetAction.save(data))(requestActions)  ,
        // saveDoc:(data:DocCreate) =>singleRequest<{data:DocCreate,message:string}> (DocumnetAction.saveDoc(data))(requestActions)  ,
        fetch:(id:number) =>singleRequest<DocumentationDTO> (DocumnetAction.fetch(id))(requestActions) as Promise<DocumentationDTO> ,
        void:(id:number) =>singleRequest<{message:string}> (DocumnetAction.void(id))(requestActions),
        delete:(id:number) =>singleRequest<{message:string}> (DocumnetAction.delete(id))(requestActions),
        moveToTrash:(id:number) =>singleRequest<{message:string}> (DocumnetAction.moveToTrash(id))(requestActions),
        // deleteDoc:(id:number) =>singleRequest<{message:string}> (DocumnetAction.deleteDoc(id))(requestActions),
        uploadAttachment:(data:UploadAttachmentFile) =>singleRequest<{message:string}> (DocumnetAction.uploadAttachment(data))(requestActions),
        listUploadAttachment:(id?:number) =>singleRequest<Attachment> (DocumnetAction.listUploadAttachment(id))(requestActions) as Promise<List<Attachment>>,
        page:(param:TableViewSearchParams<DocumentationAdvanceSearch>) =>singleRequest<DocumentationDTO> (DocumnetAction.page(param))(requestActions) as Promise<Page<DocumentationDTO>>,
    }
    
}

