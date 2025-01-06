import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { TireAssignParam, TireVehicleDTO, VoidVehicleTireDTO } from "../specification/data";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";


const TireAction ={
    page:(params:TableViewSearchParams<TireAssignParam>):ServiceApiType<{searchValue?:string}> =>({
        actionName:"page-tire-assign-vehicle",
        endpoint:"FLEET",
        type:"PAGING_QUERY",
        payload: { ...params.criteria },
        pagination: {
          pageSize: params.pagination?.pageSize,
          page: params.pagination?.current,
        },
    }),
    voidVehicleTire: (data: VoidVehicleTireDTO): ServiceApiType<VoidVehicleTireDTO> => ({
        type: "EXEC",
        actionName: 'void-vehicle-tire',
        endpoint: 'FLEET',
        payload: data
    
      }),
}



export const TireServiceAPI = (requestAction:RequestActions)=>{
    return {
        page:(param:TableViewSearchParams<TireAssignParam>) => singleRequest(TireAction.page(param))(requestAction) as Promise<Page<TireVehicleDTO>>,
        voidVehicleTire: (params: VoidVehicleTireDTO) =>singleRequest<{ data: string; message: string }>(TireAction.voidVehicleTire(params))(requestAction),
    }
}