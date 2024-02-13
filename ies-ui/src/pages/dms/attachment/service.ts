import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";


const AttachmentAction ={
    delete:(id?:number):ServiceApiType<{id?:number}>=>({
        actionName:"delete-doc-upload-file",
        endpoint:"DMS",
        type:"EXEC",
        payload:{id}
    }),

    list:(id?:number):ServiceApiType<{id?:number}> => ({
        actionName:"list-doc-upload-file",
        endpoint:"DMS",
        type:"LIST_QUERY",
        payload:{id}
    })
}


export const AttachmentServiceAPI = (requestAction:RequestActions) =>{
    return {
        delete:(id?:number) => singleRequest<{message?:string}> (AttachmentAction.delete(id))(requestAction),
        list:(id?:number) =>singleRequest<Attachment> (AttachmentAction.list(id))(requestAction) as Promise<Attachment[]>
    }
}