import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { MaintenaceAdvanceSearch, MaintenanceCreate, MaintenanceStatus, MaintenanceSummary, MaintenneceDetailDTO, MaintenneceDTO } from "./data";
import moment from "moment";

const MaintenenceAction  =  {

    page: (params : TableViewSearchParams<MaintenaceAdvanceSearch>):ServiceApiType<{searchValue?:string}>=>({
        type:"PAGING_QUERY",
        endpoint:"FLEET",
        actionName:"page-maintenance",
        payload:{ ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
        },
    }),

    summary: (param: MaintenaceAdvanceSearch): ServiceApiType<MaintenaceAdvanceSearch> => ({
        type:"LIST_QUERY",
        actionName: 'summary-maintenance',
        endpoint:'FLEET',
        payload:param
      }),

    save:(data: MaintenanceCreate):ServiceApiType<MaintenanceCreate>=>({
        actionName:"save-maintenance",
        endpoint:"FLEET",
        type:"EXEC",
        payload:data,
    }),
    delete:(params:{vehicleId:string, date?:moment.Moment}):ServiceApiType<{vehicleId:string, date?:moment.Moment}>=>({
        actionName:"delete-maintenance",
        endpoint:"FLEET",
        type:"EXEC",
        payload:params,
    }),

    status:(data: MaintenanceStatus):ServiceApiType<MaintenanceStatus>=>({
        actionName:"status-maintenance",
        endpoint:"FLEET",
        type:"EXEC",
        payload:data,
    }),

    detail: (id:string):ServiceApiType<{id:string}>=>({
        actionName:"detail-maintenance",
        endpoint:"FLEET",
        type:"FETCH_QUERY",
        payload:{id}
    })
}


export const MaintenanceServiceAPI = (requestActions: RequestActions) => {
    return {
       page : (params: TableViewSearchParams<MaintenaceAdvanceSearch>)=>singleRequest<MaintenneceDTO>(MaintenenceAction.page(params))(requestActions) as Promise<Paging<MaintenneceDTO>> ,
       summary: (data: MaintenaceAdvanceSearch)=>singleRequest<MaintenanceSummary>(MaintenenceAction.summary(data))(requestActions) as Promise<MaintenanceSummary[]>,
       save: (data: MaintenanceCreate) =>singleRequest<{data:string, message:string}>(MaintenenceAction.save(data))(requestActions),
       delete: (params:{vehicleId:string, date?:moment.Moment}) =>singleRequest<{data:string, message:string}>(MaintenenceAction.delete(params))(requestActions),
       status: (data: MaintenanceStatus) =>singleRequest<{data:string, message:string}>(MaintenenceAction.status(data))(requestActions),
       detail:(id:string)=>singleRequest<MaintenneceDetailDTO>(MaintenenceAction.detail(id))(requestActions) as Promise<MaintenneceDetailDTO>
    }
};
  


