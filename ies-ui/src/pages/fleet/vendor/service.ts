import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { DriverSearchParam, DriverCreate, DriverDTO, VehicleDriverDTO } from "./data";



const DriverAction  =  {

    page: (params : TableViewSearchParams<DriverSearchParam>):ServiceApiType<{searchValue?:string}>=>({
        type:"PAGING_QUERY",
        endpoint:"FLEET",
        actionName:"page-driver",
        payload:{ ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
        },
    }),

    list:(param: DriverSearchParam):ServiceApiType<{ searchValue?:string }> =>({
        type:"LIST_QUERY",
        actionName:"list-driver",
        endpoint:"FLEET",
        payload: param
    }),

    listVehicleDriver:(id?:string):ServiceApiType<{ id?:string }> =>({
        type:"LIST_QUERY",
        actionName:"list-vehicle-driver",
        endpoint:"FLEET",
        payload: {id}
    }),

    removeVehicleDriver:(id?:number):ServiceApiType<{ id?:number }> =>({
        type:"EXEC",
        actionName:"delete-vehicle-driver",
        endpoint:"FLEET",
        payload: {id}
    }),

    save:(data: DriverCreate):ServiceApiType<DriverCreate>=>({
        actionName:"save-driver",
        endpoint:"FLEET",
        type:"EXEC",
        payload:data,
    })
}


export const DriverServiceAPI = (requestActions: RequestActions) => {
    return {
       page : (params: TableViewSearchParams<DriverSearchParam>)=>
       singleRequest<DriverDTO>(DriverAction.page(params))(requestActions) as Promise<Paging<DriverDTO>> ,

       listVehicleDriver:(params?:string)=>singleRequest<VehicleDriverDTO>(DriverAction.listVehicleDriver(params))(requestActions) as Promise<VehicleDriverDTO[]>,
       list:(params: DriverSearchParam)=>singleRequest<DriverDTO>(DriverAction.list(params))(requestActions) as Promise<DriverDTO[]>,

       save: (data: DriverCreate) =>singleRequest<{data:string, message:string}>(DriverAction.save(data))(requestActions),
       removeVehicleDriver: (id:number) =>singleRequest<{data:string, message:string}>(DriverAction.removeVehicleDriver(id))(requestActions),

    }
};
  


