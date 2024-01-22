import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { execDataService0, fetchDataListService, fetchDataPagingService, ServiceApiType } from "@/services/apiGateway";
import { LookupDataItem } from "@/services/data";
import { InspectionLookup } from "./inspection/data";
import { SaveVehicle, VehicleSearchParam, VehicleListItem } from "./vehicle/data";

export const FleetServices  =  {

    listLookupData: (list: string[]) => fetchDataListService<LookupDataItem, {list: string[]}>({
        actionName: 'look-up-data-list',
        endpoint:'FLEET',
        payload : {list}
      }),
    listInpectionLookupData: (list: string[]) => fetchDataListService<InspectionLookup, {list: string[]}>({
        actionName: 'inspection-look-up-data-list',
        endpoint:'FLEET',
        payload : {list}
      }),

    saveVehicle: (vhlt:SaveVehicle) => execDataService0<SaveVehicle>({
        actionName: 'save-vehicle',
        endpoint:'FLEET',
        payload: {...vhlt}

    }),

    fetchVehicle: (id: number): ServiceApiType<{ id: number }> => ({
        type: 'FETCH_QUERY',
        endpoint: 'FLEET',
        responseKey:'vehicle',
        actionName: 'fetch-vehicle',
        payload: { id }
    }),
    
    listVehicle: (params: TableViewSearchParams<VehicleSearchParam>)=> fetchDataPagingService<VehicleListItem, {searchValue?: string}>({
        actionName: 'list-vehicle',
        endpoint:'FLEET',
        payload: {searchValue: params.criteria?.searchValue},
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current
        },
      }), 


    


}