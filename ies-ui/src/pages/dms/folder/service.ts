import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { FolderCreate, FolderSearchParam, FolderAdvanceSearch, FolderDTO, FolderMoveParam, CollaboratorCreate, CollaboratorDTO } from "./data";
import { List } from "lodash";

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
  delete: (id?: number): ServiceApiType<{ id?: number }> => ({
    actionName: "delete-folder",
    endpoint: "DMS",
    type: "EXEC",
    payload: { id }
  }),
  move: (data: FolderMoveParam): ServiceApiType<FolderMoveParam> => ({
    actionName: "move-folder",
    endpoint: "DMS",
    type: "EXEC",
    payload: data
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
  collaboratorList: (id:number): ServiceApiType<{id:number}> => ({
    actionName: "list-collaborator",
    endpoint: "DMS",
    type: "LIST_QUERY",
    payload: {id},
  }),
  collaborator: (param: CollaboratorCreate): ServiceApiType<CollaboratorCreate> => ({
    actionName: "save-collaborator",
    endpoint: "DMS",
    type: "EXEC",
    payload: param
  }),
  removeCollaborator: (id:number): ServiceApiType<{id:number}> => ({
    actionName: "remove-collaborator",
    endpoint: "DMS",
    type: "EXEC",
    payload: {id}
  }),
}

export const FolderServiceAPI = (requestActions: RequestActions) => {
  return {
    save: (data: FolderCreate) => singleRequest<{ data: string, message: string }>(FolderAction.save(data))(requestActions),
    collaborator: (data: CollaboratorCreate) => singleRequest<{ data: string, message: string }>(FolderAction.collaborator(data))(requestActions),
    removeCollaborator: (id:number) => singleRequest<{message:string}>(FolderAction.removeCollaborator(id))(requestActions),
    collaboratorList: (id:number) =>singleRequest<{}>(FolderAction.collaboratorList(id))(requestActions) as Promise<CollaboratorDTO[]>,
    fetch: (id: number) => singleRequest<FolderDTO>(FolderAction.fetch(id))(requestActions),
    list: (params: FolderSearchParam) => singleRequest<FolderDTO>(FolderAction.list(params))(requestActions) as Promise<FolderDTO[]>,
    delete: (id?: number) => singleRequest<{ id?: number }>(FolderAction.delete(id))(requestActions),
    move: (data: FolderMoveParam) => singleRequest<{ data: string, message: string }>(FolderAction.move(data))(requestActions),
    page: (params: TableViewSearchParams<FolderAdvanceSearch>) => singleRequest<FolderDTO>(FolderAction.page(params))(requestActions) as Promise<Paging<FolderDTO>>,
  }
};
