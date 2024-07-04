import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { execDataService0, fetchDataListService, fetchDataPagingService, RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { LookupDataItem } from "@/services/data";
import { InspectionLookup } from "./inspection/data";
import { SaveVehicle, VehicleSearchParam, VehicleListItem } from "./vehicle/data";
import { ActivityLogAdvanceSearchParam, ActivityLogDTO } from "./data";
import { Page } from "@/services/shared/data";

export const FleetServices = {

  listLookupData: (list: string[]) => fetchDataListService<LookupDataItem, { list: string[] }>({
    actionName: 'look-up-data-list',
    endpoint: 'FLEET',
    payload: { list }
  }),
  listInpectionLookupData: (list: string[]) => fetchDataListService<InspectionLookup, { list: string[] }>({
    actionName: 'inspection-look-up-data-list',
    endpoint: 'FLEET',
    payload: { list }
  }),

  saveVehicle: (vhlt: SaveVehicle) => execDataService0<SaveVehicle>({
    actionName: 'save-vehicle',
    endpoint: 'FLEET',
    payload: { ...vhlt }

  }),

  fetchVehicle: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'FLEET',
    responseKey: 'vehicle',
    actionName: 'fetch-vehicle',
    payload: { id }
  }),

  listVehicle: (params: TableViewSearchParams<VehicleSearchParam>) => fetchDataPagingService<VehicleListItem, { searchValue?: string }>({
    actionName: 'list-vehicle',
    endpoint: 'FLEET',
    payload: { searchValue: params.criteria?.searchValue },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current
    },
  }),




}


const FleetAction = {
  pageActivityLog: (params: TableViewSearchParams<ActivityLogAdvanceSearchParam>): ServiceApiType<{ searchValue?: string }> => ({
    actionName: "page-activity-log",
    endpoint:"FLEET",
    type:"PAGING_QUERY",
    payload:{ ...params.criteria},
    pagination:{
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    }
  }),
}

export const FleetServiceAPI = (requestAction:RequestActions) =>{
  return {
      pageActivityLog: (params:TableViewSearchParams<ActivityLogAdvanceSearchParam>)=>singleRequest(FleetAction.pageActivityLog(params))(requestAction) as Promise<Page<ActivityLogDTO>>
  }
}