import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { LibraryAdvanceSearchParam, LibraryCreate, LibraryDTO } from "./data";


const LibraryAction = {
    save: (data: LibraryCreate): ServiceApiType<LibraryCreate> => ({
        actionName: "save-library",
        endpoint: "DMS",
        type: "EXEC",
        payload: data
    }),

    fetch:(id?:number) :ServiceApiType<{id?:number}>=>({
        actionName:"fetch-library",
        endpoint:"DMS",
        type:"FETCH_QUERY",
        payload:{id},

    }),

    list: (params: LibraryAdvanceSearchParam): ServiceApiType<{ searchValue?: string }> => ({
        actionName: "list-library",
        endpoint: "DMS",
        type: "LIST_QUERY",
        payload: params
    }),
}


export const LibraryServiceAPI=(requestActions: RequestActions)=>{
    return {
        save: (data: LibraryCreate) => singleRequest<{ data: string, message: string }>(LibraryAction.save(data))(requestActions),
        fetch:(id?:number)=>singleRequest<LibraryDTO>(LibraryAction.fetch(id))(requestActions) as Promise<LibraryDTO> ,
        list: (params:LibraryAdvanceSearchParam) => singleRequest<LibraryDTO>(LibraryAction.list(params))(requestActions) as Promise<LibraryDTO[]>,
    }
   
}