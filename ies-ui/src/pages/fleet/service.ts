import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { ActivityLogAdvanceSearchParam, ActivityLogDTO, AttachmentFilesCreate, AttachmentFilesDTO, BusnessUnit, LookUpDataDTO, LookUpDataParam } from "./data";
import { Page } from "@/services/shared/data";

// export const FleetServices = {

//   listLookupData: (list: string[]) => fetchDataListService<LookupDataItem, { list: string[] }>({
//     actionName: 'look-up-data-list',
//     endpoint: 'FLEET',
//     payload: { list }
//   }),
//   // listInpectionLookupData: (list: string[]) => fetchDataListService<InspectionLookup, { list: string[] }>({
//   //   actionName: 'inspection-look-up-data-list',
//   //   endpoint: 'FLEET',
//   //   payload: { list }
//   // }),

//   // saveVehicle: (vhlt: SaveVehicle) => execDataService0<SaveVehicle>({
//   //   actionName: 'save-vehicle',
//   //   endpoint: 'FLEET',
//   //   payload: { ...vhlt }

//   // }),

//   // fetchVehicle: (id: number): ServiceApiType<{ id: number }> => ({
//   //   type: 'FETCH_QUERY',
//   //   endpoint: 'FLEET',
//   //   responseKey: 'vehicle',
//   //   actionName: 'fetch-vehicle',
//   //   payload: { id }
//   // }),

//   // listVehicle: (params: TableViewSearchParams<VehicleSearchParam>) => fetchDataPagingService<VehicleListItem, { searchValue?: string }>({
//   //   actionName: 'list-vehicle',
//   //   endpoint: 'FLEET',
//   //   payload: { searchValue: params.criteria?.searchValue },
//   //   pagination: {
//   //     pageSize: params.pagination?.pageSize,
//   //     page: params.pagination?.current
//   //   },
//   // }),
// }


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
  buList :():ServiceApiType<{ }> =>({
    actionName:"business-unit-list",
    endpoint:"FLEET",
    type:"LIST_QUERY",
    payload:{}
  }),
  listLookupData: (param: LookUpDataParam): ServiceApiType<LookUpDataParam> => ({
    type: 'LIST_QUERY',
    actionName: 'look-up-data-list',
    endpoint: 'FLEET',
    payload: param,
  }),

  saveAttachment: (data: AttachmentFilesCreate): ServiceApiType<AttachmentFilesCreate> => ({
    actionName: 'save-attache-file',
    endpoint: 'FLEET',
    type: 'EXEC',
    payload: data,
  }),

  listAttachemnet: (id: string): ServiceApiType<{ id?: string }> => ({
    type: 'LIST_QUERY',
    endpoint: 'FLEET',
    actionName: 'fetch-attach-file',
    payload: { id },
  }),
}

export const FleetServiceAPI = (requestActions:RequestActions) =>{
  return {
      pageActivityLog: (params:TableViewSearchParams<ActivityLogAdvanceSearchParam>)=>singleRequest(FleetAction.pageActivityLog(params))(requestActions) as Promise<Page<ActivityLogDTO>>,
      buList: ()=>singleRequest(FleetAction.buList())(requestActions) as Promise<BusnessUnit[]>,
      lookupData: (data: LookUpDataParam) =>singleRequest<LookUpDataDTO>(FleetAction.listLookupData(data))(requestActions) as Promise<LookUpDataDTO[]>,
      listAttachemnet: (codeType: string) =>singleRequest<AttachmentFilesDTO>(FleetAction.listAttachemnet(codeType))(requestActions) as Promise<AttachmentFilesDTO[]>,
      saveAttachment: (data: AttachmentFilesCreate) =>singleRequest<{ data: string; message: string }>(FleetAction.saveAttachment(data))(requestActions),
  }
}