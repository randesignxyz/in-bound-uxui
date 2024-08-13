import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { VehicleDriverCreate } from '../driver/data';
import { AttachmentFilesCreate } from '../lookupData/data';
import {
  MeterFetchParam,
  MeterHistoryDTO,
  MeterSearchParam as MeterHistorySearchParam,
  MeterTypeParam,
  SaveVehicle,
  VehicleListItem,
  VehicleSearchParam,
} from './data';

const VehicleAction = {
  saveVehicle: (vhlt: SaveVehicle): ServiceApiType<SaveVehicle> => ({
    type: 'EXEC',
    actionName: 'save-vehicle',
    endpoint: 'FLEET',
    payload: { ...vhlt },
  }),

  status: (param: {
    id: string;
    status: string;
  }): ServiceApiType<{ id: string; status: string }> => ({
    type: 'EXEC',
    actionName: 'change-vehicle-status',
    endpoint: 'FLEET',
    payload: param,
  }),

  fetchVehicle: (id: string): ServiceApiType<{ id: string }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'FLEET',
    actionName: 'fetch-vehicle',
    payload: { id },
  }),

  page: (
    params: TableViewSearchParams<VehicleSearchParam>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    actionName: 'page-vehicle',
    endpoint: 'FLEET',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  saveVehicleDriver: (data: VehicleDriverCreate): ServiceApiType<VehicleDriverCreate> => ({
    endpoint: 'FLEET',
    actionName: 'save-vehicle-driver',
    type: 'EXEC',
    payload: data,
  }),

  profilePicture: (data: AttachmentFilesCreate): ServiceApiType<AttachmentFilesCreate> => ({
    endpoint: 'FLEET',
    actionName: 'profile-picture',
    type: 'EXEC',
    payload: data,
  }),

  // extra attribute
  meterhistory: (
    params: TableViewSearchParams<MeterHistorySearchParam>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    actionName: 'page-meter-history',
    endpoint: 'FLEET',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
  updateMeterHistory: (param: MeterHistoryDTO): ServiceApiType<MeterHistoryDTO> => ({
    type: "EXEC",
    actionName: "update-meter-history",
    endpoint: "FLEET",
    payload: param
  }),
  deleteMeterHistory: (param: MeterHistoryDTO): ServiceApiType<MeterHistoryDTO> => ({
    type: "EXEC",
    actionName: "delete-meter-history",
    endpoint: "FLEET",
    payload: param
  }),
  fetchMeterHistory: (param: MeterFetchParam): ServiceApiType<{ param: MeterFetchParam }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'FLEET',
    actionName: 'fetch-vehicle',
    payload: { param },
  }),
  findMeterHistory: (param: MeterTypeParam): ServiceApiType<MeterTypeParam > => ({
    type: 'FETCH_QUERY',
    endpoint: 'FLEET',
    actionName: 'find-meter-history',
    payload: param ,
  }),

  changeOdometer: (param:{vId?:String; odometer:number; reason?:string}):ServiceApiType<{odometer:number; reason?:string}> =>({
    type:"EXEC",
    actionName:"change-odometer",
    endpoint:"FLEET",
    payload:param
  })
};

export const VehicleServiceAPI = (requestActions: RequestActions) => {
  return {
    pageVehicle: (params: TableViewSearchParams<VehicleSearchParam>) =>singleRequest<VehicleListItem>(VehicleAction.page(params))(requestActions) as Promise<Paging<VehicleListItem>>,
    fetchVehicle: (id: string) =>singleRequest<VehicleListItem>(VehicleAction.fetchVehicle(id))(requestActions) as Promise<VehicleListItem>,
    save: (params: SaveVehicle) =>singleRequest<{ data: string; message: string }>(VehicleAction.saveVehicle(params))(requestActions),
    status: (params: { id: string; status: string }) =>singleRequest<{ data: string; message: string }>(VehicleAction.status(params))(requestActions),
    saveVehicleDriver: (param: VehicleDriverCreate) =>singleRequest<{ data: string; message: string }>(VehicleAction.saveVehicleDriver(param))(requestActions),
    profilePicture: (param: AttachmentFilesCreate) =>singleRequest<{ data: string; message: string }>(VehicleAction.profilePicture(param))(requestActions),

    // extra attribute
    pageMeterHistory: (params: TableViewSearchParams<MeterHistorySearchParam>) =>singleRequest<MeterHistoryDTO>(VehicleAction.meterhistory(params))(requestActions) as Promise<Paging<MeterHistoryDTO>>,
    updateMeterHistory: (params: MeterHistoryDTO) =>singleRequest<{ data: string; message: string }>(VehicleAction.updateMeterHistory(params))(requestActions),
    deleteMeterHistory: (params: MeterHistoryDTO) =>singleRequest<{ data: string; message: string }>(VehicleAction.deleteMeterHistory(params))(requestActions),
    fetchMeterHistory: (param: MeterFetchParam) =>singleRequest<MeterHistoryDTO>(VehicleAction.fetchMeterHistory(param))(requestActions) as Promise<MeterHistoryDTO>,
    findMeterHistory: (param: MeterTypeParam) =>singleRequest<MeterHistoryDTO>(VehicleAction.findMeterHistory(param))(requestActions) as Promise<MeterHistoryDTO>,
    changeOdometer: (params:{vId?:string; odometer:number; reason?:string})=>singleRequest<{vId?:String;odometer:number; reason?:string}>(VehicleAction.changeOdometer(params))(requestActions)

  };
};
