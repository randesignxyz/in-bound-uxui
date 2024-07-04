import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { ReminderHistory, ReminderHistorySearch, ServiceReminderCreate, ServiceReminderDTO, ServiceReminderMaintenance, ServiceReminderSearchParam } from "./data";

const ReminderAction  =  {

    page: (params: TableViewSearchParams<ServiceReminderSearchParam>): ServiceApiType<{searchValue?:string}> => ({
        type:"PAGING_QUERY",
        actionName: 'page-maintenance-plan',
        endpoint:'FLEET',
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
        },
      }),

    save:(data: ServiceReminderCreate):ServiceApiType<ServiceReminderCreate>=>({
        type:"EXEC",
        actionName:"save-maintenance-plan",
        endpoint:"FLEET",
        payload:data
    }),

    delete:(id:number):ServiceApiType<{id:number}>=>({
        type:"EXEC",
        actionName:"delete-reminder",
        endpoint:"FLEET",
        payload:{id}
    }),

    listAlertHistory:(id:number):ServiceApiType<{id:number}>=>({
        type:"LIST_QUERY",
        actionName:"list-alert-history",
        endpoint:"FLEET",
        payload:{id}
    }),

    // =========== save service reminder history ===========
    saveReminderHistory:(data: ReminderHistory):ServiceApiType<ReminderHistory>=>({
        type:"EXEC",
        actionName:"save-reminder-history",
        endpoint:"FLEET",
        payload:data
    }),

    pageReminderHistory: (params: TableViewSearchParams<ReminderHistorySearch>): ServiceApiType<{searchValue?:string}> => ({
        type:"PAGING_QUERY",
        actionName: 'page-reminder-history',
        endpoint:'FLEET',
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
        },
      }),

      fetchVehicleServiceTask:(param:{vehicleId:string,serviceTaskId:number }):ServiceApiType<{vehicleId:string,serviceTaskId:number }> =>({
        actionName:"fetch-vehicle-service-tasks",
        endpoint:"FLEET",
        type:"FETCH_QUERY",
        payload:{...param}
    }),
}


export const ReminderServiceAPI = (requestActions: RequestActions) => {
    return {
        page: (params: TableViewSearchParams<ServiceReminderSearchParam>) =>singleRequest<ServiceReminderDTO>(ReminderAction.page(params))(requestActions) as Promise<Paging<ServiceReminderDTO>>,
        save:(data: ServiceReminderCreate)=>singleRequest<{data:string, message:string}>(ReminderAction.save(data))(requestActions),
        delete:(id:number)=>singleRequest<{data:string, message:string}>(ReminderAction.delete(id))(requestActions),
        listAlertHistory:(id:number)=>singleRequest<ServiceReminderMaintenance>(ReminderAction.listAlertHistory(id))(requestActions) as Promise<ServiceReminderMaintenance[]>,
        pageReminderHistory: (params: TableViewSearchParams<ReminderHistorySearch>) =>singleRequest<ReminderHistory>(ReminderAction.pageReminderHistory(params))(requestActions) as Promise<Paging<ReminderHistory>>,
        saveReminderHistory:(data: ReminderHistory)=>singleRequest<{data:string, message:string}>(ReminderAction.saveReminderHistory(data))(requestActions),
        fetchVehicleServiceTask:(param:{vehicleId:string,serviceTaskId:number })=>singleRequest<ServiceReminderDTO>(ReminderAction.fetchVehicleServiceTask(param))(requestActions) as Promise<ServiceReminderDTO>,
    }
};
  