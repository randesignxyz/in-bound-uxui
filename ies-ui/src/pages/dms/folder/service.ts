import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { FolderCreate, FolderSearchParam, FolderAdvanceSearch, FolderDTO, FolderMoveParam } from "./data";

const FolderAction = {
  save: (param: FolderCreate): ServiceApiType<FolderCreate> => ({
    actionName: "save-folder",
    endpoint: "DMS",
    type: "EXEC",
    payload: param
  }),
  fetch: (id: number): ServiceApiType<{ id: number }> => ({
    actionName: "fetch-folder",
    endpoint: "DMS",
    type: "FETCH_QUERY",
    payload: { id: id }
  }),
  list: (params: FolderSearchParam): ServiceApiType<{ searchValue?: string }> => ({
    actionName: "list-folder",
    endpoint: "DMS",
    type: "LIST_QUERY",
    payload: params
  }),
  delete: (id?:number): ServiceApiType<{ id?: number }> => ({
    actionName: "delete-folder",
    endpoint: "DMS",
    type: "EXEC",
    payload: {id}
  }),
  move:(data:FolderMoveParam):ServiceApiType<FolderMoveParam> =>({
    actionName:"move-folder",
    endpoint:"DMS",
    type:"EXEC",
    payload:data
  }),
  page: (
    params: TableViewSearchParams<FolderAdvanceSearch>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: "PAGING_QUERY",
    actionName: "page-folder",
    endpoint: "DMS",
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
}




export const FolderServiceAPI = (requestActions: RequestActions) => {
  return {
    save: (data: FolderCreate) => singleRequest<{ data: string, message: string }>(FolderAction.save(data))(requestActions),
    fetch: (id: number) => singleRequest<FolderDTO>(FolderAction.fetch(id))(requestActions),
    list: (params:FolderSearchParam) => singleRequest<FolderDTO>(FolderAction.list(params))(requestActions) as Promise<FolderDTO[]>,
    delete: (id?:number) => singleRequest<{id?:number}>(FolderAction.delete(id))(requestActions),
    move :(data:FolderMoveParam) =>singleRequest<{data:string, message:string}>(FolderAction.move(data))(requestActions),
    page: (params: TableViewSearchParams<FolderAdvanceSearch>) =>singleRequest<FolderDTO>(FolderAction.page(params))(requestActions) as Promise<Paging<FolderDTO>>,
  }
};
