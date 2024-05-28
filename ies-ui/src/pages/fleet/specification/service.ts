
import { ServiceApiType, RequestActions, singleRequest } from "@/services/apiGateway";
import { BatteryVehicleCreate, BatteryVehicleDTO, NormFuelConsumptionCreate, NormFuelConsumptionDTO, TireVehicleDTO, TireAssignCreate, TireAssignParam } from "./data.d";


const SpecificationAction = {


  saveVehicleTire: (data: TireAssignCreate): ServiceApiType<TireAssignCreate> => ({
    type: "EXEC",
    actionName: 'save-vehicle-tire',
    endpoint: 'FLEET',
    payload: data

  }),

  listVehicleTire: (params:TireAssignParam): ServiceApiType<TireAssignParam> => ({
    type: "LIST_QUERY",
    actionName: "list-vehicle-tire",
    endpoint: "FLEET",
    payload: params
  }),

  saveBattery: (data: BatteryVehicleCreate): ServiceApiType<BatteryVehicleCreate> => ({
    type: "EXEC",
    actionName: 'save-battery-vehicle',
    endpoint: 'FLEET',
    payload: data

  }),

  fetchBattery: (id?: string): ServiceApiType<{ id?: string }> => ({
    type: "FETCH_QUERY",
    actionName: "fetch-battery-vehicle",
    endpoint: "FLEET",
    payload: { id }
  }),
  listBattery: (id?: string): ServiceApiType<{ id?: string }> => ({
    type: "LIST_QUERY",
    actionName: "list-battery-vehicle",
    endpoint: "FLEET",
    payload: { id }
  }),

  fetchSpecification: (id: string): ServiceApiType<{ id: string }> => ({
    endpoint: "FLEET",
    actionName: "fetch-specification",
    type: "FETCH_QUERY",
    payload: { id }
  }),
  //========= norm fuel consumtion =========
  saveNormFuelConsumption: (data: NormFuelConsumptionCreate): ServiceApiType<NormFuelConsumptionCreate> => ({
    endpoint: "FLEET",
    actionName: "save-norm-fuel-consumption",
    type: "EXEC",
    payload: data
  }),
  fetchNormFuelConsumption: (id: string): ServiceApiType<{ id: string }> => ({
    endpoint: "FLEET",
    actionName: "fetch-norm-fuel-consumption",
    type: "FETCH_QUERY",
    payload: { id }
  }),

}


export const SpecificationServiceAPI = (requestActions: RequestActions) => {
  return {


    listVehicleTire: (params:TireAssignParam) => singleRequest<TireVehicleDTO>(SpecificationAction.listVehicleTire(params))(requestActions) as Promise<TireVehicleDTO[]>,


    saveVehicleTire: (params: TireAssignCreate) =>
      singleRequest<{ data: string; message: string }>(SpecificationAction.saveVehicleTire(params))(
        requestActions,
      ),

    // ============================== battery ==============================
    saveBattery: (params: BatteryVehicleCreate) =>
      singleRequest<{ data: string; message: string }>(SpecificationAction.saveBattery(params))(
        requestActions,
      ),
    fetchBattery: (id: string) =>
      singleRequest<BatteryVehicleDTO>(SpecificationAction.fetchBattery(id))(
        requestActions,
      ) as Promise<BatteryVehicleDTO>,

    listBattery: (id: string) => singleRequest<BatteryVehicleDTO>(SpecificationAction.listBattery(id))(requestActions) as Promise<BatteryVehicleDTO[]>,

   
    
    // ======= norm fuel consumtion =======
    saveNormFuelConsumption: (params: NormFuelConsumptionCreate) =>
      singleRequest<{ data: NormFuelConsumptionCreate; message: string }>(SpecificationAction.saveNormFuelConsumption(params))(
        requestActions,
    ),

    fetchNormFuelConsumption: (id: string) =>
      singleRequest<NormFuelConsumptionDTO>(SpecificationAction.fetchNormFuelConsumption(id))(
        requestActions,
      ) as Promise<NormFuelConsumptionDTO>,
  }
};
